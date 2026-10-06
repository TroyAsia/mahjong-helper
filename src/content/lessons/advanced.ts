import type { InteractiveLesson } from './types'

export const advancedLessons: readonly InteractiveLesson[] = [
  {
    id: 'reading-discards',
    title: 'Reading discard piles',
    summary: 'Infer pivots and live waits, then make the table-aware throw.',
    minutes: 7,
    steps: [
      {
        type: 'teach',
        body: [
          '[[discard|Discards]] are a public diary. Suit piles, honor timing, and repeats all mean something.',
          'Lots of one suit in the discards often means that suit is cold for them, or they pivoted away from it.',
          'Track what is gone so you know which waits are still live for you and for them.',
        ],
      },
      {
        type: 'quiz',
        prompt:
          'West threw four Bams early, then stopped and later exposed a Crak pung. What does that suggest?',
        choices: [
          { id: 'bam-hand', label: 'West is still on a Bam hand' },
          { id: 'crak-hand', label: 'West likely pivoted toward Craks' },
          { id: 'random', label: 'Discards are random noise' },
        ],
        correctId: 'crak-hand',
        explanation:
          'Early Bam dumps plus Crak exposure is a classic pivot signal. Defend Craks more than Bams.',
      },
      {
        type: 'play',
        prompt: 'North exposed Dot sets only. 8 Bam is all over the discard piles. Throw safely.',
        situation: 'You must discard. Pick the safer tile given the public information.',
        goal: 'Prefer the heavily discarded Bam over a fresh honor.',
        mode: 'discard',
        hand: [
          { kind: 'suit', suit: 'bam', rank: 8 },
          { kind: 'wind', wind: 'north' },
          { kind: 'suit', suit: 'dot', rank: 3 },
          { kind: 'suit', suit: 'dot', rank: 3 },
        ],
        correctIds: ['bam-8'],
        explanation:
          'Heavily discarded 8 Bam that does not match North’s Dot exposures is usually safer than an untouched North wind.',
      },
      {
        type: 'quiz',
        prompt:
          'Three of the four 5 Dots are already in discard piles. You need 5 Dot for a pair. What is true?',
        choices: [
          { id: 'live', label: 'The wait is still fully live' },
          { id: 'thin', label: 'The wait is thin: at most one 5 Dot remains' },
          { id: 'impossible', label: 'Pairs can use jokers, so it does not matter' },
        ],
        correctId: 'thin',
        explanation:
          'Four copies exist. Three visible means at most one remains (unless buried in a hand). Jokers cannot finish pairs.',
      },
    ],
  },
  {
    id: 'hand-equity',
    title: 'Your hand vs the table',
    summary: 'Count live tiles, then commit with a real discard.',
    minutes: 7,
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
        type: 'quiz',
        prompt:
          'Hand A: 1 away, but both waiting tiles are nearly gone. Hand B: 2 away, with many live outs. Which often has better equity?',
        choices: [
          { id: 'a', label: 'Force Hand A because 1 away always wins' },
          { id: 'b', label: 'Seriously consider Hand B: more live outs' },
        ],
        correctId: 'b',
        explanation:
          'One-away with dead waits can be worse than two-away with a thick pile of outs. Count tiles, not just distance.',
      },
      {
        type: 'play',
        prompt: 'Your White dragon plan looks frozen. Pivot with the discard.',
        situation:
          'White dragons are stuck behind Dot exposures elsewhere. You also have a clean mid-Dot pattern forming.',
        goal: 'Throw White; commit to Dots.',
        mode: 'discard',
        hand: [
          { kind: 'dragon', dragon: 'white' },
          { kind: 'suit', suit: 'dot', rank: 4 },
          { kind: 'suit', suit: 'dot', rank: 4 },
          { kind: 'suit', suit: 'dot', rank: 5 },
          { kind: 'suit', suit: 'dot', rank: 5 },
          { kind: 'suit', suit: 'dot', rank: 6 },
          { kind: 'suit', suit: 'dot', rank: 6 },
        ],
        correctIds: ['dragon-white'],
        explanation:
          'When key tiles are probably frozen, switch to the live hand. Discard White and ride the Dots.',
      },
      {
        type: 'play',
        prompt: 'Call or pass? The offer is on your dead line.',
        situation:
          'Someone discards White dragon. Calling would restart the frozen White plan and abandon your live Dot shape.',
        goal: 'Pass and stay on the live pattern.',
        mode: 'call_or_pass',
        offer: { kind: 'dragon', dragon: 'white' },
        hand: [
          { kind: 'dragon', dragon: 'white' },
          { kind: 'dragon', dragon: 'white' },
          { kind: 'suit', suit: 'dot', rank: 5 },
          { kind: 'suit', suit: 'dot', rank: 5 },
          { kind: 'suit', suit: 'dot', rank: 5 },
        ],
        correctIds: ['pass'],
        explanation:
          'A call that revives a dead line wrecks equity. Pass and keep the Dot pung path.',
      },
    ],
  },
  {
    id: 'wall-awareness',
    title: 'Wall awareness',
    summary: 'Late wall changes how bold you can be. Play the endgame discard.',
    minutes: 6,
    steps: [
      {
        type: 'teach',
        body: [
          'Watch the [[wall|wall]] count. Few draws left means fewer miracles.',
          'Short wall means prefer safer discards and hands that need fewer tiles.',
          'Long wall means you can invest in slightly slower, higher-value shapes if the table is quiet.',
        ],
      },
      {
        type: 'quiz',
        prompt:
          'Wall has about 8 tiles left. You are 4 away from a fancy hand and 1 away from a plain hand. Default plan?',
        choices: [
          { id: 'fancy', label: 'Fancy hand' },
          { id: 'plain', label: 'Plain hand' },
        ],
        correctId: 'plain',
        explanation:
          'There are not enough draws for a 4-away dream. Take the finishable hand.',
      },
      {
        type: 'play',
        prompt: 'Wall almost empty. An exposed opponent wants Red. What do you throw?',
        situation:
          'Your best offensive discard is Red, but that opponent has been calling Reds. A safer Dot keeps you only one step slower.',
        goal: 'Prefer the safer Dot discard.',
        mode: 'discard',
        hand: [
          { kind: 'dragon', dragon: 'red' },
          { kind: 'suit', suit: 'dot', rank: 2 },
          { kind: 'suit', suit: 'dot', rank: 3 },
          { kind: 'suit', suit: 'dot', rank: 3 },
          { kind: 'suit', suit: 'dot', rank: 3 },
        ],
        correctIds: ['dot-2'],
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
          'Wall length is a planning signal: offense, defense, and pattern choice all shift with it.',
      },
    ],
  },
  {
    id: 'decision-comparison',
    title: 'Comparing decisions',
    summary: 'Rank distance, outs, and risk, then make the move.',
    minutes: 7,
    steps: [
      {
        type: 'teach',
        body: [
          'Strong players rank discards on three axes: [[tiles-away|tiles away]], live outs, and deal-in risk.',
          'Use practice tools (meter, hints, explainer) as training, then try to predict the verdict before you tap.',
          'After a deal, review one decision: which throw quietly cost the win?',
        ],
      },
      {
        type: 'play',
        prompt: 'X is 1 away but feeds a hot exposure. Y is 2 away and looks safe. Throw.',
        situation:
          'West has loud Crak exposures. Your 7 Crak is the “closest” offense. Your 9 Bam is safer and still keeps a solid shape.',
        goal: 'Prefer risk-adjusted outs over raw distance.',
        mode: 'discard',
        hand: [
          { kind: 'suit', suit: 'crak', rank: 7 },
          { kind: 'suit', suit: 'bam', rank: 9 },
          { kind: 'suit', suit: 'bam', rank: 3 },
          { kind: 'suit', suit: 'bam', rank: 3 },
          { kind: 'suit', suit: 'bam', rank: 4 },
          { kind: 'suit', suit: 'bam', rank: 4 },
        ],
        correctIds: ['bam-9'],
        explanation:
          'Distance alone is incomplete. The safer Bam keeps outs without feeding West.',
      },
      {
        type: 'play',
        prompt: 'Call improves you 3→2 away but paints a target. Call or pass?',
        situation:
          'Two opponents are already defending your suit. The call reveals your hand type even more clearly.',
        goal: 'Weigh tempo against giving them a clearer defense target.',
        mode: 'call_or_pass',
        offer: { kind: 'suit', suit: 'bam', rank: 5 },
        hand: [
          { kind: 'suit', suit: 'bam', rank: 5 },
          { kind: 'suit', suit: 'bam', rank: 5 },
          { kind: 'suit', suit: 'bam', rank: 6 },
          { kind: 'suit', suit: 'bam', rank: 6 },
          { kind: 'suit', suit: 'bam', rank: 6 },
        ],
        correctIds: ['pass'],
        explanation:
          'Even “improving” calls have a cost when they focus the table’s defense. Here, pass is the disciplined choice.',
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
    ],
  },
]
