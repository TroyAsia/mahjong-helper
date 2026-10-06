import type { LevelId } from '../../levels/schema'
import { advancedLessons } from './advanced'
import { beginnerLessons } from './beginner'
import { intermediateLessons } from './intermediate'
import type { InteractiveLesson, LessonTrack } from './types'

export type { InteractiveLesson, LessonStep, LessonTrack, LessonFace } from './types'

export const lessonTracks: readonly LessonTrack[] = [
  {
    level: 'beginner',
    label: 'Beginner',
    blurb: 'Tiles, turns, jokers, and how a hand actually wins.',
    lessons: beginnerLessons,
  },
  {
    level: 'intermediate',
    label: 'Intermediate',
    blurb: 'Discards, defense, Charleston, calls, and scoring mindset.',
    lessons: intermediateLessons,
  },
  {
    level: 'advanced',
    label: 'Advanced',
    blurb: 'Read the table, count outs, and manage the wall.',
    lessons: advancedLessons,
  },
]

export function getLessonTrack(level: LevelId): LessonTrack {
  const track = lessonTracks.find((t) => t.level === level)
  if (!track) throw new Error(`No lesson track for ${level}`)
  return track
}

export function getLesson(
  level: LevelId,
  lessonId: string,
): InteractiveLesson | null {
  return getLessonTrack(level).lessons.find((l) => l.id === lessonId) ?? null
}
