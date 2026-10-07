import { getIllegalReason, getLegalActions } from '../engine/legalMoves'
import type { Action, GameState, Seat } from '../engine/types'
import { illegalMoveMessage } from './messages'

export function legalActionsFor(
  state: GameState,
  seat: Seat,
): readonly Action[] {
  return getLegalActions(state, seat)
}

export function describeIllegal(
  state: GameState,
  seat: Seat,
  action: Action,
): string | null {
  const reason = getIllegalReason(state, seat, action)
  return reason ? illegalMoveMessage(reason) : null
}
