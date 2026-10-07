import { useState } from 'react'
import { getWinningHandsGuide } from '../../app/patternGuide'
import './WinningHandsGuide.css'

type Props = {
  /** Pattern name currently closest for the player, if any. */
  readonly highlightedName?: string | null
}

export function WinningHandsGuide({ highlightedName }: Props) {
  const [open, setOpen] = useState(false)
  const guide = getWinningHandsGuide()

  return (
    <section className="hands-guide" aria-labelledby="hands-guide-title">
      <div className="hands-guide-header">
        <h2 id="hands-guide-title" className="hands-guide-title">
          Winning hands guide
        </h2>
        <button
          type="button"
          className="btn"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>

      {open && (
        <div className="hands-guide-body">
          <p className="hands-guide-intro">
            In American mahjong you win by matching a hand on the card, not by
            making free-form sets. A <strong>practice card</strong> is our own
            learning card with original winning patterns. It is{' '}
            <strong>not</strong> the official NMJL card (which is copyrighted).
            Aim for one of these shapes with 14 tiles.
          </p>
          <p className="hands-guide-notice">{guide.notice}</p>
          <ul className="hands-guide-list">
            {guide.hands.map((hand) => {
              const active =
                highlightedName !== null &&
                highlightedName !== undefined &&
                highlightedName === hand.name
              return (
                <li
                  key={hand.id}
                  className={`hands-guide-item${active ? ' is-closest' : ''}`}
                >
                  <div className="hands-guide-item-top">
                    <h3 className="hands-guide-name">{hand.name}</h3>
                    {active && (
                      <span className="hands-guide-badge">Closest now</span>
                    )}
                  </div>
                  <p className="hands-guide-desc">{hand.description}</p>
                  <ul className="hands-guide-groups">
                    {hand.groups.map((group) => (
                      <li key={`${hand.id}-${group}`}>{group}</li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ul>
          <p className="hands-guide-legend">
            Pair = 2 · Pung = 3 · Kong = 4 · Quint = 5 · Sextet = 6. Jokers may
            help only in sets of 3 or more, never in a pair or single.
          </p>
        </div>
      )}
    </section>
  )
}
