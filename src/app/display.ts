import type { Tile, TileFace } from '../engine/types'

export type { Tile, Seat, GameState, Action, Phase } from '../engine/types'
export { SEATS, TURN_ORDER } from '../engine/types'

/** Short label for a tile (letters + numbers; not color-only). */
export function tileLabel(face: TileFace): string {
  switch (face.kind) {
    case 'suit': {
      const suit =
        face.suit === 'bam' ? 'B' : face.suit === 'crak' ? 'C' : 'D'
      return `${face.rank}${suit}`
    }
    case 'wind':
      return face.wind[0]!.toUpperCase() + 'W'
    case 'dragon':
      return face.dragon === 'green'
        ? 'GD'
        : face.dragon === 'red'
          ? 'RD'
          : 'WD'
    case 'flower':
      return `F${face.index + 1}`
    case 'joker':
      return 'Jk'
  }
}

export function tileSuitMarker(face: TileFace): string {
  switch (face.kind) {
    case 'suit':
      return face.suit === 'bam' ? '║' : face.suit === 'crak' ? '#' : '●'
    case 'wind':
      return '◇'
    case 'dragon':
      return '◆'
    case 'flower':
      return '❀'
    case 'joker':
      return '★'
  }
}

export function describeTile(tile: Tile): string {
  return `${tileLabel(tile.face)} ${tileSuitMarker(tile.face)}`
}
