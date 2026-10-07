import type { PracticePattern } from '../content/patterns/practiceCard'
import { practiceCard } from '../content/patterns/practiceCard'
import type { FaceMatcher, PatternGroup } from '../engine/types'

export type GuideHand = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly groups: readonly string[]
}

function sizeLabel(size: PatternGroup['size']): string {
  switch (size) {
    case 1:
      return 'Single'
    case 2:
      return 'Pair'
    case 3:
      return 'Pung'
    case 4:
      return 'Kong'
    case 5:
      return 'Quint'
    case 6:
      return 'Sextet'
  }
}

function faceLabel(face: FaceMatcher): string {
  switch (face.match) {
    case 'suit': {
      const suit =
        face.suit === 'any'
          ? 'any suit'
          : face.suit === 'bam'
            ? 'Bam'
            : face.suit === 'crak'
              ? 'Crak'
              : 'Dot'
      const rank = face.rank === 'any' ? 'any rank' : String(face.rank)
      if (face.suit === 'any' && face.rank !== 'any') return `${rank} of any suit`
      if (face.rank === 'any') return `any ${suit}`
      return `${rank} ${suit}`
    }
    case 'wind':
      return face.wind === 'any'
        ? 'any wind'
        : `${face.wind[0]!.toUpperCase()}${face.wind.slice(1)} wind`
    case 'dragon':
      return face.dragon === 'any'
        ? 'any dragon'
        : `${face.dragon[0]!.toUpperCase()}${face.dragon.slice(1)} dragon`
    case 'flower':
      return 'Flower'
  }
}

export function formatPatternGroup(group: PatternGroup): string {
  return `${sizeLabel(group.size)} of ${faceLabel(group.face)}`
}

export function getWinningHandsGuide(): {
  readonly notice: string
  readonly hands: readonly GuideHand[]
} {
  return {
    notice: practiceCard.notice,
    hands: practiceCard.patterns.map((p: PracticePattern) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      groups: p.groups.map(formatPatternGroup),
    })),
  }
}
