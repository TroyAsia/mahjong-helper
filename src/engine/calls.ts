import {
  bestMatch,
  isWinningHand,
  tileMatchesFace,
  tilesAway,
  type MatchResult,
} from './patterns'
import {
  MELD_KINDS,
  MELD_SIZE,
  SEATS,
  TURN_ORDER,
  type Action,
  type GameState,
  type IllegalReason,
  type Meld,
  type MeldKind,
  type Pattern,
  type PendingDiscard,
  type Seat,
  type Tile,
  type TileFace,
} from './types'

export type CallOption = {
  readonly meld: MeldKind
  readonly tileIds: readonly string[]
}

export type JokerSwap = {
  readonly targetSeat: Seat
  readonly meldIndex: number
  readonly jokerTileId: string
  readonly tileId: string
}

export function isJoker(tile: Tile): boolean {
  return tile.face.kind === 'joker'
}

/** Faces are interchangeable for calls: same suit+rank, wind, dragon; any flower. */
export function sameFace(a: TileFace, b: TileFace): boolean {
  switch (a.kind) {
    case 'suit':
      return b.kind === 'suit' && a.suit === b.suit && a.rank === b.rank
    case 'wind':
      return b.kind === 'wind' && a.wind === b.wind
    case 'dragon':
      return b.kind === 'dragon' && a.dragon === b.dragon
    case 'flower':
      return b.kind === 'flower'
    case 'joker':
      return b.kind === 'joker'
  }
}

/** The face an exposed set represents (first natural tile). */
export function meldFace(meld: Meld): TileFace | null {
  const natural = meld.tiles.find((t) => !isJoker(t))
  return natural?.face ?? null
}

/** Every tile a seat owns: concealed hand plus exposed sets. */
export function getSeatTiles(state: GameState, seat: Seat): readonly Tile[] {
  return [...state.hands[seat], ...state.exposed[seat].flatMap((m) => m.tiles)]
}

function canAssignMelds(pattern: Pattern, melds: readonly Meld[]): boolean {
  const used = pattern.groups.map(() => false)

  function place(index: number): boolean {
    if (index >= melds.length) return true
    const meld = melds[index]!
    const face = meldFace(meld)
    if (!face) return false
    for (let g = 0; g < pattern.groups.length; g++) {
      const group = pattern.groups[g]!
      if (used[g]) continue
      if (group.size !== MELD_SIZE[meld.kind]) continue
      if (!tileMatchesFace(face, group.face)) continue
      used[g] = true
      if (place(index + 1)) return true
      used[g] = false
    }
    return false
  }

  return place(0)
}

/** Patterns that still fit once the given sets are exposed. */
export function compatiblePatterns(
  patterns: readonly Pattern[],
  melds: readonly Meld[],
): readonly Pattern[] {
  if (melds.length === 0) return patterns
  return patterns.filter((p) => canAssignMelds(p, melds))
}

export function seatPatterns(
  state: GameState,
  seat: Seat,
): readonly Pattern[] {
  return compatiblePatterns(state.patterns, state.exposed[seat])
}

/** Tiles-away that accounts for exposed sets locking you into patterns. */
export function seatTilesAway(state: GameState, seat: Seat): number {
  return tilesAway(getSeatTiles(state, seat), seatPatterns(state, seat))
}

export function seatBestMatch(
  state: GameState,
  seat: Seat,
): MatchResult | null {
  return bestMatch(getSeatTiles(state, seat), seatPatterns(state, seat))
}

export function seatIsWinning(state: GameState, seat: Seat): boolean {
  if (state.deadHands.includes(seat)) return false
  return isWinningHand(getSeatTiles(state, seat), seatPatterns(state, seat))
}

function canWinWithDiscard(
  state: GameState,
  seat: Seat,
  discard: PendingDiscard,
): boolean {
  if (seat === discard.seat || state.deadHands.includes(seat)) return false
  if (isJoker(discard.tile)) return false
  return isWinningHand(
    [...getSeatTiles(state, seat), discard.tile],
    seatPatterns(state, seat),
  )
}

function buildMeld(
  kind: MeldKind,
  discard: PendingDiscard,
  handTiles: readonly Tile[],
): Meld {
  return {
    kind,
    tiles: [discard.tile, ...handTiles],
    calledFrom: discard.seat,
  }
}

function patternsAllow(
  patterns: readonly Pattern[],
  melds: readonly Meld[],
): boolean {
  return patterns.some((p) => canAssignMelds(p, melds))
}

function callOptionsForDiscard(
  state: GameState,
  seat: Seat,
  discard: PendingDiscard,
): readonly CallOption[] {
  if (seat === discard.seat || state.deadHands.includes(seat)) return []
  if (isJoker(discard.tile)) return []

  const hand = state.hands[seat]
  const naturals = hand.filter(
    (t) => !isJoker(t) && sameFace(t.face, discard.tile.face),
  )
  const jokers = hand.filter(isJoker)
  const options: CallOption[] = []

  for (const kind of MELD_KINDS) {
    const need = MELD_SIZE[kind] - 1
    const naturalCount = Math.min(naturals.length, need)
    const jokerCount = need - naturalCount
    if (naturalCount < 1 || jokerCount > jokers.length) continue

    const used = [
      ...naturals.slice(0, naturalCount),
      ...jokers.slice(0, jokerCount),
    ]
    const meld = buildMeld(kind, discard, used)
    if (!patternsAllow(state.patterns, [...state.exposed[seat], meld])) continue
    options.push({ meld: kind, tileIds: used.map((t) => t.id) })
  }
  return options
}

/** Calls `seat` may make on the open discard (empty outside the call phase). */
export function getCallOptions(
  state: GameState,
  seat: Seat,
): readonly CallOption[] {
  if (state.phase !== 'call' || !state.lastDiscard) return []
  return callOptionsForDiscard(state, seat, state.lastDiscard)
}

export function canDeclareWinOnDiscard(state: GameState, seat: Seat): boolean {
  if (state.phase !== 'call' || !state.lastDiscard) return false
  return canWinWithDiscard(state, seat, state.lastDiscard)
}

/** Seats (in turn order after the discarder) that can call or win on a discard. */
export function getCallers(
  state: GameState,
  discard: PendingDiscard,
): readonly Seat[] {
  const start = TURN_ORDER.indexOf(discard.seat)
  const callers: Seat[] = []
  for (let step = 1; step < TURN_ORDER.length; step++) {
    const seat = TURN_ORDER[(start + step) % TURN_ORDER.length]!
    if (
      callOptionsForDiscard(state, seat, discard).length > 0 ||
      canWinWithDiscard(state, seat, discard)
    ) {
      callers.push(seat)
    }
  }
  return callers
}

/** Joker swaps available to `seat`: trade a matching natural for an exposed joker. */
export function getJokerSwaps(
  state: GameState,
  seat: Seat,
): readonly JokerSwap[] {
  if (state.deadHands.includes(seat)) return []
  const hand = state.hands[seat]
  const swaps: JokerSwap[] = []

  for (const targetSeat of SEATS) {
    state.exposed[targetSeat].forEach((meld, meldIndex) => {
      const face = meldFace(meld)
      if (!face) return
      const replacement = hand.find(
        (t) => !isJoker(t) && sameFace(t.face, face),
      )
      if (!replacement) return
      for (const joker of meld.tiles.filter(isJoker)) {
        swaps.push({
          targetSeat,
          meldIndex,
          jokerTileId: joker.id,
          tileId: replacement.id,
        })
      }
    })
  }
  return swaps
}

export function callIllegalReason(
  state: GameState,
  seat: Seat,
  action: Extract<Action, { type: 'call' }>,
): IllegalReason | null {
  if (state.phase === 'ended') return 'game_over'
  if (state.phase !== 'call' || !state.lastDiscard) return 'wrong_phase'
  if (seat !== state.currentSeat) return 'not_your_turn'
  if (state.deadHands.includes(seat)) return 'dead_hand'

  const discard = state.lastDiscard
  if (isJoker(discard.tile)) return 'joker_call'

  const hand = state.hands[seat]
  const chosen: Tile[] = []
  for (const id of action.tileIds) {
    const tile = hand.find((t) => t.id === id)
    if (!tile || chosen.includes(tile)) return 'no_such_tile'
    chosen.push(tile)
  }

  const naturals = chosen.filter(
    (t) => !isJoker(t) && sameFace(t.face, discard.tile.face),
  )
  const jokers = chosen.filter(isJoker)
  if (
    naturals.length + jokers.length !== chosen.length ||
    chosen.length !== MELD_SIZE[action.meld] - 1 ||
    naturals.length < 1
  ) {
    return 'not_enough_matching'
  }

  const meld = buildMeld(action.meld, discard, chosen)
  if (!patternsAllow(state.patterns, [...state.exposed[seat], meld])) {
    return 'call_not_in_pattern'
  }
  return null
}

export function jokerSwapIllegalReason(
  state: GameState,
  seat: Seat,
  action: Extract<Action, { type: 'joker_swap' }>,
): IllegalReason | null {
  if (state.phase === 'ended') return 'game_over'
  if (state.phase !== 'draw' && state.phase !== 'discard') return 'wrong_phase'
  if (seat !== state.currentSeat) return 'not_your_turn'
  const match = getJokerSwaps(state, seat).some(
    (s) =>
      s.targetSeat === action.targetSeat &&
      s.meldIndex === action.meldIndex &&
      s.jokerTileId === action.jokerTileId,
  )
  if (!match) return 'no_swap_available'
  const meld = state.exposed[action.targetSeat][action.meldIndex]
  const face = meld ? meldFace(meld) : null
  const tile = state.hands[seat].find((t) => t.id === action.tileId)
  if (!tile) return 'no_such_tile'
  if (!face || isJoker(tile) || !sameFace(tile.face, face)) {
    return 'no_swap_available'
  }
  return null
}
