import type { Dragon, Suit, SuitRank, Tile, TileFace, Wind } from './types'

const SUITS: readonly Suit[] = ['bam', 'crak', 'dot']
const RANKS: readonly SuitRank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const WINDS: readonly Wind[] = ['east', 'south', 'west', 'north']
const DRAGONS: readonly Dragon[] = ['green', 'red', 'white']

const COPIES_PER_FACE = 4
const FLOWER_COUNT = 8
const JOKER_COUNT = 8

export const TOTAL_TILES = 152

function faceKey(face: TileFace): string {
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

function makeTile(face: TileFace, copyIndex: number): Tile {
  return {
    id: `${faceKey(face)}#${copyIndex}`,
    face,
  }
}

/** Build the standard 152-tile American mahjong set (unshuffled). */
export function createTileSet(): readonly Tile[] {
  const tiles: Tile[] = []

  for (const suit of SUITS) {
    for (const rank of RANKS) {
      for (let copy = 0; copy < COPIES_PER_FACE; copy++) {
        tiles.push(makeTile({ kind: 'suit', suit, rank }, copy))
      }
    }
  }

  for (const wind of WINDS) {
    for (let copy = 0; copy < COPIES_PER_FACE; copy++) {
      tiles.push(makeTile({ kind: 'wind', wind }, copy))
    }
  }

  for (const dragon of DRAGONS) {
    for (let copy = 0; copy < COPIES_PER_FACE; copy++) {
      tiles.push(makeTile({ kind: 'dragon', dragon }, copy))
    }
  }

  for (let index = 0; index < FLOWER_COUNT; index++) {
    tiles.push(makeTile({ kind: 'flower', index }, 0))
  }

  for (let copy = 0; copy < JOKER_COUNT; copy++) {
    tiles.push(makeTile({ kind: 'joker' }, copy))
  }

  return tiles
}

export function countByKind(tiles: readonly Tile[]): {
  jokers: number
  flowers: number
  suits: number
  winds: number
  dragons: number
} {
  let jokers = 0
  let flowers = 0
  let suits = 0
  let winds = 0
  let dragons = 0
  for (const tile of tiles) {
    switch (tile.face.kind) {
      case 'joker':
        jokers++
        break
      case 'flower':
        flowers++
        break
      case 'suit':
        suits++
        break
      case 'wind':
        winds++
        break
      case 'dragon':
        dragons++
        break
    }
  }
  return { jokers, flowers, suits, winds, dragons }
}

/**
 * Mulberry32: returns [0, 1) and the next 32-bit seed.
 * Pure — same seed always yields the same stream.
 */
export function nextRng(seed: number): { value: number; nextSeed: number } {
  let t = (seed + 0x6d2b79f5) >>> 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const nextSeed = t >>> 0
  const value = (nextSeed ^ (nextSeed >>> 14)) >>> 0
  return { value: value / 4294967296, nextSeed }
}

/** Fisher–Yates shuffle. Returns a new array and advanced seed. */
export function shuffleTiles(
  tiles: readonly Tile[],
  seed: number,
): { tiles: readonly Tile[]; seed: number } {
  const result = tiles.slice()
  let s = seed
  for (let i = result.length - 1; i > 0; i--) {
    const { value, nextSeed } = nextRng(s)
    s = nextSeed
    const j = Math.floor(value * (i + 1))
    const tmp = result[i]!
    result[i] = result[j]!
    result[j] = tmp
  }
  return { tiles: result, seed: s }
}

/** Suit a dragon maps to (Green=Bam, Red=Crak, White=Dot). */
export function dragonSuit(dragon: Dragon): Suit {
  switch (dragon) {
    case 'green':
      return 'bam'
    case 'red':
      return 'crak'
    case 'white':
      return 'dot'
  }
}
