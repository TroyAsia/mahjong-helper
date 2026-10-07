import { useEffect, useState } from 'react'
import {
  explainMove,
  requestHint,
  type Explanation,
  type Hint,
} from '../../app/coachApi'
import { SEATS, type Action, type Tile } from '../../app/display'
import { startGameLoop } from '../../app/gameLoop'
import { useGameStore } from '../../app/gameStore'
import { legalActionsFor } from '../../app/legal'
import { illegalMoveMessage } from '../../app/messages'
import {
  seatAway,
  seatPatternName,
  seatWinning,
} from '../../app/patterns'
import { useLevelConfig } from '../../app/useLevelConfig'
import { DiscardPile } from '../components/DiscardPile'
import { MahjongMark } from '../components/MahjongMark'
import { Rack } from '../components/Rack'
import { TileView } from '../components/Tile'
import { WinningHandsGuide } from '../components/WinningHandsGuide'
import './PracticeGame.css'
import './screen.css'

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
  const [message, setMessage] = useState<string | null>(null)
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
  const inCall = present.phase === 'call' && present.currentSeat === HUMAN
  const canWin = (canDiscard || inCall) && seatWinning(present, HUMAN)
  const away = seatAway(present, HUMAN)
  const bestName = seatPatternName(present, HUMAN)
  const callActions = inCall
    ? legalActionsFor(present, HUMAN).filter(
        (a): a is Extract<Action, { type: 'call' }> => a.type === 'call',
      )
    : []

  const apply = (action: Action) => {
    const before = present
    const result = dispatch(HUMAN, action, { isBot: false })
    if (!result.ok) {
      setMessage(illegalMoveMessage(result.reason))
      return
    }
    setMessage(null)
    setExplanation(
      explainMove(before, action, result.state, levelConfig.explainer),
    )
  }

  const onSelect = (tile: Tile) => {
    if (!canDiscard) return
    setSelectedId(tile.id)
  }

  const confirmDiscard = () => {
    if (!selectedId || !canDiscard) return
    apply({ type: 'discard', tileId: selectedId })
    setSelectedId(null)
  }

  const doDraw = () => {
    if (!canDraw) return
    apply({ type: 'draw' })
    setHint(null)
  }

  const doWin = () => {
    if (!canWin) return
    apply({ type: 'declare_win' })
  }

  const doPass = () => {
    if (!inCall) return
    apply({ type: 'pass' })
  }

  const showHint = () => {
    setHint(requestHint(present, HUMAN, levelConfig.hints))
  }

  const status =
    present.phase === 'ended'
      ? present.endReason === 'win'
        ? `Mahjong! Winner: ${present.winner}`
        : `Game over: draw (empty wall)`
      : present.phase === 'call' && present.lastDiscard
        ? `Call window: ${present.lastDiscard.seat} discarded · asking ${present.currentSeat}`
        : `Turn: ${present.currentSeat} · Phase: ${present.phase} · Wall: ${present.wall.length}`

  return (
    <div className="screen">
      <div className="felt-frame felt-frame--wide practice">
        {onBack && (
          <button type="button" className="back-link" onClick={onBack}>
            ← Change difficulty
          </button>
        )}
        <div className="brand-row">
          <MahjongMark size="sm" />
          <p className="brand brand--small">Mahjong Helper</p>
        </div>
        <h1 className="headline headline--section">Play vs AI</h1>
        <p className="practice-status" aria-live="polite">
          {status}
        </p>
        <p className="practice-meter" aria-live="polite">
          Pattern meter: {away} tile{away === 1 ? '' : 's'} away
          {bestName ? ` · best: ${bestName}` : ''}
        </p>
        <p className="lede lede--tight practice-notice">
          Win by matching a practice-card hand (not the official NMJL card).
        </p>

        <WinningHandsGuide highlightedName={bestName} />

        <div className="practice-actions" role="group" aria-label="Game actions">
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

        {message && (
          <p className="practice-message" role="alert">
            {message}
          </p>
        )}
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

        {inCall && present.lastDiscard && (
          <section className="call-panel" aria-label="Call or pass">
            <h2 className="rack-title">Call or pass</h2>
            <p className="call-panel-copy">
              {present.lastDiscard.seat} discarded this tile. Call only for a
              pung/kong (or bigger) in your pattern, or to win.
            </p>
            <div className="call-offer">
              <TileView tile={present.lastDiscard.tile} />
            </div>
            <div className="practice-actions">
              {callActions.map((action) => (
                <button
                  key={`${action.meld}-${action.tileIds.join(',')}`}
                  type="button"
                  className="btn btn-primary"
                  onClick={() => apply(action)}
                >
                  Call {action.meld}
                </button>
              ))}
              <button type="button" className="btn" onClick={doPass}>
                Pass
              </button>
              {canWin && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={doWin}
                >
                  Win on discard
                </button>
              )}
            </div>
          </section>
        )}

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
              {present.exposed[seat].length > 0
                ? ` · ${present.exposed[seat].length} exposed`
                : ''}
            </p>
          ))}
        </div>

        {SEATS.some((s) => present.exposed[s].length > 0) && (
          <section className="exposed-board" aria-label="Exposed melds">
            <h2 className="rack-title">Exposed melds</h2>
            {SEATS.map((seat) =>
              present.exposed[seat].length === 0 ? null : (
                <div key={seat} className="exposed-row">
                  <span className="discard-seat">{seat}</span>
                  <div className="exposed-melds">
                    {present.exposed[seat].map((meld, i) => (
                      <div key={`${seat}-${i}`} className="exposed-meld">
                        <span className="exposed-kind">{meld.kind}</span>
                        {meld.tiles.map((tile) => (
                          <TileView key={tile.id} tile={tile} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </section>
        )}

        <DiscardPile discards={present.discards} seats={SEATS} />
      </div>
    </div>
  )
}
