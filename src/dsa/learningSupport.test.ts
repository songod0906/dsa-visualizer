import { describe, expect, it } from 'vitest'
import { getLearningSupport, getTeachingStep } from './learningSupport'
import { executeProgram } from './engine'
import { instructionsToPython } from './blockly'
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

  it('marks the Level 4 block-built starter as partial', () => {
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

    expect(support.teaching).toBe('partial')
    expect(support.codeHighlight).toBe('unsupported')
    expect(support.explanation).toBe('fallback')
  })

  it('does not support the binary search recipe for Teaching yet', () => {
    const support = getLearningSupport(levelById(7), [{ type: 'binarySearch' }])

    expect(support.teaching).toBe('unsupported')
    expect(support.codeHighlight).toBe('unsupported')
    expect(support.explanation).toBe('unsupported')
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
