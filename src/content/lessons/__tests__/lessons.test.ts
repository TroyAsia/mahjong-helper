import { describe, expect, it } from 'vitest'
import { lessonTracks } from '../tracks'

describe('interactive lessons', () => {
  it('has beginner, intermediate, and advanced tracks with exercises', () => {
    expect(lessonTracks.map((t) => t.level)).toEqual([
      'beginner',
      'intermediate',
      'advanced',
    ])
    for (const track of lessonTracks) {
      expect(track.lessons.length).toBeGreaterThanOrEqual(4)
      for (const lesson of track.lessons) {
        expect(lesson.steps.length).toBeGreaterThanOrEqual(2)
        const interactive = lesson.steps.filter((s) => s.type !== 'teach')
        expect(interactive.length).toBeGreaterThanOrEqual(1)
        for (const step of lesson.steps) {
          if (step.type === 'teach') continue
          const ids = step.choices.map((c) => c.id)
          expect(ids).toContain(step.correctId)
        }
      }
    }
  })
})
