export type GlossaryTerm = {
  readonly id: string
  readonly term: string
  readonly definition: string
}

export const glossary: readonly GlossaryTerm[] = [
  {
    id: 'bam',
    term: 'Bam',
    definition:
      'Bamboo suit. Numbered 1–9. Marker looks like sticks (║). Green dragon matches Bams.',
  },
  {
    id: 'crak',
    term: 'Crak',
    definition:
      'Character suit. Numbered 1–9. Marker looks like hash marks (#). Red dragon matches Craks.',
  },
  {
    id: 'dot',
    term: 'Dot',
    definition:
      'Circle suit. Numbered 1–9. Marker is a filled circle (●). White dragon matches Dots.',
  },
  {
    id: 'dragon',
    term: 'Dragon',
    definition:
      'Honor tile: Green, Red, or White. Four of each. Used as sets in many patterns.',
  },
  {
    id: 'wind',
    term: 'Wind',
    definition:
      'Honor tile: East, South, West, or North. Four of each. Also names the seats at the table.',
  },
  {
    id: 'joker',
    term: 'Joker',
    definition:
      'Wild tile that can fill a seat in a set of 3+. Never used in a pair or single. Cannot be called from a discard.',
  },
  {
    id: 'flower',
    term: 'Flower',
    definition:
      'Special tile (eight in the set). Often grouped together in patterns. Not a suit number.',
  },
  {
    id: 'pung',
    term: 'Pung',
    definition: 'Three identical tiles (jokers allowed to help fill).',
  },
  {
    id: 'kong',
    term: 'Kong',
    definition: 'Four identical tiles (jokers allowed to help fill).',
  },
  {
    id: 'pair',
    term: 'Pair',
    definition: 'Two identical tiles. Jokers cannot complete a pair.',
  },
  {
    id: 'call',
    term: 'Call',
    definition:
      'Claiming another player’s discard to complete a pung/kong (or bigger) or to win. Exposed for all to see.',
  },
  {
    id: 'discard',
    term: 'Discard',
    definition:
      'The tile you throw face-up after drawing (or after a call resolves). Others may call it.',
  },
  {
    id: 'wall',
    term: 'Wall',
    definition:
      'The remaining undealt tiles. Drawing from an empty wall ends the deal in a draw.',
  },
  {
    id: 'charleston',
    term: 'Charleston',
    definition:
      'Passing tiles before play: right, across, left; optional second left-across-right; optional courtesy across.',
  },
  {
    id: 'pattern',
    term: 'Pattern',
    definition:
      'A listed winning hand shape. In American mahjong you win by matching a card pattern, not free-form chows.',
  },
  {
    id: 'exposure',
    term: 'Exposure',
    definition:
      'A set laid face-up after a call. Opponents can see what you are building.',
  },
  {
    id: 'tiles-away',
    term: 'Tiles away',
    definition:
      'How many tiles you still need to finish your closest practice pattern. Lower is better.',
  },
]

export function getGlossaryTerm(id: string): GlossaryTerm | undefined {
  return glossary.find((g) => g.id === id)
}

export function getGlossaryByTermName(name: string): GlossaryTerm | undefined {
  const lower = name.toLowerCase()
  return glossary.find((g) => g.term.toLowerCase() === lower)
}
