import type { Seat, Tile } from '../../app/display'
import { TileView } from './Tile'

type Props = {
  readonly discards: { readonly [S in Seat]: readonly Tile[] }
  readonly seats: readonly Seat[]
}

export function DiscardPile({ discards, seats }: Props) {
  return (
    <section className="discards" aria-label="Discard piles">
      <h2 className="rack-title">Discards</h2>
      {seats.map((seat) => (
        <div key={seat} className="discard-row" aria-label={`${seat} discards`}>
          <span className="discard-seat">{seat}</span>
          <div className="discard-tiles">
            {discards[seat].map((tile) => (
              <TileView key={tile.id} tile={tile} />
            ))}
            {discards[seat].length === 0 && (
              <span className="discard-empty">—</span>
            )}
          </div>
        </div>
      ))}
    </section>
  )
}
