/** Core engine types. Plain JSON only — no classes, functions, Map, or Set. */

export type Seat = 'east' | 'south' | 'west' | 'north'

export const SEATS: readonly Seat[] = ['east', 'south', 'west', 'north']

/** Counterclockwise turn order starting at East (dealer). */
export const TURN_ORDER: readonly Seat[] = ['east', 'south', 'west', 'north']

export type Suit = 'bam' | 'crak' | 'dot'

export type Wind = 'east' | 'south' | 'west' | 'north'

/** Green→Bam, Red→Crak, White→Dot. */
export type Dragon = 'green' | 'red' | 'white'

export type SuitRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type TileFace =
  | { readonly kind: 'suit'; readonly suit: Suit; readonly rank: SuitRank }
  | { readonly kind: 'wind'; readonly wind: Wind }
  | { readonly kind: 'dragon'; readonly dragon: Dragon }
  | { readonly kind: 'flower'; readonly index: number }
  | { readonly kind: 'joker' }

/** Unique tile instance. `id` distinguishes copies of the same face. */
export type Tile = {
  readonly id: string
  readonly face: TileFace
}

export type FaceMatcher =
  | {
      readonly match: 'suit'
      readonly suit: 'bam' | 'crak' | 'dot' | 'any'
      readonly rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'any'
    }
  | {
      readonly match: 'wind'
      readonly wind: 'east' | 'south' | 'west' | 'north' | 'any'
    }
  | {
      readonly match: 'dragon'
      readonly dragon: 'green' | 'red' | 'white' | 'any'
    }
  | { readonly match: 'flower' }

export type PatternGroup = {
  readonly size: 1 | 2 | 3 | 4 | 5 | 6
  readonly face: FaceMatcher
}

/** Engine pattern: id + groups only (no display copy). */
export type Pattern = {
  readonly id: string
  readonly groups: readonly PatternGroup[]
}

export type Phase =
  | 'charleston'
  | 'deal'
  | 'draw'
  | 'discard'
  | 'call'
  | 'ended'

export type EndReason = 'empty_wall' | 'win' | null

export type MeldKind = 'pung' | 'kong' | 'quint' | 'sextet'

export const MELD_KINDS: readonly MeldKind[] = [
  'pung',
  'kong',
  'quint',
  'sextet',
]

export const MELD_SIZE: { readonly [K in MeldKind]: 3 | 4 | 5 | 6 } = {
  pung: 3,
  kong: 4,
  quint: 5,
  sextet: 6,
}

/** An exposed set. Jokers inside stand in for the natural tiles' face. */
export type Meld = {
  readonly kind: MeldKind
  readonly tiles: readonly Tile[]
  readonly calledFrom: Seat
}

/** The discard currently open for calls. */
export type PendingDiscard = {
  readonly seat: Seat
  readonly tile: Tile
}

export type CharlestonStep =
  | 'first_right'
  | 'first_across'
  | 'first_left'
  | 'vote_second'
  | 'second_left'
  | 'second_across'
  | 'second_right'
  | 'courtesy'

/** Charleston progress. `selections` hold tile ids each seat has committed this step. */
export type CharlestonState = {
  readonly step: CharlestonStep
  readonly selections: { readonly [S in Seat]: readonly string[] | null }
  readonly votes: { readonly [S in Seat]: boolean | null }
}

/**
 * Full game snapshot. Every field is readonly JSON data.
 * Randomness advances via `rngSeed` only (no Math.random).
 */
export type GameState = {
  readonly version: 1
  readonly rngSeed: number
  readonly dealer: Seat
  readonly currentSeat: Seat
  readonly phase: Phase
  readonly wall: readonly Tile[]
  readonly hands: { readonly [S in Seat]: readonly Tile[] }
  readonly discards: { readonly [S in Seat]: readonly Tile[] }
  readonly exposed: { readonly [S in Seat]: readonly Meld[] }
  /** Set while phase is `call`: the discard seats may claim. */
  readonly lastDiscard: PendingDiscard | null
  /** Seats still to be asked after `currentSeat` during a call window. */
  readonly callQueue: readonly Seat[]
  readonly charleston: CharlestonState | null
  readonly deadHands: readonly Seat[]
  readonly patterns: readonly Pattern[]
  readonly winner: Seat | null
  readonly endReason: EndReason
}

export type Action =
  | { readonly type: 'draw' }
  | { readonly type: 'discard'; readonly tileId: string }
  | { readonly type: 'declare_win' }
  | {
      readonly type: 'call'
      readonly meld: MeldKind
      /** Hand tiles combined with the discard to form the meld. */
      readonly tileIds: readonly string[]
    }
  | { readonly type: 'pass' }
  | {
      readonly type: 'joker_swap'
      readonly targetSeat: Seat
      readonly meldIndex: number
      readonly jokerTileId: string
      /** Natural tile from the swapper's hand that replaces the joker. */
      readonly tileId: string
    }
  | { readonly type: 'charleston_pass'; readonly tileIds: readonly string[] }
  | { readonly type: 'charleston_vote'; readonly continue: boolean }
  /** Penalty applied by the app when an illegal move is attempted. */
  | { readonly type: 'declare_dead_hand' }

/** Machine-readable reason an action was rejected. The app turns these into messages. */
export type IllegalReason =
  | 'game_over'
  | 'not_your_turn'
  | 'wrong_phase'
  | 'dead_hand'
  | 'no_such_tile'
  | 'not_winning'
  | 'joker_call'
  | 'not_enough_matching'
  | 'call_not_in_pattern'
  | 'no_swap_available'
  | 'charleston_wrong_count'
  | 'charleston_joker'
  | 'charleston_already_submitted'

export type InvariantIssue =
  | { readonly code: 'wrong_total'; readonly total: number }
  | { readonly code: 'duplicate_id'; readonly id: string }
  | { readonly code: 'wrong_seat_count'; readonly seat: Seat; readonly count: number }
  | { readonly code: 'bad_meld'; readonly seat: Seat; readonly index: number }
