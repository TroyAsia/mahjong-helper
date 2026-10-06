import { createCharlestonState } from './charleston'
import { countByKind, createTileSet, shuffleTiles, TOTAL_TILES } from './tiles'
import type { Pattern } from './types'
import {
  MELD_SIZE,
  SEATS,
  type GameState,
  type InvariantIssue,
  type Seat,
  type Tile,
} from './types'

const HAND_SIZE = 13
const DEALER_HAND_SIZE = 14

function emptyDiscards(): GameState['discards'] {
  return {
    east: [],
    south: [],
    west: [],
    north: [],
  }
}

function emptyExposed(): GameState['exposed'] {
  return {
    east: [],
    south: [],
    west: [],
    north: [],
  }
}

export type SetupOptions = {
  /** Start in the Charleston phase instead of the dealer's first discard. */
  readonly charleston?: boolean
}

/**
 * Deal a new game from a seed.
 * Dealer (East) receives 14 tiles; others receive 13. Remainder is the wall.
 * Play starts with the dealer in the discard phase (already holding 14),
 * or in the Charleston phase when `options.charleston` is set.
 */
export function createInitialState(
  seed: number,
  patterns: readonly Pattern[] = [],
  options: SetupOptions = {},
): GameState {
  const { tiles: shuffled, seed: afterShuffle } = shuffleTiles(
    createTileSet(),
    seed,
  )

  const hands: { [S in Seat]: Tile[] } = {
    east: [],
    south: [],
    west: [],
    north: [],
  }

  let index = 0
  for (const seat of SEATS) {
    const size = seat === 'east' ? DEALER_HAND_SIZE : HAND_SIZE
    hands[seat] = shuffled.slice(index, index + size)
    index += size
  }

  const wall = shuffled.slice(index)

  return {
    version: 1,
    rngSeed: afterShuffle,
    dealer: 'east',
    currentSeat: 'east',
    phase: options.charleston ? 'charleston' : 'discard',
    wall,
    hands,
    discards: emptyDiscards(),
    exposed: emptyExposed(),
    lastDiscard: null,
    callQueue: [],
    charleston: options.charleston ? createCharlestonState() : null,
    deadHands: [],
    patterns,
    winner: null,
    endReason: null,
  }
}

/** Collect every tile currently in the game (wall + hands + exposed sets + discards). */
export function allTilesInPlay(state: GameState): readonly Tile[] {
  const tiles: Tile[] = [...state.wall]
  for (const seat of SEATS) {
    tiles.push(...state.hands[seat], ...state.discards[seat])
    for (const meld of state.exposed[seat]) tiles.push(...meld.tiles)
  }
  return tiles
}

/** Tiles a seat should own (hand + exposed) in the current phase, or null when unchecked. */
function expectedSeatCount(state: GameState, seat: Seat): number | null {
  if (state.phase === 'ended' || state.phase === 'deal') return null
  if (state.phase === 'charleston') {
    return seat === state.dealer ? DEALER_HAND_SIZE : HAND_SIZE
  }
  if (state.phase === 'discard' && seat === state.currentSeat) {
    return DEALER_HAND_SIZE
  }
  return HAND_SIZE
}

/**
 * Tile-conservation invariant: exactly 152 tiles (including exposed sets),
 * no duplicate ids, 13/14 tiles per seat, and well-formed exposed sets.
 * Used in tests (and later in the reducer loop).
 */
export function checkInvariants(state: GameState): readonly InvariantIssue[] {
  const tiles = allTilesInPlay(state)
  const issues: InvariantIssue[] = []

  if (tiles.length !== TOTAL_TILES) {
    issues.push({ code: 'wrong_total', total: tiles.length })
  }

  const seen = new Set<string>()
  for (const tile of tiles) {
    if (seen.has(tile.id)) {
      issues.push({ code: 'duplicate_id', id: tile.id })
    }
    seen.add(tile.id)
  }

  for (const seat of SEATS) {
    const exposedCount = state.exposed[seat].reduce(
      (sum, m) => sum + m.tiles.length,
      0,
    )
    const expected = expectedSeatCount(state, seat)
    const count = state.hands[seat].length + exposedCount
    if (expected !== null && count !== expected) {
      issues.push({ code: 'wrong_seat_count', seat, count })
    }
    state.exposed[seat].forEach((meld, index) => {
      const naturals = meld.tiles.filter((t) => t.face.kind !== 'joker')
      const first = naturals[0]
      const consistent =
        first !== undefined &&
        naturals.every((t) => faceId(t) === faceId(first))
      if (meld.tiles.length !== MELD_SIZE[meld.kind] || !consistent) {
        issues.push({ code: 'bad_meld', seat, index })
      }
    })
  }

  return issues
}

function faceId(tile: Tile): string {
  return tile.face.kind === 'flower' ? 'flower' : tile.id.split('#')[0]!
}

export function handSizes(state: GameState): { [S in Seat]: number } {
  return {
    east: state.hands.east.length,
    south: state.hands.south.length,
    west: state.hands.west.length,
    north: state.hands.north.length,
  }
}

export { countByKind, HAND_SIZE, DEALER_HAND_SIZE }
