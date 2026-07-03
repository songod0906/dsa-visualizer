import type { ExecutionFrame, Level, ProgramInstruction } from './types'

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

export function getLearningSupport(level: Level | null, instructions: ProgramInstruction[]): LearningSupport {
  if (isLinearSearchProgram(instructions)) {
    return {
      teaching: 'supported',
      codeHighlight: 'supported',
      explanation: 'supported',
      reason: 'Linear search checks values left to right until it finds the target or reaches the end.',
    }
  }

  if (level?.id === 4) {
    return {
      teaching: 'partial',
      codeHighlight: 'unsupported',
      explanation: 'fallback',
      reason: 'Line-by-line teaching is not wired for this block-built version yet.',
    }
  }

  return {
    teaching: 'unsupported',
    codeHighlight: 'unsupported',
    explanation: 'unsupported',
    reason: 'Teaching is not ready for this level yet.',
  }
}

// Maps one execution frame of the single-block Linear Search program to the
// code line(s) to highlight plus a beginner explanation. This is the sync
// contract between the runtime trace, the generated Python, and the teaching
// text; keep it in step with the linearSearch case of engine.ts and the
// linearSearch Python emitted by blockly.ts.
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

  if (support.teaching !== 'supported' || !isLinearSearchProgram(instructions)) {
    return {
      activeLines: [],
      summary: frame.event.message,
      detail: support.reason,
    }
  }

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
