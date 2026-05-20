import type { Level, ProgramInstruction } from './types'

export type LearningSupport = {
  teaching: 'supported' | 'partial' | 'unsupported'
  codeHighlight: 'supported' | 'unsupported'
  explanation: 'supported' | 'fallback' | 'unsupported'
  reason: string
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
