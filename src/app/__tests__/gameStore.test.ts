import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from '../gameStore'
import { createInitialState } from '../../engine/setup'

describe('gameStore undo', () => {
  beforeEach(() => {
    useGameStore.setState({
      present: createInitialState(10),
      past: [],
      future: [],
      humanSeat: 'east',
    })
  })

  it('dispatch then undo restores prior state', () => {
    const before = useGameStore.getState().present
    const tileId = before.hands.east[0]!.id
    const result = useGameStore
      .getState()
      .dispatch('east', { type: 'discard', tileId }, { isBot: false })
    expect(result.ok).toBe(true)

    useGameStore.getState().undo()
    expect(useGameStore.getState().present).toEqual(before)
    expect(useGameStore.getState().past).toHaveLength(0)
  })

  it('undo skips bot moves back to human decision', () => {
    const store = useGameStore.getState()
    const humanTile = store.present.hands.east[0]!.id
    store.dispatch('east', { type: 'discard', tileId: humanTile }, { isBot: false })

    // South draws and discards as bot
    let s = useGameStore.getState()
    s.dispatch('south', { type: 'draw' }, { isBot: true })
    s = useGameStore.getState()
    const southTile = s.present.hands.south[0]!.id
    s.dispatch('south', { type: 'discard', tileId: southTile }, { isBot: true })

    // West draws as bot
    s = useGameStore.getState()
    s.dispatch('west', { type: 'draw' }, { isBot: true })

    const afterBots = useGameStore.getState().present
    expect(afterBots.currentSeat).toBe('west')
    expect(afterBots.phase).toBe('discard')

    useGameStore.getState().undo()

    const restored = useGameStore.getState().present
    // Back to before human's discard (east still to discard, 14 tiles)
    expect(restored.currentSeat).toBe('east')
    expect(restored.phase).toBe('discard')
    expect(restored.hands.east).toHaveLength(14)
    expect(restored.discards.east).toHaveLength(0)
  })
})
