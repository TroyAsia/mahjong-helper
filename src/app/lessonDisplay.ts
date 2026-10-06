import type { LessonFace } from '../content/lessons/types'
import type { Tile, TileFace } from '../engine/types'
import { tileLabel, tileSuitMarker } from './display'

export function lessonFaceToTileFace(face: LessonFace): TileFace {
  switch (face.kind) {
    case 'suit':
      return { kind: 'suit', suit: face.suit, rank: face.rank }
    case 'wind':
      return { kind: 'wind', wind: face.wind }
    case 'dragon':
      return { kind: 'dragon', dragon: face.dragon }
    case 'flower':
      return { kind: 'flower', index: face.index }
    case 'joker':
      return { kind: 'joker' }
  }
}

export function lessonFaceAsTile(face: LessonFace, id = 'lesson'): Tile {
  return { id, face: lessonFaceToTileFace(face) }
}

export function describeLessonFace(face: LessonFace): string {
  const tileFace = lessonFaceToTileFace(face)
  return `${tileLabel(tileFace)} ${tileSuitMarker(tileFace)}`
}
