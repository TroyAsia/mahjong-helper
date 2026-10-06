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
import type { LessonStep } from '../../content/lessons/types'
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
  const interactive = step.type !== 'teach'
  const isCorrect =
    interactive && selectedId !== null
      ? selectedId === step.correctId
      : false
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

  const checkAnswer = () => {
    if (!interactive || selectedId === null || checked) return
    setChecked(true)
    setScore((s) => ({
      correct: s.correct + (selectedId === step.correctId ? 1 : 0),
      asked: s.asked + 1,
    }))
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

        <StepBody
          step={step}
          selectedId={selectedId}
          checked={checked}
          onSelect={(id) => {
            if (!checked) setSelectedId(id)
          }}
        />

        {checked && interactive && (
          <div
            className={`lesson-feedback ${isCorrect ? 'is-good' : 'is-bad'}`}
            role="status"
          >
            <strong>{isCorrect ? 'Correct' : 'Not quite'}</strong>
            <p>
              <GlossaryText text={step.explanation} />
            </p>
          </div>
        )}

        <div className="lesson-nav">
          {interactive && !checked && (
            <button
              type="button"
              className="cta cta--primary"
              disabled={selectedId === null}
              onClick={checkAnswer}
            >
              Check answer
            </button>
          )}
          {(!interactive || checked) && (
            <button type="button" className="cta cta--primary" onClick={goNext}>
              {isLast ? 'Finish lesson' : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StepBody({
  step,
  selectedId,
  checked,
  onSelect,
}: {
  step: LessonStep
  selectedId: string | null
  checked: boolean
  onSelect: (id: string) => void
}) {
  if (step.type === 'teach') {
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

  return (
    <div className="lesson-step">
      <h2 className="lesson-step-title">
        <GlossaryText text={step.prompt} />
      </h2>

      {step.type === 'scenario' && (
        <p className="lesson-situation">
          <GlossaryText text={step.situation} />
        </p>
      )}

      {step.type === 'identify' && (
        <div
          className="lesson-tile-focus"
          aria-label={describeLessonFace(step.tile)}
        >
          <TileView tile={lessonFaceAsTile(step.tile)} />
          <span className="lesson-tile-caption">
            Marker + label — do not rely on color alone
          </span>
        </div>
      )}

      {step.type === 'scenario' && step.tiles && step.tiles.length > 0 && (
        <div className="lesson-tile-row" aria-label="Example tiles">
          {step.tiles.map((face, i) => (
            <TileView
              key={`${i}-${describeLessonFace(face)}`}
              tile={lessonFaceAsTile(face, `t${i}`)}
            />
          ))}
        </div>
      )}

      <div className="lesson-choices" role="group" aria-label="Choices">
        {step.choices.map((choice) => {
          const selected = selectedId === choice.id
          const showVerdict = checked && selected
          const correct = choice.id === step.correctId
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
