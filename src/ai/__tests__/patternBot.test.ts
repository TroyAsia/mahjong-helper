import { describe, expect, it } from 'vitest'
import { reduce } from '../../engine/reducer'
import { createInitialState } from '../../engine/setup'
import { tilesAway } from '../../engine/patterns'
import type { Pattern } from '../../engine/types'
import { randomLegalFromState } from '../bots/randomLegal'
import { patternBotFromState } from '../bots/patternBot'
import type { AiConfig } from '../types'

const samplePattern: Pattern = {
  id: 'bamboo-ladder',
  groups: [
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 1 } },
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 2 } },
    { size: 4, face: { match: 'suit', suit: 'bam', rank: 3 } },
    { size: 2, face: { match: 'wind', wind: 'east' } },
  ],
}

const strongAi: AiConfig = {
  thinkDelayMs: 0,
  strength: 1,
  mistakeRate: 0,
}

const randomAi: AiConfig = {
  thinkDelayMs: 0,
  strength: 0,
  mistakeRate: 1,
}

function playBotGame(
  seed: number,
  bot: 'pattern' | 'random',
  moves = 40,
): number {
  let state = createInitialState(seed, [samplePattern])
  let rng = seed + 99
  for (let i = 0; i < moves && state.phase !== 'ended'; i++) {
    const seat = state.currentSeat
    const pick =
      bot === 'pattern'
        ? patternBotFromState(state, seat, rng, strongAi)
        : randomLegalFromState(state, seat, rng, randomAi)
    rng = pick.nextSeed
    const result = reduce(state, seat, pick.action)
    if (!result.ok) break
    state = result.state
  }
  // Average tiles-away across seats
  const seats = ['east', 'south', 'west', 'north'] as const
  const sum = seats.reduce(
    (acc, s) => acc + tilesAway(state.hands[s], state.patterns),
    0,
  )
  return sum / seats.length
}

describe('patternBotFromState', () => {
  it('strength 0 behaves like random (same seed path when only random)', () => {
    const state = createInitialState(3, [samplePattern])
    const a = patternBotFromState(state, 'east', 50, {
      thinkDelayMs: 0,
      strength: 0,
      mistakeRate: 0,
    })
    const b = randomLegalFromState(state, 'east', 50, randomAi)
    expect(a.action).toEqual(b.action)
  })

  it(
    'beats random bot on average tiles-away over many games',
    () => {
      const n = 80
      let patternSum = 0
      let randomSum = 0
      for (let seed = 1; seed <= n; seed++) {
        patternSum += playBotGame(seed, 'pattern')
        randomSum += playBotGame(seed, 'random')
      }
      const patternAvg = patternSum / n
      const randomAvg = randomSum / n
      expect(patternAvg).toBeLessThan(randomAvg)
    },
    60_000,
  )
})
