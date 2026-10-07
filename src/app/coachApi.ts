import { explain, explainCharlestonPass } from '../coach/explain'
import type { ExplainerConfig } from '../coach/explain'
import { getHint } from '../coach/hint'
import type { HintsConfig } from '../coach/hint'
import type { Explanation, Hint } from '../coach/types'
import type { Action, GameState, Seat } from '../engine/types'

export type { Explanation, Hint }

export function explainMove(
  before: GameState,
  action: Action,
  after: GameState,
  config: ExplainerConfig,
): Explanation {
  return explain(before, action, after, config)
}

export function explainCharleston(
  state: GameState,
  seat: Seat,
  tileIds: readonly string[],
  config: ExplainerConfig,
): Explanation {
  return explainCharlestonPass(state, seat, tileIds, config)
}

export function requestHint(
  state: GameState,
  seat: Seat,
  config: HintsConfig,
): Hint | null {
  return getHint(state, seat, config)
}
