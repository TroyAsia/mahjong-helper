import { loadLevel } from '../levels'
import type { LevelConfig, LevelId } from '../levels/schema'
import { useSettingsStore } from './settingsStore'

/**
 * Resolve the active LevelConfig from settings.level.
 * Level-id branching lives here (and in levels/) only.
 */
export function useLevelConfig(): LevelConfig {
  const level = useSettingsStore((s) => s.level)
  return resolveLevelConfig(level)
}

/** Non-hook lookup for app/gameLoop and tests. */
export function resolveLevelConfig(level: LevelId): LevelConfig {
  return loadLevel(level)
}
