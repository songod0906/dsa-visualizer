import { buildProgramCode } from './blockly'
import type { ExecutionFrame, ProgramInstruction, Level } from './types'

export type LearningSupport = {
  teaching: 'supported' | 'partial' | 'unsupported'
  codeHighlight: 'supported' | 'unsupported'
  explanation: 'supported' | 'fallback' | 'unsupported'
  reason: string
}

export type TeachingStep = {
  activeLines: number[]
  summary: string
  detail: string
}

export function isLinearSearchProgram(instructions: ProgramInstruction[]) {
  return instructions.length === 1 && instructions[0]?.type === 'linearSearch'
}

export function isBinarySearchProgram(instructions: ProgramInstruction[]) {
  return instructions.length === 1 && instructions[0]?.type === 'binarySearch'
}

// Recognizes the block-built linear search shape the teaching engine fully
// understands: a single scan loop whose body compares each cell and returns the
// index when an `if current == target` matches, optionally followed by a
// `return -1`. Anything outside this shape is honestly reported as partial so we
// never fake per-line teaching for a structure we cannot narrate.
export function isSupportedBlockLinearSearch(instructions: ProgramInstruction[]): boolean {
  if (instructions.length < 1 || instructions.length > 2) return false
  const [first, second] = instructions
  if (first?.type !== 'scanArray') return false
  if (instructions.length === 2 && second?.type !== 'outputNotFound') return false

  const body = first.body
  if (body.length === 0) return false
  // Only comparisons and the if-equals block are allowed directly in the loop.
  if (!body.every((block) => block.type === 'compareIndex' || block.type === 'ifCurrentEqualsTarget')) {
    return false
  }
  const ifBlock = body.find((block) => block.type === 'ifCurrentEqualsTarget')
  if (ifBlock?.type !== 'ifCurrentEqualsTarget') return false
  // The if must actually output the found index, or nothing is being taught.
  return ifBlock.body.some((block) => block.type === 'outputFoundCurrent')
}

export function getLearningSupport(level: Level | null, instructions: ProgramInstruction[]): LearningSupport {
  if (isLinearSearchProgram(instructions)) {
    return {
      teaching: 'supported',
      codeHighlight: 'supported',
      explanation: 'supported',
      reason: 'Linear search checks values left to right until it finds the target or reaches the end.',
    }
  }

  if (isBinarySearchProgram(instructions)) {
    return {
      teaching: 'supported',
      codeHighlight: 'supported',
      explanation: 'supported',
      reason: 'Binary search checks the middle of the current window and discards the half that cannot contain the target.',
    }
  }

  if (isSupportedBlockLinearSearch(instructions)) {
    return {
      teaching: 'supported',
      codeHighlight: 'supported',
      explanation: 'supported',
      reason: 'This block-built linear search loops over each cell, compares it with the target, and returns the index the moment it matches.',
    }
  }

  if (level?.id === 4) {
    return {
      teaching: 'partial',
      codeHighlight: 'unsupported',
      explanation: 'fallback',
      reason: 'These blocks run, but they are not the standard linear-search shape, so line-by-line teaching is off for this arrangement.',
    }
  }

  return {
    teaching: 'unsupported',
    codeHighlight: 'unsupported',
    explanation: 'unsupported',
    reason: 'Teaching is not ready for this level yet.',
  }
}

// Maps one execution frame to the code line(s) to highlight plus a beginner
// explanation. This is the sync contract between the runtime trace, the
// generated Python, and the teaching text. Two strategies:
//   - the single-block linearSearch recipe is one instruction that expands to a
//     fixed multi-line block, so it uses a fixed event-kind -> line mapping;
//   - block-built programs have one instruction per line, so each frame carries
//     its source instruction (see engine.ts) and we look the line up directly.
export function getTeachingStep(
  frame: ExecutionFrame | undefined,
  instructions: ProgramInstruction[],
  support: LearningSupport,
): TeachingStep {
  if (!frame) {
    return {
      activeLines: [],
      summary: 'No step is selected yet.',
      detail: 'Run or step the program to connect each code line with the visualization.',
    }
  }

  if (support.teaching !== 'supported') {
    return {
      activeLines: [],
      summary: frame.event.message,
      detail: support.reason,
    }
  }

  if (isLinearSearchProgram(instructions)) {
    return teachLinearSearchRecipe(frame)
  }

  if (isBinarySearchProgram(instructions)) {
    return teachBinarySearchRecipe(frame)
  }

  return teachBlockProgram(frame, instructions)
}

// Fixed line mapping for the single `binarySearch` block:
//   1 def / 2 left=0 / 3 right=len-1 / 4 while / 5 mid / 6 if ==target /
//   7 return mid / 8 if <target / 9 left=mid+1 / 10 else / 11 right=mid-1 / 12 return -1
// The initial left/right setup moves use the default "Move ... to index N."
// message; the in-loop narrowing moves use "... moves to N.", which is how we
// tell the setup lines (2/3) apart from the discard lines (9/11).
function teachBinarySearchRecipe(frame: ExecutionFrame): TeachingStep {
  const summary = frame.event.message

  switch (frame.event.kind) {
    case 'note':
      return {
        activeLines: [1],
        summary,
        detail: 'Binary search starts by looking at the whole array, from the left end to the right end.',
      }
    case 'movePointer': {
      const isSetup = frame.event.message.startsWith('Move ')
      if (frame.event.pointer === 'mid') {
        return {
          activeLines: [5],
          summary,
          detail: 'The middle index sits halfway between left and right. Binary search always checks the middle next.',
        }
      }
      if (frame.event.pointer === 'left') {
        return isSetup
          ? { activeLines: [2], summary, detail: 'Left marks the low end of the window still being searched.' }
          : { activeLines: [9], summary, detail: 'The middle value was too small, so the target must be to the right. Move left past the middle to discard the left half.' }
      }
      if (frame.event.pointer === 'right') {
        return isSetup
          ? { activeLines: [3], summary, detail: 'Right marks the high end of the window still being searched.' }
          : { activeLines: [11], summary, detail: 'The middle value was too big, so the target must be to the left. Move right below the middle to discard the right half.' }
      }
      break
    }
    case 'compare': {
      if (frame.event.match) {
        return {
          activeLines: [6],
          summary,
          detail: 'The middle value equals the target, so the search can return this index next.',
        }
      }
      const midValue = typeof frame.event.value === 'number' ? frame.event.value : null
      const tooSmall = midValue !== null && midValue < frame.state.target
      return {
        activeLines: [6],
        summary,
        detail: tooSmall
          ? 'The middle value is smaller than the target, so the whole left half can be discarded.'
          : 'The middle value is larger than the target, so the whole right half can be discarded.',
      }
    }
    case 'setResult':
      if (frame.state.found) {
        return {
          activeLines: [7],
          summary,
          detail: 'Returning the middle index finishes the search the moment the target is found.',
        }
      }
      return {
        activeLines: [12],
        summary,
        detail: 'Left has passed right, so the window is empty and the target is not in the array.',
      }
    default:
      break
  }

  return {
    activeLines: [1],
    summary,
    detail: 'This step updates the search window shown in the visualization.',
  }
}

// Fixed line mapping for the single `linearSearch` block:
//   1 def / 2 for-loop / 3 if / 4 return i / 5 return -1
function teachLinearSearchRecipe(frame: ExecutionFrame): TeachingStep {
  switch (frame.event.kind) {
    case 'movePointer':
      if (frame.event.pointer === 'current') {
        return {
          activeLines: [2],
          summary: frame.event.message,
          detail: 'The for-loop chooses the next index. Linear search advances one cell at a time, so each index gets a turn.',
        }
      }
      break
    case 'compare':
      return {
        activeLines: [3],
        summary: frame.event.message,
        detail: frame.event.match
          ? 'The if condition is true because this value equals the target. The next step can return this index.'
          : 'The if condition is false because this value is different from the target. The search must continue.',
      }
    case 'setResult':
      if (frame.state.found) {
        return {
          activeLines: [4],
          summary: frame.event.message,
          detail: 'Returning the index finishes the algorithm immediately once the target is found.',
        }
      }
      return {
        activeLines: [5],
        summary: frame.event.message,
        detail: 'The loop has finished without a match, so returning -1 correctly means the target is not in the array.',
      }
    case 'note':
      return {
        activeLines: [1],
        summary: frame.event.message,
        detail: 'The function receives an array and a target. The following lines decide which index to return, or -1 if no value matches.',
      }
    default:
      break
  }

  return {
    activeLines: [1],
    summary: frame.event.message,
    detail: 'This step updates the program state shown in the visualization.',
  }
}

// General mapping for block-built programs: highlight the line of the source
// instruction the frame is executing, and explain by event kind. Same engine,
// so Level 4 and the single-block recipe stay in step without duplicated logic.
function teachBlockProgram(frame: ExecutionFrame, instructions: ProgramInstruction[]): TeachingStep {
  const { lineOf } = buildProgramCode(instructions)
  const source = frame.event.source
  const sourceLine = source ? lineOf.get(source) : undefined
  const lines = typeof sourceLine === 'number' ? [sourceLine] : []
  const summary = frame.event.message

  switch (frame.event.kind) {
    case 'movePointer':
      // The scan loop stepping to the next index.
      return {
        activeLines: lines.length ? lines : [1],
        summary,
        detail: 'The loop advances to the next index and runs the blocks inside once for this cell.',
      }
    case 'compare':
      return {
        activeLines: lines,
        summary,
        detail: frame.event.match
          ? 'This cell equals the target, so the if condition that follows will be true.'
          : 'This cell is different from the target, so the search keeps going.',
      }
    case 'note': {
      if (source?.type === 'ifCurrentEqualsTarget') {
        const index = frame.event.index
        const matched = typeof index === 'number' && frame.state.array[index] === frame.state.target
        return {
          activeLines: lines,
          summary,
          detail: matched
            ? 'The if is true, so the blocks inside it run next.'
            : 'The if is false, so its inside blocks are skipped and the loop continues.',
        }
      }
      // Program start/finish notes carry no source instruction.
      return {
        activeLines: [1],
        summary,
        detail: 'The function receives an array and a target, then the blocks below decide which index to return.',
      }
    }
    case 'setResult':
      return {
        activeLines: lines,
        summary,
        detail: frame.state.found
          ? 'Returning the current index ends the search the moment a match is found.'
          : 'The loop finished without a match, so the program returns -1.',
      }
    case 'read':
      return { activeLines: lines, summary, detail: 'This reads the value stored at the given index.' }
    default:
      return {
        activeLines: lines.length ? lines : [1],
        summary,
        detail: 'This step updates the program state shown in the visualization.',
      }
  }
}
