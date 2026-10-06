import {
  countCompletedInTrack,
  isLessonComplete,
} from '../../app/lessonProgress'
import type { LevelId } from '../../app/levelTypes'
import { getLessonTrack } from '../../content/lessons/tracks'
import './screen.css'

type Props = {
  readonly level: LevelId
  readonly onBack: () => void
  readonly onOpenLesson: (lessonId: string) => void
}

export function LessonList({ level, onBack, onOpenLesson }: Props) {
  const track = getLessonTrack(level)
  const completed = countCompletedInTrack(
    level,
    track.lessons.map((l) => l.id),
  )

  return (
    <div className="screen">
      <div className="felt-frame">
        <button type="button" className="back-link" onClick={onBack}>
          ← Back
        </button>
        <p className="brand brand--small">Mahjong Helper</p>
        <h1 className="headline headline--section">{track.label} lessons</h1>
        <p className="lede lede--tight">{track.blurb}</p>
        <p className="lesson-track-progress">
          {completed} of {track.lessons.length} complete
        </p>
        <ol className="lesson-list">
          {track.lessons.map((lesson, index) => {
            const done = isLessonComplete(level, lesson.id)
            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  className={`lesson-row${done ? ' lesson-row--done' : ''}`}
                  onClick={() => onOpenLesson(lesson.id)}
                >
                  <span className="lesson-index" aria-hidden="true">
                    {done ? '✓' : index + 1}
                  </span>
                  <span className="lesson-copy">
                    <span className="lesson-title">{lesson.title}</span>
                    <span className="lesson-summary">
                      {lesson.summary} · ~{lesson.minutes} min · interactive
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
