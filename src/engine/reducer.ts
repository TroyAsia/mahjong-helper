import { produce, type Draft } from 'immer'
import { getCallers, isJoker } from './calls'
import { reduceCharleston } from './charleston'
import {
  getIllegalReason,
  getLegalActions,
  isActionLegal,
  nextSeat,
} from './legalMoves'
import type { Action, GameState, IllegalReason, Seat } from './types'

export type ReduceOk = { readonly ok: true; readonly state: GameState }
export type ReduceErr = {
  readonly ok: false
  readonly error: string
  readonly reason: IllegalReason
}
export type ReduceResult = ReduceOk | ReduceErr

/** Close a call window: next seat in line is asked, or play moves on to the next draw. */
function advanceCallWindow(draft: Draft<GameState>): void {
  const discard = draft.lastDiscard
  if (!discard) return
  const [following, ...rest] = draft.callQueue
  if (following) {
    draft.currentSeat = following
    draft.callQueue = rest
    return
  }
  draft.phase = 'draw'
  draft.currentSeat = nextSeat(discard.seat)
  draft.lastDiscard = null
  draft.callQueue = []
}

/** After a discard lands, open a call window only if someone could actually use it. */
function openCallWindow(state: GameState): GameState {
  const discard = state.lastDiscard
  if (!discard || state.phase !== 'draw') return state

  const callers = getCallers(state, discard)
  return produce(state, (draft) => {
    const [first, ...rest] = callers
    if (!first) {
      draft.lastDiscard = null
      return
    }
    draft.phase = 'call'
    draft.currentSeat = first
    draft.callQueue = rest
  })
}

function applyAction(
  state: GameState,
  seat: Seat,
  action: Action,
): GameState {
  return produce(state, (draft) => {
    switch (action.type) {
      case 'draw': {
        const tile = draft.wall.shift()
        if (!tile) {
          draft.phase = 'ended'
          draft.endReason = 'empty_wall'
          return
        }
        draft.hands[seat].push(tile)
        draft.phase = 'discard'
        break
      }
      case 'discard': {
        const hand = draft.hands[seat]
        const idx = hand.findIndex((t) => t.id === action.tileId)
        if (idx < 0) return
        const [tile] = hand.splice(idx, 1)
        if (!tile) return
        draft.discards[seat].push(tile)

        const following = nextSeat(seat)
        draft.currentSeat = following
        if (draft.wall.length === 0) {
          draft.phase = 'ended'
          draft.endReason = 'empty_wall'
        } else {
          draft.phase = 'draw'
          draft.lastDiscard = { seat, tile }
        }
        break
      }
      case 'declare_win': {
        if (draft.phase === 'call' && draft.lastDiscard) {
          const { seat: from, tile } = draft.lastDiscard
          draft.discards[from] = draft.discards[from].filter(
            (t) => t.id !== tile.id,
          )
          draft.hands[seat].push(tile)
          draft.lastDiscard = null
          draft.callQueue = []
        }
        draft.phase = 'ended'
        draft.endReason = 'win'
        draft.winner = seat
        break
      }
      case 'pass': {
        advanceCallWindow(draft)
        break
      }
      case 'call': {
        const discard = draft.lastDiscard
        if (!discard) return
        const hand = draft.hands[seat]
        const taken = hand.filter((t) => action.tileIds.includes(t.id))
        draft.hands[seat] = hand.filter((t) => !action.tileIds.includes(t.id))
        draft.discards[discard.seat] = draft.discards[discard.seat].filter(
          (t) => t.id !== discard.tile.id,
        )
        draft.exposed[seat].push({
          kind: action.meld,
          tiles: [discard.tile, ...taken],
          calledFrom: discard.seat,
        })
        draft.phase = 'discard'
        draft.currentSeat = seat
        draft.lastDiscard = null
        draft.callQueue = []
        break
      }
      case 'joker_swap': {
        const meld = draft.exposed[action.targetSeat][action.meldIndex]
        if (!meld) return
        const hand = draft.hands[seat]
        const handIdx = hand.findIndex((t) => t.id === action.tileId)
        const jokerIdx = meld.tiles.findIndex(
          (t) => t.id === action.jokerTileId,
        )
        if (handIdx < 0 || jokerIdx < 0) return
        const natural = hand[handIdx]!
        const joker = meld.tiles[jokerIdx]!
        if (!isJoker(joker)) return
        meld.tiles[jokerIdx] = natural
        hand[handIdx] = joker
        break
      }
      case 'declare_dead_hand': {
        if (!draft.deadHands.includes(seat)) draft.deadHands.push(seat)
        if (draft.phase === 'call' && draft.currentSeat === seat) {
          advanceCallWindow(draft)
        }
        break
      }
      case 'charleston_pass':
      case 'charleston_vote':
        break
    }
  })
}

/**
 * Apply an action for `seat`. Illegal actions return an error result (no throw).
 * Validates against getLegalActions before mutating.
 * `declare_dead_hand` is the one penalty action the app may apply to an offender.
 */
export function reduce(
  state: GameState,
  seat: Seat,
  action: Action,
): ReduceResult {
  if (action.type === 'declare_dead_hand') {
    if (state.phase === 'ended') {
      return {
        ok: false,
        error: `Illegal action ${action.type}: game is over`,
        reason: 'game_over',
      }
    }
    return { ok: true, state: applyAction(state, seat, action) }
  }

  if (!isActionLegal(state, seat, action)) {
    const legal = getLegalActions(state, seat)
    return {
      ok: false,
      error: `Illegal action ${action.type} for ${seat} in phase ${state.phase} (${legal.length} legal)`,
      reason: getIllegalReason(state, seat, action) ?? 'wrong_phase',
    }
  }

  if (action.type === 'charleston_pass' || action.type === 'charleston_vote') {
    return { ok: true, state: reduceCharleston(state, seat, action) }
  }

  const next = applyAction(state, seat, action)
  return {
    ok: true,
    state: action.type === 'discard' ? openCallWindow(next) : next,
  }
}
