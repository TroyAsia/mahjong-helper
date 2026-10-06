import { passCountRange } from '../../engine/charleston'
import { tilesAway } from '../../engine/patterns'
import { nextRng } from '../../engine/tiles'
import type { Action, GameState, Seat, Tile } from '../../engine/types'
import type { AiConfig } from '../types'

const STILL_NEEDS_HELP_AWAY = 4

function passableTiles(hand: readonly Tile[]): Tile[] {
  return hand.filter((t) => t.face.kind !== 'joker')
}

function pickRandomIds(
  tiles: readonly Tile[],
  count: number,
  seed: number,
): { ids: string[]; nextSeed: number } {
  const pool = [...tiles]
  const ids: string[] = []
  let s = seed
  while (ids.length < count && pool.length > 0) {
    const { value, nextSeed } = nextRng(s)
    s = nextSeed
    const [picked] = pool.splice(Math.floor(value * pool.length), 1)
    if (picked) ids.push(picked.id)
  }
  return { ids, nextSeed: s }
}

/** Repeatedly drop the tile whose removal hurts tiles-away least. */
function pickGreedyIds(
  state: GameState,
  seat: Seat,
  count: number,
): string[] {
  const hand = state.hands[seat]
  const chosen: string[] = []
  while (chosen.length < count) {
    let bestId: string | null = null
    let bestScore = Infinity
    for (const tile of passableTiles(hand)) {
      if (chosen.includes(tile.id)) continue
      const remaining = hand.filter(
        (t) => t.id !== tile.id && !chosen.includes(t.id),
      )
      const score = tilesAway(remaining, state.patterns)
      if (score < bestScore) {
        bestScore = score
        bestId = tile.id
      }
    }
    if (!bestId) break
    chosen.push(bestId)
  }
  return chosen
}

/**
 * Pick a Charleston action (pass or vote) for a bot seat.
 * strength 0 plays randomly; otherwise passes the tiles that matter least to the
 * closest pattern, with `mistakeRate` chance of a random choice instead.
 */
export function charlestonBotFromState(
  state: GameState,
  seat: Seat,
  seed: number,
  config: AiConfig,
): { action: Action; nextSeed: number } {
  const charleston = state.charleston
  if (state.phase !== 'charleston' || !charleston) {
    throw new Error('charlestonBotFromState: not in the Charleston')
  }

  let s = seed
  const roll = nextRng(s)
  s = roll.nextSeed
  const playRandom = config.strength <= 0 || roll.value < config.mistakeRate

  if (charleston.step === 'vote_second') {
    const vote = nextRng(s)
    const needsHelp =
      tilesAway(state.hands[seat], state.patterns) > STILL_NEEDS_HELP_AWAY
    return {
      action: {
        type: 'charleston_vote',
        continue: playRandom ? vote.value < 0.5 : needsHelp,
      },
      nextSeed: vote.nextSeed,
    }
  }

  const { max } = passCountRange(charleston.step)
  const count = charleston.step === 'courtesy' ? Math.min(1, max) : max

  if (playRandom) {
    const { ids, nextSeed } = pickRandomIds(
      passableTiles(state.hands[seat]),
      count,
      s,
    )
    return { action: { type: 'charleston_pass', tileIds: ids }, nextSeed }
  }

  return {
    action: {
      type: 'charleston_pass',
      tileIds: pickGreedyIds(state, seat, count),
    },
    nextSeed: s,
  }
}
