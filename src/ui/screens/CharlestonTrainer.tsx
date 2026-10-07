import { useEffect, useState } from 'react'
import { explainCharleston, type Explanation } from '../../app/coachApi'
import { startGameLoop } from '../../app/gameLoop'
import { useGameStore } from '../../app/gameStore'
import { useLevelConfig } from '../../app/useLevelConfig'
import { Rack } from '../components/Rack'
import type { Tile } from '../../app/display'
import './PracticeGame.css'
import './screen.css'

const HUMAN = 'east' as const

type Props = {
  readonly onBack: () => void
}

function stepLabel(step: string): string {
  switch (step) {
    case 'first_right':
      return 'First Charleston: pass 3 right'
    case 'first_across':
      return 'First Charleston: pass 3 across'
    case 'first_left':
      return 'First Charleston: pass 3 left'
    case 'vote_second':
      return 'Vote: continue with a second Charleston?'
    case 'second_left':
      return 'Second Charleston: pass 3 left'
    case 'second_across':
      return 'Second Charleston: pass 3 across'
    case 'second_right':
      return 'Second Charleston: pass 3 right'
    case 'courtesy':
      return 'Courtesy pass: up to 3 across (optional)'
    default:
      return step
  }
}

export function CharlestonTrainer({ onBack }: Props) {
  const present = useGameStore((s) => s.present)
  const dispatch = useGameStore((s) => s.dispatch)
  const newGame = useGameStore((s) => s.newGame)
  const levelConfig = useLevelConfig()
  const [selected, setSelected] = useState<string[]>([])
  const [explanation, setExplanation] = useState<Explanation | null>(null)
  const [showGuide, setShowGuide] = useState(true)
  const [, setTick] = useState(0)

  const { thinkDelayMs, strength, mistakeRate } = levelConfig.ai

  useEffect(() => {
    newGame(undefined, { charleston: true })
  }, [newGame])

  useEffect(() => {
    const stop = startGameLoop({
      humanSeat: HUMAN,
      ai: { thinkDelayMs, strength, mistakeRate },
      onUpdate: () => setTick((n) => n + 1),
    })
    return stop
  }, [thinkDelayMs, strength, mistakeRate])

  const charleston = present.charleston
  const inCharleston = present.phase === 'charleston' && charleston
  const submitted = Boolean(
    inCharleston &&
      (charleston.step === 'vote_second'
        ? charleston.votes.east !== null
        : charleston.selections.east !== null),
  )

  const onSelect = (tile: Tile) => {
    if (!inCharleston || submitted || tile.face.kind === 'joker') return
    setSelected((prev) => {
      if (prev.includes(tile.id)) return prev.filter((id) => id !== tile.id)
      const max = charleston.step === 'courtesy' ? 3 : 3
      if (prev.length >= max && charleston.step !== 'courtesy') return prev
      if (charleston.step === 'courtesy' && prev.length >= 3) return prev
      return [...prev, tile.id]
    })
  }

  const passTiles = () => {
    if (!charleston || charleston.step === 'vote_second') return
    const count = charleston.step === 'courtesy' ? selected.length : 3
    if (charleston.step !== 'courtesy' && selected.length !== 3) return
    if (charleston.step === 'courtesy' && selected.length > 3) return
    const tileIds = selected.slice(0, count)
    const feedback = explainCharleston(
      present,
      HUMAN,
      tileIds,
      levelConfig.explainer,
    )
    const result = dispatch(
      HUMAN,
      { type: 'charleston_pass', tileIds },
      { isBot: false },
    )
    if (result.ok) {
      setExplanation(feedback)
      setSelected([])
    }
  }

  const vote = (continueSecond: boolean) => {
    const result = dispatch(
      HUMAN,
      { type: 'charleston_vote', continue: continueSecond },
      { isBot: false },
    )
    if (result.ok) {
      setExplanation({
        kind: 'charleston',
        verdict: 'ok',
        summary: continueSecond ? 'Second Charleston on' : 'Stopping after first',
        detail: continueSecond
          ? 'You voted to keep passing. Any "no" from the table skips the second round.'
          : 'A no vote ends the optional second Charleston for everyone.',
      })
    }
  }

  const done = present.phase !== 'charleston'

  return (
    <div className="screen">
      <div className="felt-frame" style={{ width: 'min(48rem, 100%)' }}>
        <button type="button" className="back-link" onClick={onBack}>
          ← Home
        </button>
        <p className="brand brand--small">Mahjong Helper</p>
        <h1 className="headline headline--section">Charleston trainer</h1>
        <p className="lede lede--tight">
          Practice the tile-passing phase that happens before play starts.
        </p>

        <section className="charleston-guide" aria-labelledby="charleston-guide-title">
          <div className="charleston-guide-header">
            <h2 id="charleston-guide-title" className="charleston-guide-title">
              How the Charleston works
            </h2>
            <button
              type="button"
              className="btn"
              onClick={() => setShowGuide((v) => !v)}
              aria-expanded={showGuide}
            >
              {showGuide ? 'Hide' : 'Show'}
            </button>
          </div>
          {showGuide && (
            <div className="charleston-guide-body">
              <p>
                After the deal, every player passes unwanted tiles to reshape
                their hand before anyone draws or discards. You cannot pass
                jokers.
              </p>
              <ol className="charleston-guide-steps">
                <li>
                  <strong>First Charleston (required).</strong> Pass 3 tiles
                  right, then 3 across, then 3 left. Everyone passes at the same
                  time each step.
                </li>
                <li>
                  <strong>Vote.</strong> Decide whether to run a second
                  Charleston. In this app the second round only happens if
                  everyone votes yes. Any no skips it.
                </li>
                <li>
                  <strong>Second Charleston (optional).</strong> If everyone
                  agreed, pass 3 left, then 3 across, then 3 right.
                </li>
                <li>
                  <strong>Courtesy pass (optional).</strong> Pass 0 to 3 tiles
                  across. Then normal play begins.
                </li>
              </ol>
              <p className="charleston-guide-tip">
                Tip: pass tiles that do not fit the hand you want. Keep pairs,
                pung starts, and your main suit or honors. If your hand already
                looks focused after the first Charleston, voting no on the
                second is often smart.
              </p>
            </div>
          )}
        </section>

        <div className="practice-actions" style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSelected([])
              setExplanation(null)
              newGame(undefined, { charleston: true })
            }}
          >
            Restart Charleston
          </button>
        </div>

        {done ? (
          <p className="practice-status">
            Charleston finished. Play continues with the dealer discard, or
            restart to practice again.
          </p>
        ) : (
          <>
            <p className="practice-status">
              {stepLabel(charleston!.step)}
              {submitted ? ' · Waiting for others…' : ''}
            </p>
            <Rack
              label="Your hand (East): tap tiles to pass"
              tiles={present.hands.east}
              selectedIds={selected}
              interactive={!submitted && charleston!.step !== 'vote_second'}
              onSelect={onSelect}
            />
            {selected.length > 0 && (
              <p className="practice-meter">
                Selected {selected.length}
                {charleston!.step === 'courtesy' ? ' (0–3)' : ' / 3'}
              </p>
            )}
            <div className="practice-actions">
              {charleston!.step === 'vote_second' ? (
                <>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={submitted}
                    onClick={() => vote(true)}
                  >
                    Continue second
                  </button>
                  <button
                    type="button"
                    className="btn"
                    disabled={submitted}
                    onClick={() => vote(false)}
                  >
                    Stop after first
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={
                    submitted ||
                    (charleston!.step !== 'courtesy' && selected.length !== 3)
                  }
                  onClick={passTiles}
                >
                  {charleston!.step === 'courtesy'
                    ? `Pass ${selected.length} across`
                    : 'Pass 3 tiles'}
                </button>
              )}
            </div>
          </>
        )}

        {explanation && explanation.kind !== 'none' && (
          <aside className="practice-explain" aria-live="polite">
            <strong>{explanation.summary}</strong>
            <p>{explanation.detail}</p>
          </aside>
        )}
      </div>
    </div>
  )
}
