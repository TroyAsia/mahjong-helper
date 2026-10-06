import { seatBestMatch, seatTilesAway } from '../engine/calls'
import { getLegalActions } from '../engine/legalMoves'
import { bestMatch, tilesAway } from '../engine/patterns'
import { reduce } from '../engine/reducer'
import type { Action, GameState, Seat } from '../engine/types'
import type { ExplainerDepth } from '../levels/schema'
import {
  callBad,
  callGood,
  callOk,
  charlestonBad,
  charlestonGood,
  charlestonOk,
  discardBad,
  discardGood,
  discardOk,
  noExplanation,
  passGood,
  passMissedCall,
  passMissedWin,
} from './templates'
import type { Explanation } from './types'

export type ExplainerConfig = {
  readonly depth: ExplainerDepth
  readonly decisionTypes: readonly string[]
}

function withDepth(e: Explanation, config: ExplainerConfig): Explanation {
  return config.depth === 'brief' ? { ...e, detail: e.summary } : e
}

function isEnabled(config: ExplainerConfig, decision: string): boolean {
  return config.depth !== 'off' && config.decisionTypes.includes(decision)
}

/**
 * Explain a completed action. depth "off" returns an empty explanation.
 */
export function explain(
  before: GameState,
  action: Action,
  after: GameState,
  config: ExplainerConfig,
): Explanation {
  switch (action.type) {
    case 'discard':
      return isEnabled(config, 'discard')
        ? withDepth(explainDiscard(before, after), config)
        : noExplanation()
    case 'call':
      return isEnabled(config, 'call')
        ? withDepth(explainCall(before, after), config)
        : noExplanation()
    case 'pass':
      return isEnabled(config, 'call')
        ? withDepth(explainPass(before), config)
        : noExplanation()
    default:
      return noExplanation()
  }
}

function explainDiscard(before: GameState, after: GameState): Explanation {
  const seat = before.currentSeat
  const beforeAway = seatTilesAway(before, seat)
  const afterAway = seatTilesAway(after, seat)
  const name = seatBestMatch(after, seat)?.patternId ?? 'your hand'

  if (afterAway < beforeAway) return discardGood(name, afterAway)
  if (afterAway > beforeAway) return discardBad(name, beforeAway, afterAway)
  return discardOk(afterAway)
}

/** Compare the hand before calling with the hand right after (discard still to make). */
function explainCall(before: GameState, after: GameState): Explanation {
  const seat = before.currentSeat
  const beforeAway = seatTilesAway(before, seat)
  const afterAway = seatTilesAway(after, seat)
  const newName = seatBestMatch(after, seat)?.patternId ?? 'your hand'
  const oldName = seatBestMatch(before, seat)?.patternId ?? 'your hand'

  if (afterAway < beforeAway) return callGood(newName, beforeAway, afterAway)
  if (afterAway === beforeAway) return callOk(newName, afterAway)
  return callBad(newName, oldName, beforeAway, afterAway)
}

/** Judge a pass by whether any call (or a win) was available and worth taking. */
function explainPass(before: GameState): Explanation {
  const seat = before.currentSeat
  const legal = getLegalActions(before, seat)
  if (legal.some((a) => a.type === 'declare_win')) return passMissedWin()

  const beforeAway = seatTilesAway(before, seat)
  let bestGain = 0
  let bestName = 'your hand'
  for (const action of legal) {
    if (action.type !== 'call') continue
    const result = reduce(before, seat, action)
    if (!result.ok) continue
    const gain = beforeAway - seatTilesAway(result.state, seat)
    if (gain > bestGain) {
      bestGain = gain
      bestName = seatBestMatch(result.state, seat)?.patternId ?? bestName
    }
  }
  return bestGain > 0 ? passMissedCall(bestName, bestGain) : passGood()
}

/**
 * Explain a Charleston pass. Passing tiles that do not help your closest
 * pattern costs nothing; passing ones that do raises tiles-away.
 */
export function explainCharlestonPass(
  before: GameState,
  seat: Seat,
  tileIds: readonly string[],
  config: ExplainerConfig,
): Explanation {
  if (!isEnabled(config, 'charleston')) return noExplanation()

  const hand = before.hands[seat]
  const remaining = hand.filter((t) => !tileIds.includes(t.id))
  const beforeAway = tilesAway(hand, before.patterns)
  const afterAway = tilesAway(remaining, before.patterns)
  const name = bestMatch(hand, before.patterns)?.patternId ?? 'your hand'
  const cost = afterAway - beforeAway

  if (cost <= 0) return withDepth(charlestonGood(name), config)
  if (cost === 1) return withDepth(charlestonOk(name), config)
  return withDepth(charlestonBad(name, cost), config)
}
