import type { Tile, TileFace, FaceMatcher, Pattern, PatternGroup } from './types'

export type { FaceMatcher, Pattern, PatternGroup }

export type MatchResult = {
  readonly patternId: string
  readonly matched: boolean
  readonly tilesUsed: number
  readonly tilesAway: number
}

export function tileMatchesFace(face: TileFace, matcher: FaceMatcher): boolean {
  if (face.kind === 'joker') return false
  switch (matcher.match) {
    case 'suit':
      if (face.kind !== 'suit') return false
      if (matcher.suit !== 'any' && face.suit !== matcher.suit) return false
      if (matcher.rank !== 'any' && face.rank !== matcher.rank) return false
      return true
    case 'wind':
      if (face.kind !== 'wind') return false
      if (matcher.wind !== 'any' && face.wind !== matcher.wind) return false
      return true
    case 'dragon':
      if (face.kind !== 'dragon') return false
      if (matcher.dragon !== 'any' && face.dragon !== matcher.dragon)
        return false
      return true
    case 'flower':
      return face.kind === 'flower'
  }
}

function faceSignature(face: TileFace): string {
  switch (face.kind) {
    case 'suit':
      return `suit:${face.suit}:${face.rank}`
    case 'wind':
      return `wind:${face.wind}`
    case 'dragon':
      return `dragon:${face.dragon}`
    case 'flower':
      return 'flower'
    case 'joker':
      return 'joker'
  }
}

type Pool = Map<string, number>

function buildPool(tiles: readonly Tile[]): { pool: Pool; jokers: number } {
  const pool: Pool = new Map()
  let jokers = 0
  for (const tile of tiles) {
    if (tile.face.kind === 'joker') {
      jokers++
      continue
    }
    const key = faceSignature(tile.face)
    pool.set(key, (pool.get(key) ?? 0) + 1)
  }
  return { pool, jokers }
}

function clonePool(pool: Pool): Pool {
  return new Map(pool)
}

function faceFromKey(key: string): TileFace | null {
  const [kind, a, b] = key.split(':')
  if (kind === 'suit' && a && b) {
    return {
      kind: 'suit',
      suit: a as 'bam' | 'crak' | 'dot',
      rank: Number(b) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
    }
  }
  if (kind === 'wind' && a) {
    return { kind: 'wind', wind: a as 'east' | 'south' | 'west' | 'north' }
  }
  if (kind === 'dragon' && a) {
    return { kind: 'dragon', dragon: a as 'green' | 'red' | 'white' }
  }
  if (kind === 'flower') return { kind: 'flower', index: 0 }
  return null
}

function matchingKeys(pool: Pool, matcher: FaceMatcher): string[] {
  const keys: string[] = []
  for (const key of pool.keys()) {
    const face = faceFromKey(key)
    if (face && tileMatchesFace(face, matcher)) keys.push(key)
  }
  return keys
}

export function canUseJokerInGroupSize(size: number): boolean {
  return size >= 3
}

function matchPatternSearch(
  tiles: readonly Tile[],
  pattern: Pattern,
): { matched: boolean; tilesUsed: number } {
  const total = pattern.groups.reduce((s, g) => s + g.size, 0)

  function search(
    groupIndex: number,
    pool: Pool,
    jokers: number,
    used: number,
  ): number {
    if (groupIndex >= pattern.groups.length) return used
    const group = pattern.groups[groupIndex]!
    const keys = matchingKeys(pool, group.face)
    const allowJokers = group.size >= 3

    const attempts: {
      key: string | null
      natural: number
      jokersUsed: number
    }[] = []
    for (const key of keys) {
      const available = pool.get(key) ?? 0
      if (available >= group.size) {
        attempts.push({ key, natural: group.size, jokersUsed: 0 })
      } else if (allowJokers && available + jokers >= group.size) {
        attempts.push({
          key,
          natural: available,
          jokersUsed: group.size - available,
        })
      } else {
        // Partial credit so tilesAway reflects near-complete groups (e.g. 1/2 pair).
        const natural = Math.min(available, group.size)
        const jokersUsed = allowJokers
          ? Math.min(jokers, group.size - natural)
          : 0
        if (natural + jokersUsed > 0) {
          attempts.push({ key, natural, jokersUsed })
        }
      }
    }
    if (allowJokers && jokers >= group.size) {
      attempts.push({ key: null, natural: 0, jokersUsed: group.size })
    }

    let best = 0
    if (attempts.length === 0) {
      return search(groupIndex + 1, pool, jokers, used)
    }

    for (const attempt of attempts) {
      const nextPool = clonePool(pool)
      if (attempt.key) {
        const left = (nextPool.get(attempt.key) ?? 0) - attempt.natural
        if (left <= 0) nextPool.delete(attempt.key)
        else nextPool.set(attempt.key, left)
      }
      const score = search(
        groupIndex + 1,
        nextPool,
        jokers - attempt.jokersUsed,
        used + attempt.natural + attempt.jokersUsed,
      )
      if (score > best) best = score
      if (best >= total) return best
    }
    const skip = search(groupIndex + 1, pool, jokers, used)
    return Math.max(best, skip)
  }

  const { pool, jokers } = buildPool(tiles)
  const tilesUsed = search(0, pool, jokers, 0)
  return {
    matched: tilesUsed >= total && tiles.length === total,
    tilesUsed: Math.min(tilesUsed, total),
  }
}

export function matchPattern(
  tiles: readonly Tile[],
  pattern: Pattern,
): MatchResult {
  const total = pattern.groups.reduce((s, g) => s + g.size, 0)
  const { matched, tilesUsed } = matchPatternSearch(tiles, pattern)
  const tilesAway = Math.max(0, total - tilesUsed)
  return {
    patternId: pattern.id,
    matched: matched && tilesAway === 0,
    tilesUsed,
    tilesAway,
  }
}

export function bestMatch(
  tiles: readonly Tile[],
  patterns: readonly Pattern[],
): MatchResult | null {
  let best: MatchResult | null = null
  for (const pattern of patterns) {
    const result = matchPattern(tiles, pattern)
    if (!best || result.tilesAway < best.tilesAway) best = result
  }
  return best
}

export function tilesAway(
  tiles: readonly Tile[],
  patterns: readonly Pattern[],
): number {
  const best = bestMatch(tiles, patterns)
  return best?.tilesAway ?? 14
}

export function isWinningHand(
  tiles: readonly Tile[],
  patterns: readonly Pattern[],
): boolean {
  return patterns.some((p) => matchPattern(tiles, p).matched)
}
