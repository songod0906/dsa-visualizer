import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import * as Blockly from 'blockly/core'
import { BookOpen, Check, Pause, Play, RotateCcw, Settings2, StepForward } from 'lucide-react'
import './App.css'
import {
  instructionsToPython,
  makeToolbox,
  registerDsaBlocks,
  starterXml,
  workspaceToInstructions,
} from './dsa/blockly'
import { executeProgram, createInitialState } from './dsa/engine'
import { getLearningSupport, isLinearSearchProgram } from './dsa/learningSupport'
import { levels } from './dsa/levels'
import type { LearningSupport } from './dsa/learningSupport'
import type { ExecutionFrame, LearningMode, Level, ProgramInstruction, SandboxConfig } from './dsa/types'

const sandboxScenarios = [
  {
    id: 'found-linear',
    name: 'Find one value',
    array: [4, 8, 12, 16, 20, 24],
    target: 16,
    recipe: 'linearSearch',
    note: 'A normal search: watch current move left to right until it reaches 16.',
  },
  {
    id: 'missing',
    name: 'Missing target',
    array: [3, 6, 9, 12, 15],
    target: 10,
    recipe: 'linearSearch',
    note: 'A missing target: linear search must check every cell before returning -1.',
  },
  {
    id: 'binary',
    name: 'Binary search',
    array: [2, 5, 9, 14, 18, 23, 31, 40],
    target: 23,
    recipe: 'binarySearch',
    note: 'A sorted array: binary search jumps to mid and discards half the cells.',
  },
]

const allBlocks = [
  'dsa_read_index',
  'dsa_set_pointer',
  'dsa_compare_index',
  'dsa_scan_array',
  'dsa_if_current_equals_target',
  'dsa_output_found_current',
  'dsa_output_not_found',
  'dsa_linear_search',
  'dsa_binary_search',
]

const linearSearchTeachingIntro =
  'Linear search checks values left to right until it finds the target or reaches the end.'

const explorationIntro =
  'Step through the visualization and trace.'

const explorationFallbackIntro =
  'Code highlighting is unavailable for this level.'

const explorationNeutralDetail =
  'The visualization and trace are still available for this algorithm.'

type CodeLine = {
  text: string
  number: number
}

type TeachingStep = {
  activeLines: number[]
  summary: string
  detail: string
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const makeRandomArray = () => {
  const size = randomInt(5, 8)
  const values = new Set<number>()
  while (values.size < size) values.add(randomInt(1, 30))
  return [...values].sort((left, right) => left - right)
}

const pickRandomTarget = (array: number[]) => {
  if (array.length === 0 || Math.random() < 0.35) return randomInt(1, 30)
  return array[randomInt(0, array.length - 1)]
}

const toCodeLines = (code: string): CodeLine[] =>
  code.split('\n').map((text, index) => ({
    text,
    number: index + 1,
  }))

function getTeachingStep(
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

function App() {
  const blocklyHost = useRef<HTMLDivElement | null>(null)
  const workspace = useRef<Blockly.WorkspaceSvg | null>(null)
  const runTimer = useRef<number | null>(null)

  const [mode, setMode] = useState<'puzzle' | 'sandbox'>('puzzle')
  const [learningMode, setLearningMode] = useState<LearningMode>('teaching')
  const [levelIndex, setLevelIndex] = useState(0)
  const [sandbox, setSandbox] = useState<SandboxConfig>({ array: [4, 8, 12, 16, 20, 24], target: 16 })
  const [instructions, setInstructions] = useState<ProgramInstruction[]>([])
  const [frameIndex, setFrameIndex] = useState(0)
  const [running, setRunning] = useState(false)
  const [speed, setSpeed] = useState(650)
  const [hintIndex, setHintIndex] = useState(0)
  const [feedback, setFeedback] = useState('Drag blocks, then step through the program.')

  const activeLevel = levels[levelIndex]
  const activeArray = mode === 'puzzle' ? activeLevel.array : sandbox.array
  const activeTarget = mode === 'puzzle' ? activeLevel.target : sandbox.target
  const allowedBlocks = useMemo(
    () => (mode === 'puzzle' ? activeLevel.allowedBlocks : allBlocks),
    [activeLevel.allowedBlocks, mode],
  )
  const frames = useMemo(
    () => executeProgram(instructions, activeArray, activeTarget),
    [activeArray, activeTarget, instructions],
  )
  const pythonCode = useMemo(() => instructionsToPython(instructions), [instructions])
  const codeLines = useMemo(() => toCodeLines(pythonCode), [pythonCode])
  const currentFrame = frames[Math.min(frameIndex, Math.max(frames.length - 1, 0))]
  const currentState = currentFrame?.state ?? createInitialState(activeArray, activeTarget)
  const learningSupport = useMemo(
    () => getLearningSupport(mode === 'puzzle' ? activeLevel : null, instructions),
    [activeLevel, instructions, mode],
  )
  const teachingStep = useMemo(
    () => getTeachingStep(currentFrame, instructions, learningSupport),
    [currentFrame, instructions, learningSupport],
  )
  const activeCodeLines =
    learningSupport.codeHighlight === 'supported' ? teachingStep.activeLines : []
  const sandboxExpectedIndex = sandbox.array.indexOf(sandbox.target)
  const activeHint =
    mode === 'puzzle'
      ? activeLevel.hints[hintIndex % activeLevel.hints.length]
      : 'Sandbox loop: choose an experiment, pick Linear or Binary, then Step until the result changes.'

  const refreshProgram = useCallback(() => {
    if (!workspace.current) return
    setInstructions(workspaceToInstructions(workspace.current))
    setFrameIndex(0)
    setRunning(false)
  }, [])

  const loadStarter = useCallback(
    (kind: string) => {
      if (!workspace.current) return
      workspace.current.clear()
      const xml = Blockly.utils.xml.textToDom(starterXml(kind))
      Blockly.Xml.domToWorkspace(xml, workspace.current)
      refreshProgram()
    },
    [refreshProgram],
  )

  useEffect(() => {
    registerDsaBlocks()
  }, [])

  useEffect(() => {
    if (!blocklyHost.current) return

    workspace.current?.dispose()
    workspace.current = Blockly.inject(blocklyHost.current, {
      toolbox: makeToolbox(allowedBlocks),
      trashcan: true,
      scrollbars: true,
      zoom: { controls: true, wheel: true, startScale: 0.85, maxScale: 1.2, minScale: 0.55 },
      renderer: 'zelos',
    })

    loadStarter(mode === 'puzzle' ? activeLevel.starterBlocks[0] : 'linearSearch')
    const listener = () => refreshProgram()
    workspace.current.addChangeListener(listener)
    refreshProgram()

    return () => {
      workspace.current?.removeChangeListener(listener)
      workspace.current?.dispose()
      workspace.current = null
    }
  }, [activeLevel.starterBlocks, allowedBlocks, loadStarter, mode, refreshProgram])

  useEffect(() => {
    if (!running) return
    if (frameIndex >= frames.length - 1) return

    runTimer.current = window.setTimeout(() => {
      const nextFrame = Math.min(frameIndex + 1, frames.length - 1)
      setFrameIndex(nextFrame)
      if (nextFrame >= frames.length - 1) setRunning(false)
    }, speed)

    return () => {
      if (runTimer.current) window.clearTimeout(runTimer.current)
    }
  }, [running, frameIndex, frames.length, speed])

  const resetRun = () => {
    setRunning(false)
    setFrameIndex(0)
    setFeedback('Reset to the first step.')
  }

  const stepOnce = () => {
    setRunning(false)
    setFrameIndex((index) => Math.min(index + 1, Math.max(frames.length - 1, 0)))
  }

  const runProgram = () => {
    if (frames.length === 0) return
    setRunning(true)
    setFeedback('Running. Watch the highlighted cells and trace.')
  }

  const checkAnswer = () => {
    const last = frames.at(-1)
    if (!last) {
      setFeedback('Add at least one block before checking.')
      return
    }
    if (mode === 'sandbox') {
      const result = last.state.resultIndex
      const expectedText = sandboxExpectedIndex === -1 ? 'not found (-1)' : `index ${sandboxExpectedIndex}`
      setFeedback(
        result === sandboxExpectedIndex
          ? `Sandbox result matches the data: ${expectedText}, using ${last.state.operationCount} comparisons.`
          : `This program returned ${result ?? '-'}, but this data expects ${expectedText}. Try stepping through the trace.`,
      )
      return
    }
    const passed = activeLevel.goal(last.state, frames)
    setFeedback(passed ? activeLevel.success : 'Not quite yet. Step through the trace and adjust the blocks.')
  }

  const chooseLevel = (next: number) => {
    setLevelIndex(next)
    setHintIndex(0)
    setFrameIndex(0)
    setRunning(false)
    setFeedback(`Loaded Level ${levels[next].id}: ${levels[next].title}.`)
  }

  const updateSandboxArray = (value: string) => {
    const nextArray = value
      .split(',')
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item))
    setSandbox((current) => ({ ...current, array: nextArray }))
    setFrameIndex(0)
    setRunning(false)
  }

  const randomizeSandboxArray = () => {
    const array = makeRandomArray()
    setSandbox({ array, target: pickRandomTarget(array) })
    setFrameIndex(0)
    setRunning(false)
    setFeedback('Generated a random sorted array and target. Step to see how the recipe behaves.')
  }

  const randomizeSandboxTarget = () => {
    setSandbox((current) => ({ ...current, target: pickRandomTarget(current.array) }))
    setFrameIndex(0)
    setRunning(false)
    setFeedback('Generated a random target for this array.')
  }

  const loadSandboxScenario = (scenario: (typeof sandboxScenarios)[number]) => {
    setSandbox({ array: scenario.array, target: scenario.target })
    setHintIndex(0)
    setFrameIndex(0)
    setRunning(false)
    setFeedback(scenario.note)
    loadStarter(scenario.recipe)
  }

  const loadSandboxRecipe = (recipe: 'linearSearch' | 'binarySearch') => {
    loadStarter(recipe)
    setFrameIndex(0)
    setRunning(false)
    setFeedback(
      recipe === 'linearSearch'
        ? 'Loaded Linear Search. Step to watch current check cells one by one.'
        : 'Loaded Binary Search. Step to watch left, mid, and right shrink the search area.',
    )
  }

  const chooseMode = (nextMode: 'puzzle' | 'sandbox') => {
    setMode(nextMode)
    setHintIndex(0)
    setFrameIndex(0)
    setRunning(false)
    setFeedback(
      nextMode === 'puzzle'
        ? `Loaded Level ${activeLevel.id}: ${activeLevel.title}.`
        : 'Sandbox ready. Change the data or run either search recipe.',
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <p className="eyebrow">DSA Blocks Lab</p>
          <h1>Array Search Lab</h1>
        </div>
        <nav className="algo-tabs" aria-label="Algorithm topics">
          <span className="active">Array</span>
          <span>Linear</span>
          <span>Binary</span>
          <span>Big O</span>
        </nav>
        <div className="mode-toggle" aria-label="Choose learning mode">
          <button className={mode === 'puzzle' ? 'active' : ''} onClick={() => chooseMode('puzzle')}>
            <BookOpen size={16} /> Puzzle
          </button>
          <button className={mode === 'sandbox' ? 'active' : ''} onClick={() => chooseMode('sandbox')}>
            <Settings2 size={16} /> Sandbox
          </button>
        </div>
      </header>

      <section className="lesson-strip">
        {mode === 'puzzle' ? (
          <>
            <div className="lesson-copy">
              <strong>Level {activeLevel.id}: {activeLevel.title}</strong>
              <span>{activeLevel.prompt}</span>
            </div>
            <div className="level-tabs" aria-label="Choose level">
              {levels.map((level, index) => (
                <button
                  key={level.id}
                  className={index === levelIndex ? 'active' : ''}
                  onClick={() => chooseLevel(index)}
                >
                  {level.id}
                </button>
              ))}
            </div>
          </>
        ) : (
        <SandboxControls
          sandbox={sandbox}
          onArrayChange={updateSandboxArray}
          onRandomArray={randomizeSandboxArray}
          onTargetChange={(target) => {
            setSandbox((current) => ({ ...current, target }))
            setFrameIndex(0)
            setRunning(false)
          }}
          onRandomTarget={randomizeSandboxTarget}
          onScenario={loadSandboxScenario}
          onRecipe={loadSandboxRecipe}
          expectedIndex={sandboxExpectedIndex}
        />
        )}
      </section>

      <section className="workspace-grid lab-workspace">
        <aside className="block-panel build-zone">
          <div className="panel-heading zone-heading">
            <div>
              <span className="zone-kicker">Build</span>
              <span>Logic blocks</span>
            </div>
            <button onClick={() => loadStarter(mode === 'puzzle' ? activeLevel.starterBlocks[0] : 'linearSearch')}>Starter</button>
          </div>
          <div ref={blocklyHost} className="blockly-host" />
        </aside>

        <section className="visual-panel run-zone">
          <div className="panel-heading zone-heading run-heading">
            <div>
              <span className="zone-kicker">Run</span>
              <span>Runtime stage</span>
            </div>
            <div className="memory-badges">
              <div className="learning-toggle" aria-label="Choose teaching or exploration mode">
                <button
                  className={learningMode === 'teaching' ? 'active' : ''}
                  onClick={() => setLearningMode('teaching')}
                >
                  Teaching
                </button>
                <button
                  className={learningMode === 'exploration' ? 'active' : ''}
                  onClick={() => setLearningMode('exploration')}
                >
                  Exploration
                </button>
              </div>
              <span className="step-pill">step {Math.min(frameIndex + 1, frames.length)} / {frames.length}</span>
              <span className="target-pill">target = {activeTarget}</span>
            </div>
          </div>
          <div className="run-stage">
            <ArrayBoard level={mode === 'puzzle' ? activeLevel : null} state={currentState} event={currentFrame?.event} />
            <ModePanel
              learningMode={learningMode}
              teachingStep={teachingStep}
              support={learningSupport}
            />
          </div>
          <div className="controls" aria-label="Execution controls">
            <button onClick={runProgram}><Play size={16} /> Run</button>
            <button onClick={() => setRunning(false)}><Pause size={16} /> Pause</button>
            <button onClick={stepOnce}><StepForward size={16} /> Step</button>
            <button onClick={resetRun}><RotateCcw size={16} /> Reset</button>
            <label>
              Speed
              <input type="range" min="180" max="1200" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} />
            </label>
            <button className="primary-action" onClick={checkAnswer}><Check size={16} /> Check</button>
          </div>
          <div className="run-footer">
            <div className="feedback-row">
              <p>{feedback}</p>
              <button onClick={() => setHintIndex((index) => index + 1)}>Hint</button>
            </div>
            <p className="hint-line">{activeHint}</p>
          </div>
        </section>

        <aside className="code-panel inspect-zone">
          <div className="panel-heading zone-heading">
            <div>
              <span className="zone-kicker">Inspect</span>
              <span>Code</span>
            </div>
            <span>{currentState.operationCount} comparisons</span>
          </div>
          <CodePanel lines={codeLines} activeLines={activeCodeLines} />
          <div className="trace-heading">
            <span>Trace</span>
            <span>{frames.length} steps</span>
          </div>
          <div className="trace">
            {frames.map((frame, index) => (
              <button
                key={`${frame.event.kind}-${index}`}
                className={index === frameIndex ? 'active' : ''}
                onClick={() => {
                  setRunning(false)
                  setFrameIndex(index)
                }}
              >
                <span>{index}</span>
                {frame.event.message}
              </button>
            ))}
          </div>
        </aside>
      </section>
    </main>
  )
}

function SandboxControls({
  sandbox,
  onArrayChange,
  onRandomArray,
  onTargetChange,
  onRandomTarget,
  onScenario,
  onRecipe,
  expectedIndex,
}: {
  sandbox: SandboxConfig
  onArrayChange: (value: string) => void
  onRandomArray: () => void
  onTargetChange: (value: number) => void
  onRandomTarget: () => void
  onScenario: (scenario: (typeof sandboxScenarios)[number]) => void
  onRecipe: (recipe: 'linearSearch' | 'binarySearch') => void
  expectedIndex: number
}) {
  return (
    <div className="sandbox-controls">
      <div className="sandbox-intro">
        <strong>Sandbox: make your own search experiment</strong>
        <span>
          Pick data, choose a recipe, then Step. Expected result:{' '}
          {expectedIndex === -1 ? 'not found (-1)' : `target is at index ${expectedIndex}`}.
        </span>
      </div>
      <div className="experiment-row" aria-label="Sandbox experiments">
        {sandboxScenarios.map((scenario) => (
          <button key={scenario.id} onClick={() => onScenario(scenario)}>
            {scenario.name}
          </button>
        ))}
      </div>
      <div className="sandbox-fields">
        <label>
          Array
          <span className="field-with-action">
            <input
              key={sandbox.array.join(',')}
              defaultValue={sandbox.array.join(', ')}
              onBlur={(event) => onArrayChange(event.target.value)}
            />
            <button type="button" onClick={onRandomArray}>Random</button>
          </span>
        </label>
        <label>
          Target
          <span className="field-with-action compact">
            <input type="number" value={sandbox.target} onChange={(event) => onTargetChange(Number(event.target.value))} />
            <button type="button" onClick={onRandomTarget}>Random</button>
          </span>
        </label>
      </div>
      <div className="recipe-row" aria-label="Sandbox recipes">
        <span>Load recipe:</span>
        <button onClick={() => onRecipe('linearSearch')}>Linear Search</button>
        <button onClick={() => onRecipe('binarySearch')}>Binary Search</button>
      </div>
    </div>
  )
}

function ModePanel({
  learningMode,
  teachingStep,
  support,
}: {
  learningMode: LearningMode
  teachingStep: TeachingStep
  support: LearningSupport
}) {
  if (learningMode === 'teaching') {
    const message =
      support.teaching === 'supported'
        ? null
        : support.teaching === 'partial'
          ? 'Line-by-line teaching is not wired for this block-built version yet.'
          : 'Teaching is not ready for this level yet.'

    return (
      <section className="mode-panel" aria-label="Teaching mode details">
        <div>
          <strong>Teaching</strong>
          <span>{message ?? linearSearchTeachingIntro}</span>
        </div>
        {!message && (
          <div className="step-explanation">
            <span>{teachingStep.summary}</span>
            <p>{teachingStep.detail}</p>
          </div>
        )}
      </section>
    )
  }

  return (
    <section className="mode-panel" aria-label="Exploration mode details">
      <div>
        <strong>Exploration</strong>
        <span>{explorationIntro}</span>
        {support.codeHighlight !== 'supported' && (
          <span>{explorationFallbackIntro}</span>
        )}
      </div>
      <div className="step-explanation">
        <span>{teachingStep.summary}</span>
        <p>{support.codeHighlight === 'supported' ? teachingStep.detail : explorationNeutralDetail}</p>
      </div>
    </section>
  )
}

function CodePanel({ lines, activeLines }: { lines: CodeLine[]; activeLines: number[] }) {
  return (
    <pre className="python-code" aria-label="Python code with current line highlight">
      {lines.map((line) => (
        <code className={activeLines.includes(line.number) ? 'active' : ''} key={`${line.number}-${line.text}`}>
          <span>{line.number}</span>
          {line.text || ' '}
        </code>
      ))}
    </pre>
  )
}

function ArrayBoard({
  level,
  state,
  event,
}: {
  level: Level | null
  state: ReturnType<typeof createInitialState>
  event: ExecutionFrame['event'] | undefined
}) {
  const pointerEntries = Object.entries(state.pointers).filter(([, value]) => typeof value === 'number')
  const left = state.pointers.left
  const right = state.pointers.right
  const hasBinaryWindow = typeof left === 'number' && typeof right === 'number'
  const current = state.pointers.current
  const maxMagnitude = Math.max(...state.array.map((value) => Math.abs(value)), 1)

  return (
    <div className="array-board">
      <div className="concept-line">{level?.concept ?? 'Experiment with array values and search targets.'}</div>
      <div className="variables-panel" aria-label="Runtime variables">
        <span className="variable-chip">target: {state.target}</span>
        <span className="variable-chip">result: {state.resultIndex ?? '-'}</span>
        <span className="variable-chip">comparisons: {state.operationCount}</span>
        {pointerEntries.map(([name, value]) => (
          <span className="variable-chip pointer" key={name}>
            {name}: {value}
          </span>
        ))}
      </div>
      <div className="array-cells">
        {state.array.map((value, index) => {
          const pointers = Object.entries(state.pointers)
            .filter(([, pointerIndex]) => pointerIndex === index)
            .map(([name]) => name)
          const isActive = state.currentIndex === index || event?.index === index
          const isMatch = event?.kind === 'compare' && event.index === index && event.match
          const isDiscarded = hasBinaryWindow && (index < left || index > right)
          const isVisited = !hasBinaryWindow && typeof current === 'number' && index < current
          const cellStyle = {
            '--cell-height': `${56 + (Math.abs(value) / maxMagnitude) * 118}px`,
          } as CSSProperties
          return (
            <div
              className={`array-cell ${isActive ? 'active' : ''} ${isMatch ? 'match' : ''} ${isDiscarded ? 'discarded' : ''} ${isVisited ? 'visited' : ''}`}
              key={`${value}-${index}`}
              style={cellStyle}
            >
              <div className="cell-index">{index}</div>
              <strong>{value}</strong>
              <div className="pointer-stack">
                {pointers.map((pointer) => (
                  <span key={pointer}>{pointer}</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <div className="state-readout">
        <span>last read: {state.lastRead ?? '-'}</span>
        <span>result: {state.resultIndex ?? '-'}</span>
        <span>{state.message}</span>
      </div>
    </div>
  )
}

export default App
