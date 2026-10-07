import './screen.css'

type Props = {
  readonly onPlayVsAi: () => void
  readonly onLessons: () => void
  readonly onCharleston: () => void
}

export function Home({ onPlayVsAi, onLessons, onCharleston }: Props) {
  return (
    <div className="screen screen--home">
      <div className="felt-frame">
        <p className="brand">Mahjong Helper</p>
        <h1 className="headline">Welcome to Mahjong Helper</h1>
        <p className="lede">
          It will help you get better at mahjong, from reading tiles to
          practicing full hands against AI.
        </p>
        <div className="cta-row">
          <button type="button" className="cta cta--primary" onClick={onPlayVsAi}>
            Play vs AI
          </button>
          <button type="button" className="cta cta--secondary" onClick={onLessons}>
            Lessons
          </button>
          <button type="button" className="cta cta--secondary" onClick={onCharleston}>
            Charleston
          </button>
        </div>
      </div>
    </div>
  )
}
