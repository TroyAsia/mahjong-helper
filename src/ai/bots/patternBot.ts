import { getLegalActions } from '../../engine/legalMoves'
import type { Action, GameState, Seat } from '../../engine/types'
import { nextRng } from '../../engine/tiles'
import type { AiConfig } from '../types'
import { pickRandomAction } from '../types'
import { bestAction, evaluateActions } from '../evaluate'

/**
 * Pattern-aware bot. strength 0 → pure random.
 * With probability mistakeRate, picks random instead of best.
 * Otherwise picks the lowest tiles-away action (blended with random by strength).
 */
export function patternBotFromState(
  state: GameState,
  seat: Seat,
  seed: number,
  config: AiConfig,
): { action: Action; nextSeed: number } {
  const legal = getLegalActions(state, seat)
  if (legal.length === 0) {
    throw new Error('patternBotFromState: no legal actions')
  }

  if (config.strength <= 0) {
    return pickRandomAction(legal, seed)
  }

  let s = seed
  const mistake = nextRng(s)
  s = mistake.nextSeed
  if (mistake.value < config.mistakeRate) {
    return pickRandomAction(legal, s)
  }

  const ranked = evaluateActions(state, seat, legal)
  const best = bestAction(ranked)
  if (!best) return pickRandomAction(legal, s)

  // With (1 - strength), still randomize among near-best
  const blend = nextRng(s)
  s = blend.nextSeed
  if (blend.value > config.strength) {
    return pickRandomAction(legal, s)
  }

  return { action: best, nextSeed: s }
}
