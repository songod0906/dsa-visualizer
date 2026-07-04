import { describe, expect, it } from 'vitest'
import { gradeProgram, problems } from './problems'
import type { ProgramInstruction } from './types'

const findTheTarget = problems[0]

const blockLinearSearch: ProgramInstruction[] = [
  {
    type: 'scanArray',
    body: [
      { type: 'compareIndex', index: 'i' },
      { type: 'ifCurrentEqualsTarget', body: [{ type: 'outputFoundCurrent' }] },
    ],
  },
  { type: 'outputNotFound' },
]

describe('gradeProgram', () => {
  it('passes every case for the single-block linear search', () => {
    const results = gradeProgram([{ type: 'linearSearch' }], findTheTarget.cases)
    expect(results).toHaveLength(findTheTarget.cases.length)
    expect(results.every((r) => r.passed)).toBe(true)
  })

  it('passes every case for the block-built linear search', () => {
    const results = gradeProgram(blockLinearSearch, findTheTarget.cases)
    expect(results.every((r) => r.passed)).toBe(true)
  })

  it('fails the specific cases a broken program gets wrong, with real actual values', () => {
    // Only checks index 0, never loops -> right only when the target is at index 0
    // or genuinely absent; wrong for a target sitting deeper in the array.
    const broken: ProgramInstruction[] = [
      { type: 'compareIndex', index: 0 },
      { type: 'ifCurrentEqualsTarget', body: [{ type: 'outputFoundCurrent' }] },
      { type: 'outputNotFound' },
    ]
    const results = gradeProgram(broken, findTheTarget.cases)

    expect(results.every((r) => r.passed)).toBe(false)
    expect(results.some((r) => !r.passed)).toBe(true)

    // The "found at index 2" case is wrong and reports the real returned value.
    const middle = results.find((r) => r.testCase.target === 15)
    expect(middle?.passed).toBe(false)
    expect(middle?.actual).toBe(-1)

    // The "found at index 0" case is genuinely correct for this broken program.
    const first = results.find((r) => r.testCase.target === 4)
    expect(first?.passed).toBe(true)
    expect(first?.actual).toBe(0)
  })

  it('reports actual = null when the program never sets a result', () => {
    const results = gradeProgram([{ type: 'compareIndex', index: 0 }], [
      { array: [1, 2, 3], target: 2, expected: 1 },
    ])
    expect(results[0].actual).toBeNull()
    expect(results[0].passed).toBe(false)
  })
})

describe('problems data', () => {
  it('every Find the Target case is internally consistent (expected matches a real linear scan)', () => {
    for (const c of findTheTarget.cases) {
      const trueIndex = c.array.indexOf(c.target)
      expect(c.expected).toBe(trueIndex)
    }
  })
})
