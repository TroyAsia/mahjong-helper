import { enginePatterns, practiceCard } from '../content/patterns/practiceCard'
import {
  bestMatch,
  isWinningHand,
  tilesAway as engineTilesAway,
} from '../engine/patterns'
import type { Tile } from '../engine/types'

export { practiceCard, enginePatterns }

export function handTilesAway(tiles: readonly Tile[]): number {
  return engineTilesAway(tiles, enginePatterns())
}

export function handBestPattern(tiles: readonly Tile[]): string | null {
  const best = bestMatch(tiles, enginePatterns())
  if (!best) return null
  const named = practiceCard.patterns.find((p) => p.id === best.patternId)
  return named?.name ?? best.patternId
}

export function handIsWinning(tiles: readonly Tile[]): boolean {
  return isWinningHand(tiles, enginePatterns())
}
