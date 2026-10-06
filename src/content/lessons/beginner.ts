import type { InteractiveLesson } from './types'

export const beginnerLessons: readonly InteractiveLesson[] = [
  {
    id: 'suits',
    title: 'The three suits',
    summary: 'Recognize Bams, Craks, and Dots by mark, not color alone.',
    minutes: 5,
    steps: [
      {
        type: 'teach',
        title: 'Meet the suits',
        body: [
          'American mahjong has three numbered suits: [[bam|Bams]], [[crak|Craks]], and [[dot|Dots]].',
          'Each suit runs 1–9, with four copies of every tile. That is 108 suit tiles in the set.',
          'Always read the number and the suit marker together. Color is a helper, not the whole story.',
        ],
      },
      {
        type: 'identify',
        prompt: 'What suit is this tile?',
        tile: { kind: 'suit', suit: 'bam', rank: 5 },
        choices: [
          { id: 'bam', label: 'Bam (bamboo)' },
          { id: 'crak', label: 'Crak (characters)' },
          { id: 'dot', label: 'Dot (circles)' },
        ],
        correctId: 'bam',
        explanation:
          '5B uses the stick marker (║). That is Bam. Craks use # and Dots use ●.',
      },
      {
        type: 'identify',
        prompt: 'Identify this tile.',
        tile: { kind: 'suit', suit: 'dot', rank: 3 },
        choices: [
          { id: '3b', label: '3 Bam' },
          { id: '3c', label: '3 Crak' },
          { id: '3d', label: '3 Dot' },
        ],
        correctId: '3d',
        explanation: 'The ● marker means Dots. Rank 3 means 3 Dot.',
      },
      {
        type: 'quiz',
        prompt: 'How many copies of 7 Crak exist in a full set?',
        choices: [
          { id: '2', label: '2' },
          { id: '3', label: '3' },
          { id: '4', label: '4' },
        ],
        correctId: '4',
        explanation: 'Every numbered suit tile has four copies.',
      },
    ],
  },
  {
    id: 'dragons',
    title: 'Dragons',
    summary: 'Green, Red, White, and which suit each matches.',
    minutes: 5,
    steps: [
      {
        type: 'teach',
        title: 'Three dragons',
        body: [
          'There are three [[dragon|dragons]]: Green, Red, and White (four of each).',
          'Memory hook: Green ↔ [[bam|Bam]], Red ↔ [[crak|Crak]], White ↔ [[dot|Dot]].',
          'Patterns often ask for a pung or kong of a specific dragon.',
        ],
      },
      {
        type: 'quiz',
        prompt: 'Which suit matches the Red dragon?',
        choices: [
          { id: 'bam', label: 'Bam' },
          { id: 'crak', label: 'Crak' },
          { id: 'dot', label: 'Dot' },
        ],
        correctId: 'crak',
        explanation: 'Red dragon pairs with Craks. Green→Bam, White→Dot.',
      },
      {
        type: 'identify',
        prompt: 'What tile is this?',
        tile: { kind: 'dragon', dragon: 'white' },
        choices: [
          { id: 'gd', label: 'Green dragon' },
          { id: 'rd', label: 'Red dragon' },
          { id: 'wd', label: 'White dragon' },
        ],
        correctId: 'wd',
        explanation: 'WD is the White dragon (matches Dots).',
      },
      {
        type: 'play',
        prompt: 'Your hand is chasing Green dragon sets. Discard the tile that does not belong.',
        situation:
          'You want Bams and Green dragons. One tile is clearly outside that plan.',
        goal: 'Keep Bam / Green dragon tiles; throw the odd suit out.',
        mode: 'discard',
        hand: [
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'dragon', dragon: 'green' },
          { kind: 'dragon', dragon: 'green' },
          { kind: 'suit', suit: 'dot', rank: 9 },
        ],
        correctIds: ['dot-9'],
        explanation:
          '9 Dot is the orphan. Keeping Green and Bams matches the dragon-Bam family idea.',
      },
    ],
  },
  {
    id: 'winds',
    title: 'Winds and seats',
    summary: 'East, South, West, North: tiles and table seats.',
    minutes: 4,
    steps: [
      {
        type: 'teach',
        body: [
          'The four [[wind|winds]] are East, South, West, and North (four tiles each).',
          'Seats use the same names. Play runs counterclockwise: East → South → West → North.',
          'Dealer usually starts as East and begins with 14 tiles; others start with 13.',
        ],
      },
      {
        type: 'identify',
        prompt: 'Which wind is this?',
        tile: { kind: 'wind', wind: 'south' },
        choices: [
          { id: 'e', label: 'East' },
          { id: 's', label: 'South' },
          { id: 'w', label: 'West' },
          { id: 'n', label: 'North' },
        ],
        correctId: 's',
        explanation: 'SW means South wind.',
      },
      {
        type: 'quiz',
        prompt: 'After East’s turn, whose turn is next?',
        choices: [
          { id: 'north', label: 'North' },
          { id: 'south', label: 'South' },
          { id: 'west', label: 'West' },
        ],
        correctId: 'south',
        explanation: 'Counterclockwise order: East → South → West → North.',
      },
    ],
  },
  {
    id: 'flowers-jokers',
    title: 'Flowers and jokers',
    summary: 'When jokers help, and when they never can.',
    minutes: 6,
    steps: [
      {
        type: 'teach',
        title: 'Special tiles',
        body: [
          'The set has eight [[flower|Flowers]] and eight [[joker|Jokers]].',
          'Jokers may stand in for tiles inside a [[pung|pung]], [[kong|kong]], or bigger set.',
          'Jokers cannot complete a [[pair|pair]] or a single. You also cannot [[call|call]] a joker from someone’s [[discard|discard]].',
        ],
      },
      {
        type: 'quiz',
        prompt: 'You have two East winds and a joker. Can the joker finish that pair?',
        choices: [
          { id: 'yes', label: 'Yes, jokers are wild' },
          { id: 'no', label: 'No, jokers never go in pairs' },
        ],
        correctId: 'no',
        explanation:
          'Jokers only help sets of three or more. A pair must be two real matching tiles.',
      },
      {
        type: 'quiz',
        prompt: 'Someone discards a joker. Can you call it for your kong?',
        choices: [
          { id: 'yes', label: 'Yes, if you need it' },
          { id: 'no', label: 'No, jokers cannot be called' },
        ],
        correctId: 'no',
        explanation:
          'Jokers are never called from discards. Draw them or receive them in the deal/Charleston.',
      },
      {
        type: 'play',
        prompt: 'South discarded a joker. Do you call?',
        situation:
          'You need one more tile for a kong of 8 Dot. A joker hits the table.',
        goal: 'Decide Call or Pass on the joker discard.',
        mode: 'call_or_pass',
        offer: { kind: 'joker' },
        hand: [
          { kind: 'suit', suit: 'dot', rank: 8 },
          { kind: 'suit', suit: 'dot', rank: 8 },
          { kind: 'suit', suit: 'dot', rank: 8 },
          { kind: 'suit', suit: 'bam', rank: 1 },
        ],
        correctIds: ['pass'],
        explanation:
          'Even though a joker would “help,” jokers cannot be called from discards. Pass.',
      },
    ],
  },
  {
    id: 'how-to-win',
    title: 'How to win',
    summary: 'Match a pattern. American mahjong is not free-form.',
    minutes: 6,
    steps: [
      {
        type: 'teach',
        body: [
          'You win only by completing a listed [[pattern|pattern]] (we use original practice patterns, not the official NMJL card).',
          'There are no free-form “four sets + a pair” wins, and no casual chows (1-2-3) unless a pattern asks for identical-tile sets.',
          'A complete hand is 14 tiles that match every group in the pattern.',
        ],
      },
      {
        type: 'quiz',
        prompt: 'You have four nice 1-2-3 Bam runs and a pair. Is that a win by itself?',
        choices: [
          { id: 'yes', label: 'Yes, classic mahjong shape' },
          { id: 'no', label: 'No, it must match a card pattern' },
        ],
        correctId: 'no',
        explanation:
          'American mahjong wins are pattern-based. Pretty runs do not count unless the card asks for that hand.',
      },
      {
        type: 'play',
        prompt: 'You are one away from Bamboo Ladder (kong 1B, 2B, 3B + pair East). Discard the tile that is not helping.',
        situation:
          'Your hand is almost there, but one tile is junk for this pattern.',
        goal: 'Throw the tile that does not belong in Bamboo Ladder.',
        mode: 'discard',
        hand: [
          { kind: 'suit', suit: 'bam', rank: 1 },
          { kind: 'suit', suit: 'bam', rank: 1 },
          { kind: 'suit', suit: 'bam', rank: 1 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 3 },
          { kind: 'suit', suit: 'bam', rank: 3 },
          { kind: 'suit', suit: 'bam', rank: 3 },
          { kind: 'wind', wind: 'east' },
          { kind: 'suit', suit: 'dot', rank: 9 },
        ],
        correctIds: ['dot-9'],
        explanation:
          '9 Dot is not in Bamboo Ladder. Keep the Bam groups and the East for the pair. Remember: a joker cannot finish that East pair.',
      },
      {
        type: 'quiz',
        prompt: 'What does “tiles away” tell you?',
        choices: [
          { id: 'score', label: 'Your score if you win now' },
          { id: 'away', label: 'How many tiles you still need for your closest pattern' },
          { id: 'wall', label: 'How many tiles are left in the wall' },
        ],
        correctId: 'away',
        explanation:
          '[[tiles-away|Tiles away]] measures distance to your best matching practice pattern. Lower is closer to mahjong.',
      },
    ],
  },
  {
    id: 'your-turn',
    title: 'Your turn: draw and discard',
    summary: 'Practice the basic rhythm: keep your pattern, throw orphans.',
    minutes: 6,
    steps: [
      {
        type: 'teach',
        body: [
          'On your turn you usually draw one tile from the [[wall|wall]], then [[discard|discard]] one tile from your hand.',
          'If your 14 tiles already match a pattern after the draw, declare mahjong instead of discarding.',
          'Before you throw, glance at your closest pattern so you do not break a set you still need.',
        ],
      },
      {
        type: 'play',
        prompt: 'Your closest pattern loves Bams. Make the discard.',
        situation:
          'You just drew. Your Bam sets are progressing, and one lonely 9 Dot fits nothing.',
        goal: 'Discard the orphan that does not serve Bams.',
        mode: 'discard',
        hand: [
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 3 },
          { kind: 'suit', suit: 'bam', rank: 3 },
          { kind: 'suit', suit: 'bam', rank: 3 },
          { kind: 'suit', suit: 'bam', rank: 4 },
          { kind: 'suit', suit: 'bam', rank: 4 },
          { kind: 'suit', suit: 'dot', rank: 9 },
        ],
        correctIds: ['dot-9'],
        explanation:
          'Throw the tile that does not serve your pattern. Keep the Bam pairs and pung starts alive.',
      },
      {
        type: 'play',
        prompt: 'Do not break your key pair.',
        situation:
          'You need a pair of Easts for your pattern. You also hold a useless 9 Crak.',
        goal: 'Discard 9 Crak. Keep both Easts.',
        mode: 'discard',
        hand: [
          { kind: 'wind', wind: 'east' },
          { kind: 'wind', wind: 'east' },
          { kind: 'suit', suit: 'bam', rank: 5 },
          { kind: 'suit', suit: 'bam', rank: 5 },
          { kind: 'suit', suit: 'bam', rank: 5 },
          { kind: 'suit', suit: 'crak', rank: 9 },
        ],
        correctIds: ['crak-9'],
        explanation:
          'Never break a needed pair when a clear orphan exists. Keep both Easts.',
      },
      {
        type: 'quiz',
        prompt: 'You just drew and now hold 14 tiles that match a pattern. What should you do?',
        choices: [
          { id: 'discard', label: 'Discard anyway to be polite' },
          { id: 'win', label: 'Declare win / mahjong' },
          { id: 'call', label: 'Wait and call next turn' },
        ],
        correctId: 'win',
        explanation: 'A complete 14-tile pattern is the win. Declare it.',
      },
    ],
  },
  {
    id: 'when-someone-discards',
    title: 'When someone discards',
    summary: 'Call only to finish a real set, or to win. Play the decision.',
    minutes: 7,
    steps: [
      {
        type: 'teach',
        body: [
          'After a [[discard|discard]], you may [[call|call]] it only to complete a [[pung|pung]], [[kong|kong]], quint, or sextet toward your pattern, or to win.',
          'Called sets become an [[exposure|exposure]]: everyone can see them.',
          'If the tile does not clearly help your pattern, pass. Bad calls lock you into the wrong hand.',
        ],
      },
      {
        type: 'play',
        prompt: 'South discarded East. Call or pass?',
        situation:
          'You are building Wind Garden (pungs of all winds + flower pair). You already hold two Easts.',
        goal: 'Complete the East pung your pattern needs.',
        mode: 'call_or_pass',
        offer: { kind: 'wind', wind: 'east' },
        hand: [
          { kind: 'wind', wind: 'east' },
          { kind: 'wind', wind: 'east' },
          { kind: 'wind', wind: 'south' },
          { kind: 'wind', wind: 'south' },
          { kind: 'flower', index: 0 },
          { kind: 'flower', index: 1 },
        ],
        correctIds: ['call'],
        explanation:
          'That discard completes a pung your pattern actually needs. This is a good call.',
      },
      {
        type: 'play',
        prompt: 'West discarded Red dragon. Call or pass?',
        situation:
          'You are one tile from a Bam-heavy pattern. You hold two Red dragons, but Red is not in your pattern.',
        goal: 'Do not expose a set that pulls you off Bams.',
        mode: 'call_or_pass',
        offer: { kind: 'dragon', dragon: 'red' },
        hand: [
          { kind: 'dragon', dragon: 'red' },
          { kind: 'dragon', dragon: 'red' },
          { kind: 'suit', suit: 'bam', rank: 1 },
          { kind: 'suit', suit: 'bam', rank: 1 },
          { kind: 'suit', suit: 'bam', rank: 1 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 2 },
        ],
        correctIds: ['pass'],
        explanation:
          'A call that is not on your pattern creates a useless exposure and wastes tempo. Pass.',
      },
      {
        type: 'play',
        prompt: 'North discarded 6 Crak. Call or pass?',
        situation: 'You only have one 6 Crak in hand.',
        goal: 'A pung needs three tiles total after the call.',
        mode: 'call_or_pass',
        offer: { kind: 'suit', suit: 'crak', rank: 6 },
        hand: [
          { kind: 'suit', suit: 'crak', rank: 6 },
          { kind: 'suit', suit: 'bam', rank: 3 },
          { kind: 'suit', suit: 'bam', rank: 4 },
        ],
        correctIds: ['pass'],
        explanation:
          'Calling with only one matching tile would make two tiles, not a pung. Pass (unless jokers already complete a legal 3+ plan, which they do not here).',
      },
    ],
  },
]
