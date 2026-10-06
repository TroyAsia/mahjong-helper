import { produce } from 'immer'
import {
  SEATS,
  TURN_ORDER,
  type Action,
  type CharlestonState,
  type CharlestonStep,
  type GameState,
  type IllegalReason,
  type Seat,
  type Tile,
} from './types'

export type PassDirection = 'right' | 'across' | 'left'

export const CHARLESTON_STEPS: readonly CharlestonStep[] = [
  'first_right',
  'first_across',
  'first_left',
  'vote_second',
  'second_left',
  'second_across',
  'second_right',
  'courtesy',
]

const PASS_COUNT = 3
const COURTESY_MAX = 3

export function createCharlestonState(): CharlestonState {
  return {
    step: 'first_right',
    selections: { east: null, south: null, west: null, north: null },
    votes: { east: null, south: null, west: null, north: null },
  }
}

/** Direction tiles travel this step. Voting has none; courtesy goes across. */
export function stepDirection(step: CharlestonStep): PassDirection | null {
  switch (step) {
    case 'first_right':
    case 'second_right':
      return 'right'
    case 'first_across':
    case 'second_across':
    case 'courtesy':
      return 'across'
    case 'first_left':
    case 'second_left':
      return 'left'
    case 'vote_second':
      return null
  }
}

/** Play runs counterclockwise, so "right" is the next seat in turn order. */
export function passTarget(seat: Seat, direction: PassDirection): Seat {
  const offset = direction === 'right' ? 1 : direction === 'across' ? 2 : 3
  const i = TURN_ORDER.indexOf(seat)
  return TURN_ORDER[(i + offset) % TURN_ORDER.length]!
}

export function isSecondCharlestonStep(step: CharlestonStep): boolean {
  return (
    step === 'second_left' ||
    step === 'second_across' ||
    step === 'second_right'
  )
}

export function passCountRange(step: CharlestonStep): {
  readonly min: number
  readonly max: number
} {
  if (step === 'vote_second') return { min: 0, max: 0 }
  if (step === 'courtesy') return { min: 0, max: COURTESY_MAX }
  return { min: PASS_COUNT, max: PASS_COUNT }
}

/** Step after `current`, or null when the Charleston is over. Any "no" vote skips the second round. */
export function nextCharlestonStep(
  charleston: CharlestonState,
): CharlestonStep | null {
  switch (charleston.step) {
    case 'first_right':
      return 'first_across'
    case 'first_across':
      return 'first_left'
    case 'first_left':
      return 'vote_second'
    case 'vote_second':
      return SEATS.every((s) => charleston.votes[s] === true)
        ? 'second_left'
        : 'courtesy'
    case 'second_left':
      return 'second_across'
    case 'second_across':
      return 'second_right'
    case 'second_right':
      return 'courtesy'
    case 'courtesy':
      return null
  }
}

export function charlestonIllegalReason(
  state: GameState,
  seat: Seat,
  action: Extract<Action, { type: 'charleston_pass' | 'charleston_vote' }>,
): IllegalReason | null {
  if (state.phase === 'ended') return 'game_over'
  const charleston = state.charleston
  if (state.phase !== 'charleston' || !charleston) return 'wrong_phase'

  if (action.type === 'charleston_vote') {
    if (charleston.step !== 'vote_second') return 'wrong_phase'
    return charleston.votes[seat] === null ? null : 'charleston_already_submitted'
  }

  if (charleston.step === 'vote_second') return 'wrong_phase'
  if (charleston.selections[seat] !== null) return 'charleston_already_submitted'

  const hand = state.hands[seat]
  const seen = new Set<string>()
  const tiles: Tile[] = []
  for (const id of action.tileIds) {
    const tile = hand.find((t) => t.id === id)
    if (!tile || seen.has(id)) return 'no_such_tile'
    seen.add(id)
    tiles.push(tile)
  }
  if (tiles.some((t) => t.face.kind === 'joker')) return 'charleston_joker'

  const { min, max } = passCountRange(charleston.step)
  if (tiles.length < min || tiles.length > max) return 'charleston_wrong_count'
  return null
}

function combinations(ids: readonly string[], size: number): string[][] {
  if (size === 0) return [[]]
  const result: string[][] = []
  const pick = (start: number, chosen: string[]) => {
    if (chosen.length === size) {
      result.push([...chosen])
      return
    }
    for (let i = start; i < ids.length; i++) {
      chosen.push(ids[i]!)
      pick(i + 1, chosen)
      chosen.pop()
    }
  }
  pick(0, [])
  return result
}

/** Legal Charleston actions for a seat (any seat that hasn't committed yet). */
export function charlestonLegalActions(
  state: GameState,
  seat: Seat,
): readonly Action[] {
  const charleston = state.charleston
  if (state.phase !== 'charleston' || !charleston) return []

  if (charleston.step === 'vote_second') {
    if (charleston.votes[seat] !== null) return []
    return [
      { type: 'charleston_vote', continue: true },
      { type: 'charleston_vote', continue: false },
    ]
  }

  if (charleston.selections[seat] !== null) return []
  const ids = state.hands[seat]
    .filter((t) => t.face.kind !== 'joker')
    .map((t) => t.id)
  const { min, max } = passCountRange(charleston.step)
  const actions: Action[] = []
  for (let size = min; size <= max; size++) {
    for (const tileIds of combinations(ids, size)) {
      actions.push({ type: 'charleston_pass', tileIds })
    }
  }
  return actions
}

type Hands = { [S in Seat]: Tile[] }

function resolveSelections(
  hands: Hands,
  charleston: CharlestonState,
): void {
  const direction = stepDirection(charleston.step)
  if (!direction) return

  // Take everything out first so passes are simultaneous.
  const outgoing: { to: Seat; tiles: Tile[] }[] = []
  for (const seat of SEATS) {
    const ids = [...(charleston.selections[seat] ?? [])]
    const to = passTarget(seat, direction)
    if (charleston.step === 'courtesy') {
      const partnerCount = charleston.selections[to]?.length ?? 0
      ids.length = Math.min(ids.length, partnerCount)
    }
    const tiles: Tile[] = []
    for (const id of ids) {
      const index = hands[seat].findIndex((t) => t.id === id)
      if (index >= 0) tiles.push(...hands[seat].splice(index, 1))
    }
    outgoing.push({ to, tiles })
  }
  for (const { to, tiles } of outgoing) hands[to].push(...tiles)
}

/** Apply a Charleston action and, once all four seats commit, move tiles and advance. */
export function reduceCharleston(
  state: GameState,
  seat: Seat,
  action: Extract<Action, { type: 'charleston_pass' | 'charleston_vote' }>,
): GameState {
  return produce(state, (draft) => {
    const charleston = draft.charleston
    if (!charleston) return

    if (action.type === 'charleston_vote') {
      charleston.votes[seat] = action.continue
    } else {
      charleston.selections[seat] = [...action.tileIds]
    }

    const ready =
      charleston.step === 'vote_second'
        ? SEATS.every((s) => charleston.votes[s] !== null)
        : SEATS.every((s) => charleston.selections[s] !== null)
    if (!ready) return

    if (charleston.step !== 'vote_second') {
      resolveSelections(draft.hands, charleston as CharlestonState)
    }

    const next = nextCharlestonStep(charleston as CharlestonState)
    if (next === null) {
      draft.charleston = null
      draft.phase = 'discard'
      draft.currentSeat = draft.dealer
      return
    }
    charleston.step = next
    for (const s of SEATS) charleston.selections[s] = null
  })
}
