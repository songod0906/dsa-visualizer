import type {
  ExecutionEvent,
  ExecutionFrame,
  PointerName,
  ProgramInstruction,
  RunState,
} from './types'

export function createInitialState(array: number[], target: number): RunState {
  return {
    array,
    target,
    pointers: {},
    currentIndex: null,
    lastRead: null,
    lastComparedIndex: null,
    resultIndex: null,
    found: null,
    operationCount: 0,
    status: 'ready',
    message: 'Ready to step through the program.',
  }
}

export function executeProgram(
  instructions: ProgramInstruction[],
  array: number[],
  target: number,
): ExecutionFrame[] {
  const state = createInitialState(array, target)
  const frames: ExecutionFrame[] = []

  const push = (
    event: ExecutionEvent,
    update?: (draft: RunState) => void,
    source?: ProgramInstruction,
  ) => {
    update?.(state)
    frames.push({
      event: source ? { ...event, source } : event,
      state: {
        ...state,
        array: [...state.array],
        pointers: { ...state.pointers },
      },
    })
  }

  const valueAt = (index: number) => state.array[index]
  const resolveIndex = (index: number | 'i' | 'mid') => {
    if (index === 'i') return state.currentIndex ?? 0
    if (index === 'mid') return state.pointers.mid ?? 0
    return index
  }

  const compareAt = (index: number, source?: ProgramInstruction) => {
    const value = valueAt(index)
    const match = value === state.target
    push(
      {
        kind: 'compare',
        index,
        value,
        match,
        cost: state.operationCount + 1,
        message: `Compare array[${index}] (${value ?? 'empty'}) with target ${state.target}.`,
      },
      (draft) => {
        draft.currentIndex = index
        draft.lastComparedIndex = index
        draft.operationCount += 1
        draft.message = match ? 'That cell matches the target.' : 'No match here; keep searching.'
      },
      source,
    )
  }

  const movePointer = (
    pointer: PointerName,
    index: number,
    message?: string,
    source?: ProgramInstruction,
  ) => {
    push(
      {
        kind: 'movePointer',
        pointer,
        index,
        message: message ?? `Move ${pointer} to index ${index}.`,
      },
      (draft) => {
        draft.pointers[pointer] = index
        if (pointer === 'current') draft.currentIndex = index
        draft.message = message ?? `Pointer ${pointer} is now at ${index}.`
      },
      source,
    )
  }

  const isFinished = () => state.status === 'finished'

  const setFound = (index: number, source?: ProgramInstruction) => {
    push(
      {
        kind: 'setResult',
        index,
        value: index,
        message: `Return index ${index}. The target was found.`,
      },
      (draft) => {
        draft.resultIndex = index
        draft.found = true
        draft.status = 'finished'
        draft.message = `Found target ${draft.target} at index ${index}.`
      },
      source,
    )
  }

  const setNotFound = (source?: ProgramInstruction) => {
    push(
      {
        kind: 'setResult',
        value: null,
        message: 'Return -1. The target was not found.',
      },
      (draft) => {
        draft.resultIndex = -1
        draft.found = false
        draft.status = 'finished'
        draft.message = `Target ${draft.target} is not in this array.`
      },
      source,
    )
  }

  const run = (items: ProgramInstruction[]) => {
    for (const instruction of items) {
      if (isFinished()) break

      switch (instruction.type) {
        case 'readIndex': {
          const value = valueAt(instruction.index)
          push(
            {
              kind: 'read',
              index: instruction.index,
              value,
              message: `Read array[${instruction.index}], which contains ${value ?? 'nothing'}.`,
            },
            (draft) => {
              draft.currentIndex = instruction.index
              draft.lastRead = typeof value === 'number' ? value : null
              draft.message = `array[${instruction.index}] gives ${value ?? 'nothing'}.`
            },
            instruction,
          )
          break
        }
        case 'setPointer':
          movePointer(instruction.pointer, instruction.index, undefined, instruction)
          break
        case 'compareIndex':
          compareAt(resolveIndex(instruction.index), instruction)
          break
        case 'scanArray':
          for (let i = 0; i < state.array.length; i += 1) {
            if (isFinished()) break
            movePointer('current', i, `Loop step: current visits index ${i}.`, instruction)
            run(instruction.body)
          }
          break
        case 'ifCurrentEqualsTarget': {
          const index = state.currentIndex ?? state.lastComparedIndex ?? 0
          if (valueAt(index) === state.target) {
            push(
              {
                kind: 'note',
                index,
                message: 'The if condition is true, so the blocks inside run.',
              },
              (draft) => {
                draft.message = 'Condition true.'
              },
              instruction,
            )
            run(instruction.body)
          } else {
            push(
              {
                kind: 'note',
                index,
                message: 'The if condition is false, so the inside blocks are skipped.',
              },
              (draft) => {
                draft.message = 'Condition false.'
              },
              instruction,
            )
          }
          break
        }
        case 'outputFoundCurrent': {
          const index = state.currentIndex ?? state.lastComparedIndex ?? 0
          setFound(index, instruction)
          break
        }
        case 'outputNotFound':
          setNotFound(instruction)
          break
        case 'linearSearch':
          for (let i = 0; i < state.array.length; i += 1) {
            movePointer('current', i, `Linear search checks the next cell: ${i}.`)
            compareAt(i)
            if (valueAt(i) === state.target) {
              setFound(i)
              break
            }
          }
          if (state.resultIndex === null) setNotFound()
          break
        case 'binarySearch': {
          let left = 0
          let right = state.array.length - 1
          movePointer('left', left)
          movePointer('right', right)
          while (left <= right && !isFinished()) {
            const mid = Math.floor((left + right) / 2)
            movePointer('mid', mid, `Pick the middle index: ${mid}.`)
            compareAt(mid)
            const midValue = valueAt(mid)
            if (midValue === state.target) {
              setFound(mid)
            } else if (midValue < state.target) {
              left = mid + 1
              movePointer('left', left, `Target is larger, so left moves to ${left}.`)
            } else {
              right = mid - 1
              movePointer('right', right, `Target is smaller, so right moves to ${right}.`)
            }
          }
          if (state.resultIndex === null) setNotFound()
          break
        }
      }
    }
  }

  push({ kind: 'note', message: 'Program starts.' }, (draft) => {
    draft.status = 'running'
    draft.message = 'Program starts.'
  })
  run(instructions)
  if (frames.at(-1)?.state.status !== 'finished') {
    push({ kind: 'note', message: 'Program finished without returning a result.' }, (draft) => {
      draft.status = 'finished'
      draft.message = 'Finished. Add an output block if the level asks for a result.'
    })
  }

  return frames
}
