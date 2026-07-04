import * as Blockly from 'blockly/core'
import 'blockly/blocks'
import type { ProgramInstruction } from './types'

let registered = false

export const blockLabels: Record<string, string> = {
  dsa_read_index: 'read array[index]',
  dsa_set_pointer: 'move pointer',
  dsa_compare_index: 'compare value with target',
  dsa_scan_array: 'for each index',
  dsa_if_current_equals_target: 'if current equals target',
  dsa_output_found_current: 'return found index',
  dsa_output_not_found: 'return -1',
  dsa_linear_search: 'linear search recipe',
  dsa_binary_search: 'binary search recipe',
}

export function registerDsaBlocks() {
  if (registered) return
  registered = true

  Blockly.common.defineBlocksWithJsonArray([
    {
      type: 'dsa_read_index',
      message0: 'read array [ %1 ]',
      args0: [{ type: 'field_number', name: 'INDEX', value: 0, min: 0, precision: 1 }],
      previousStatement: null,
      nextStatement: null,
      colour: 205,
      tooltip: 'Read one array cell by index.',
    },
    {
      type: 'dsa_set_pointer',
      message0: 'move %1 pointer to index %2',
      args0: [
        {
          type: 'field_dropdown',
          name: 'POINTER',
          options: [
            ['current', 'current'],
            ['left', 'left'],
            ['mid', 'mid'],
            ['right', 'right'],
          ],
        },
        { type: 'field_number', name: 'INDEX', value: 0, min: 0, precision: 1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 45,
      tooltip: 'Place a pointer marker on an array index.',
    },
    {
      type: 'dsa_compare_index',
      message0: 'compare array [ %1 ] with target',
      args0: [
        {
          type: 'field_dropdown',
          name: 'INDEX',
          options: [
            ['current', 'i'],
            ['mid', 'mid'],
            ['0', '0'],
            ['1', '1'],
            ['2', '2'],
            ['3', '3'],
            ['4', '4'],
            ['5', '5'],
            ['6', '6'],
            ['7', '7'],
            ['8', '8'],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 120,
      tooltip: 'Compare an array cell with the target value.',
    },
    {
      type: 'dsa_scan_array',
      message0: 'for each index in array %1 do %2',
      args0: [
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 260,
      tooltip: 'Visit every index from left to right.',
    },
    {
      type: 'dsa_if_current_equals_target',
      message0: 'if current value equals target %1 do %2',
      args0: [
        { type: 'input_dummy' },
        { type: 'input_statement', name: 'DO' },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 20,
      tooltip: 'Run inner blocks only when the current cell matches.',
    },
    {
      type: 'dsa_output_found_current',
      message0: 'return current index',
      previousStatement: null,
      nextStatement: null,
      colour: 300,
      tooltip: 'Finish with the index where the target was found.',
    },
    {
      type: 'dsa_output_not_found',
      message0: 'return -1 not found',
      previousStatement: null,
      nextStatement: null,
      colour: 300,
      tooltip: 'Finish when the target is not in the array.',
    },
    {
      type: 'dsa_linear_search',
      message0: 'linear search for target',
      previousStatement: null,
      nextStatement: null,
      colour: 155,
      tooltip: 'A full linear search recipe.',
    },
    {
      type: 'dsa_binary_search',
      message0: 'binary search for target',
      previousStatement: null,
      nextStatement: null,
      colour: 185,
      tooltip: 'A full binary search recipe for sorted arrays.',
    },
  ])
}

export function makeToolbox(allowedBlocks: string[]) {
  const byCategory: Record<string, string[]> = {
    Array: ['dsa_read_index'],
    Pointer: ['dsa_set_pointer'],
    Loop: ['dsa_scan_array'],
    Compare: ['dsa_compare_index', 'dsa_if_current_equals_target'],
    Control: ['dsa_linear_search', 'dsa_binary_search'],
    Output: ['dsa_output_found_current', 'dsa_output_not_found'],
  }

  return {
    kind: 'categoryToolbox',
    contents: Object.entries(byCategory)
      .map(([name, blocks]) => ({
        kind: 'category',
        name,
        colour: categoryColour(name),
        contents: blocks
          .filter((type) => allowedBlocks.includes(type))
          .map((type) => ({ kind: 'block', type })),
      }))
      .filter((category) => category.contents.length > 0),
  }
}

export function workspaceToInstructions(workspace: Blockly.Workspace): ProgramInstruction[] {
  return workspace
    .getTopBlocks(true)
    .flatMap((block) => blockToInstructions(block))
}

export type ProgramCode = {
  code: string
  // 1-indexed line number of each instruction's primary (first) generated line,
  // keyed by instruction object identity. Includes nested instructions.
  lineOf: Map<ProgramInstruction, number>
}

// Generates the beginner Python and, in the same walk, records which line each
// instruction begins on. The teaching layer uses lineOf to highlight the exact
// line a given execution frame is running.
export function buildProgramCode(instructions: ProgramInstruction[]): ProgramCode {
  const lineOf = new Map<ProgramInstruction, number>()
  if (instructions.length === 0) {
    return { code: '# Drag blocks here to build a program.', lineOf }
  }
  // Line 1 is the `def` header; the body begins at line 2.
  const body = emitPython(instructions, 1, 2, lineOf)
  return { code: ['def search(array, target):', ...body].join('\n'), lineOf }
}

export function instructionsToPython(instructions: ProgramInstruction[]): string {
  return buildProgramCode(instructions).code
}

export function starterXml(kind: string): string {
  const snippets: Record<string, string> = {
    readIndex: '<block type="dsa_read_index" x="24" y="32"><field name="INDEX">2</field></block>',
    setPointer:
      '<block type="dsa_set_pointer" x="24" y="32"><field name="POINTER">current</field><field name="INDEX">2</field></block>',
    compareIndex:
      '<block type="dsa_compare_index" x="24" y="32"><field name="INDEX">2</field></block>',
    linearSearch:
      '<block type="dsa_linear_search" x="24" y="32"></block>',
    binarySearch:
      '<block type="dsa_binary_search" x="24" y="32"></block>',
    middleCompare:
      '<block type="dsa_set_pointer" x="24" y="32"><field name="POINTER">mid</field><field name="INDEX">3</field><next><block type="dsa_compare_index"><field name="INDEX">mid</field></block></next></block>',
    linearSearchParts:
      '<block type="dsa_scan_array" x="24" y="32"><statement name="DO"><block type="dsa_compare_index"><field name="INDEX">i</field><next><block type="dsa_if_current_equals_target"><statement name="DO"><block type="dsa_output_found_current"></block></statement></block></next></block></statement><next><block type="dsa_output_not_found"></block></next></block>',
  }
  return `<xml xmlns="https://developers.google.com/blockly/xml">${snippets[kind] ?? ''}</xml>`
}

function blockToInstructions(block: Blockly.Block | null): ProgramInstruction[] {
  const instructions: ProgramInstruction[] = []
  let cursor = block

  while (cursor) {
    const instruction = singleBlockToInstruction(cursor)
    if (instruction) instructions.push(instruction)
    cursor = cursor.getNextBlock()
  }

  return instructions
}

function singleBlockToInstruction(block: Blockly.Block): ProgramInstruction | null {
  switch (block.type) {
    case 'dsa_read_index':
      return { type: 'readIndex', index: Number(block.getFieldValue('INDEX')) }
    case 'dsa_set_pointer':
      return {
        type: 'setPointer',
        pointer: block.getFieldValue('POINTER'),
        index: Number(block.getFieldValue('INDEX')),
      }
    case 'dsa_compare_index': {
      const raw = block.getFieldValue('INDEX')
      return { type: 'compareIndex', index: raw === 'i' || raw === 'mid' ? raw : Number(raw) }
    }
    case 'dsa_scan_array':
      return {
        type: 'scanArray',
        body: blockToInstructions(block.getInputTargetBlock('DO')),
      }
    case 'dsa_if_current_equals_target':
      return {
        type: 'ifCurrentEqualsTarget',
        body: blockToInstructions(block.getInputTargetBlock('DO')),
      }
    case 'dsa_output_found_current':
      return { type: 'outputFoundCurrent' }
    case 'dsa_output_not_found':
      return { type: 'outputNotFound' }
    case 'dsa_linear_search':
      return { type: 'linearSearch' }
    case 'dsa_binary_search':
      return { type: 'binarySearch' }
    default:
      return null
  }
}

// Emits the Python for a list of instructions starting at absolute line
// `firstLine`, recording each instruction's start line in `lineOf` as it goes.
function emitPython(
  instructions: ProgramInstruction[],
  indent: number,
  firstLine: number,
  lineOf: Map<ProgramInstruction, number>,
): string[] {
  const pad = '    '.repeat(indent)
  const out: string[] = []
  let line = firstLine

  // Emit a leaf instruction (no nested body) and advance the line counter.
  const leaf = (instruction: ProgramInstruction, produced: string[]) => {
    lineOf.set(instruction, line)
    out.push(...produced)
    line += produced.length
  }

  // Emit a block instruction: its header line, then its nested body.
  const block = (instruction: ProgramInstruction, header: string, body: ProgramInstruction[]) => {
    lineOf.set(instruction, line)
    out.push(header)
    line += 1
    const inner = emitPython(body, indent + 1, line, lineOf)
    out.push(...inner)
    line += inner.length
  }

  for (const instruction of instructions) {
    switch (instruction.type) {
      case 'readIndex':
        leaf(instruction, [`${pad}value = array[${instruction.index}]`])
        break
      case 'setPointer':
        leaf(instruction, [`${pad}${instruction.pointer} = ${instruction.index}`])
        break
      case 'compareIndex':
        leaf(instruction, [`${pad}array[${instruction.index}] == target`])
        break
      case 'scanArray':
        block(instruction, `${pad}for i in range(len(array)):`, instruction.body)
        break
      case 'ifCurrentEqualsTarget':
        block(instruction, `${pad}if array[i] == target:`, instruction.body)
        break
      case 'outputFoundCurrent':
        leaf(instruction, [`${pad}return i`])
        break
      case 'outputNotFound':
        leaf(instruction, [`${pad}return -1`])
        break
      case 'linearSearch':
        leaf(instruction, [
          `${pad}for i in range(len(array)):`,
          `${pad}    if array[i] == target:`,
          `${pad}        return i`,
          `${pad}return -1`,
        ])
        break
      case 'binarySearch':
        leaf(instruction, [
          `${pad}left = 0`,
          `${pad}right = len(array) - 1`,
          `${pad}while left <= right:`,
          `${pad}    mid = (left + right) // 2`,
          `${pad}    if array[mid] == target:`,
          `${pad}        return mid`,
          `${pad}    if array[mid] < target:`,
          `${pad}        left = mid + 1`,
          `${pad}    else:`,
          `${pad}        right = mid - 1`,
          `${pad}return -1`,
        ])
        break
    }
  }

  return out
}

function categoryColour(name: string) {
  return {
    Array: '205',
    Pointer: '45',
    Loop: '260',
    Compare: '120',
    Control: '155',
    Output: '300',
  }[name]
}
