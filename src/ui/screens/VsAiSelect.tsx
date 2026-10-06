import type { LevelId } from '../../app/levelTypes'
import './screen.css'

type Props = {
  readonly onBack: () => void
  readonly onSelect: (level: LevelId) => void
}

const OPTIONS: readonly {
  level: LevelId
  title: string
  detail: string
}[] = [
  {
    level: 'beginner',
    title: 'Easy',
    detail: 'Slower bots, more mistakes, room to learn.',
  },
  {
    level: 'intermediate',
    title: 'Medium',
    detail: 'Sharper play and fewer free gifts.',
  },
  {
    level: 'advanced',
    title: 'Hard',
    detail: 'Strong pattern-focused opponents.',
  },
]

export function VsAiSelect({ onBack, onSelect }: Props) {
  return (
    <div className="screen">
      <div className="felt-frame felt-frame--narrow">
        <button type="button" className="back-link" onClick={onBack}>
          ← Back
        </button>
        <p className="brand brand--small">Mahjong Helper</p>
        <h1 className="headline headline--section">Choose AI difficulty</h1>
        <p className="lede lede--tight">
          Pick how tough you want your three opponents to be.
        </p>
        <ul className="choice-list">
          {OPTIONS.map((opt) => (
            <li key={opt.level}>
              <button
                type="button"
                className="choice"
                onClick={() => onSelect(opt.level)}
              >
                <span className="choice-title">{opt.title}</span>
                <span className="choice-detail">{opt.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
