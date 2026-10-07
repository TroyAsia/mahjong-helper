import { create } from 'zustand'
import { enginePatterns } from '../content/patterns/practiceCard'
import { reduce, type ReduceResult } from '../engine/reducer'
import { createInitialState } from '../engine/setup'
import type { Action, GameState, Seat } from '../engine/types'

export type HistoryEntry = {
  readonly state: GameState
  readonly seat: Seat
  readonly action: Action
  readonly isBot: boolean
}

type GameStore = {
  readonly present: GameState
  readonly past: readonly HistoryEntry[]
  readonly future: readonly HistoryEntry[]
  readonly humanSeat: Seat
  newGame: (seed?: number, opts?: { charleston?: boolean }) => void
  dispatch: (
    seat: Seat,
    action: Action,
    opts?: { isBot?: boolean },
  ) => ReduceResult
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

function initialPresent(seed = 1): GameState {
  return createInitialState(seed, enginePatterns())
}

export const useGameStore = create<GameStore>((set, get) => ({
  present: initialPresent(),
  past: [],
  future: [],
  humanSeat: 'east',

  newGame: (seed = Date.now() % 1_000_000, opts) => {
    set({
      present: createInitialState(seed, enginePatterns(), {
        charleston: opts?.charleston ?? false,
      }),
      past: [],
      future: [],
    })
  },

  dispatch: (seat, action, opts) => {
    const { present, past } = get()
    const result = reduce(present, seat, action)
    if (!result.ok) return result

    const entry: HistoryEntry = {
      state: present,
      seat,
      action,
      isBot: opts?.isBot ?? false,
    }

    set({
      present: result.state,
      past: [...past, entry],
      future: [],
    })
    return result
  },

  undo: () => {
    const { past, present, future, humanSeat } = get()
    if (past.length === 0) return

    const nextPast = [...past]
    let nextPresent = present
    let nextFuture = [...future]

    // Rewind through bot moves, then one human decision.
    while (nextPast.length > 0) {
      const entry = nextPast.pop()!
      nextFuture = [
        {
          state: nextPresent,
          seat: entry.seat,
          action: entry.action,
          isBot: entry.isBot,
        },
        ...nextFuture,
      ]
      nextPresent = entry.state
      if (!entry.isBot && entry.seat === humanSeat) break
    }

    set({ present: nextPresent, past: nextPast, future: nextFuture })
  },

  redo: () => {
    const { future, present, past } = get()
    if (future.length === 0) return

    const [entry, ...rest] = future
    if (!entry) return

    const result = reduce(present, entry.seat, entry.action)
    if (!result.ok) return

    set({
      present: result.state,
      past: [
        ...past,
        {
          state: present,
          seat: entry.seat,
          action: entry.action,
          isBot: entry.isBot,
        },
      ],
      future: rest,
    })
  },

  canUndo: () => get().past.some((e) => !e.isBot && e.seat === get().humanSeat),
  canRedo: () => get().future.length > 0,
}))
