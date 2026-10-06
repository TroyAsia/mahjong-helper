import { describe, expect, it } from 'vitest'
import { getLegalActions } from '../legalMoves'
import { reduce } from '../reducer'
import { checkInvariants, createInitialState } from '../setup'
import type { GameState } from '../types'
import { SEATS } from '../types'
import { nextRng } from '../tiles'

function playRandomToEnd(seed: number): GameState {
  let state = createInitialState(seed)
  let rng = state.rngSeed
  let guard = 0
  while (state.phase !== 'ended') {
    guard++
    if (guard > 500) throw new Error('game did not end within 500 actions')

    const seat = state.currentSeat
    const legal = getLegalActions(state, seat)
    if (legal.length === 0) {
      expect(state.wall.length).toBe(0)
      break
    }

    const { value, nextSeed } = nextRng(rng)
    rng = nextSeed
    const action = legal[Math.floor(value * legal.length)]!

    const result = reduce(state, seat, action)
    expect(result.ok).toBe(true)
    if (!result.ok) break
    state = result.state
    expect(checkInvariants(state)).toEqual([])
  }
  return state
}

describe('getLegalActions', () => {
  it('allows discard of each hand tile for dealer at start', () => {
    const state = createInitialState(1)
    const legal = getLegalActions(state, 'east')
    expect(legal.every((a) => a.type === 'discard')).toBe(true)
    expect(legal).toHaveLength(14)
  })

  it('returns nothing for other seats during east discard', () => {
    const state = createInitialState(1)
    for (const seat of SEATS) {
      if (seat === 'east') continue
      expect(getLegalActions(state, seat)).toEqual([])
    }
  })
})

describe('reduce', () => {
  it('rejects illegal actions without throwing', () => {
    const state = createInitialState(2)
    const result = reduce(state, 'east', { type: 'draw' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/Illegal/)
  })

  it('draw then discard advances seat', () => {
    let state = createInitialState(3)
    const discardId = state.hands.east[0]!.id
    let result = reduce(state, 'east', { type: 'discard', tileId: discardId })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    state = result.state
    expect(state.currentSeat).toBe('south')
    expect(state.phase).toBe('draw')

    result = reduce(state, 'south', { type: 'draw' })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    state = result.state
    expect(state.hands.south).toHaveLength(14)
    expect(state.phase).toBe('discard')
  })

  it(
    'random legal play reaches empty wall with invariants intact',
    () => {
      for (const seed of [1, 42, 99, 1000, 7777]) {
        const end = playRandomToEnd(seed)
        expect(end.phase).toBe('ended')
        expect(end.endReason).toBe('empty_wall')
        expect(end.wall).toHaveLength(0)
        expect(checkInvariants(end)).toEqual([])
      }
    },
    20_000,
  )
})
