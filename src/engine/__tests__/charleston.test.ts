import { describe, expect, it } from 'vitest'
import {
  charlestonLegalActions,
  createCharlestonState,
  nextCharlestonStep,
  passTarget,
  stepDirection,
} from '../charleston'
import { getIllegalReason, getLegalActions } from '../legalMoves'
import { reduce } from '../reducer'
import { checkInvariants, createInitialState } from '../setup'
import type { GameState, Seat } from '../types'
import { SEATS } from '../types'

function start(seed = 5): GameState {
  return createInitialState(seed, [], { charleston: true })
}

/** First `count` non-joker tile ids from a seat's hand. */
function pickIds(state: GameState, seat: Seat, count = 3): string[] {
  return state.hands[seat]
    .filter((t) => t.face.kind !== 'joker')
    .slice(0, count)
    .map((t) => t.id)
}

function submitAll(
  state: GameState,
  picks: { [S in Seat]?: readonly string[] } = {},
): GameState {
  let next = state
  for (const seat of SEATS) {
    const tileIds = picks[seat] ?? pickIds(next, seat)
    const result = reduce(next, seat, { type: 'charleston_pass', tileIds })
    if (!result.ok) throw new Error(`pass failed for ${seat}: ${result.error}`)
    next = result.state
  }
  return next
}

function voteAll(state: GameState, votes: { [S in Seat]: boolean }): GameState {
  let next = state
  for (const seat of SEATS) {
    const result = reduce(next, seat, {
      type: 'charleston_vote',
      continue: votes[seat],
    })
    if (!result.ok) throw new Error(`vote failed: ${result.error}`)
    next = result.state
  }
  return next
}

const allYes = { east: true, south: true, west: true, north: true }

function stepOf(state: GameState) {
  return state.charleston?.step ?? null
}

describe('pass directions', () => {
  it('right is the next seat in turn order, across is opposite, left is the previous', () => {
    expect(passTarget('east', 'right')).toBe('south')
    expect(passTarget('east', 'across')).toBe('west')
    expect(passTarget('east', 'left')).toBe('north')
    expect(passTarget('north', 'right')).toBe('east')
    expect(passTarget('south', 'left')).toBe('east')
  })

  it('maps steps to directions', () => {
    expect(stepDirection('first_right')).toBe('right')
    expect(stepDirection('first_across')).toBe('across')
    expect(stepDirection('first_left')).toBe('left')
    expect(stepDirection('second_left')).toBe('left')
    expect(stepDirection('second_across')).toBe('across')
    expect(stepDirection('second_right')).toBe('right')
    expect(stepDirection('courtesy')).toBe('across')
    expect(stepDirection('vote_second')).toBeNull()
  })
})

describe('charleston setup', () => {
  it('deals 14/13/13/13 and starts in the charleston phase', () => {
    const state = start()
    expect(state.phase).toBe('charleston')
    expect(state.charleston).toEqual(createCharlestonState())
    expect(state.hands.east).toHaveLength(14)
    expect(state.hands.south).toHaveLength(13)
    expect(checkInvariants(state)).toEqual([])
  })

  it('does not enable draw/discard during the charleston', () => {
    const state = start()
    const types = new Set(
      SEATS.flatMap((s) => getLegalActions(state, s).map((a) => a.type)),
    )
    expect([...types]).toEqual(['charleston_pass'])
  })
})

describe('first charleston', () => {
  it('passes right, then across, then left in order', () => {
    let state = start()
    const order: (string | null)[] = [stepOf(state)]
    for (let i = 0; i < 3; i++) {
      state = submitAll(state)
      order.push(stepOf(state))
    }
    expect(order).toEqual([
      'first_right',
      'first_across',
      'first_left',
      'vote_second',
    ])
  })

  it('moves the chosen tiles to the seat on the right', () => {
    const state = start()
    const picks = Object.fromEntries(
      SEATS.map((s) => [s, pickIds(state, s)]),
    ) as { [S in Seat]: string[] }
    const next = submitAll(state, picks)

    for (const seat of SEATS) {
      const target = passTarget(seat, 'right')
      for (const id of picks[seat]) {
        expect(next.hands[target].some((t) => t.id === id)).toBe(true)
        if (target !== seat) {
          expect(next.hands[seat].some((t) => t.id === id)).toBe(false)
        }
      }
    }
    expect(next.hands.east).toHaveLength(14)
    expect(next.hands.south).toHaveLength(13)
    expect(checkInvariants(next)).toEqual([])
  })

  it('waits until all four seats have committed', () => {
    const state = start()
    const first = reduce(state, 'east', {
      type: 'charleston_pass',
      tileIds: pickIds(state, 'east'),
    })
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(stepOf(first.state)).toBe('first_right')
    expect(first.state.charleston!.selections.east).not.toBeNull()
    expect(first.state.hands.east).toEqual(state.hands.east)

    const again = reduce(first.state, 'east', {
      type: 'charleston_pass',
      tileIds: pickIds(state, 'east'),
    })
    expect(again.ok).toBe(false)
    if (!again.ok) expect(again.reason).toBe('charleston_already_submitted')
  })

  it('requires exactly three tiles and never jokers', () => {
    const state = start()
    const two = reduce(state, 'south', {
      type: 'charleston_pass',
      tileIds: pickIds(state, 'south', 2),
    })
    expect(two.ok).toBe(false)
    if (!two.ok) expect(two.reason).toBe('charleston_wrong_count')

    const joker = { id: 'joker#0', face: { kind: 'joker' as const } }
    const withJoker: GameState = {
      ...state,
      hands: { ...state.hands, south: [joker, ...state.hands.south.slice(1)] },
    }
    const ids = ['joker#0', ...pickIds(withJoker, 'south', 2)]
    const result = reduce(withJoker, 'south', {
      type: 'charleston_pass',
      tileIds: ids,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('charleston_joker')

    const missing = getIllegalReason(state, 'south', {
      type: 'charleston_pass',
      tileIds: ['nope#0', 'nope#1', 'nope#2'],
    })
    expect(missing).toBe('no_such_tile')
  })

  it('excludes jokers from legal pass options', () => {
    const state = start()
    const jokerIds = new Set(
      state.hands.east.filter((t) => t.face.kind === 'joker').map((t) => t.id),
    )
    for (const action of charlestonLegalActions(state, 'east')) {
      if (action.type !== 'charleston_pass') throw new Error('unexpected')
      expect(action.tileIds).toHaveLength(3)
      expect(action.tileIds.some((id) => jokerIds.has(id))).toBe(false)
    }
  })
})

describe('optional second charleston', () => {
  function atVote(): GameState {
    let state = start()
    for (let i = 0; i < 3; i++) state = submitAll(state)
    return state
  }

  it('runs left, across, right when everyone agrees, then the courtesy pass', () => {
    let state = voteAll(atVote(), allYes)
    const order: (string | null)[] = [stepOf(state)]
    for (let i = 0; i < 3; i++) {
      state = submitAll(state)
      order.push(stepOf(state))
    }
    expect(order).toEqual([
      'second_left',
      'second_across',
      'second_right',
      'courtesy',
    ])
  })

  it('skips straight to the courtesy pass if any seat stops', () => {
    const state = voteAll(atVote(), { ...allYes, west: false })
    expect(stepOf(state)).toBe('courtesy')
  })

  it('a single stop vote from the last seat is enough', () => {
    const state = voteAll(atVote(), { ...allYes, north: false })
    expect(stepOf(state)).toBe('courtesy')
  })

  it('does not decide until every seat has voted', () => {
    const state = atVote()
    const one = reduce(state, 'east', { type: 'charleston_vote', continue: true })
    if (!one.ok) throw new Error('vote failed')
    expect(stepOf(one.state)).toBe('vote_second')
    const dup = reduce(one.state, 'east', {
      type: 'charleston_vote',
      continue: false,
    })
    expect(dup.ok).toBe(false)
  })

  it('rejects votes and passes at the wrong step', () => {
    const early = reduce(start(), 'east', {
      type: 'charleston_vote',
      continue: true,
    })
    expect(early.ok).toBe(false)
    const atVoteState = atVote()
    const pass = reduce(atVoteState, 'east', {
      type: 'charleston_pass',
      tileIds: pickIds(atVoteState, 'east'),
    })
    expect(pass.ok).toBe(false)
  })

  it('nextCharlestonStep follows the vote result', () => {
    const base = createCharlestonState()
    const voted = (votes: { [S in Seat]: boolean }) => ({
      ...base,
      step: 'vote_second' as const,
      votes,
    })
    expect(nextCharlestonStep(voted(allYes))).toBe('second_left')
    expect(nextCharlestonStep(voted({ ...allYes, south: false }))).toBe(
      'courtesy',
    )
  })
})

describe('courtesy pass and handoff', () => {
  function atCourtesy(): GameState {
    let state = start()
    for (let i = 0; i < 3; i++) state = submitAll(state)
    return voteAll(state, { ...allYes, east: false })
  }

  it('exchanges the smaller of the two proposed counts with your partner across', () => {
    const state = atCourtesy()
    const eastIds = pickIds(state, 'east', 3)
    const westIds = pickIds(state, 'west', 1)
    const next = submitAll(state, {
      east: eastIds,
      west: westIds,
      south: [],
      north: [],
    })

    expect(next.charleston).toBeNull()
    expect(next.phase).toBe('discard')
    expect(next.currentSeat).toBe('east')
    expect(next.hands.west.some((t) => t.id === eastIds[0])).toBe(true)
    expect(next.hands.west.some((t) => t.id === eastIds[1])).toBe(false)
    expect(next.hands.east.some((t) => t.id === westIds[0])).toBe(true)
    expect(next.hands.east.some((t) => t.id === eastIds[0])).toBe(false)
    expect(next.hands.east.some((t) => t.id === eastIds[1])).toBe(true)
  })

  it('allows zero tiles and then hands off to normal play with a valid deal', () => {
    const state = atCourtesy()
    const next = submitAll(state, { east: [], south: [], west: [], north: [] })
    expect(next.phase).toBe('discard')
    expect(next.hands.east).toHaveLength(14)
    expect(next.hands.south).toHaveLength(13)
    expect(checkInvariants(next)).toEqual([])
    expect(
      getLegalActions(next, 'east').every(
        (a) => a.type === 'discard' || a.type === 'declare_win',
      ),
    ).toBe(true)
  })

  it('rejects more than three tiles on the courtesy pass', () => {
    const state = atCourtesy()
    const result = reduce(state, 'east', {
      type: 'charleston_pass',
      tileIds: pickIds(state, 'east', 4),
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.reason).toBe('charleston_wrong_count')
  })

  it('plays a full two-round Charleston and keeps every tile accounted for', () => {
    let state = start(21)
    for (let i = 0; i < 3; i++) state = submitAll(state)
    state = voteAll(state, allYes)
    for (let i = 0; i < 3; i++) state = submitAll(state)
    expect(stepOf(state)).toBe('courtesy')
    state = submitAll(state, { east: pickIds(state, 'east', 2), west: pickIds(state, 'west', 2), south: [], north: [] })
    expect(state.phase).toBe('discard')
    expect(checkInvariants(state)).toEqual([])
  })
})
