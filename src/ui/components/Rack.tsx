import type { Tile } from '../../app/display'
import { TileView } from './Tile'

type Props = {
  readonly tiles: readonly Tile[]
  readonly selectedId?: string | null
  readonly interactive?: boolean
  readonly onSelect?: (tile: Tile) => void
  readonly label: string
}

export function Rack({
  tiles,
  selectedId,
  interactive,
  onSelect,
  label,
}: Props) {
  return (
    <section className="rack" aria-label={label}>
      <h2 className="rack-title">{label}</h2>
      <div className="rack-tiles" role="list">
        {tiles.map((tile) => (
          <span role="listitem" key={tile.id}>
            <TileView
              tile={tile}
              selected={selectedId === tile.id}
              onSelect={interactive ? onSelect : undefined}
            />
          </span>
        ))}
      </div>
    </section>
  )
}
