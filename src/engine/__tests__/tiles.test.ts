import { describe, expect, it } from 'vitest'
import {
  checkInvariants,
  createInitialState,
  handSizes,
} from '../setup'
import {
  countByKind,
  createTileSet,
  dragonSuit,
  shuffleTiles,
  TOTAL_TILES,
} from '../tiles'

describe('createTileSet', () => {
  it('has exactly 152 tiles', () => {
    expect(createTileSet()).toHaveLength(TOTAL_TILES)
  })

  it('has 8 jokers and 8 flowers', () => {
    const counts = countByKind(createTileSet())
    expect(counts.jokers).toBe(8)
    expect(counts.flowers).toBe(8)
  })

  it('has 108 suit tiles, 16 winds, 12 dragons', () => {
    const counts = countByKind(createTileSet())
    expect(counts.suits).toBe(108) // 3 suits × 9 ranks × 4
    expect(counts.winds).toBe(16)
    expect(counts.dragons).toBe(12)
  })

  it('gives every tile a unique id', () => {
    const ids = createTileSet().map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('dragonSuit', () => {
  it('maps green→bam, red→crak, white→dot', () => {
    expect(dragonSuit('green')).toBe('bam')
    expect(dragonSuit('red')).toBe('crak')
    expect(dragonSuit('white')).toBe('dot')
  })
})

describe('shuffleTiles', () => {
  it('is deterministic for the same seed', () => {
    const set = createTileSet()
    const a = shuffleTiles(set, 42)
    const b = shuffleTiles(set, 42)
    expect(a.tiles.map((t) => t.id)).toEqual(b.tiles.map((t) => t.id))
    expect(a.seed).toBe(b.seed)
  })

  it('differs for different seeds', () => {
    const set = createTileSet()
    const a = shuffleTiles(set, 1)
    const b = shuffleTiles(set, 2)
    expect(a.tiles.map((t) => t.id)).not.toEqual(b.tiles.map((t) => t.id))
  })

  it('does not mutate the input array', () => {
    const set = createTileSet()
    const before = set.map((t) => t.id)
    shuffleTiles(set, 7)
    expect(set.map((t) => t.id)).toEqual(before)
  })
})

describe('createInitialState', () => {
  it('deals 13/13/13/14 with East as dealer', () => {
    const state = createInitialState(99)
    expect(handSizes(state)).toEqual({
      east: 14,
      south: 13,
      west: 13,
      north: 13,
    })
    expect(state.dealer).toBe('east')
    expect(state.currentSeat).toBe('east')
    expect(state.phase).toBe('discard')
    expect(state.wall).toHaveLength(152 - 14 - 13 * 3)
  })

  it('same seed gives the same deal', () => {
    const a = createInitialState(12345)
    const b = createInitialState(12345)
    expect(a.hands).toEqual(b.hands)
    expect(a.wall.map((t) => t.id)).toEqual(b.wall.map((t) => t.id))
    expect(a.rngSeed).toBe(b.rngSeed)
  })

  it('conserves 152 unique tiles', () => {
    const state = createInitialState(7)
    expect(checkInvariants(state)).toEqual([])
  })
})
