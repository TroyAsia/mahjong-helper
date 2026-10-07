import { charlestonBotFromState } from '../ai/bots/charlestonBot'
import { patternBotFromState } from '../ai/bots/patternBot'
import { randomLegalFromState } from '../ai/bots/randomLegal'
import type { AiConfig } from '../ai/types'
import { getLegalActions } from '../engine/legalMoves'
import { nextRng } from '../engine/tiles'
import { SEATS, type Seat } from '../engine/types'
import { useGameStore } from './gameStore'

export type GameLoopOptions = {
  readonly humanSeat: Seat
  readonly ai: AiConfig
  readonly onUpdate?: () => void
}

/**
 * Advances bots (including Charleston and call windows) until the human
 * must act or the game ends.
 */
export function startGameLoop(opts: GameLoopOptions): () => void {
  let cancelled = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let botSeed = (useGameStore.getState().present.rngSeed + 17) >>> 0

  const delayMs = () => Math.max(0, opts.ai.thinkDelayMs)

  const schedule = (ms: number) => {
    if (cancelled) return
    timer = setTimeout(tick, ms)
  }

  const tick = () => {
    if (cancelled) return
    const { present, humanSeat, dispatch } = useGameStore.getState()
    const human = opts.humanSeat ?? humanSeat

    if (present.phase === 'ended') {
      opts.onUpdate?.()
      return
    }

    if (present.phase === 'charleston') {
      const waitingBots = SEATS.filter(
        (seat) =>
          seat !== human && getLegalActions(present, seat).length > 0,
      )
      if (waitingBots.length === 0) {
        opts.onUpdate?.()
        schedule(Math.max(100, delayMs()))
        return
      }
      const seat = waitingBots[0]!
      try {
        const { action, nextSeed } = charlestonBotFromState(
          present,
          seat,
          botSeed,
          opts.ai,
        )
        botSeed = nextSeed
        dispatch(seat, action, { isBot: true })
      } catch {
        // ignore
      }
      opts.onUpdate?.()
      schedule(delayMs())
      return
    }

    const seat = present.currentSeat
    if (seat === human) {
      opts.onUpdate?.()
      schedule(Math.max(100, delayMs()))
      return
    }

    const { value, nextSeed } = nextRng(botSeed)
    botSeed = nextSeed
    const pickSeed =
      (botSeed + present.wall.length + Math.floor(value * 1000)) >>> 0
    try {
      const picker =
        opts.ai.strength <= 0 ? randomLegalFromState : patternBotFromState
      const { action, nextSeed: afterPick } = picker(
        present,
        seat,
        pickSeed,
        opts.ai,
      )
      botSeed = afterPick
      dispatch(seat, action, { isBot: true })
    } catch {
      // no legal actions
    }
    opts.onUpdate?.()
    schedule(delayMs())
  }

  schedule(delayMs())

  return () => {
    cancelled = true
    if (timer) clearTimeout(timer)
  }
}
