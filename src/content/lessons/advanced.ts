import type { InteractiveLesson } from './types'

export const advancedLessons: readonly InteractiveLesson[] = [
  {
    id: 'reading-discards',
    title: 'Reading discard piles',
    summary: 'Infer pivots, cold suits, and live waits.',
    minutes: 6,
    steps: [
      {
        type: 'teach',
        body: [
          '[[discard|Discards]] are a public diary. Suit piles, honor timing, and repeats all mean something.',
          'Lots of one suit in the discards often means that suit is cold for them — or they pivoted away from it.',
          'Track what is gone so you know which waits are still live for you and for them.',
        ],
      },
      {
        type: 'scenario',
        prompt: 'What does this discard history suggest?',
        situation:
          'West has thrown four Bams early, then stopped throwing Bams and started tossing Dots. West later exposes a Crak pung.',
        choices: [
          { id: 'bam-hand', label: 'West is still on a Bam hand' },
          { id: 'crak-hand', label: 'West likely pivoted toward Craks' },
          { id: 'random', label: 'Discards are random noise' },
        ],
        correctId: 'crak-hand',
        explanation:
          'Early Bam dumps + Crak exposure is a classic pivot signal. Defend Craks/related honors more than Bams.',
      },
      {
        type: 'quiz',
        prompt: 'Three of the four 5 Dots are already in discard piles. You need 5 Dot for a pair. What is true?',
        choices: [
          { id: 'live', label: 'The wait is still fully live' },
          { id: 'thin', label: 'The wait is thin — at most one 5 Dot remains' },
          { id: 'impossible', label: 'Pairs can use jokers, so it does not matter' },
        ],
        correctId: 'thin',
        explanation:
          'Four copies exist. Three visible means at most one remains (unless buried in a hand). Jokers cannot finish pairs.',
      },
      {
        type: 'scenario',
        prompt: 'Safe throw from the discards.',
        situation:
          'You must discard. 8 Bam appears many times across piles. North has exposed Dot sets only.',
        choices: [
          { id: '8b', label: '8 Bam looks safer' },
          { id: 'fresh', label: 'A fresh honor nobody has touched is always safest' },
        ],
        correctId: '8b',
        explanation:
          'Heavily discarded tiles that do not match North’s Dot exposures are often safer than untouched honors.',
      },
    ],
  },
  {
    id: 'hand-equity',
    title: 'Your hand vs the table',
    summary: 'Count live tiles before you commit.',
    minutes: 6,
    steps: [
      {
        type: 'teach',
        body: [
          'Advanced players estimate how many tiles still serve each candidate [[pattern|pattern]] after seeing [[discard|discards]] and [[exposure|exposures]].',
          'If two shapes are close in [[tiles-away|tiles away]], prefer the one with more live tiles remaining.',
          'Be ready to pivot when the table has eaten your first plan.',
        ],
      },
      {
        type: 'scenario',
        prompt: 'Which path has better equity?',
        situation:
          'Hand A: 1 away, but both waiting tiles are heavily discarded (maybe one left). Hand B: 2 away, but many live tiles remain for both needs.',
        choices: [
          { id: 'a', label: 'Force Hand A because 1 away always wins' },
          { id: 'b', label: 'Seriously consider Hand B — more live outs' },
        ],
        correctId: 'b',
        explanation:
          'One-away with dead waits can be worse than two-away with a thick pile of outs. Count tiles, not just distance.',
      },
      {
        type: 'quiz',
        prompt: 'You discover three of your key tiles are in opponents’ exposures. Best response?',
        choices: [
          { id: 'pray', label: 'Keep forcing the same pattern' },
          { id: 'pivot', label: 'Re-score alternatives and pivot if another pattern is healthier' },
        ],
        correctId: 'pivot',
        explanation:
          'Exposures remove tiles from the available pool. Recompute — stubbornness is not equity.',
      },
      {
        type: 'scenario',
        prompt: 'Keep or pivot?',
        situation:
          'You chased White dragon kongs, but both White dragons left are likely stuck in a closed hand that already exposed Dot sets. You also have a clean mid-Dot pattern 2 away with live tiles.',
        choices: [
          { id: 'white', label: 'Keep hunting White' },
          { id: 'dots', label: 'Pivot to the Dot pattern' },
        ],
        correctId: 'dots',
        explanation:
          'When your key tiles are probably frozen, switch to the live hand.',
      },
    ],
  },
  {
    id: 'wall-awareness',
    title: 'Wall awareness',
    summary: 'Late wall changes how bold you can be.',
    minutes: 5,
    steps: [
      {
        type: 'teach',
        body: [
          'Watch the [[wall|wall]] count. Few draws left means fewer miracles.',
          'Short wall → prefer safer discards and hands that need fewer tiles.',
          'Long wall → you can invest in slightly slower, higher-value shapes if the table is quiet.',
        ],
      },
      {
        type: 'quiz',
        prompt: 'Wall has ~8 tiles left. You are 4 away from a fancy hand and 1 away from a plain hand. What is the default plan?',
        choices: [
          { id: 'fancy', label: 'Fancy hand' },
          { id: 'plain', label: 'Plain hand' },
        ],
        correctId: 'plain',
        explanation:
          'There are not enough draws for a 4-away dream. Take the finishable hand.',
      },
      {
        type: 'scenario',
        prompt: 'Adjust your discard.',
        situation:
          'Wall is nearly empty. Your best offensive discard is also the tile an exposed opponent likely wants. A safer discard keeps you 2 away instead of 1.',
        choices: [
          { id: 'gamble', label: 'Gamble the offensive discard' },
          { id: 'safe', label: 'Take the safer discard' },
        ],
        correctId: 'safe',
        explanation:
          'Endgame mistakes are expensive. Not dealing into mahjong matters more than shaving one tile off your own line.',
      },
      {
        type: 'quiz',
        prompt: 'Why check wall count every few turns?',
        choices: [
          { id: 'habit', label: 'It is only a habit for show' },
          { id: 'plan', label: 'It changes whether you chase value, speed, or safety' },
        ],
        correctId: 'plan',
        explanation:
          'Wall length is a planning signal — offense, defense, and pattern choice all shift with it.',
      },
    ],
  },
  {
    id: 'decision-comparison',
    title: 'Comparing decisions',
    summary: 'Rank options: distance, outs, and risk.',
    minutes: 6,
    steps: [
      {
        type: 'teach',
        body: [
          'Strong players rank discards on three axes: [[tiles-away|tiles away]], live outs, and deal-in risk.',
          'Use practice tools (meter, hints, explainer) as training — then try to predict the verdict before you tap.',
          'After a deal, review one decision: which throw quietly cost the win?',
        ],
      },
      {
        type: 'scenario',
        prompt: 'Rank these throws.',
        situation:
          'Discard X: 1 away, but feeds a hot exposure. Discard Y: 2 away, many live outs, looks safe from piles.',
        choices: [
          { id: 'x', label: 'X is always better because 1 away' },
          { id: 'y', label: 'Y can be better when risk and outs are considered' },
        ],
        correctId: 'y',
        explanation:
          'Distance alone is incomplete. Risk-adjusted outs win more games over time.',
      },
      {
        type: 'quiz',
        prompt: 'Best study habit after a practice deal?',
        choices: [
          { id: 'blame', label: 'Blame bad luck and redeal immediately' },
          {
            id: 'review',
            label: 'Replay one discard and ask if another tile kept more outs',
          },
        ],
        correctId: 'review',
        explanation:
          'One reviewed decision per deal builds judgment faster than twenty unexamined hands.',
      },
      {
        type: 'scenario',
        prompt: 'Final check.',
        situation:
          'You can call a pung that reveals your hand type. It improves you from 3 away to 2 away, but two opponents are already defending your suit.',
        choices: [
          { id: 'auto', label: 'Always call improvements' },
          {
            id: 'weigh',
            label: 'Weigh tempo gain against giving them a clearer defense target',
          },
        ],
        correctId: 'weigh',
        explanation:
          'Even “improving” calls have a cost when they focus the table’s defense. Choose deliberately.',
      },
    ],
  },
]
