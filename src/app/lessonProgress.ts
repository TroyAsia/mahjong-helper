import type { LevelId } from '../levels/schema'

const STORAGE_KEY = 'mahjong-helper.lessonProgress.v1'

export type LessonProgress = {
  readonly completed: readonly string[] // `${level}:${lessonId}`
}

function keyFor(level: LevelId, lessonId: string): string {
  return `${level}:${lessonId}`
}

function read(): LessonProgress {
  try {
    if (typeof localStorage === 'undefined') return { completed: [] }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completed: [] }
    const parsed = JSON.parse(raw) as LessonProgress
    if (!parsed || !Array.isArray(parsed.completed)) return { completed: [] }
    return { completed: parsed.completed.filter((x) => typeof x === 'string') }
  } catch {
    return { completed: [] }
  }
}

function write(progress: LessonProgress): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function isLessonComplete(level: LevelId, lessonId: string): boolean {
  return read().completed.includes(keyFor(level, lessonId))
}

export function markLessonComplete(level: LevelId, lessonId: string): void {
  const current = read()
  const key = keyFor(level, lessonId)
  if (current.completed.includes(key)) return
  write({ completed: [...current.completed, key] })
}

export function countCompletedInTrack(
  level: LevelId,
  lessonIds: readonly string[],
): number {
  const done = new Set(read().completed)
  return lessonIds.filter((id) => done.has(keyFor(level, id))).length
}
