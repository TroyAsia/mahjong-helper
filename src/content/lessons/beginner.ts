import type { InteractiveLesson } from './types'

export const beginnerLessons: readonly InteractiveLesson[] = [
  {
    id: 'suits',
    title: 'The three suits',
    summary: 'Recognize Bams, Craks, and Dots by mark — not color alone.',
    minutes: 4,
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
        explanation: 'The ● marker means Dots. Rank 3 → 3 Dot.',
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
    summary: 'Green, Red, White — and which suit each matches.',
    minutes: 4,
    steps: [
      {
        type: 'teach',
        title: 'Three dragons',
        body: [
          'There are three [[dragon|dragons]]: Green, Red, and White — four of each.',
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
        type: 'quiz',
        prompt: 'You need a pung of Green dragon. Which suit “family” is that linked to?',
        choices: [
          { id: 'bam', label: 'Bams' },
          { id: 'crak', label: 'Craks' },
          { id: 'dot', label: 'Dots' },
        ],
        correctId: 'bam',
        explanation: 'Green dragon ↔ Bam family.',
      },
    ],
  },
  {
    id: 'winds',
    title: 'Winds and seats',
    summary: 'East, South, West, North — tiles and table seats.',
    minutes: 3,
    steps: [
      {
        type: 'teach',
        body: [
          'The four [[wind|winds]] are East, South, West, and North — four tiles each.',
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
        explanation: 'SW means South wind (S + W for wind).',
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
    summary: 'When jokers help — and when they never can.',
    minutes: 5,
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
          { id: 'yes', label: 'Yes — jokers are wild' },
          { id: 'no', label: 'No — jokers never go in pairs' },
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
          { id: 'no', label: 'No — jokers cannot be called' },
        ],
        correctId: 'no',
        explanation: 'Jokers are never called from discards. Draw them or receive them in the deal/Charleston.',
      },
      {
        type: 'scenario',
        prompt: 'Is this set legal?',
        situation:
          'You show three tiles toward a pung of 8 Dot: 8 Dot, Joker, Joker.',
        tiles: [
          { kind: 'suit', suit: 'dot', rank: 8 },
          { kind: 'joker' },
          { kind: 'joker' },
        ],
        choices: [
          { id: 'legal', label: 'Legal pung (jokers fill a 3+ set)' },
          { id: 'illegal', label: 'Illegal — need two natural 8 Dots' },
        ],
        correctId: 'legal',
        explanation:
          'One natural tile plus jokers is fine for a pung/kong. The set size is 3+, so jokers are allowed.',
      },
    ],
  },
  {
    id: 'how-to-win',
    title: 'How to win',
    summary: 'Match a pattern — American mahjong is not free-form.',
    minutes: 5,
    steps: [
      {
        type: 'teach',
        body: [
          'You win only by completing a listed [[pattern|pattern]] (we use original practice patterns — not the official NMJL card).',
          'There are no free-form “four sets + a pair” wins, and no casual chows (1-2-3) unless a pattern asks for identical-tile sets.',
          'A complete hand is 14 tiles that match every group in the pattern.',
        ],
      },
      {
        type: 'quiz',
        prompt: 'You have four nice 1-2-3 Bam runs and a pair. Is that a win by itself?',
        choices: [
          { id: 'yes', label: 'Yes — classic mahjong shape' },
          { id: 'no', label: 'No — it must match a card pattern' },
        ],
        correctId: 'no',
        explanation:
          'American mahjong wins are pattern-based. Pretty runs do not count unless the card asks for that hand.',
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
      {
        type: 'scenario',
        prompt: 'Pick the winning idea.',
        situation:
          'Your practice pattern needs: Kong 1B, Kong 2B, Kong 3B, pair East. You have all of that except one East.',
        choices: [
          { id: 'chow', label: 'Make a 4-5-6 Bam chow instead' },
          { id: 'east', label: 'Need one more East (or win by calling/drawing it)' },
          { id: 'joker', label: 'Use a joker as the second East' },
        ],
        correctId: 'east',
        explanation:
          'You are one tile away on the pair. Jokers cannot fill pairs — you need a real East.',
      },
    ],
  },
  {
    id: 'your-turn',
    title: 'Your turn: draw and discard',
    summary: 'The basic rhythm of play.',
    minutes: 4,
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
      {
        type: 'scenario',
        prompt: 'Which discard is smarter?',
        situation:
          'Closest pattern loves Bams. Your hand is full of Bam sets, plus one lonely 9 Dot that fits nothing.',
        tiles: [
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'dot', rank: 9 },
        ],
        choices: [
          { id: 'bam', label: 'Discard a 2 Bam' },
          { id: 'dot', label: 'Discard the 9 Dot' },
        ],
        correctId: 'dot',
        explanation:
          'Throw the tile that does not serve your pattern. Keep the Bam pair alive.',
      },
    ],
  },
  {
    id: 'when-someone-discards',
    title: 'When someone discards',
    summary: 'Call only to finish a real set — or to win.',
    minutes: 5,
    steps: [
      {
        type: 'teach',
        body: [
          'After a [[discard|discard]], you may [[call|call]] it only to complete a [[pung|pung]], [[kong|kong]], quint, or sextet toward your pattern — or to win.',
          'Called sets become an [[exposure|exposure]]: everyone can see them.',
          'If the tile does not clearly help your pattern, pass. Bad calls lock you into the wrong hand.',
        ],
      },
      {
        type: 'quiz',
        prompt: 'Someone discards 6 Crak. You have one 6 Crak. Can you call for a pung?',
        choices: [
          { id: 'yes', label: 'Yes — any matching tile is fine' },
          { id: 'no', label: 'No — a pung needs three; you would only have two' },
        ],
        correctId: 'no',
        explanation:
          'Calling 6 Crak with only one in hand makes two tiles — that is not a pung. You need two already (or jokers filling a 3+ set plan).',
      },
      {
        type: 'scenario',
        prompt: 'Call or pass?',
        situation:
          'You are building Wind Garden (pungs of all winds + flower pair). South discards East. You already hold two Easts.',
        choices: [
          { id: 'call', label: 'Call pung of East' },
          { id: 'pass', label: 'Pass — winds are dangerous' },
        ],
        correctId: 'call',
        explanation:
          'That discard completes a pung your pattern actually needs. This is a good call.',
      },
      {
        type: 'scenario',
        prompt: 'Call or pass?',
        situation:
          'You are one tile from a Bam-heavy pattern. Someone discards Red dragon. You have two Red dragons but Red is not in your pattern.',
        choices: [
          { id: 'call', label: 'Call the pung — exposures are cool' },
          { id: 'pass', label: 'Pass — it pulls you off your hand' },
        ],
        correctId: 'pass',
        explanation:
          'A call that is not on your pattern creates a useless exposure and wastes tempo. Pass.',
      },
    ],
  },
]
