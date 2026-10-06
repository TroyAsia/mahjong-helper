import { describe, expect, it } from 'vitest'
import { buildState } from '../../engine/__tests__/testUtils'
import { createInitialState } from '../../engine/setup'
import type { Action, GameState, Pattern, Seat } from '../../engine/types'
import { explain, explainCharlestonPass, type ExplainerConfig } from '../explain'
import { filterHintByConfig, getHint } from '../hint'
import { reduce } from '../../engine/reducer'

const pattern: Pattern = {
  id: 'bamboo-ladder',
  groups: [
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 1 } },
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 2 } },
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 3 } },
    { size: 2, face: { match: 'wind', wind: 'east' } },
  ],
}

describe('getHint', () => {
  it('never returns hint types outside config.allowed', () => {
    const state = createInitialState(1, [pattern])
    const hint = getHint(state, 'east', { allowed: ['tilesAway'] })
    expect(hint?.type).toBe('tilesAway')

    const blocked = filterHintByConfig(
      { type: 'showOdds', text: 'nope' },
      { allowed: ['tilesAway'] },
    )
    expect(blocked).toBeNull()
  })

  it('returns null when nothing allowed', () => {
    const state = createInitialState(1, [pattern])
    expect(getHint(state, 'east', { allowed: [] })).toBeNull()
  })
})

describe('explain discard', () => {
  it('returns nothing when depth is off', () => {
    const before = createInitialState(2, [pattern])
    const tileId = before.hands.east[0]!.id
    const action = { type: 'discard' as const, tileId }
    const after = reduce(before, 'east', action)
    expect(after.ok).toBe(true)
    if (!after.ok) return
    const e = explain(before, action, after.state, {
      depth: 'off',
      decisionTypes: ['discard'],
    })
    expect(e.kind).toBe('none')
    expect(e.summary).toBe('')
  })

  it('explains a discard when depth is brief', () => {
    const before = createInitialState(2, [pattern])
    const tileId = before.hands.east[0]!.id
    const action = { type: 'discard' as const, tileId }
    const after = reduce(before, 'east', action)
    expect(after.ok).toBe(true)
    if (!after.ok) return
    const e = explain(before, action, after.state, {
      depth: 'brief',
      decisionTypes: ['discard'],
    })
    expect(e.kind).toBe('discard')
    expect(e.summary.length).toBeGreaterThan(0)
  })
})

const pungsA: Pattern = {
  id: 'bam-pungs',
  groups: [
    { size: 3, face: { match: 'suit', suit: 'bam', rank: 3 } },
    { size: 3, face: { match: 'suit', suit: 'bam', rank: 4 } },
    { size: 3, face: { match: 'dragon', dragon: 'red' } },
    { size: 3, face: { match: 'wind', wind: 'east' } },
    { size: 2, face: { match: 'dragon', dragon: 'green' } },
  ],
}

const pungsB: Pattern = {
  id: 'crak-pungs',
  groups: [
    { size: 3, face: { match: 'suit', suit: 'crak', rank: 7 } },
    { size: 3, face: { match: 'suit', suit: 'crak', rank: 8 } },
    { size: 3, face: { match: 'suit', suit: 'crak', rank: 9 } },
    { size: 3, face: { match: 'wind', wind: 'south' } },
    { size: 2, face: { match: 'dragon', dragon: 'white' } },
  ],
}

const detailed: ExplainerConfig = {
  depth: 'detailed',
  decisionTypes: ['discard', 'call', 'charleston'],
}

/** South is strong on bam-pungs (11 tiles) and holds a spare pair of 7 Crak. */
const strongSouth = [
  'bam-4#0', 'bam-4#1', 'bam-4#2',
  'dragon-red#0', 'dragon-red#1', 'dragon-red#2',
  'wind-east#0', 'wind-east#1', 'wind-east#2',
  'dragon-green#0', 'dragon-green#1',
]

function callWindow(discardId: string, southHand: readonly string[]): GameState {
  return buildState({
    patterns: [pungsA, pungsB],
    phase: 'call',
    currentSeat: 'south',
    lastDiscard: { seat: 'east', tile: { id: discardId, face: faceOf(discardId) } },
    discards: { east: [discardId] },
    hands: { south: southHand },
  })
}

function faceOf(id: string) {
  const state = buildState({ hands: { east: [id] } })
  return state.hands.east.find((t) => t.id === id)!.face
}

function act(state: GameState, seat: Seat, action: Action) {
  const result = reduce(state, seat, action)
  if (!result.ok) throw new Error(result.error)
  return result.state
}

describe('explain call', () => {
  it('praises a call that completes a set in the closest pattern', () => {
    const before = callWindow('bam-3#0', [...strongSouth.slice(0, 9), 'bam-3#1', 'bam-3#2'])
    const action: Action = {
      type: 'call',
      meld: 'pung',
      tileIds: ['bam-3#1', 'bam-3#2'],
    }
    const after = act(before, 'south', action)
    const e = explain(before, action, after, detailed)
    expect(e.kind).toBe('call')
    expect(e.verdict).toBe('good')
    expect(e.detail).toContain('bam-pungs')
  })

  it('warns about a call that wrecks a near-complete hand', () => {
    const before = callWindow('crak-7#0', [...strongSouth, 'crak-7#1', 'crak-7#2'])
    const action: Action = {
      type: 'call',
      meld: 'pung',
      tileIds: ['crak-7#1', 'crak-7#2'],
    }
    const after = act(before, 'south', action)
    const e = explain(before, action, after, detailed)
    expect(e.kind).toBe('call')
    expect(e.verdict).toBe('bad')
    expect(e.detail).toContain('crak-pungs')
    expect(e.detail).toContain('bam-pungs')
  })

  it('returns nothing when call explanations are not enabled or depth is off', () => {
    const before = callWindow('bam-3#0', ['bam-3#1', 'bam-3#2'])
    const action: Action = {
      type: 'call',
      meld: 'pung',
      tileIds: ['bam-3#1', 'bam-3#2'],
    }
    const after = act(before, 'south', action)
    expect(
      explain(before, action, after, { depth: 'detailed', decisionTypes: ['discard'] })
        .kind,
    ).toBe('none')
    expect(
      explain(before, action, after, { depth: 'off', decisionTypes: ['call'] }).kind,
    ).toBe('none')
  })

  it('praises passing on a call that would have wrecked the hand', () => {
    const before = callWindow('crak-7#0', [...strongSouth, 'crak-7#1', 'crak-7#2'])
    const after = act(before, 'south', { type: 'pass' })
    const e = explain(before, { type: 'pass' }, after, detailed)
    expect(e.verdict).toBe('good')
  })

  it('notes a missed helpful call', () => {
    const before = callWindow('bam-3#0', [...strongSouth.slice(0, 9), 'bam-3#1', 'bam-3#2'])
    const after = act(before, 'south', { type: 'pass' })
    const e = explain(before, { type: 'pass' }, after, detailed)
    expect(e.verdict).toBe('ok')
    expect(e.summary).toMatch(/missed/i)
  })

  it('flags passing on a winning discard', () => {
    const winning = [
      'bam-3#1', 'bam-3#2', 'bam-4#0', 'bam-4#1', 'bam-4#2',
      'dragon-red#0', 'dragon-red#1', 'dragon-red#2',
      'wind-east#0', 'wind-east#1', 'wind-east#2',
      'dragon-green#0', 'dragon-green#1',
    ]
    const before = callWindow('bam-3#0', winning)
    const after = act(before, 'south', { type: 'pass' })
    const e = explain(before, { type: 'pass' }, after, detailed)
    expect(e.verdict).toBe('bad')
    expect(e.summary).toMatch(/won/i)
  })
})

describe('explainCharlestonPass', () => {
  const state = buildState({
    patterns: [pungsA],
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
  const junk = state.hands.east.slice(-3).map((t) => t.id)

  it('praises passing tiles that do not fit the closest pattern', () => {
    expect(junk.every((id) => id.startsWith('dot-'))).toBe(true)
    const e = explainCharlestonPass(state, 'east', junk, detailed)
    expect(e.kind).toBe('charleston')
    expect(e.verdict).toBe('good')
  })

  it('flags passing tiles that belong to the closest pattern', () => {
    const e = explainCharlestonPass(
      state,
      'east',
      ['bam-3#0', 'bam-3#1', 'bam-4#0'],
      detailed,
    )
    expect(e.verdict).toBe('bad')
    expect(e.detail).toContain('bam-pungs')
  })

  it('is silent when depth is off or charleston is not an enabled decision', () => {
    expect(
      explainCharlestonPass(state, 'east', junk, { depth: 'off', decisionTypes: ['charleston'] })
        .kind,
    ).toBe('none')
    expect(
      explainCharlestonPass(state, 'east', junk, { depth: 'brief', decisionTypes: ['discard'] })
        .kind,
    ).toBe('none')
  })
})

describe('hints during calls', () => {
  it('callAdvice mentions the call rules while a call is pending', () => {
    const before = callWindow('bam-3#0', ['bam-3#1', 'bam-3#2'])
    const hint = getHint(before, 'south', { allowed: ['callAdvice'] })
    expect(hint?.type).toBe('callAdvice')
    expect(hint?.text).toMatch(/pung, kong, quint or sextet/)
  })
})
