export type PointerName = 'current' | 'left' | 'mid' | 'right'

export type ProgramInstruction =
  | { type: 'readIndex'; index: number }
  | { type: 'setPointer'; pointer: PointerName; index: number }
  | { type: 'compareIndex'; index: number | 'i' | 'mid' }
  | { type: 'scanArray'; body: ProgramInstruction[] }
  | { type: 'ifCurrentEqualsTarget'; body: ProgramInstruction[] }
  | { type: 'outputFoundCurrent' }
  | { type: 'outputNotFound' }
  | { type: 'linearSearch' }
  | { type: 'binarySearch' }

export type ExecutionEventKind =
  | 'highlightCell'
  | 'movePointer'
  | 'compare'
  | 'read'
  | 'setResult'
  | 'incrementCost'
  | 'note'

export interface ExecutionEvent {
  kind: ExecutionEventKind
  message: string
  index?: number
  pointer?: PointerName
  value?: number | string | null
  match?: boolean
  cost?: number
}

export interface RunState {
  array: number[]
  target: number
  pointers: Partial<Record<PointerName, number>>
  currentIndex: number | null
  lastRead: number | null
  lastComparedIndex: number | null
  resultIndex: number | null
  found: boolean | null
  operationCount: number
  status: 'idle' | 'ready' | 'running' | 'finished' | 'error'
  message: string
}

export interface ExecutionFrame {
  event: ExecutionEvent
  state: RunState
}

export type LearningMode = 'teaching' | 'exploration'

export interface Level {
  id: number
  title: string
  concept: string
  prompt: string
  array: number[]
  target: number
  allowedBlocks: string[]
  starterBlocks: string[]
  hints: string[]
  goal: (state: RunState, frames: ExecutionFrame[]) => boolean
  success: string
}

export interface SandboxConfig {
  array: number[]
  target: number
}
