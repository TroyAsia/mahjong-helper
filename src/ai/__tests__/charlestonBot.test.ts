import { describe, expect, it } from 'vitest'
import { buildState } from '../../engine/__tests__/testUtils'
import { reduce } from '../../engine/reducer'
import { createInitialState } from '../../engine/setup'
import { SEATS, type GameState, type Pattern } from '../../engine/types'
import { charlestonBotFromState } from '../bots/charlestonBot'
import type { AiConfig } from '../types'

const pattern: Pattern = {
  id: 'bam-pungs',
  groups: [
    { size: 3, face: { match: 'suit', suit: 'bam', rank: 3 } },
    { size: 3, face: { match: 'suit', suit: 'bam', rank: 4 } },
    { size: 3, face: { match: 'dragon', dragon: 'red' } },
    { size: 3, face: { match: 'wind', wind: 'east' } },
    { size: 2, face: { match: 'dragon', dragon: 'green' } },
  ],
}

const strong: AiConfig = { thinkDelayMs: 0, strength: 1, mistakeRate: 0 }
const random: AiConfig = { thinkDelayMs: 0, strength: 0, mistakeRate: 1 }

function eastHeavy(): GameState {
  return buildState({
    patterns: [pattern],
    phase: 'charleston',
    hands: {
      east: [
        'bam-3#0', 'bam-3#1', 'bam-3#2',
        'bam-4#0', 'bam-4#1', 'bam-4#2',
        'dragon-red#0', 'dragon-red#1', 'dragon-red#2',
        'wind-east#0', 'wind-east#1',
      ],
    },
  })
}

describe('charlestonBotFromState', () => {
  it('passes tiles that do not fit its closest pattern', () => {
    const state = eastHeavy()
    const { action } = charlestonBotFromState(state, 'east', 7, strong)
    expect(action.type).toBe('charleston_pass')
    if (action.type !== 'charleston_pass') return
    expect(action.tileIds).toHaveLength(3)
    expect(action.tileIds.every((id) => id.startsWith('dot-'))).toBe(true)
  })

  it('never passes jokers, even playing randomly', () => {
    const state = createInitialState(9, [pattern], { charleston: true })
    for (let seed = 1; seed < 30; seed++) {
      const { action } = charlestonBotFromState(state, 'east', seed, random)
      if (action.type !== 'charleston_pass') throw new Error('expected pass')
      const hand = state.hands.east
      for (const id of action.tileIds) {
        expect(hand.find((t) => t.id === id)?.face.kind).not.toBe('joker')
      }
    }
  })

  it('produces actions the engine accepts through a whole Charleston', () => {
    let state = createInitialState(13, [pattern], { charleston: true })
    let seed = 5
    let guard = 0
    while (state.phase === 'charleston') {
      if (++guard > 60) throw new Error('charleston did not finish')
      for (const seat of SEATS) {
        const pick = charlestonBotFromState(state, seat, seed, strong)
        seed = pick.nextSeed
        const result = reduce(state, seat, pick.action)
        if (!result.ok) throw new Error(result.error)
        state = result.state
      }
    }
    expect(state.phase).toBe('discard')
  })
})
