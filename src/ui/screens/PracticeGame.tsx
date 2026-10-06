import { useEffect, useState } from 'react'
import {
  explainMove,
  requestHint,
  type Explanation,
  type Hint,
} from '../../app/coachApi'
import { SEATS, type Tile } from '../../app/display'
import { startGameLoop } from '../../app/gameLoop'
import { useGameStore } from '../../app/gameStore'
import { handBestPattern, handIsWinning, handTilesAway } from '../../app/patterns'
import { useLevelConfig } from '../../app/useLevelConfig'
import { DiscardPile } from '../components/DiscardPile'
import { Rack } from '../components/Rack'
import './PracticeGame.css'

const HUMAN = 'east' as const

type Props = {
  readonly onBack?: () => void
}

export function PracticeGame({ onBack }: Props) {
  const present = useGameStore((s) => s.present)
  const dispatch = useGameStore((s) => s.dispatch)
  const undo = useGameStore((s) => s.undo)
  const canUndo = useGameStore((s) => s.canUndo)
  const newGame = useGameStore((s) => s.newGame)
  const levelConfig = useLevelConfig()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hint, setHint] = useState<Hint | null>(null)
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [, setTick] = useState(0)

  const { thinkDelayMs, strength, mistakeRate } = levelConfig.ai

  useEffect(() => {
    const stop = startGameLoop({
      humanSeat: HUMAN,
      ai: { thinkDelayMs, strength, mistakeRate },
      onUpdate: () => setTick((n) => n + 1),
    })
    return stop
  }, [thinkDelayMs, strength, mistakeRate])

  const isHumanTurn =
    present.phase !== 'ended' && present.currentSeat === HUMAN
  const canDraw = isHumanTurn && present.phase === 'draw'
  const canDiscard = isHumanTurn && present.phase === 'discard'
  const canWin = canDiscard && handIsWinning(present.hands.east)
  const away = handTilesAway(present.hands.east)
  const bestName = handBestPattern(present.hands.east)

  const onSelect = (tile: Tile) => {
    if (!canDiscard) return
    setSelectedId(tile.id)
  }

  const confirmDiscard = () => {
    if (!selectedId || !canDiscard) return
    const before = present
    const action = { type: 'discard' as const, tileId: selectedId }
    const result = dispatch(HUMAN, action, { isBot: false })
    setSelectedId(null)
    if (result.ok) {
      setExplanation(
        explainMove(before, action, result.state, levelConfig.explainer),
      )
    }
  }

  const doDraw = () => {
    if (!canDraw) return
    dispatch(HUMAN, { type: 'draw' }, { isBot: false })
    setHint(null)
  }

  const doWin = () => {
    if (!canWin) return
    dispatch(HUMAN, { type: 'declare_win' }, { isBot: false })
  }

  const showHint = () => {
    setHint(requestHint(present, HUMAN, levelConfig.hints))
  }

  const status =
    present.phase === 'ended'
      ? present.endReason === 'win'
        ? `Mahjong! Winner: ${present.winner}`
        : `Game over: draw (empty wall)`
      : `Turn: ${present.currentSeat} · Phase: ${present.phase} · Wall: ${present.wall.length}`

  return (
    <div className="practice">
      <header className="practice-header">
        {onBack && (
          <button type="button" className="practice-back" onClick={onBack}>
            ← Change difficulty
          </button>
        )}
        <h1>Play vs AI</h1>
        <p className="practice-status">{status}</p>
        <p className="practice-meter" aria-live="polite">
          Pattern meter: {away} tile{away === 1 ? '' : 's'} away
          {bestName ? ` · best: ${bestName}` : ''}
        </p>
        <p className="practice-notice">
          Practice patterns only, not the official NMJL card.
        </p>
        <div className="practice-actions">
          <button type="button" onClick={() => newGame()} className="btn">
            New game
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => undo()}
            disabled={!canUndo()}
          >
            Undo
          </button>
          <button type="button" className="btn" onClick={showHint}>
            Hint
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={doDraw}
            disabled={!canDraw}
          >
            Draw
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={confirmDiscard}
            disabled={!canDiscard || !selectedId}
          >
            Discard
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={doWin}
            disabled={!canWin}
          >
            Declare win
          </button>
        </div>
        {hint && (
          <p className="practice-hint" role="status">
            Hint: {hint.text}
          </p>
        )}
        {explanation && explanation.kind !== 'none' && (
          <aside className="practice-explain" aria-live="polite">
            <strong>{explanation.summary}</strong>
            <p>{explanation.detail}</p>
          </aside>
        )}
      </header>

      <Rack
        label="Your hand (East)"
        tiles={present.hands.east}
        selectedId={selectedId}
        interactive={canDiscard}
        onSelect={onSelect}
      />

      <div className="opponent-summary" aria-label="Opponents">
        {SEATS.filter((s) => s !== HUMAN).map((seat) => (
          <p key={seat}>
            {seat}: {present.hands[seat].length} tiles
          </p>
        ))}
      </div>

      <DiscardPile discards={present.discards} seats={SEATS} />
    </div>
  )
}
