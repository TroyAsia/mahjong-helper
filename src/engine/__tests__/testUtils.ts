import { createCharlestonState } from '../charleston'
import { createInitialState } from '../setup'
import { createTileSet } from '../tiles'
import type {
  GameState,
  Meld,
  Pattern,
  PendingDiscard,
  Phase,
  Seat,
  Tile,
} from '../types'
import { SEATS } from '../types'

const TILES_BY_ID = new Map(createTileSet().map((t) => [t.id, t]))

/** Look up a real tile by id, e.g. `bam-1#0`, `wind-east#2`, `joker#0`, `flower-3#0`. */
export function tile(id: string): Tile {
  const found = TILES_BY_ID.get(id)
  if (!found) throw new Error(`unknown tile id ${id}`)
  return found
}

export type StateSpec = {
  readonly hands?: { readonly [S in Seat]?: readonly string[] }
  readonly exposed?: { readonly [S in Seat]?: readonly Meld[] }
  readonly patterns?: readonly Pattern[]
  readonly phase?: Phase
  readonly currentSeat?: Seat
  readonly lastDiscard?: PendingDiscard | null
  readonly callQueue?: readonly Seat[]
  readonly discards?: { readonly [S in Seat]?: readonly string[] }
}

function fillerIds(used: ReadonlySet<string>): string[] {
  return createTileSet()
    .filter((t) => t.face.kind === 'suit' && !used.has(t.id))
    .map((t) => t.id)
    .reverse()
}

/**
 * Build a conserving state. Listed hand tiles are kept; each hand is padded
 * with suit tiles up to 13 (14 for the seat about to discard / the dealer in
 * Charleston). Everything else lands in the wall.
 */
export function buildState(spec: StateSpec): GameState {
  const base = createInitialState(1, spec.patterns ?? [])
  const used = new Set<string>()
  const claim = (ids: readonly string[]) => ids.forEach((id) => used.add(id))

  for (const seat of SEATS) {
    claim(spec.hands?.[seat] ?? [])
    claim(spec.discards?.[seat] ?? [])
    for (const meld of spec.exposed?.[seat] ?? []) {
      claim(meld.tiles.map((t) => t.id))
    }
  }
  if (spec.lastDiscard) claim([spec.lastDiscard.tile.id])

  const phase = spec.phase ?? 'discard'
  const currentSeat = spec.currentSeat ?? 'east'
  const filler = fillerIds(used)
  const hands = {} as { [S in Seat]: Tile[] }
  for (const seat of SEATS) {
    const exposedCount = (spec.exposed?.[seat] ?? []).reduce(
      (n, m) => n + m.tiles.length,
      0,
    )
    const dealing14 =
      (phase === 'discard' && seat === currentSeat) ||
      (phase === 'charleston' && seat === base.dealer)
    const target = (dealing14 ? 14 : 13) - exposedCount
    const given = spec.hands?.[seat] ?? []
    const padding = filler.splice(0, Math.max(0, target - given.length))
    claim(padding)
    hands[seat] = [...given, ...padding].map(tile)
  }

  const wall = createTileSet().filter((t) => !used.has(t.id))
  return {
    ...base,
    phase,
    currentSeat,
    wall,
    hands,
    discards: {
      east: (spec.discards?.east ?? []).map(tile),
      south: (spec.discards?.south ?? []).map(tile),
      west: (spec.discards?.west ?? []).map(tile),
      north: (spec.discards?.north ?? []).map(tile),
    },
    exposed: {
      east: spec.exposed?.east ?? [],
      south: spec.exposed?.south ?? [],
      west: spec.exposed?.west ?? [],
      north: spec.exposed?.north ?? [],
    },
    lastDiscard: spec.lastDiscard ?? null,
    callQueue: spec.callQueue ?? [],
    charleston: phase === 'charleston' ? createCharlestonState() : null,
  }
}

export function meld(
  kind: Meld['kind'],
  ids: readonly string[],
  calledFrom: Seat = 'east',
): Meld {
  return { kind, tiles: ids.map(tile), calledFrom }
}
