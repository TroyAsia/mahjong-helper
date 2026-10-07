import type { IllegalReason } from '../engine/types'

/** Friendly copy for illegal moves (beginner-facing). */
export function illegalMoveMessage(reason: IllegalReason): string {
  switch (reason) {
    case 'game_over':
      return 'The deal is already over.'
    case 'not_your_turn':
      return 'It is not your turn.'
    case 'wrong_phase':
      return 'That action is not available right now.'
    case 'dead_hand':
      return 'Your hand is dead and cannot act.'
    case 'no_such_tile':
      return 'That tile is not in your hand.'
    case 'not_winning':
      return 'Your tiles do not match a practice pattern yet.'
    case 'joker_call':
      return 'Jokers cannot be called from a discard.'
    case 'not_enough_matching':
      return 'You do not have enough matching tiles for that call.'
    case 'call_not_in_pattern':
      return 'That call does not fit a set in your closest practice pattern.'
    case 'no_swap_available':
      return 'No exposed joker can be swapped for that tile.'
    case 'charleston_wrong_count':
      return 'Pass the correct number of tiles for this Charleston step.'
    case 'charleston_joker':
      return 'You cannot pass jokers in the Charleston.'
    case 'charleston_already_submitted':
      return 'You already submitted for this Charleston step.'
  }
}
