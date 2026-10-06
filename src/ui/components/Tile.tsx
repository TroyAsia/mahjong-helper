import type { Tile } from '../../app/display'
import { tileLabel, tileSuitMarker } from '../../app/display'
import './Tile.css'

type Props = {
  readonly tile: Tile
  readonly selected?: boolean
  readonly disabled?: boolean
  readonly onSelect?: (tile: Tile) => void
}

export function TileView({ tile, selected, disabled, onSelect }: Props) {
  const label = tileLabel(tile.face)
  const marker = tileSuitMarker(tile.face)
  const interactive = Boolean(onSelect) && !disabled

  const content = (
    <>
      <span className="tile-marker" aria-hidden="true">
        {marker}
      </span>
      <span className="tile-label">{label}</span>
    </>
  )

  if (!interactive) {
    return (
      <span
        className={`tile${selected ? ' tile--selected' : ''}`}
        title={label}
        aria-label={label}
      >
        {content}
      </span>
    )
  }

  return (
    <button
      type="button"
      className={`tile tile--button${selected ? ' tile--selected' : ''}`}
      aria-label={`Select ${label}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={() => onSelect?.(tile)}
    >
      {content}
    </button>
  )
}
