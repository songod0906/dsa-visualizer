import { describe, expect, it } from 'vitest'
import { executeProgram } from './engine'
import { levels } from './levels'
import type { ProgramInstruction } from './types'

describe('executeProgram', () => {
  it('traces linear search when the target is found', () => {
    const frames = executeProgram([{ type: 'linearSearch' }], [4, 8, 12, 16], 12)
    const finalState = frames.at(-1)?.state

    expect(finalState?.resultIndex).toBe(2)
    expect(finalState?.operationCount).toBe(3)
    expect(frames.filter((frame) => frame.event.kind === 'compare')).toHaveLength(3)
  })

  it('traces linear search when the target is missing', () => {
    const frames = executeProgram([{ type: 'linearSearch' }], [4, 8, 12], 99)
    const finalState = frames.at(-1)?.state

    expect(finalState?.resultIndex).toBe(-1)
    expect(finalState?.found).toBe(false)
    expect(finalState?.operationCount).toBe(3)
  })

  it('handles empty arrays', () => {
    const frames = executeProgram([{ type: 'linearSearch' }], [], 10)

    expect(frames.at(-1)?.state.resultIndex).toBe(-1)
    expect(frames.filter((frame) => frame.event.kind === 'compare')).toHaveLength(0)
  })

  it('finds a one-item array value', () => {
    const frames = executeProgram([{ type: 'linearSearch' }], [7], 7)

    expect(frames.at(-1)?.state.resultIndex).toBe(0)
    expect(frames.at(-1)?.state.operationCount).toBe(1)
  })

  it('returns the first duplicate target for linear search', () => {
    const frames = executeProgram([{ type: 'linearSearch' }], [5, 9, 9, 12], 9)

    expect(frames.at(-1)?.state.resultIndex).toBe(1)
  })

  it('traces binary search with fewer comparisons than a full scan', () => {
    const frames = executeProgram([{ type: 'binarySearch' }], [1, 3, 5, 7, 9, 11, 13, 15, 17], 15)
    const finalState = frames.at(-1)?.state

    expect(finalState?.resultIndex).toBe(7)
    expect(finalState?.operationCount).toBeLessThan(8)
    expect(frames.some((frame) => frame.event.pointer === 'mid')).toBe(true)
  })

  it('binary search returns -1 when the target is missing', () => {
    const frames = executeProgram([{ type: 'binarySearch' }], [1, 3, 5, 7, 9], 4)
    const finalState = frames.at(-1)?.state

    expect(finalState?.resultIndex).toBe(-1)
    expect(finalState?.found).toBe(false)
  })

  it('binary search finds the target at the first element', () => {
    const frames = executeProgram([{ type: 'binarySearch' }], [1, 3, 5, 7, 9], 1)
    const finalState = frames.at(-1)?.state

    expect(finalState?.resultIndex).toBe(0)
    expect(finalState?.operationCount).toBeGreaterThan(0)
  })

  it('binary search on empty array returns -1, found false, operationCount 0', () => {
    const frames = executeProgram([{ type: 'binarySearch' }], [], 10)
    const finalState = frames.at(-1)?.state

    expect(finalState?.resultIndex).toBe(-1)
    expect(finalState?.found).toBe(false)
    expect(finalState?.operationCount).toBe(0)
  })

  it('binary search finds target at last element with at least one comparison', () => {
    const frames = executeProgram([{ type: 'binarySearch' }], [2, 4, 6, 8, 10], 10)
    const finalState = frames.at(-1)?.state

    expect(finalState?.resultIndex).toBe(4)
    expect(finalState?.operationCount).toBeGreaterThan(0)
  })

  it('executes learner-built linear search blocks', () => {
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

    const frames = executeProgram(program, [3, 10, 14, 19, 26], 19)

    expect(frames.at(-1)?.state.resultIndex).toBe(3)
  })
})

describe('level goals', () => {
  it('accepts the provided starter behavior for every MVP level', () => {
    for (const level of levels) {
      const starterProgram = level.id === 4
        ? [
            {
              type: 'scanArray' as const,
              body: [
                { type: 'compareIndex' as const, index: 'i' as const },
                {
                  type: 'ifCurrentEqualsTarget' as const,
                  body: [{ type: 'outputFoundCurrent' as const }],
                },
              ],
            },
            { type: 'outputNotFound' as const },
          ]
        : level.allowedBlocks.includes('dsa_binary_search')
          ? [{ type: 'binarySearch' as const }]
          : level.allowedBlocks.includes('dsa_linear_search')
            ? [{ type: 'linearSearch' as const }]
            : level.id === 6
              ? [
                  { type: 'setPointer' as const, pointer: 'mid' as const, index: 3 },
                  { type: 'compareIndex' as const, index: 'mid' as const },
                ]
              : level.id === 3
                ? [{ type: 'compareIndex' as const, index: 2 }]
                : level.id === 2
                  ? [{ type: 'setPointer' as const, pointer: 'current' as const, index: 2 }]
                  : [{ type: 'readIndex' as const, index: 2 }]

      const frames = executeProgram(starterProgram, level.array, level.target)
      expect(level.goal(frames.at(-1)!.state, frames), `level ${level.id}`).toBe(true)
    }
  })
})
