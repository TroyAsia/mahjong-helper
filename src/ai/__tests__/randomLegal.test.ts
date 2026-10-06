import { describe, expect, it } from 'vitest'
import { createInitialState } from '../../engine/setup'
import { reduce } from '../../engine/reducer'
import { randomLegalFromState } from '../bots/randomLegal'

describe('randomLegalFromState', () => {
  it('always returns a legal discard at deal', () => {
    const state = createInitialState(5)
    const { action } = randomLegalFromState(state, 'east', 11)
    expect(action.type).toBe('discard')
    if (action.type === 'discard') {
      expect(state.hands.east.some((t) => t.id === action.tileId)).toBe(true)
    }
  })

  it('same seed picks the same action', () => {
    const state = createInitialState(5)
    const a = randomLegalFromState(state, 'east', 99)
    const b = randomLegalFromState(state, 'east', 99)
    expect(a.action).toEqual(b.action)
  })

  it('can play a short sequence without errors', () => {
    let state = createInitialState(8)
    let seed = 3
    for (let i = 0; i < 20 && state.phase !== 'ended'; i++) {
      const { action, nextSeed } = randomLegalFromState(
        state,
        state.currentSeat,
        seed,
      )
      seed = nextSeed
      const result = reduce(state, state.currentSeat, action)
      expect(result.ok).toBe(true)
      if (!result.ok) break
      state = result.state
    }
  })
})
