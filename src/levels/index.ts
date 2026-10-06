import advancedRaw from './advanced.json'
import beginnerRaw from './beginner.json'
import intermediateRaw from './intermediate.json'
import {
  formatLevelConfigError,
  levelConfigSchema,
  type LevelConfig,
  type LevelId,
} from './schema'

const rawById: Record<LevelId, unknown> = {
  beginner: beginnerRaw,
  intermediate: intermediateRaw,
  advanced: advancedRaw,
}

const cache = new Map<LevelId, LevelConfig>()

/** Validate and return a LevelConfig. Throws a readable Error on bad data. */
export function loadLevel(id: LevelId): LevelConfig {
  const cached = cache.get(id)
  if (cached) return cached

  const raw = rawById[id]
  const result = levelConfigSchema.safeParse(raw)
  if (!result.success) {
    throw new Error(formatLevelConfigError(id, result.error))
  }
  cache.set(id, result.data)
  return result.data
}

/** Parse arbitrary JSON-like input as a LevelConfig (for tests / tooling). */
export function parseLevelConfig(raw: unknown, label = 'unknown'): LevelConfig {
  const result = levelConfigSchema.safeParse(raw)
  if (!result.success) {
    throw new Error(formatLevelConfigError(label, result.error))
  }
  return result.data
}

export type { LevelConfig, LevelId } from './schema'
