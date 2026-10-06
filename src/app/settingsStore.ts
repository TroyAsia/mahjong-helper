import { create } from 'zustand'
import type { LevelId } from '../levels/schema'

type SettingsStore = {
  readonly level: LevelId
  setLevel: (level: LevelId) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  level: 'beginner',
  setLevel: (level) => set({ level }),
}))
