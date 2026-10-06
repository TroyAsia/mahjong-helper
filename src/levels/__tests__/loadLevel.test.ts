import { describe, expect, it } from 'vitest'
import { loadLevel, parseLevelConfig } from '../index'
import type { LevelId } from '../schema'

const LEVEL_IDS: readonly LevelId[] = [
  'beginner',
  'intermediate',
  'advanced',
]

describe('loadLevel', () => {
  it.each(LEVEL_IDS)('loads and validates %s config', (id) => {
    const config = loadLevel(id)
    expect(config.id).toBe(id)
    expect(config.ai.thinkDelayMs).toBeGreaterThanOrEqual(0)
    expect(config.ai.strength).toBeGreaterThanOrEqual(0)
    expect(config.ai.strength).toBeLessThanOrEqual(1)
    expect(config.lessonSet.id).toBeTruthy()
  })

  it('beginner uses a slower think delay than advanced', () => {
    const beginner = loadLevel('beginner')
    const advanced = loadLevel('advanced')
    expect(beginner.ai.thinkDelayMs).toBeGreaterThan(advanced.ai.thinkDelayMs)
  })
})

describe('parseLevelConfig', () => {
  it('throws a readable error for missing ai fields', () => {
    expect(() =>
      parseLevelConfig(
        {
          id: 'beginner',
          label: 'Broken',
          explainer: { depth: 'off', decisionTypes: [] },
          hints: { allowed: [] },
          undo: { mode: 'unlimited' },
          warnVsDeadHand: true,
          lessonSet: { id: 'x', lessons: [] },
        },
        'broken-beginner',
      ),
    ).toThrow(/Invalid level config for "broken-beginner"/)
  })

  it('throws a readable error for out-of-range strength', () => {
    expect(() =>
      parseLevelConfig(
        {
          id: 'beginner',
          label: 'Broken',
          ai: { thinkDelayMs: 100, strength: 2, mistakeRate: 0 },
          explainer: { depth: 'brief', decisionTypes: [] },
          hints: { allowed: [] },
          undo: { mode: 'unlimited' },
          warnVsDeadHand: true,
          lessonSet: { id: 'x', lessons: ['a'] },
        },
        'bad-strength',
      ),
    ).toThrow(/Invalid level config for "bad-strength".*strength/)
  })

  it('throws a readable error for invalid explainer depth', () => {
    expect(() =>
      parseLevelConfig(
        {
          id: 'intermediate',
          label: 'Broken',
          ai: { thinkDelayMs: 100, strength: 0.5, mistakeRate: 0.1 },
          explainer: { depth: 'verbose', decisionTypes: [] },
          hints: { allowed: [] },
          undo: { mode: 'limited', limit: 5 },
          warnVsDeadHand: false,
          lessonSet: { id: 'x', lessons: [] },
        },
        'bad-depth',
      ),
    ).toThrow(/Invalid level config for "bad-depth"/)
  })
})
