import { lessonTracks } from '../../content/lessons/tracks'
import type { LevelId } from '../../app/levelTypes'
import { MahjongMark } from '../components/MahjongMark'
import './screen.css'

type Props = {
  readonly onBack: () => void
  readonly onSelect: (level: LevelId) => void
}

export function LessonsSelect({ onBack, onSelect }: Props) {
  return (
    <div className="screen">
      <div className="felt-frame felt-frame--narrow">
        <button type="button" className="back-link" onClick={onBack}>
          ← Back
        </button>
        <div className="brand-row">
          <MahjongMark size="sm" />
          <p className="brand brand--small">Mahjong Helper</p>
        </div>
        <h1 className="headline headline--section">Choose lesson level</h1>
        <p className="lede lede--tight">
          Start with the basics, then grow into strategy and table reading.
        </p>
        <ul className="choice-list">
          {lessonTracks.map((track) => (
            <li key={track.level}>
              <button
                type="button"
                className="choice"
                onClick={() => onSelect(track.level)}
              >
                <span className="choice-title">{track.label}</span>
                <span className="choice-detail">{track.blurb}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
