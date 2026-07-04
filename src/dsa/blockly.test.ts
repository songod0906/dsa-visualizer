import { describe, expect, it } from 'vitest'
import * as Blockly from 'blockly/core'
import 'blockly/blocks'
import { buildProgramCode, instructionsToPython, registerDsaBlocks, starterXml, workspaceToInstructions } from './blockly'
import type { ProgramInstruction } from './types'

function parseStarter(kind: string) {
  registerDsaBlocks()
  const workspace = new Blockly.Workspace()
  const xml = Blockly.utils.xml.textToDom(starterXml(kind))
  Blockly.Xml.domToWorkspace(xml, workspace)
  const instructions = workspaceToInstructions(workspace)
  workspace.dispose()
  return instructions
}

describe('Blockly parser', () => {
  it('converts a read block to an instruction', () => {
    expect(parseStarter('readIndex')).toEqual([{ type: 'readIndex', index: 2 }])
  })

  it('converts pointer and comparison blocks to instructions', () => {
    expect(parseStarter('middleCompare')).toEqual([
      { type: 'setPointer', pointer: 'mid', index: 3 },
      { type: 'compareIndex', index: 'mid' },
    ])
  })

  it('converts nested linear search blocks to safe instructions', () => {
    expect(parseStarter('linearSearchParts')).toEqual([
      {
        type: 'scanArray',
        body: [
          { type: 'compareIndex', index: 'i' },
          { type: 'ifCurrentEqualsTarget', body: [{ type: 'outputFoundCurrent' }] },
        ],
      },
      { type: 'outputNotFound' },
    ])
  })

  it('parses binarySearch starter block', () => {
    expect(parseStarter('binarySearch')).toEqual([{ type: 'binarySearch' }])
  })

  it('reveals beginner-friendly Python', () => {
    const python = instructionsToPython(parseStarter('binarySearch'))

    expect(python).toContain('def search(array, target):')
    expect(python).toContain('mid = (left + right) // 2')
    expect(python).toContain('return -1')
  })
})

describe('buildProgramCode line map', () => {
  it('maps each instruction (including nested) to its generated line', () => {
    const compare: ProgramInstruction = { type: 'compareIndex', index: 'i' }
    const found: ProgramInstruction = { type: 'outputFoundCurrent' }
    const ifBlock: ProgramInstruction = { type: 'ifCurrentEqualsTarget', body: [found] }
    const scan: ProgramInstruction = { type: 'scanArray', body: [compare, ifBlock] }
    const notFound: ProgramInstruction = { type: 'outputNotFound' }
    const program = [scan, notFound]

    const { code, lineOf } = buildProgramCode(program)
    const lines = code.split('\n')

    // 1 def / 2 for / 3 compare / 4 if / 5 return i / 6 return -1
    expect(lineOf.get(scan)).toBe(2)
    expect(lineOf.get(compare)).toBe(3)
    expect(lineOf.get(ifBlock)).toBe(4)
    expect(lineOf.get(found)).toBe(5)
    expect(lineOf.get(notFound)).toBe(6)

    // The recorded line number actually points at that instruction's text.
    expect(lines[lineOf.get(scan)! - 1]).toContain('for i in range')
    expect(lines[lineOf.get(ifBlock)! - 1]).toContain('if array[i] == target')
    expect(lines[lineOf.get(found)! - 1]).toContain('return i')
    expect(lines[lineOf.get(notFound)! - 1].trim()).toBe('return -1')
  })
})
