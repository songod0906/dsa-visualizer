import { describe, expect, it } from 'vitest'
import { getLearningSupport, getTeachingStep } from './learningSupport'
import { executeProgram } from './engine'
import { buildProgramCode, instructionsToPython } from './blockly'
import { levels } from './levels'
import type { ProgramInstruction } from './types'

const levelById = (id: number) => {
  const level = levels.find((candidate) => candidate.id === id)
  if (!level) throw new Error(`Missing level ${id}`)
  return level
}

const linearSearch: ProgramInstruction[] = [{ type: 'linearSearch' }]
const pythonLines = instructionsToPython(linearSearch).split('\n')
// 1-indexed accessor matching the CodePanel's line numbering.
const codeLine = (n: number) => pythonLines[n - 1]

describe('getLearningSupport', () => {
  it('fully supports the single-block linear search recipe', () => {
    const support = getLearningSupport(levelById(5), [{ type: 'linearSearch' }])

    expect(support.teaching).toBe('supported')
    expect(support.codeHighlight).toBe('supported')
    expect(support.explanation).toBe('supported')
  })

  it('fully supports the canonical Level 4 block-built linear search', () => {
    const program: ProgramInstruction[] = [
      {
        type: 'scanArray',
        body: [
          { type: 'compareIndex', index: 'i' },
          { type: 'ifCurrentEqualsTarget', body: [{ type: 'outputFoundCurrent' }] },
        ],
      },
      { type: 'outputNotFound' },
    ]

    const support = getLearningSupport(levelById(4), program)

    expect(support.teaching).toBe('supported')
    expect(support.codeHighlight).toBe('supported')
    expect(support.explanation).toBe('supported')
  })

  it('keeps a non-canonical Level 4 arrangement honest (partial, no fake highlight)', () => {
    // A loop that only reads a cell and never compares/returns is not a linear
    // search we can narrate line-by-line, so it must stay partial.
    const program: ProgramInstruction[] = [
      { type: 'scanArray', body: [{ type: 'readIndex', index: 0 }] },
    ]

    const support = getLearningSupport(levelById(4), program)

    expect(support.teaching).toBe('partial')
    expect(support.codeHighlight).toBe('unsupported')
  })

  it('fully supports the single-block binary search recipe for Teaching', () => {
    const support = getLearningSupport(levelById(7), [{ type: 'binarySearch' }])

    expect(support.teaching).toBe('supported')
    expect(support.codeHighlight).toBe('supported')
    expect(support.explanation).toBe('supported')
  })

  it('does not give unsupported programs code highlighting', () => {
    const support = getLearningSupport(levelById(1), [{ type: 'readIndex', index: 2 }])

    expect(support.codeHighlight).toBe('unsupported')
  })
})

describe('getTeachingStep sync contract (single-block Linear Search)', () => {
  // Assert the generated Python actually has the shape the mapping assumes,
  // so a future edit to blockly.ts that shifts a line breaks these tests.
  it('emits the five-line linear search body the mapping targets', () => {
    expect(codeLine(1)).toContain('def search')
    expect(codeLine(2)).toContain('for i in range')
    expect(codeLine(3)).toContain('if array[i] == target')
    expect(codeLine(4)).toContain('return i')
    expect(codeLine(5).trim()).toBe('return -1')
  })

  const runSteps = (array: number[], target: number) => {
    const frames = executeProgram(linearSearch, array, target)
    const support = getLearningSupport(levelById(5), linearSearch)
    return frames.map((frame) => ({ frame, step: getTeachingStep(frame, linearSearch, support) }))
  }

  it.each([
    { name: 'found in the middle', array: [4, 8, 12, 16], target: 12 },
    { name: 'found at the first index', array: [7, 9, 11], target: 7 },
    { name: 'found at the last index', array: [2, 4, 6, 8], target: 8 },
    { name: 'missing target', array: [4, 8, 12], target: 99 },
    { name: 'one-item array', array: [7], target: 7 },
    { name: 'duplicate target', array: [5, 9, 9, 12], target: 9 },
  ])('keeps every step highlighted and in sync ($name)', ({ array, target }) => {
    const steps = runSteps(array, target)

    for (const { frame, step } of steps) {
      // Every step in a supported run highlights at least one real code line.
      expect(step.activeLines.length).toBeGreaterThan(0)
      expect(step.activeLines.every((line) => line >= 1 && line <= pythonLines.length)).toBe(true)
      // The teaching summary is exactly the trace/event message -> no divergence
      // between what the trace row says and what the explanation headlines.
      expect(step.summary).toBe(frame.event.message)

      // The highlighted line's text must describe the same operation as the event.
      if (frame.event.kind === 'compare') {
        expect(step.activeLines).toEqual([3])
        expect(codeLine(3)).toContain('if array[i] == target')
      }
      if (frame.event.kind === 'movePointer' && frame.event.pointer === 'current') {
        expect(step.activeLines).toEqual([2])
        expect(codeLine(2)).toContain('for i in range')
      }
    }
  })

  it('ends a found run on the return-i line, a missing run on return -1', () => {
    const found = runSteps([4, 8, 12, 16], 12).at(-1)!
    expect(found.frame.state.found).toBe(true)
    expect(found.step.activeLines).toEqual([4])
    expect(codeLine(4)).toContain('return i')

    const missing = runSteps([4, 8, 12], 99).at(-1)!
    expect(missing.frame.state.found).toBe(false)
    expect(missing.step.activeLines).toEqual([5])
    expect(codeLine(5).trim()).toBe('return -1')
  })

  it('empty array jumps straight from the def to return -1, never faking a loop step', () => {
    const steps = runSteps([], 10)
    // No comparison and no current-pointer move can happen with no cells.
    expect(steps.some(({ frame }) => frame.event.kind === 'compare')).toBe(false)
    expect(steps.some(({ frame }) => frame.event.kind === 'movePointer')).toBe(false)
    expect(steps.at(-1)!.step.activeLines).toEqual([5])
  })

  it('does not highlight or explain when support is not the linear search recipe', () => {
    const program: ProgramInstruction[] = [{ type: 'readIndex', index: 2 }]
    const support = getLearningSupport(levelById(1), program)
    const frames = executeProgram(program, [4, 9, 13, 21], 13)

    for (const frame of frames) {
      const step = getTeachingStep(frame, program, support)
      expect(step.activeLines).toEqual([])
      expect(step.summary).toBe(frame.event.message)
      expect(step.detail).toBe(support.reason)
    }
  })

  it('returns a neutral placeholder when no frame is selected', () => {
    const support = getLearningSupport(levelById(5), linearSearch)
    const step = getTeachingStep(undefined, linearSearch, support)
    expect(step.activeLines).toEqual([])
    expect(step.summary).toContain('No step is selected')
  })
})

describe('getTeachingStep sync contract (block-built Level 4 linear search)', () => {
  // Build the canonical program once so the SAME instruction objects flow into
  // both the engine (which stamps them onto event.source) and the line map
  // (keyed by object identity). This is what proves the shared engine works.
  const buildProgram = () => {
    const compare: ProgramInstruction = { type: 'compareIndex', index: 'i' }
    const found: ProgramInstruction = { type: 'outputFoundCurrent' }
    const ifBlock: ProgramInstruction = { type: 'ifCurrentEqualsTarget', body: [found] }
    const scan: ProgramInstruction = { type: 'scanArray', body: [compare, ifBlock] }
    const notFound: ProgramInstruction = { type: 'outputNotFound' }
    return { program: [scan, notFound], scan, compare, ifBlock, found, notFound }
  }

  it('highlights each source instruction on its own generated line (found case)', () => {
    const { program, scan, compare, ifBlock, found } = buildProgram()
    const support = getLearningSupport(levelById(4), program)
    const { lineOf } = buildProgramCode(program)
    const frames = executeProgram(program, [3, 10, 14, 19], 14) // found at index 2

    const seen = new Set<ProgramInstruction>()
    for (const frame of frames) {
      const step = getTeachingStep(frame, program, support)
      // Teaching summary never diverges from the trace event message.
      expect(step.summary).toBe(frame.event.message)

      const src = frame.event.source
      if (src) {
        // Every sourced frame highlights exactly that instruction's line.
        expect(step.activeLines).toEqual([lineOf.get(src)])
        seen.add(src)
      }
    }
    // The loop, the compare, the if, and the found-return were each taught.
    expect(seen.has(scan)).toBe(true)
    expect(seen.has(compare)).toBe(true)
    expect(seen.has(ifBlock)).toBe(true)
    expect(seen.has(found)).toBe(true)

    const final = frames.at(-1)!
    expect(final.state.found).toBe(true)
    expect(getTeachingStep(final, program, support).activeLines).toEqual([lineOf.get(found)])
  })

  it('ends a missing search on the outputNotFound line (return -1)', () => {
    const { program, notFound } = buildProgram()
    const support = getLearningSupport(levelById(4), program)
    const { lineOf } = buildProgramCode(program)
    const frames = executeProgram(program, [3, 10, 14], 99)

    const final = frames.at(-1)!
    expect(final.state.found).toBe(false)
    expect(final.event.source).toBe(notFound)
    expect(getTeachingStep(final, program, support).activeLines).toEqual([lineOf.get(notFound)])
  })

  it('never leaves a supported block step without a highlight', () => {
    const { program } = buildProgram()
    const support = getLearningSupport(levelById(4), program)
    const frames = executeProgram(program, [3, 10, 14, 19], 14)

    for (const frame of frames) {
      expect(getTeachingStep(frame, program, support).activeLines.length).toBeGreaterThan(0)
    }
  })

  it('the single-block recipe and the block build produce the same found index', () => {
    // Same algorithm, two authoring paths, one engine -> same result.
    const { program } = buildProgram()
    const array = [3, 10, 14, 19, 26]
    const recipe = executeProgram([{ type: 'linearSearch' }], array, 19)
    const blocks = executeProgram(program, array, 19)
    expect(recipe.at(-1)!.state.resultIndex).toBe(blocks.at(-1)!.state.resultIndex)
    expect(blocks.at(-1)!.state.resultIndex).toBe(3)
  })
})

describe('getTeachingStep sync contract (single-block Binary Search)', () => {
  const binary: ProgramInstruction[] = [{ type: 'binarySearch' }]
  const binaryLines = instructionsToPython(binary).split('\n')
  const bline = (n: number) => binaryLines[n - 1]

  // Pin the generated Python so a future blockly.ts change that shifts a binary
  // line breaks these tests instead of silently desyncing the highlight.
  it('emits the twelve-line binary body the mapping targets', () => {
    expect(bline(1)).toContain('def search')
    expect(bline(2).trim()).toBe('left = 0')
    expect(bline(3).trim()).toBe('right = len(array) - 1')
    expect(bline(4).trim()).toBe('while left <= right:')
    expect(bline(5)).toContain('mid = (left + right) // 2')
    expect(bline(6)).toContain('if array[mid] == target')
    expect(bline(7).trim()).toBe('return mid')
    expect(bline(9).trim()).toBe('left = mid + 1')
    expect(bline(11).trim()).toBe('right = mid - 1')
    expect(bline(12).trim()).toBe('return -1')
  })

  it('marks the binary recipe supported for Teaching', () => {
    const support = getLearningSupport(levelById(7), binary)
    expect(support.teaching).toBe('supported')
    expect(support.codeHighlight).toBe('supported')
    expect(support.reason.toLowerCase()).toContain('binary')
  })

  const runBinary = (array: number[], target: number) => {
    const frames = executeProgram(binary, array, target)
    const support = getLearningSupport(levelById(7), binary)
    return frames.map((frame) => ({ frame, step: getTeachingStep(frame, binary, support) }))
  }

  it('maps setup, mid, compare, narrowing, and found to the right lines', () => {
    const steps = runBinary([2, 5, 9, 14, 18, 23, 31, 40], 23) // found at index 5

    for (const { frame, step } of steps) {
      expect(step.summary).toBe(frame.event.message)
      expect(step.activeLines.length).toBeGreaterThan(0)
    }

    const leftSetup = steps.find(
      (s) => s.frame.event.pointer === 'left' && s.frame.event.message.startsWith('Move'),
    )
    expect(leftSetup?.step.activeLines).toEqual([2])

    const rightSetup = steps.find(
      (s) => s.frame.event.pointer === 'right' && s.frame.event.message.startsWith('Move'),
    )
    expect(rightSetup?.step.activeLines).toEqual([3])

    const midMove = steps.find((s) => s.frame.event.pointer === 'mid')
    expect(midMove?.step.activeLines).toEqual([5])

    const compare = steps.find((s) => s.frame.event.kind === 'compare')
    expect(compare?.step.activeLines).toEqual([6])

    // Target 23 is bigger than the first middle (14), so left narrows -> line 9.
    const leftNarrow = steps.find(
      (s) => s.frame.event.pointer === 'left' && s.frame.event.message.includes('moves to'),
    )
    expect(leftNarrow?.step.activeLines).toEqual([9])

    const final = steps.at(-1)!
    expect(final.frame.state.found).toBe(true)
    expect(final.step.activeLines).toEqual([7])
  })

  it('maps a right-narrowing step to line 11', () => {
    // Target 5 is smaller than the first middle (14), so right narrows.
    const steps = runBinary([2, 5, 9, 14, 18, 23, 31, 40], 5)
    const rightNarrow = steps.find(
      (s) => s.frame.event.pointer === 'right' && s.frame.event.message.includes('moves to'),
    )
    expect(rightNarrow?.step.activeLines).toEqual([11])
  })

  it('ends a missing binary search on return -1 (line 12)', () => {
    const steps = runBinary([1, 3, 5, 7, 9], 4)
    const final = steps.at(-1)!
    expect(final.frame.state.found).toBe(false)
    expect(final.step.activeLines).toEqual([12])
  })
})
