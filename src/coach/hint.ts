import {
  getSeatTiles,
  seatBestMatch,
  seatPatterns,
  seatTilesAway,
} from '../engine/calls'
import { tilesAway } from '../engine/patterns'
import { getLegalActions } from '../engine/legalMoves'
import type { GameState, Seat } from '../engine/types'
import type { HintType } from '../levels/schema'
import type { Hint } from './types'

export type HintsConfig = {
  readonly allowed: readonly HintType[]
}

export function getHint(
  state: GameState,
  seat: Seat,
  config: HintsConfig,
): Hint | null {
  for (const type of config.allowed) {
    const hint = hintForType(state, seat, type)
    if (hint) return hint
  }
  return null
}

function hintForType(
  state: GameState,
  seat: Seat,
  type: HintType,
): Hint | null {
  const hand = getSeatTiles(state, seat)

  switch (type) {
    case 'tilesAway': {
      const away = seatTilesAway(state, seat)
      return {
        type: 'tilesAway',
        text: `You are ${away} tile${away === 1 ? '' : 's'} away from a practice pattern.`,
      }
    }
    case 'bestPattern': {
      const best = seatBestMatch(state, seat)
      if (!best) return null
      return {
        type: 'bestPattern',
        text: `Closest pattern right now: ${best.patternId} (${best.tilesAway} away).`,
      }
    }
    case 'safeDiscard': {
      if (state.phase !== 'discard') return null
      const discards = getLegalActions(state, seat).filter(
        (a) => a.type === 'discard',
      )
      let bestId: string | null = null
      let bestScore = 99
      for (const action of discards) {
        if (action.type !== 'discard') continue
        const next = hand.filter((t) => t.id !== action.tileId)
        const score = tilesAway(next, seatPatterns(state, seat))
        if (score < bestScore) {
          bestScore = score
          bestId = action.tileId
        }
      }
      if (!bestId) return null
      return {
        type: 'safeDiscard',
        text: `A safer discard keeps you about ${bestScore} away.`,
      }
    }
    case 'callAdvice':
      return {
        type: 'callAdvice',
        text:
          state.phase === 'call'
            ? 'Call only if the discard completes a pung, kong, quint or sextet in your pattern. Calling exposes those tiles, so make sure you want to commit to that pattern.'
            : 'Only call a discard when it completes a pung/kong (or bigger) in your pattern.',
      }
    case 'charlestonAdvice': {
      const best = seatBestMatch(state, seat)
      return {
        type: 'charlestonAdvice',
        text: best
          ? `Pass tiles that do not fit your closest pattern (${best.patternId}). Jokers can never be passed.`
          : 'Pass tiles that do not fit your closest practice pattern. Jokers can never be passed.',
      }
    }
    case 'showOdds':
      return {
        type: 'showOdds',
        text: 'Odds analysis unlocks at higher levels.',
      }
  }
}

export function filterHintByConfig(
  hint: Hint,
  config: HintsConfig,
): Hint | null {
  return config.allowed.includes(hint.type as HintType) ? hint : null
}
