import { describe, expect, it } from 'vitest'
import * as Blockly from 'blockly/core'
import 'blockly/blocks'
import { instructionsToPython, registerDsaBlocks, starterXml, workspaceToInstructions } from './blockly'

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
