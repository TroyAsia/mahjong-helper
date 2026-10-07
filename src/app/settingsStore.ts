import { create } from 'zustand'
import type { LevelId } from '../levels/schema'
import { levelIdSchema } from '../levels/schema'

const STORAGE_KEY = 'mahjong-helper.settings.v1'

type StoredSettings = {
  readonly level: LevelId
}

function loadSettings(): StoredSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { level: 'beginner' }
    const parsed = JSON.parse(raw) as Partial<StoredSettings>
    const level = levelIdSchema.safeParse(parsed.level)
    return { level: level.success ? level.data : 'beginner' }
  } catch {
    return { level: 'beginner' }
  }
}

function saveSettings(settings: StoredSettings): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

type SettingsStore = {
  readonly level: LevelId
  setLevel: (level: LevelId) => void
}

const initial = typeof localStorage !== 'undefined' ? loadSettings() : { level: 'beginner' as LevelId }

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  level: initial.level,
  setLevel: (level) => {
    set({ level })
    saveSettings({ level: get().level })
  },
}))
