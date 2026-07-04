import { executeProgram } from './engine'
import type { CaseResult, Problem, ProgramInstruction, TestCase } from './types'

// Grade a built program by running it against each test case with the same safe
// interpreter the rest of the app uses, then comparing the final resultIndex to
// the expected answer. Pure and side-effect free -- this is the whole of the
// "test feedback" step; no new engine semantics.
export function gradeProgram(instructions: ProgramInstruction[], cases: TestCase[]): CaseResult[] {
  return cases.map((testCase) => {
    const frames = executeProgram(instructions, testCase.array, testCase.target)
    const actual = frames.at(-1)?.state.resultIndex ?? null
    return { testCase, actual, passed: actual === testCase.expected }
  })
}

export const problems: Problem[] = [
  {
    id: 'find-the-target',
    title: 'Find the Target',
    statement:
      'Return the index of the target value, or -1 if it is not in the array. Your program must pass every test case — including the tricky ones like a missing target or an empty array.',
    allowedBlocks: [
      'dsa_linear_search',
      'dsa_scan_array',
      'dsa_compare_index',
      'dsa_if_current_equals_target',
      'dsa_output_found_current',
      'dsa_output_not_found',
    ],
    starterBlocks: 'linearSearch',
    cases: [
      { array: [4, 8, 15, 16, 23, 42], target: 15, expected: 2 },
      { array: [4, 8, 15, 16, 23, 42], target: 4, expected: 0 },
      { array: [4, 8, 15, 16, 23, 42], target: 42, expected: 5 },
      { array: [4, 8, 15, 16, 23, 42], target: 99, expected: -1 },
      { array: [], target: 5, expected: -1 },
      { array: [7, 7, 7], target: 7, expected: 0 },
    ],
  },
]
