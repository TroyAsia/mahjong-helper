import type { LevelId } from '../../levels/schema'

/** Display tile for lessons (plain data — no engine import). */
export type LessonFace =
  | { readonly kind: 'suit'; readonly suit: 'bam' | 'crak' | 'dot'; readonly rank: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 }
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

export type ScenarioStep = {
  readonly type: 'scenario'
  readonly prompt: string
  readonly situation: string
  readonly tiles?: readonly LessonFace[]
  readonly choices: readonly Choice[]
  readonly correctId: string
  readonly explanation: string
}

export type LessonStep = TeachStep | QuizStep | IdentifyStep | ScenarioStep

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
