import {
  callIllegalReason,
  canDeclareWinOnDiscard,
  getCallOptions,
  getJokerSwaps,
  jokerSwapIllegalReason,
  seatIsWinning,
} from './calls'
import { charlestonIllegalReason, charlestonLegalActions } from './charleston'
import {
  canUseJokerInGroupSize,
  isWinningHand,
  matchPattern,
  tilesAway,
  type MatchResult,
  type Pattern,
} from './patterns'
import type { Action, GameState, IllegalReason, Seat } from './types'
import { TURN_ORDER } from './types'

function nextSeat(seat: Seat): Seat {
  const i = TURN_ORDER.indexOf(seat)
  return TURN_ORDER[(i + 1) % TURN_ORDER.length]!
}

function jokerSwapActions(state: GameState, seat: Seat): Action[] {
  return getJokerSwaps(state, seat).map((s) => ({
    type: 'joker_swap' as const,
    ...s,
  }))
}

/** Legal actions for `seat` in the current state. */
export function getLegalActions(
  state: GameState,
  seat: Seat,
): readonly Action[] {
  if (state.phase === 'ended') return []
  if (state.phase === 'charleston') return charlestonLegalActions(state, seat)
  if (seat !== state.currentSeat) return []

  if (state.phase === 'draw') {
    if (state.wall.length === 0) return []
    return [{ type: 'draw' }, ...jokerSwapActions(state, seat)]
  }

  if (state.phase === 'discard') {
    const actions: Action[] = state.hands[seat].map((tile) => ({
      type: 'discard' as const,
      tileId: tile.id,
    }))
    actions.push(...jokerSwapActions(state, seat))
    if (seatIsWinning(state, seat)) {
      actions.push({ type: 'declare_win' })
    }
    return actions
  }

  if (state.phase === 'call') {
    const actions: Action[] = [{ type: 'pass' }]
    for (const option of getCallOptions(state, seat)) {
      actions.push({
        type: 'call',
        meld: option.meld,
        tileIds: option.tileIds,
      })
    }
    if (canDeclareWinOnDiscard(state, seat)) {
      actions.push({ type: 'declare_win' })
    }
    return actions
  }

  return []
}

export function isActionLegal(
  state: GameState,
  seat: Seat,
  action: Action,
): boolean {
  switch (action.type) {
    case 'charleston_pass':
    case 'charleston_vote':
      return charlestonIllegalReason(state, seat, action) === null
    case 'call':
      return callIllegalReason(state, seat, action) === null
    case 'joker_swap':
      return jokerSwapIllegalReason(state, seat, action) === null
    case 'declare_dead_hand':
      return false
    default:
      return getLegalActions(state, seat).some((legal) =>
        actionsEqual(legal, action),
      )
  }
}

/** Why an action is illegal, or null when it is legal. App code turns this into a message. */
export function getIllegalReason(
  state: GameState,
  seat: Seat,
  action: Action,
): IllegalReason | null {
  if (isActionLegal(state, seat, action)) return null
  if (state.phase === 'ended') return 'game_over'

  switch (action.type) {
    case 'charleston_pass':
    case 'charleston_vote':
      return charlestonIllegalReason(state, seat, action) ?? 'wrong_phase'
    default:
      break
  }

  if (state.phase === 'charleston') return 'wrong_phase'
  if (seat !== state.currentSeat) return 'not_your_turn'

  switch (action.type) {
    case 'call':
      return callIllegalReason(state, seat, action) ?? 'wrong_phase'
    case 'joker_swap':
      return jokerSwapIllegalReason(state, seat, action) ?? 'wrong_phase'
    case 'declare_win':
      if (state.deadHands.includes(seat)) return 'dead_hand'
      return state.phase === 'discard' || state.phase === 'call'
        ? 'not_winning'
        : 'wrong_phase'
    case 'discard':
      return state.phase === 'discard' ? 'no_such_tile' : 'wrong_phase'
    default:
      return 'wrong_phase'
  }
}

function sameIds(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((id, i) => id === sortedB[i])
}

function actionsEqual(a: Action, b: Action): boolean {
  if (a.type !== b.type) return false
  switch (a.type) {
    case 'discard':
      return b.type === 'discard' && a.tileId === b.tileId
    case 'call':
      return (
        b.type === 'call' && a.meld === b.meld && sameIds(a.tileIds, b.tileIds)
      )
    case 'joker_swap':
      return (
        b.type === 'joker_swap' &&
        a.targetSeat === b.targetSeat &&
        a.meldIndex === b.meldIndex &&
        a.jokerTileId === b.jokerTileId &&
        a.tileId === b.tileId
      )
    case 'charleston_pass':
      return b.type === 'charleston_pass' && sameIds(a.tileIds, b.tileIds)
    case 'charleston_vote':
      return b.type === 'charleston_vote' && a.continue === b.continue
    default:
      return true
  }
}

export {
  nextSeat,
  isWinningHand,
  matchPattern,
  tilesAway,
  canUseJokerInGroupSize,
}
export type { MatchResult, Pattern }
