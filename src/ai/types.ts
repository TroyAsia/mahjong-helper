import type { Action, GameState, Seat, Tile, TileFace } from '../engine/types'
import { getLegalActions } from '../engine/legalMoves'
import { nextRng } from '../engine/tiles'
import type { LevelConfig } from '../levels/schema'

/** Bot reads a seat-censored view (hidden opponent tiles). */
export type BotView = {
  readonly self: Seat
  readonly phase: GameState['phase']
  readonly currentSeat: Seat
  readonly wallCount: number
  readonly hand: readonly Tile[]
  readonly discards: GameState['discards']
  readonly exposed: GameState['exposed']
  readonly lastDiscard: GameState['lastDiscard']
  readonly handCounts: { readonly [S in Seat]: number }
}

/** AI knobs come from LevelConfig (levels/schema). */
export type AiConfig = LevelConfig['ai']

export type Bot = (view: BotView, config: AiConfig, seed: number) => {
  readonly action: Action
  readonly nextSeed: number
}

export function createBotView(state: GameState, self: Seat): BotView {
  return {
    self,
    phase: state.phase,
    currentSeat: state.currentSeat,
    wallCount: state.wall.length,
    hand: state.hands[self],
    discards: state.discards,
    exposed: state.exposed,
    lastDiscard: state.lastDiscard,
    handCounts: {
      east: state.hands.east.length,
      south: state.hands.south.length,
      west: state.hands.west.length,
      north: state.hands.north.length,
    },
  }
}

/** Reconstruct legal actions for the bot's seat from the full state. */
export function legalFromState(state: GameState, seat: Seat): readonly Action[] {
  return getLegalActions(state, seat)
}

export function pickRandomAction(
  actions: readonly Action[],
  seed: number,
): { action: Action; nextSeed: number } {
  if (actions.length === 0) {
    throw new Error('pickRandomAction called with no actions')
  }
  const { value, nextSeed } = nextRng(seed)
  return {
    action: actions[Math.floor(value * actions.length)]!,
    nextSeed,
  }
}

export function faceKey(face: TileFace): string {
  switch (face.kind) {
    case 'suit':
      return `${face.suit}-${face.rank}`
    case 'wind':
      return `wind-${face.wind}`
    case 'dragon':
      return `dragon-${face.dragon}`
    case 'flower':
      return `flower-${face.index}`
    case 'joker':
      return 'joker'
  }
}
