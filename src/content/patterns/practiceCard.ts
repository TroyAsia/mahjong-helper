import { z } from 'zod'
import type { Pattern } from '../../engine/patterns'

/** Original practice patterns — not the official NMJL card. */

const suitSchema = z.enum(['bam', 'crak', 'dot', 'any'])
const rankSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal('any'),
])
const windSchema = z.enum(['east', 'south', 'west', 'north', 'any'])
const dragonSchema = z.enum(['green', 'red', 'white', 'any'])

const faceMatcherSchema = z.discriminatedUnion('match', [
  z.object({
    match: z.literal('suit'),
    suit: suitSchema,
    rank: rankSchema,
  }),
  z.object({ match: z.literal('wind'), wind: windSchema }),
  z.object({ match: z.literal('dragon'), dragon: dragonSchema }),
  z.object({ match: z.literal('flower') }),
])

const groupSchema = z.object({
  size: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
    z.literal(6),
  ]),
  face: faceMatcherSchema,
})

export const patternSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  groups: z.array(groupSchema).min(1),
})

export const practiceCardSchema = z.object({
  notice: z.string(),
  patterns: z.array(patternSchema).min(1),
})

export type PracticePattern = z.infer<typeof patternSchema>
export type PracticeCard = z.infer<typeof practiceCardSchema>

export const practiceCard: PracticeCard = practiceCardSchema.parse({
  notice:
    'Practice patterns for learning only — not the official NMJL card.',
  patterns: [
    {
      id: 'bamboo-ladder',
      name: 'Bamboo Ladder',
      description: 'Kong 1B, Kong 2B, Kong 3B, pair East.',
      groups: [
        { size: 4, face: { match: 'suit', suit: 'bam', rank: 1 } },
        { size: 4, face: { match: 'suit', suit: 'bam', rank: 2 } },
        { size: 4, face: { match: 'suit', suit: 'bam', rank: 3 } },
        { size: 2, face: { match: 'wind', wind: 'east' } },
      ],
    },
    {
      id: 'crak-tower',
      name: 'Crak Tower',
      description: 'Kong 7C, Kong 8C, Kong 9C, pair West.',
      groups: [
        { size: 4, face: { match: 'suit', suit: 'crak', rank: 7 } },
        { size: 4, face: { match: 'suit', suit: 'crak', rank: 8 } },
        { size: 4, face: { match: 'suit', suit: 'crak', rank: 9 } },
        { size: 2, face: { match: 'wind', wind: 'west' } },
      ],
    },
    {
      id: 'dot-runway',
      name: 'Dot Runway',
      description: 'Kong 4D, Kong 5D, Kong 6D, pair South.',
      groups: [
        { size: 4, face: { match: 'suit', suit: 'dot', rank: 4 } },
        { size: 4, face: { match: 'suit', suit: 'dot', rank: 5 } },
        { size: 4, face: { match: 'suit', suit: 'dot', rank: 6 } },
        { size: 2, face: { match: 'wind', wind: 'south' } },
      ],
    },
    {
      id: 'dragon-pung-parade',
      name: 'Dragon Pung Parade',
      description: 'Pung each dragon, pung East, pair flowers.',
      groups: [
        { size: 3, face: { match: 'dragon', dragon: 'green' } },
        { size: 3, face: { match: 'dragon', dragon: 'red' } },
        { size: 3, face: { match: 'dragon', dragon: 'white' } },
        { size: 3, face: { match: 'wind', wind: 'east' } },
        { size: 2, face: { match: 'flower' } },
      ],
    },
    {
      id: 'wind-garden',
      name: 'Wind Garden',
      description: 'Pung each wind, pair of flowers.',
      groups: [
        { size: 3, face: { match: 'wind', wind: 'east' } },
        { size: 3, face: { match: 'wind', wind: 'south' } },
        { size: 3, face: { match: 'wind', wind: 'west' } },
        { size: 3, face: { match: 'wind', wind: 'north' } },
        { size: 2, face: { match: 'flower' } },
      ],
    },
    {
      id: 'lucky-sevens',
      name: 'Lucky Sevens',
      description: 'Kong 7B, Kong 7C, Kong 7D, pair North.',
      groups: [
        { size: 4, face: { match: 'suit', suit: 'bam', rank: 7 } },
        { size: 4, face: { match: 'suit', suit: 'crak', rank: 7 } },
        { size: 4, face: { match: 'suit', suit: 'dot', rank: 7 } },
        { size: 2, face: { match: 'wind', wind: 'north' } },
      ],
    },
    {
      id: 'flower-burst',
      name: 'Flower Burst',
      description: 'Six flowers, kong of 5s, pung Red, single 1.',
      groups: [
        { size: 6, face: { match: 'flower' } },
        { size: 4, face: { match: 'suit', suit: 'any', rank: 5 } },
        { size: 3, face: { match: 'dragon', dragon: 'red' } },
        { size: 1, face: { match: 'suit', suit: 'any', rank: 1 } },
      ],
    },
    {
      id: 'twins-and-triples',
      name: 'Twins and Triples',
      description: 'Pair 2B, pung 3B, kong 4B, pung 5B, pair East.',
      groups: [
        { size: 2, face: { match: 'suit', suit: 'bam', rank: 2 } },
        { size: 3, face: { match: 'suit', suit: 'bam', rank: 3 } },
        { size: 4, face: { match: 'suit', suit: 'bam', rank: 4 } },
        { size: 3, face: { match: 'suit', suit: 'bam', rank: 5 } },
        { size: 2, face: { match: 'wind', wind: 'east' } },
      ],
    },
    {
      id: 'white-out',
      name: 'White Out',
      description: 'Kong White, Kong 1D, Kong 9D, pair Green.',
      groups: [
        { size: 4, face: { match: 'dragon', dragon: 'white' } },
        { size: 4, face: { match: 'suit', suit: 'dot', rank: 1 } },
        { size: 4, face: { match: 'suit', suit: 'dot', rank: 9 } },
        { size: 2, face: { match: 'dragon', dragon: 'green' } },
      ],
    },
    {
      id: 'mid-board',
      name: 'Mid Board',
      description: 'Pung 4C–6C, pung South, pair West.',
      groups: [
        { size: 3, face: { match: 'suit', suit: 'crak', rank: 4 } },
        { size: 3, face: { match: 'suit', suit: 'crak', rank: 5 } },
        { size: 3, face: { match: 'suit', suit: 'crak', rank: 6 } },
        { size: 3, face: { match: 'wind', wind: 'south' } },
        { size: 2, face: { match: 'wind', wind: 'west' } },
      ],
    },
    {
      id: 'green-machine',
      name: 'Green Machine',
      description: 'Kong Green, Kong 2B, Kong 8B, pair flowers.',
      groups: [
        { size: 4, face: { match: 'dragon', dragon: 'green' } },
        { size: 4, face: { match: 'suit', suit: 'bam', rank: 2 } },
        { size: 4, face: { match: 'suit', suit: 'bam', rank: 8 } },
        { size: 2, face: { match: 'flower' } },
      ],
    },
    {
      id: 'odd-squad',
      name: 'Odd Squad',
      description: 'Pung 1/3/5/7 Crak, pair 9 Crak.',
      groups: [
        { size: 3, face: { match: 'suit', suit: 'crak', rank: 1 } },
        { size: 3, face: { match: 'suit', suit: 'crak', rank: 3 } },
        { size: 3, face: { match: 'suit', suit: 'crak', rank: 5 } },
        { size: 3, face: { match: 'suit', suit: 'crak', rank: 7 } },
        { size: 2, face: { match: 'suit', suit: 'crak', rank: 9 } },
      ],
    },
  ],
})

for (const p of practiceCard.patterns) {
  const total = p.groups.reduce((sum, g) => sum + g.size, 0)
  if (total !== 14) {
    throw new Error(`Pattern ${p.id} sums to ${total}, expected 14`)
  }
}

/** Engine-safe pattern list (no display fields). */
export function enginePatterns(): Pattern[] {
  return practiceCard.patterns.map((p) => ({
    id: p.id,
    groups: p.groups,
  }))
}
