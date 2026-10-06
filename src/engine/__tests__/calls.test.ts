import { describe, expect, it } from 'vitest'
import {
  getCallOptions,
  getCallers,
  getJokerSwaps,
  seatTilesAway,
} from '../calls'
import { getIllegalReason, getLegalActions } from '../legalMoves'
import { reduce } from '../reducer'
import { checkInvariants, createInitialState } from '../setup'
import { nextRng } from '../tiles'
import type { GameState, Pattern, Seat } from '../types'
import { buildState, meld, tile } from './testUtils'

const pungPattern: Pattern = {
  id: 'bam-pungs',
  groups: [
    { size: 3, face: { match: 'suit', suit: 'bam', rank: 3 } },
    { size: 3, face: { match: 'suit', suit: 'bam', rank: 4 } },
    { size: 3, face: { match: 'dragon', dragon: 'red' } },
    { size: 3, face: { match: 'wind', wind: 'east' } },
    { size: 2, face: { match: 'dragon', dragon: 'green' } },
  ],
}

const kongPattern: Pattern = {
  id: 'bam-kongs',
  groups: [
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 3 } },
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 4 } },
    { size: 4, face: { match: 'wind', wind: 'east' } },
    { size: 2, face: { match: 'dragon', dragon: 'green' } },
  ],
}

const quintPattern: Pattern = {
  id: 'bam-quint',
  groups: [
    { size: 5, face: { match: 'suit', suit: 'bam', rank: 3 } },
    { size: 3, face: { match: 'suit', suit: 'bam', rank: 4 } },
    { size: 3, face: { match: 'wind', wind: 'east' } },
    { size: 3, face: { match: 'dragon', dragon: 'red' } },
  ],
}

const pairOnlyPattern: Pattern = {
  id: 'pairs-only',
  groups: [
    { size: 2, face: { match: 'suit', suit: 'bam', rank: 3 } },
    { size: 2, face: { match: 'suit', suit: 'bam', rank: 4 } },
    { size: 2, face: { match: 'wind', wind: 'east' } },
    { size: 2, face: { match: 'wind', wind: 'south' } },
    { size: 2, face: { match: 'dragon', dragon: 'red' } },
    { size: 2, face: { match: 'dragon', dragon: 'green' } },
    { size: 2, face: { match: 'dragon', dragon: 'white' } },
  ],
}

/** East just discarded `discardId`; south is asked first. */
function callWindow(
  discardId: string,
  southHand: readonly string[],
  patterns: readonly Pattern[],
  extra: Partial<Parameters<typeof buildState>[0]> = {},
): GameState {
  return buildState({
    patterns,
    phase: 'call',
    currentSeat: 'south',
    lastDiscard: { seat: 'east', tile: tile(discardId) },
    discards: { east: [discardId] },
    hands: { south: southHand },
    ...extra,
  })
}

describe('call legality', () => {
  it('offers a pung with two matching tiles from hand', () => {
    const state = callWindow('bam-3#0', ['bam-3#1', 'bam-3#2'], [pungPattern])
    const options = getCallOptions(state, 'south')
    expect(options.map((o) => o.meld)).toEqual(['pung'])
    expect(options[0]!.tileIds).toEqual(['bam-3#1', 'bam-3#2'])
  })

  it('offers a kong, and also a pung, when three matching tiles are held', () => {
    const state = callWindow(
      'bam-3#0',
      ['bam-3#1', 'bam-3#2', 'bam-3#3'],
      [kongPattern, pungPattern],
    )
    const kinds = getCallOptions(state, 'south').map((o) => o.meld)
    expect(kinds).toEqual(['pung', 'kong'])
  })

  it('only offers set sizes that exist as groups in a pattern', () => {
    const state = callWindow(
      'bam-3#0',
      ['bam-3#1', 'bam-3#2', 'bam-3#3'],
      [kongPattern],
    )
    expect(getCallOptions(state, 'south').map((o) => o.meld)).toEqual(['kong'])
  })

  it('lets jokers fill out a quint when the pattern has a quint', () => {
    const state = callWindow(
      'bam-3#0',
      ['bam-3#1', 'bam-3#2', 'bam-3#3', 'joker#0'],
      [quintPattern],
    )
    const quint = getCallOptions(state, 'south').find((o) => o.meld === 'quint')
    expect(quint).toBeDefined()
    expect(quint!.tileIds).toEqual(['bam-3#1', 'bam-3#2', 'bam-3#3', 'joker#0'])
  })

  it('never offers a pair (calls complete sets of 3+)', () => {
    const state = callWindow('bam-3#0', ['bam-3#1'], [pairOnlyPattern])
    expect(getCallOptions(state, 'south')).toEqual([])
    const result = reduce(state, 'south', {
      type: 'call',
      meld: 'pung',
      tileIds: ['bam-3#1'],
    })
    expect(result.ok).toBe(false)
  })

  it('needs at least one natural tile from hand, not only jokers', () => {
    const state = callWindow('bam-3#0', ['joker#0', 'joker#1'], [pungPattern])
    expect(getCallOptions(state, 'south')).toEqual([])
  })

  it('rejects a call that is not part of any pattern', () => {
    const state = callWindow('bam-7#0', ['bam-7#1', 'bam-7#2'], [pungPattern])
    expect(getCallOptions(state, 'south')).toEqual([])
    const result = reduce(state, 'south', {
      type: 'call',
      meld: 'pung',
      tileIds: ['bam-7#1', 'bam-7#2'],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('call_not_in_pattern')
  })

  it('has no chows: neighbouring ranks are never callable', () => {
    const state = callWindow('bam-4#0', ['bam-3#0', 'bam-5#0'], [pungPattern])
    expect(getCallOptions(state, 'south')).toEqual([])
    expect(getCallers(state, state.lastDiscard!)).toEqual([])
  })

  it('does not let the discarder call their own discard', () => {
    const state = callWindow('bam-3#0', [], [pungPattern], {
      hands: { east: ['bam-3#1', 'bam-3#2'] },
    })
    expect(getCallOptions(state, 'east')).toEqual([])
  })
})

describe('joker call ban', () => {
  it('does not open a call window when a joker is discarded', () => {
    const state = buildState({
      patterns: [pungPattern],
      hands: {
        east: ['joker#0'],
        south: ['joker#1', 'joker#2'],
        west: ['joker#3', 'joker#4'],
      },
    })
    const result = reduce(state, 'east', { type: 'discard', tileId: 'joker#0' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.state.phase).toBe('draw')
    expect(result.state.currentSeat).toBe('south')
    expect(result.state.lastDiscard).toBeNull()
  })

  it('reports joker_call and offers nothing if a joker call is forced', () => {
    const state = callWindow('joker#0', ['joker#1', 'joker#2'], [pungPattern])
    expect(getCallOptions(state, 'south')).toEqual([])
    const attempt = {
      type: 'call' as const,
      meld: 'pung' as const,
      tileIds: ['joker#1', 'joker#2'],
    }
    expect(getIllegalReason(state, 'south', attempt)).toBe('joker_call')
    const result = reduce(state, 'south', attempt)
    expect(result.ok).toBe(false)
  })

  it('cannot declare a win on a discarded joker', () => {
    const state = callWindow('joker#0', ['bam-3#0'], [pungPattern])
    expect(
      getLegalActions(state, 'south').some((a) => a.type === 'declare_win'),
    ).toBe(false)
  })
})

describe('performing a call', () => {
  it('exposes the meld, takes the discard, and keeps tiles conserved', () => {
    const state = callWindow('bam-3#0', ['bam-3#1', 'bam-3#2'], [pungPattern])
    const result = reduce(state, 'south', {
      type: 'call',
      meld: 'pung',
      tileIds: ['bam-3#1', 'bam-3#2'],
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const next = result.state
    expect(next.phase).toBe('discard')
    expect(next.currentSeat).toBe('south')
    expect(next.exposed.south).toHaveLength(1)
    expect(next.exposed.south[0]!.kind).toBe('pung')
    expect(next.exposed.south[0]!.calledFrom).toBe('east')
    expect(next.discards.east).toHaveLength(0)
    expect(next.hands.south).toHaveLength(11)
    expect(next.lastDiscard).toBeNull()
    expect(checkInvariants(next)).toEqual([])
  })

  it('after calling, the caller discards and play continues past them', () => {
    const state = callWindow('bam-3#0', ['bam-3#1', 'bam-3#2'], [pungPattern])
    const called = reduce(state, 'south', {
      type: 'call',
      meld: 'pung',
      tileIds: ['bam-3#1', 'bam-3#2'],
    })
    if (!called.ok) throw new Error('call failed')
    const discardId = called.state.hands.south[0]!.id
    const next = reduce(called.state, 'south', {
      type: 'discard',
      tileId: discardId,
    })
    expect(next.ok).toBe(true)
    if (!next.ok) return
    expect(next.state.discards.south).toHaveLength(1)
    expect(checkInvariants(next.state)).toEqual([])
  })

  it('narrows later calls to patterns that fit the exposed set', () => {
    const state = callWindow(
      'bam-4#0',
      ['bam-4#1', 'bam-4#2'],
      [pungPattern],
      {
        exposed: {
          south: [meld('pung', ['bam-4#3', 'joker#5', 'joker#6'], 'west')],
        },
      },
    )
    // The only bam-4 group is already filled by the exposed pung.
    expect(getCallOptions(state, 'south')).toEqual([])
  })

  it('pass moves to the next caller, then back to the normal draw', () => {
    const state = callWindow(
      'bam-3#0',
      ['bam-3#1', 'bam-3#2'],
      [pungPattern],
      { hands: { south: ['bam-3#1', 'bam-3#2'], north: ['bam-3#3'] } },
    )
    const callers = getCallers(state, state.lastDiscard!)
    expect(callers).toEqual(['south'])

    const passed = reduce(state, 'south', { type: 'pass' })
    expect(passed.ok).toBe(true)
    if (!passed.ok) return
    expect(passed.state.phase).toBe('draw')
    expect(passed.state.currentSeat).toBe('south')
    expect(passed.state.lastDiscard).toBeNull()
  })

  it('asks several eligible seats in turn order', () => {
    const state = buildState({
      patterns: [pungPattern],
      phase: 'discard',
      currentSeat: 'east',
      hands: {
        east: ['bam-3#0'],
        south: ['bam-3#1', 'bam-3#2'],
        north: ['bam-3#3', 'joker#0'],
      },
    })
    const discarded = reduce(state, 'east', { type: 'discard', tileId: 'bam-3#0' })
    expect(discarded.ok).toBe(true)
    if (!discarded.ok) return
    expect(discarded.state.phase).toBe('call')
    expect(discarded.state.currentSeat).toBe('south')
    expect(discarded.state.callQueue).toEqual(['north'])

    const southPass = reduce(discarded.state, 'south', { type: 'pass' })
    if (!southPass.ok) throw new Error('pass failed')
    expect(southPass.state.currentSeat).toBe('north')
    expect(southPass.state.callQueue).toEqual([])

    const northPass = reduce(southPass.state, 'north', { type: 'pass' })
    if (!northPass.ok) throw new Error('pass failed')
    expect(northPass.state.phase).toBe('draw')
    expect(northPass.state.currentSeat).toBe('south')
  })

  it('only the asked seat may act in a call window', () => {
    const state = callWindow('bam-3#0', ['bam-3#1', 'bam-3#2'], [pungPattern])
    const result = reduce(state, 'west', { type: 'pass' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('not_your_turn')
  })

  it('wins on a discard that completes a pattern', () => {
    const winning = [
      'bam-3#1', 'bam-3#2', 'bam-4#0', 'bam-4#1', 'bam-4#2',
      'dragon-red#0', 'dragon-red#1', 'dragon-red#2',
      'wind-east#0', 'wind-east#1', 'wind-east#2',
      'dragon-green#0', 'dragon-green#1',
    ]
    const state = callWindow('bam-3#0', winning, [pungPattern])
    const actions = getLegalActions(state, 'south')
    expect(actions.some((a) => a.type === 'declare_win')).toBe(true)
    const result = reduce(state, 'south', { type: 'declare_win' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.state.phase).toBe('ended')
    expect(result.state.winner).toBe('south')
    expect(result.state.hands.south).toHaveLength(14)
    expect(checkInvariants(result.state)).toEqual([])
  })
})

describe('dead hands', () => {
  it('a dead seat is skipped in call windows and cannot win', () => {
    const state = callWindow('bam-3#0', ['bam-3#1', 'bam-3#2'], [pungPattern])
    const dead = reduce(state, 'south', { type: 'declare_dead_hand' })
    expect(dead.ok).toBe(true)
    if (!dead.ok) return
    expect(dead.state.deadHands).toEqual(['south'])
    expect(dead.state.phase).toBe('draw')
    expect(getCallOptions(dead.state, 'south')).toEqual([])
  })
})

describe('joker swap', () => {
  const exposedWithJoker = meld(
    'pung',
    ['bam-3#0', 'bam-3#1', 'joker#0'],
    'east',
  )

  function swapState(handIds: readonly string[]): GameState {
    return buildState({
      patterns: [pungPattern],
      phase: 'discard',
      currentSeat: 'west',
      hands: { west: handIds },
      exposed: { south: [exposedWithJoker] },
    })
  }

  it('lists a swap when you hold the real tile', () => {
    const state = swapState(['bam-3#2'])
    const swaps = getJokerSwaps(state, 'west')
    expect(swaps).toEqual([
      {
        targetSeat: 'south',
        meldIndex: 0,
        jokerTileId: 'joker#0',
        tileId: 'bam-3#2',
      },
    ])
  })

  it('returns the correct tile to the meld and the joker to your hand', () => {
    const state = swapState(['bam-3#2'])
    const result = reduce(state, 'west', {
      type: 'joker_swap',
      targetSeat: 'south',
      meldIndex: 0,
      jokerTileId: 'joker#0',
      tileId: 'bam-3#2',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    const next = result.state
    expect(next.exposed.south[0]!.tiles.map((t) => t.id)).toEqual([
      'bam-3#0',
      'bam-3#1',
      'bam-3#2',
    ])
    expect(next.hands.west.some((t) => t.id === 'joker#0')).toBe(true)
    expect(next.hands.west.some((t) => t.id === 'bam-3#2')).toBe(false)
    expect(next.hands.west).toHaveLength(14)
    expect(checkInvariants(next)).toEqual([])
    expect(getJokerSwaps(next, 'west')).toEqual([])
  })

  it('rejects a swap with a tile that is not the joker\'s face', () => {
    const state = swapState(['bam-4#0'])
    expect(getJokerSwaps(state, 'west')).toEqual([])
    const result = reduce(state, 'west', {
      type: 'joker_swap',
      targetSeat: 'south',
      meldIndex: 0,
      jokerTileId: 'joker#0',
      tileId: 'bam-4#0',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('no_swap_available')
  })

  it('rejects a swap off your own turn', () => {
    const state = swapState(['bam-3#2'])
    const result = reduce(state, 'north', {
      type: 'joker_swap',
      targetSeat: 'south',
      meldIndex: 0,
      jokerTileId: 'joker#0',
      tileId: 'bam-3#2',
    })
    expect(result.ok).toBe(false)
  })
})

describe('exposed tiles and tiles-away', () => {
  it('counts exposed tiles toward progress and locks patterns', () => {
    const state = buildState({
      patterns: [pungPattern, kongPattern],
      phase: 'discard',
      currentSeat: 'south',
      hands: { south: ['dragon-red#0', 'dragon-red#1', 'dragon-red#2'] },
      exposed: {
        south: [meld('pung', ['bam-3#0', 'bam-3#1', 'bam-3#2'], 'east')],
      },
    })
    expect(checkInvariants(state)).toEqual([])
    // 3 exposed + 3 red = 6 of 14 matched (the kong pattern is ruled out by the pung).
    expect(seatTilesAway(state, 'south')).toBe(8)
  })

  it('flags malformed exposed sets in invariants', () => {
    const state = buildState({
      patterns: [pungPattern],
      phase: 'discard',
      currentSeat: 'south',
      exposed: { south: [meld('kong', ['bam-3#0', 'bam-4#0', 'bam-3#1'])] },
    })
    const codes = checkInvariants(state).map((i) => i.code)
    expect(codes).toContain('bad_meld')
  })
})

describe('random play with calls', () => {
  const suitPung = (suit: 'bam' | 'crak', rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9) =>
    ({ size: 3, face: { match: 'suit', suit, rank } }) as const
  const bamRun: Pattern = {
    id: 'bam-run',
    groups: [
      suitPung('bam', 1),
      suitPung('bam', 2),
      suitPung('bam', 3),
      suitPung('bam', 4),
      { size: 2, face: { match: 'suit', suit: 'bam', rank: 5 } },
    ],
  }
  const crakKongs: Pattern = {
    id: 'crak-kongs',
    groups: [
      { size: 4, face: { match: 'suit', suit: 'crak', rank: 1 } },
      { size: 4, face: { match: 'suit', suit: 'crak', rank: 2 } },
      { size: 4, face: { match: 'suit', suit: 'crak', rank: 3 } },
      { size: 2, face: { match: 'suit', suit: 'crak', rank: 4 } },
    ],
  }
  const lowSuits: Pattern[] = [bamRun, crakKongs]

  it(
    'keeps invariants through calls, passes and swaps to the end of the wall',
    () => {
      let calls = 0
      for (const seed of [3, 11, 29, 57]) {
        let state = createInitialState(seed, lowSuits)
        let rng = seed
        let guard = 0
        while (state.phase !== 'ended') {
          if (++guard > 3000) throw new Error('did not end')
          const seat: Seat = state.currentSeat
          const legal = getLegalActions(state, seat)
          if (legal.length === 0) break
          const { value, nextSeed } = nextRng(rng)
          rng = nextSeed
          const action = legal[Math.floor(value * legal.length)]!
          if (action.type === 'call') calls++
          const result = reduce(state, seat, action)
          expect(result.ok).toBe(true)
          if (!result.ok) return
          state = result.state
          expect(checkInvariants(state)).toEqual([])
        }
      }
      expect(calls).toBeGreaterThan(0)
    },
    30_000,
  )
})
