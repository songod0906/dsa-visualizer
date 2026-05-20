import { describe, expect, it } from 'vitest'
import { getLearningSupport } from './learningSupport'
import { levels } from './levels'
import type { ProgramInstruction } from './types'

const levelById = (id: number) => {
  const level = levels.find((candidate) => candidate.id === id)
  if (!level) throw new Error(`Missing level ${id}`)
  return level
}

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
