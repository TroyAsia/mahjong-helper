import type { LevelId } from '../../levels/schema'

/** Display tile for lessons (plain data, no engine import). */
export type LessonFace =
  | {
      readonly kind: 'suit'
      readonly suit: 'bam' | 'crak' | 'dot'
      readonly rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    }
  | { readonly kind: 'wind'; readonly wind: 'east' | 'south' | 'west' | 'north' }
  | { readonly kind: 'dragon'; readonly dragon: 'green' | 'red' | 'white' }
  | { readonly kind: 'flower'; readonly index: number }
  | { readonly kind: 'joker' }

export type Choice = {
  readonly id: string
  readonly label: string
}

export type TeachStep = {
  readonly type: 'teach'
  readonly title?: string
  /** Paragraphs; wrap glossary terms like [[joker|Joker]] */
  readonly body: readonly string[]
}

export type QuizStep = {
  readonly type: 'quiz'
  readonly prompt: string
  readonly choices: readonly Choice[]
  readonly correctId: string
  readonly explanation: string
}

export type IdentifyStep = {
  readonly type: 'identify'
  readonly prompt: string
  readonly tile: LessonFace
  readonly choices: readonly Choice[]
  readonly correctId: string
  readonly explanation: string
}

/**
 * Chess.com-style board drill: make a move on a mock hand.
 * discard = tap the tile to throw; call_or_pass = Call or Pass on an offer.
 */
export type PlayStep = {
  readonly type: 'play'
  readonly prompt: string
  readonly situation: string
  readonly hand: readonly LessonFace[]
  /** Opponent discard you may call (call_or_pass mode). */
  readonly offer?: LessonFace
  readonly mode: 'discard' | 'call_or_pass'
  /**
   * discard: faceKey values that count as correct throws.
   * call_or_pass: 'call' and/or 'pass'.
   */
  readonly correctIds: readonly string[]
  readonly explanation: string
  /** Optional goal reminder shown above the rack. */
  readonly goal?: string
}

export type LessonStep =
  | TeachStep
  | QuizStep
  | IdentifyStep
  | PlayStep

export type InteractiveLesson = {
  readonly id: string
  readonly title: string
  readonly summary: string
  readonly minutes: number
  readonly steps: readonly LessonStep[]
}

export type LessonTrack = {
  readonly level: LevelId
  readonly label: string
  readonly blurb: string
  readonly lessons: readonly InteractiveLesson[]
}

export function faceKey(face: LessonFace): string {
  switch (face.kind) {
    case 'suit':
      return `${face.suit}-${face.rank}`
    case 'wind':
      return `wind-${face.wind}`
    case 'dragon':
      return `dragon-${face.dragon}`
    case 'flower':
      return `flower-${face.index}`
    case 'joker':
      return 'joker'
  }
}

export function isPlayCorrect(
  step: PlayStep,
  moveId: string,
): boolean {
  return step.correctIds.includes(moveId)
}
