import { useState } from 'react'
import {
  isLessonComplete,
  markLessonComplete,
} from '../../app/lessonProgress'
import {
  describeLessonFace,
  lessonFaceAsTile,
} from '../../app/lessonDisplay'
import type { LevelId } from '../../app/levelTypes'
import { getLesson, getLessonTrack } from '../../content/lessons/tracks'
import {
  faceKey,
  isPlayCorrect,
  type LessonFace,
  type LessonStep,
  type PlayStep,
} from '../../content/lessons/types'
import { GlossaryText } from '../components/GlossaryText'
import { TileView } from '../components/Tile'
import './LessonRunner.css'
import './screen.css'

type Props = {
  readonly level: LevelId
  readonly lessonId: string
  readonly onBack: () => void
}

export function LessonRunner({ level, lessonId, onBack }: Props) {
  const track = getLessonTrack(level)
  const lesson = getLesson(level, lessonId)
  const [stepIndex, setStepIndex] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState({ correct: 0, asked: 0 })

  if (!lesson) {
    return (
      <div className="screen">
        <div className="felt-frame felt-frame--narrow">
          <button type="button" className="back-link" onClick={onBack}>
            ← Back
          </button>
          <p className="lede">Lesson not found.</p>
        </div>
      </div>
    )
  }

  const step = lesson.steps[stepIndex]!
  const total = lesson.steps.length
  const isLast = stepIndex >= total - 1
  const isTeach = step.type === 'teach'
  const isPlay = step.type === 'play'
  const needsCheckButton = step.type === 'quiz' || step.type === 'identify'

  const isCorrect = (() => {
    if (selectedId === null || isTeach) return false
    if (step.type === 'play') return isPlayCorrect(step, selectedId)
    return selectedId === step.correctId
  })()

  const progressLabel = `Step ${stepIndex + 1} of ${total}`
  const alreadyDone = isLessonComplete(level, lessonId)

  const goNext = () => {
    if (isLast) {
      markLessonComplete(level, lessonId)
      onBack()
      return
    }
    setStepIndex((i) => i + 1)
    setSelectedId(null)
    setChecked(false)
  }

  const registerResult = (moveId: string, correct: boolean) => {
    setSelectedId(moveId)
    setChecked(true)
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      asked: s.asked + 1,
    }))
  }

  const checkAnswer = () => {
    if (!needsCheckButton || selectedId === null || checked) return
    const correct =
      step.type === 'quiz' || step.type === 'identify'
        ? selectedId === step.correctId
        : false
    registerResult(selectedId, correct)
  }

  const onPlayMove = (moveId: string) => {
    if (!isPlay || checked) return
    registerResult(moveId, isPlayCorrect(step, moveId))
  }

  return (
    <div className="screen">
      <div className="felt-frame lesson-runner">
        <button type="button" className="back-link" onClick={onBack}>
          ← {track.label} lessons
        </button>
        <p className="brand brand--small">Mahjong Helper</p>
        <h1 className="headline headline--section">{lesson.title}</h1>
        <p className="lesson-meta">
          {progressLabel}
          {alreadyDone ? ' · Completed before' : ''}
          {score.asked > 0
            ? ` · Practice score ${score.correct}/${score.asked}`
            : ''}
        </p>
        <div
          className="lesson-progress-bar"
          role="progressbar"
          aria-valuenow={stepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={progressLabel}
        >
          <span style={{ width: `${((stepIndex + 1) / total) * 100}%` }} />
        </div>

        {isTeach && <TeachBody step={step} />}
        {step.type === 'quiz' && (
          <ChoiceBody
            prompt={step.prompt}
            choices={step.choices}
            selectedId={selectedId}
            checked={checked}
            correctId={step.correctId}
            onSelect={(id) => {
              if (!checked) setSelectedId(id)
            }}
          />
        )}
        {step.type === 'identify' && (
          <ChoiceBody
            prompt={step.prompt}
            choices={step.choices}
            selectedId={selectedId}
            checked={checked}
            correctId={step.correctId}
            onSelect={(id) => {
              if (!checked) setSelectedId(id)
            }}
            focusTile={step.tile}
          />
        )}
        {isPlay && (
          <PlayBody
            step={step}
            selectedId={selectedId}
            checked={checked}
            onMove={onPlayMove}
          />
        )}

        {checked && step.type !== 'teach' && (
          <div
            className={`lesson-feedback ${isCorrect ? 'is-good' : 'is-bad'}`}
            role="status"
          >
            <strong>
              {step.type === 'play'
                ? isCorrect
                  ? 'Correct move'
                  : 'Not the best move'
                : isCorrect
                  ? 'Correct'
                  : 'Not quite'}
            </strong>
            <p>
              <GlossaryText text={step.explanation} />
            </p>
          </div>
        )}

        <div className="lesson-nav">
          {needsCheckButton && !checked && (
            <button
              type="button"
              className="cta cta--primary"
              disabled={selectedId === null}
              onClick={checkAnswer}
            >
              Check answer
            </button>
          )}
          {(isTeach || checked) && (
            <button type="button" className="cta cta--primary" onClick={goNext}>
              {isLast ? 'Finish lesson' : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function TeachBody({ step }: { step: Extract<LessonStep, { type: 'teach' }> }) {
  return (
    <div className="lesson-step">
      {step.title && <h2 className="lesson-step-title">{step.title}</h2>}
      <div className="lesson-body">
        {step.body.map((paragraph) => (
          <p key={paragraph}>
            <GlossaryText text={paragraph} />
          </p>
        ))}
      </div>
    </div>
  )
}

function ChoiceBody({
  prompt,
  choices,
  selectedId,
  checked,
  correctId,
  onSelect,
  focusTile,
}: {
  prompt: string
  choices: readonly { id: string; label: string }[]
  selectedId: string | null
  checked: boolean
  correctId: string
  onSelect: (id: string) => void
  focusTile?: LessonFace
}) {
  return (
    <div className="lesson-step">
      <h2 className="lesson-step-title">
        <GlossaryText text={prompt} />
      </h2>
      {focusTile && (
        <div
          className="lesson-tile-focus"
          aria-label={describeLessonFace(focusTile)}
        >
          <TileView tile={lessonFaceAsTile(focusTile)} />
          <span className="lesson-tile-caption">
            Marker + label: do not rely on color alone
          </span>
        </div>
      )}
      <div className="lesson-choices" role="group" aria-label="Choices">
        {choices.map((choice) => {
          const selected = selectedId === choice.id
          const showVerdict = checked && selected
          const correct = choice.id === correctId
          return (
            <button
              key={choice.id}
              type="button"
              className={[
                'lesson-choice',
                selected ? 'is-selected' : '',
                showVerdict && correct ? 'is-correct' : '',
                showVerdict && !correct ? 'is-wrong' : '',
                checked && correct ? 'is-correct-reveal' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect(choice.id)}
              disabled={checked}
              aria-pressed={selected}
            >
              {choice.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PlayBody({
  step,
  selectedId,
  checked,
  onMove,
}: {
  step: PlayStep
  selectedId: string | null
  checked: boolean
  onMove: (moveId: string) => void
}) {
  return (
    <div className="lesson-step">
      <h2 className="lesson-step-title">
        <GlossaryText text={step.prompt} />
      </h2>
      <p className="lesson-situation">
        <GlossaryText text={step.situation} />
      </p>
      {step.goal && (
        <p className="lesson-goal">
          Goal: <GlossaryText text={step.goal} />
        </p>
      )}

      <div className="play-table" aria-label="Practice table">
        {step.mode === 'call_or_pass' && step.offer && (
          <div className="play-offer">
            <span className="play-offer-label">Discarded</span>
            <TileView tile={lessonFaceAsTile(step.offer, 'offer')} />
          </div>
        )}

        <div className="play-rack-block">
          <p className="play-rack-label">Your hand</p>
          <div className="play-rack" role="group" aria-label="Your hand">
            {step.hand.map((face, index) => {
              const key = faceKey(face)
              const selected = selectedId === key
              const isRight = checked && step.correctIds.includes(key)
              const isWrong = checked && selected && !isRight
              return (
                <span
                  key={`${key}-${index}`}
                  className={[
                    'play-tile-wrap',
                    selected ? 'is-selected' : '',
                    isRight ? 'is-correct' : '',
                    isWrong ? 'is-wrong' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <TileView
                    tile={lessonFaceAsTile(face, `hand-${index}`)}
                    selected={selected}
                    disabled={checked || step.mode === 'call_or_pass'}
                    onSelect={
                      step.mode === 'discard' && !checked
                        ? () => onMove(key)
                        : undefined
                    }
                  />
                </span>
              )
            })}
          </div>
          {step.mode === 'discard' && !checked && (
            <p className="play-hint">Tap the tile you would discard.</p>
          )}
        </div>

        {step.mode === 'call_or_pass' && (
          <div className="play-actions">
            {(['call', 'pass'] as const).map((action) => {
              const selected = selectedId === action
              const isRight = checked && step.correctIds.includes(action)
              const isWrong = checked && selected && !isRight
              return (
                <button
                  key={action}
                  type="button"
                  className={[
                    'cta',
                    action === 'call' ? 'cta--primary' : 'cta--secondary',
                    selected ? 'is-selected' : '',
                    isRight ? 'play-action-correct' : '',
                    isWrong ? 'play-action-wrong' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={checked}
                  onClick={() => onMove(action)}
                >
                  {action === 'call' ? 'Call' : 'Pass'}
                </button>
              )
            })}
            {!checked && (
              <p className="play-hint">Choose Call or Pass for this discard.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
