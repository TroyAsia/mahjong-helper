import { describe, expect, it } from 'vitest'
import { faceKey, isPlayCorrect } from '../types'
import { lessonTracks } from '../tracks'

describe('interactive lessons', () => {
  it('has playable drills and valid answer keys on every track', () => {
    expect(lessonTracks.map((t) => t.level)).toEqual([
      'beginner',
      'intermediate',
      'advanced',
    ])
    for (const track of lessonTracks) {
      expect(track.lessons.length).toBeGreaterThanOrEqual(4)
      let playCount = 0
      for (const lesson of track.lessons) {
        expect(lesson.steps.length).toBeGreaterThanOrEqual(2)
        for (const step of lesson.steps) {
          if (step.type === 'teach') continue
          if (step.type === 'play') {
            playCount++
            expect(step.hand.length).toBeGreaterThan(0)
            expect(step.correctIds.length).toBeGreaterThan(0)
            if (step.mode === 'discard') {
              const keys = step.hand.map(faceKey)
              for (const id of step.correctIds) {
                expect(keys).toContain(id)
              }
              expect(isPlayCorrect(step, step.correctIds[0]!)).toBe(true)
            } else {
              for (const id of step.correctIds) {
                expect(['call', 'pass']).toContain(id)
              }
            }
          } else {
            const ids = step.choices.map((c) => c.id)
            expect(ids).toContain(step.correctId)
          }
        }
      }
      expect(playCount).toBeGreaterThanOrEqual(3)
    }
  })

  it('does not use em dashes in lesson copy', () => {
    const blob = JSON.stringify(lessonTracks)
    expect(blob.includes('—')).toBe(false)
  })
})
