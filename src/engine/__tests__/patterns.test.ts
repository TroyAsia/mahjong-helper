import { describe, expect, it } from 'vitest'
import {
  canUseJokerInGroupSize,
  isWinningHand,
  matchPattern,
  tilesAway,
} from '../patterns'
import type { Pattern, Tile, TileFace } from '../types'
import { reduce } from '../reducer'
import { createInitialState } from '../setup'

function tile(id: string, face: TileFace): Tile {
  return { id, face }
}

function many(
  face: TileFace,
  count: number,
  prefix: string,
): Tile[] {
  return Array.from({ length: count }, (_, i) =>
    tile(`${prefix}-${i}`, face),
  )
}

const bambooLadder: Pattern = {
  id: 'bamboo-ladder',
  groups: [
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 1 } },
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 2 } },
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 3 } },
    { size: 2, face: { match: 'wind', wind: 'east' } },
  ],
}

describe('canUseJokerInGroupSize', () => {
  it('allows jokers only in sets of 3+', () => {
    expect(canUseJokerInGroupSize(1)).toBe(false)
    expect(canUseJokerInGroupSize(2)).toBe(false)
    expect(canUseJokerInGroupSize(3)).toBe(true)
    expect(canUseJokerInGroupSize(4)).toBe(true)
  })
})

describe('matchPattern', () => {
  it('matches a complete bamboo ladder hand', () => {
    const hand = [
      ...many({ kind: 'suit', suit: 'bam', rank: 1 }, 4, 'b1'),
      ...many({ kind: 'suit', suit: 'bam', rank: 2 }, 4, 'b2'),
      ...many({ kind: 'suit', suit: 'bam', rank: 3 }, 4, 'b3'),
      ...many({ kind: 'wind', wind: 'east' }, 2, 'we'),
    ]
    const result = matchPattern(hand, bambooLadder)
    expect(result.matched).toBe(true)
    expect(result.tilesAway).toBe(0)
  })

  it('allows jokers in a kong but not in a pair', () => {
    const withJokerKong = [
      ...many({ kind: 'suit', suit: 'bam', rank: 1 }, 3, 'b1'),
      tile('jk0', { kind: 'joker' }),
      ...many({ kind: 'suit', suit: 'bam', rank: 2 }, 4, 'b2'),
      ...many({ kind: 'suit', suit: 'bam', rank: 3 }, 4, 'b3'),
      ...many({ kind: 'wind', wind: 'east' }, 2, 'we'),
    ]
    expect(matchPattern(withJokerKong, bambooLadder).matched).toBe(true)

    const jokerInPair = [
      ...many({ kind: 'suit', suit: 'bam', rank: 1 }, 4, 'b1'),
      ...many({ kind: 'suit', suit: 'bam', rank: 2 }, 4, 'b2'),
      ...many({ kind: 'suit', suit: 'bam', rank: 3 }, 4, 'b3'),
      tile('we0', { kind: 'wind', wind: 'east' }),
      tile('jk1', { kind: 'joker' }),
    ]
    expect(matchPattern(jokerInPair, bambooLadder).matched).toBe(false)
  })

  it('reports tilesAway for a near-winning hand', () => {
    const near = [
      ...many({ kind: 'suit', suit: 'bam', rank: 1 }, 4, 'b1'),
      ...many({ kind: 'suit', suit: 'bam', rank: 2 }, 4, 'b2'),
      ...many({ kind: 'suit', suit: 'bam', rank: 3 }, 4, 'b3'),
      tile('we0', { kind: 'wind', wind: 'east' }),
      tile('junk', { kind: 'suit', suit: 'dot', rank: 9 }),
    ]
    expect(matchPattern(near, bambooLadder).tilesAway).toBe(1)
    expect(tilesAway(near, [bambooLadder])).toBe(1)
  })
})

describe('declare_win', () => {
  it('is legal on a winning concealed hand', () => {
    const patterns = [bambooLadder]
    const hand = [
      ...many({ kind: 'suit', suit: 'bam', rank: 1 }, 4, 'b1'),
      ...many({ kind: 'suit', suit: 'bam', rank: 2 }, 4, 'b2'),
      ...many({ kind: 'suit', suit: 'bam', rank: 3 }, 4, 'b3'),
      ...many({ kind: 'wind', wind: 'east' }, 2, 'we'),
    ]
    expect(isWinningHand(hand, patterns)).toBe(true)

    let state = createInitialState(1, patterns)
    state = {
      ...state,
      hands: { ...state.hands, east: hand },
      phase: 'discard',
      currentSeat: 'east',
    }
    // Move non-hand tiles so invariants aren't required here
    const result = reduce(state, 'east', { type: 'declare_win' })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.endReason).toBe('win')
      expect(result.state.winner).toBe('east')
    }
  })
})
