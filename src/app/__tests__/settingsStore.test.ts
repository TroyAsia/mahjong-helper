import { beforeEach, describe, expect, it } from 'vitest'
import { resolveLevelConfig } from '../useLevelConfig'
import { useSettingsStore } from '../settingsStore'

describe('settingsStore + resolveLevelConfig', () => {
  beforeEach(() => {
    useSettingsStore.setState({ level: 'beginner' })
  })

  it('defaults to beginner', () => {
    expect(useSettingsStore.getState().level).toBe('beginner')
  })

  it('setLevel updates level and resolveLevelConfig follows', () => {
    useSettingsStore.getState().setLevel('advanced')
    expect(useSettingsStore.getState().level).toBe('advanced')
    const config = resolveLevelConfig(useSettingsStore.getState().level)
    expect(config.id).toBe('advanced')
    expect(config.ai.thinkDelayMs).toBe(80)
    expect(config.ai.strength).toBe(0.9)
  })

  it('changing level changes bot thinkDelayMs without level=== branches', () => {
    const beginnerDelay = resolveLevelConfig('beginner').ai.thinkDelayMs
    useSettingsStore.getState().setLevel('intermediate')
    const intermediateDelay = resolveLevelConfig(
      useSettingsStore.getState().level,
    ).ai.thinkDelayMs
    expect(intermediateDelay).not.toBe(beginnerDelay)
    expect(intermediateDelay).toBeLessThan(beginnerDelay)
  })
})
