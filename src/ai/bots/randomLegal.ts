import { getLegalActions } from '../../engine/legalMoves'
import type { GameState, Seat } from '../../engine/types'
import { pickRandomAction, type AiConfig } from '../types'

/**
 * Always picks a uniformly random legal action from full game state.
 * Accepts AiConfig so the game loop can pass LevelConfig.ai; strength is unused.
 */
export function randomLegalFromState(
  state: GameState,
  seat: Seat,
  seed: number,
  _config?: AiConfig,
): { action: ReturnType<typeof getLegalActions>[number]; nextSeed: number } {
  void _config
  const legal = getLegalActions(state, seat)
  return pickRandomAction(legal, seed)
}
