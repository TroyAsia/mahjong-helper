import {
  getSeatTiles,
  seatPatterns,
  seatTilesAway,
} from '../engine/calls'
import { tilesAway } from '../engine/patterns'
import { reduce } from '../engine/reducer'
import type { Action, GameState, Seat, Tile } from '../engine/types'

/** Score a prospective hand: lower tiles-away is better. */
export function scoreHand(
  tiles: readonly Tile[],
  patterns: GameState['patterns'],
): number {
  return tilesAway(tiles, patterns)
}

/**
 * Evaluate each legal action by resulting tiles-away (after applying mentally).
 * Lower score is better. declare_win scores -1 (best). draw is scored after adding wall top.
 * Pass is listed before calls, so a call only wins when it strictly improves the hand.
 */
export function evaluateActions(
  state: GameState,
  seat: Seat,
  actions: readonly Action[],
): readonly { action: Action; score: number }[] {
  return actions.map((action) => ({
    action,
    score: scoreAction(state, seat, action),
  }))
}

function scoreAfterApplying(
  state: GameState,
  seat: Seat,
  action: Action,
): number {
  const result = reduce(state, seat, action)
  return result.ok ? seatTilesAway(result.state, seat) : 14
}

function scoreAction(state: GameState, seat: Seat, action: Action): number {
  switch (action.type) {
    case 'declare_win':
      return -1
    case 'draw': {
      const top = state.wall[0]
      if (!top) return 14
      return scoreHand([...getSeatTiles(state, seat), top], seatPatterns(state, seat))
    }
    case 'discard': {
      const remaining = getSeatTiles(state, seat).filter(
        (t) => t.id !== action.tileId,
      )
      return scoreHand(remaining, seatPatterns(state, seat))
    }
    case 'pass':
      return seatTilesAway(state, seat)
    case 'call':
      return scoreAfterApplying(state, seat, action)
    case 'joker_swap':
      // Jokers are worth more in hand than in someone's exposed set.
      return seatTilesAway(state, seat) - 0.5
    case 'charleston_pass': {
      const remaining = state.hands[seat].filter(
        (t) => !action.tileIds.includes(t.id),
      )
      return scoreHand(remaining, seatPatterns(state, seat))
    }
    case 'charleston_vote':
    case 'declare_dead_hand':
      return 14
  }
}

/** Pick the action with the best (lowest) score; ties broken by first occurrence. */
export function bestAction(
  ranked: readonly { action: Action; score: number }[],
): Action | null {
  if (ranked.length === 0) return null
  let best = ranked[0]!
  for (let i = 1; i < ranked.length; i++) {
    const row = ranked[i]!
    if (row.score < best.score) best = row
  }
  return best.action
}
