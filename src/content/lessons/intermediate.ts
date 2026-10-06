import type { InteractiveLesson } from './types'

export const intermediateLessons: readonly InteractiveLesson[] = [
  {
    id: 'which-to-discard',
    title: 'Which tiles to discard',
    summary: 'Protect your closest pattern; throw the orphans on the rack.',
    minutes: 7,
    steps: [
      {
        type: 'teach',
        body: [
          'Every discard should answer: “Does this keep my best [[pattern|pattern]] alive?”',
          'Compare options by [[tiles-away|tiles away]] after the throw. Prefer the discard that leaves you closer (or tied but safer).',
          'Early on, lonely tiles that appear in no promising hand are usually correct throws.',
        ],
      },
      {
        type: 'play',
        prompt: 'Closest hand wants Bam kongs. Make the discard.',
        situation:
          'You hold strong Bam starts and a stray West with no wind plan.',
        goal: 'Throw West; keep the Bam sets.',
        mode: 'discard',
        hand: [
          { kind: 'suit', suit: 'bam', rank: 1 },
          { kind: 'suit', suit: 'bam', rank: 1 },
          { kind: 'suit', suit: 'bam', rank: 1 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'wind', wind: 'west' },
        ],
        correctIds: ['wind-west'],
        explanation:
          'West is not serving the Bam pattern. Keep the Bam sets progressing.',
      },
      {
        type: 'play',
        prompt: 'You are 1 away with a needed East pair. Discard correctly.',
        situation:
          'Wall is still long. You also have a useless 9 Dot.',
        goal: 'Keep both Easts.',
        mode: 'discard',
        hand: [
          { kind: 'wind', wind: 'east' },
          { kind: 'wind', wind: 'east' },
          { kind: 'suit', suit: 'crak', rank: 4 },
          { kind: 'suit', suit: 'crak', rank: 4 },
          { kind: 'suit', suit: 'crak', rank: 4 },
          { kind: 'suit', suit: 'dot', rank: 9 },
        ],
        correctIds: ['dot-9'],
        explanation:
          'Do not break a key pair for “flexibility” when a clear orphan exists.',
      },
      {
        type: 'quiz',
        prompt: 'Two discards leave you the same tiles-away. What else should you consider?',
        choices: [
          { id: 'pretty', label: 'Which tile looks prettier' },
          { id: 'safe', label: 'Which throw is safer against opponents’ exposures' },
          { id: 'always-honor', label: 'Always throw honors first, no matter what' },
        ],
        correctId: 'safe',
        explanation:
          'When offense is equal, prefer the safer discard so you do not deal into someone’s hand.',
      },
    ],
  },
  {
    id: 'defending',
    title: 'Defending',
    summary: 'Read the table, then make the safe throw.',
    minutes: 7,
    steps: [
      {
        type: 'teach',
        body: [
          'Defense means noticing when someone is close, then avoiding their likely waits.',
          '[[exposure|Exposures]] shout what they are collecting. Multiple pung exposures often mean they need a pair or one last set.',
          'If you must choose between a slightly worse personal discard and feeding an obvious call, lean safe.',
        ],
      },
      {
        type: 'quiz',
        prompt: 'South exposed pung Green, pung Red, and pung White. Who looks dangerous?',
        choices: [
          { id: 'south', label: 'South: dragon pungs suggest a focused honor hand' },
          { id: 'quiet', label: 'Nobody: exposures do not matter' },
        ],
        correctId: 'south',
        explanation:
          'Three dragon pungs is a loud, focused shape. Be careful throwing tiles that finish common dragon hands.',
      },
      {
        type: 'play',
        prompt: 'West has been collecting Craks (exposed pung 7 Crak). Pick the safer discard.',
        situation:
          'Your offense is similar either way. One tile feeds West’s suit; the other looks dead in the piles.',
        goal: 'Do not deal into West’s Crak hand.',
        mode: 'discard',
        hand: [
          { kind: 'suit', suit: 'crak', rank: 5 },
          { kind: 'suit', suit: 'bam', rank: 9 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'bam', rank: 2 },
        ],
        correctIds: ['bam-9'],
        explanation:
          '5 Crak matches West’s exposed Crak direction. Prefer the Bam that does not feed that story (here 9 Bam is the safer singleton).',
      },
      {
        type: 'play',
        prompt: 'Hot table. Your “best” offense feeds an aggressive caller. What do you throw?',
        situation:
          'You are 2 away. West has two big exposures. Throwing Red helps you slightly but West has been parking Red dragons.',
        goal: 'Choose safety over a tiny offensive gain.',
        mode: 'discard',
        hand: [
          { kind: 'dragon', dragon: 'red' },
          { kind: 'suit', suit: 'dot', rank: 1 },
          { kind: 'suit', suit: 'dot', rank: 1 },
          { kind: 'suit', suit: 'dot', rank: 2 },
          { kind: 'suit', suit: 'dot', rank: 2 },
        ],
        correctIds: ['dot-1', 'dot-2'],
        explanation:
          'Dealing into a ready hand loses now. Prefer a Dot from your own shape over feeding West’s Red collect.',
      },
    ],
  },
  {
    id: 'scoring-basics',
    title: 'Scoring mindset',
    summary: 'Value vs speed: choose what the table needs.',
    minutes: 5,
    steps: [
      {
        type: 'teach',
        body: [
          'Different [[pattern|patterns]] pay differently. Harder shapes often score more.',
          'Intermediate skill is knowing when to chase value and when to take a faster, cheaper win.',
          'If opponents look ready, speed beats greed. If the table is quiet and the [[wall|wall]] is long, value is more attractive.',
        ],
      },
      {
        type: 'quiz',
        prompt:
          'Opponents have heavy exposures and the wall is short. You can aim for a rare high hand (5 away) or a simple hand (1 away). What is usually better?',
        choices: [
          { id: 'rare', label: 'Rare high hand' },
          { id: 'simple', label: 'Simple hand that can finish soon' },
        ],
        correctId: 'simple',
        explanation:
          'Late wall + hot table means prioritize finishing. Big value needs time and quiet tables.',
      },
      {
        type: 'play',
        prompt: 'Late wall. Commit to the finishable hand.',
        situation:
          'Fancy dragon hand is still scattered. Your Dot runway is nearly done. Discard the dragon that is distracting you.',
        goal: 'Throw the Green dragon; stay on Dots.',
        mode: 'discard',
        hand: [
          { kind: 'suit', suit: 'dot', rank: 4 },
          { kind: 'suit', suit: 'dot', rank: 4 },
          { kind: 'suit', suit: 'dot', rank: 4 },
          { kind: 'suit', suit: 'dot', rank: 5 },
          { kind: 'suit', suit: 'dot', rank: 5 },
          { kind: 'suit', suit: 'dot', rank: 5 },
          { kind: 'dragon', dragon: 'green' },
        ],
        correctIds: ['dragon-green'],
        explanation:
          'Short wall: finish the Dot hand. The lonely Green is a value distraction.',
      },
    ],
  },
  {
    id: 'charleston-strategy',
    title: 'Charleston strategy',
    summary: 'Pass junk; keep your direction (practiced as discards).',
    minutes: 6,
    steps: [
      {
        type: 'teach',
        body: [
          'The [[charleston|Charleston]] reshapes your hand before play: right, across, left; optional second (left, across, right); optional courtesy across.',
          'Pass tiles outside the suits/honors you want to keep. Do not pass the pairs and pung starts you already like.',
          'Stop the optional Charleston if your hand is already focused. More passing can scramble a good deal.',
        ],
      },
      {
        type: 'play',
        prompt: 'First Charleston pass: which tile leaves your hand?',
        situation:
          'You like Craks and Red dragon. Your hand also has lonely Bam and Dot tiles.',
        goal: 'Pass an orphan, not your Crak/Red direction.',
        mode: 'discard',
        hand: [
          { kind: 'suit', suit: 'crak', rank: 5 },
          { kind: 'suit', suit: 'crak', rank: 5 },
          { kind: 'dragon', dragon: 'red' },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'dot', rank: 9 },
        ],
        correctIds: ['bam-2', 'dot-9'],
        explanation:
          'Pass what you do not want. Bam and Dot orphans go; keep Crak/Red.',
      },
      {
        type: 'quiz',
        prompt:
          'Your hand is already a clear Bam ladder after the first Charleston. Should you always play the optional second?',
        choices: [
          { id: 'always', label: 'Yes, more passes always help' },
          { id: 'maybe', label: 'Not always: you can stop if the hand is focused' },
        ],
        correctId: 'maybe',
        explanation:
          'Optional means optional. Protect a focused hand instead of gambling it away.',
      },
    ],
  },
  {
    id: 'call-judgment',
    title: 'Call judgment',
    summary: 'Exposures help until they trap you. Play Call vs Pass.',
    minutes: 7,
    steps: [
      {
        type: 'teach',
        body: [
          'A good [[call|call]] cuts [[tiles-away|tiles away]] on your real pattern.',
          'A bad call creates an [[exposure|exposure]] that locks you into the wrong story and tells opponents what to defend.',
          'Ask every time: “If I expose this, is my best hand still the same hand?”',
        ],
      },
      {
        type: 'play',
        prompt: 'South discarded South wind. Call or pass?',
        situation:
          'Your pattern needs pung South. You hold two Souths. Calling drops you from 3 away to 2 away.',
        goal: 'Take the set your pattern requires.',
        mode: 'call_or_pass',
        offer: { kind: 'wind', wind: 'south' },
        hand: [
          { kind: 'wind', wind: 'south' },
          { kind: 'wind', wind: 'south' },
          { kind: 'suit', suit: 'dot', rank: 2 },
          { kind: 'suit', suit: 'dot', rank: 2 },
          { kind: 'suit', suit: 'dot', rank: 3 },
        ],
        correctIds: ['call'],
        explanation:
          'The call completes a set the pattern requires and improves tiles-away. Take it.',
      },
      {
        type: 'play',
        prompt: 'Someone discarded Green dragon. Call or pass?',
        situation:
          'You are building a Dot runway. You have two Greens. Calling starts a dragon pung you do not need.',
        goal: 'Stay on Dots.',
        mode: 'call_or_pass',
        offer: { kind: 'dragon', dragon: 'green' },
        hand: [
          { kind: 'dragon', dragon: 'green' },
          { kind: 'dragon', dragon: 'green' },
          { kind: 'suit', suit: 'dot', rank: 4 },
          { kind: 'suit', suit: 'dot', rank: 4 },
          { kind: 'suit', suit: 'dot', rank: 5 },
          { kind: 'suit', suit: 'dot', rank: 5 },
          { kind: 'suit', suit: 'dot', rank: 5 },
        ],
        correctIds: ['pass'],
        explanation:
          'A free pung on the wrong tile is how hands die. Pass and stay on Dots.',
      },
      {
        type: 'quiz',
        prompt: 'Why are exposures dangerous even when the set is useful?',
        choices: [
          { id: 'ugly', label: 'They make the table look messy' },
          { id: 'info', label: 'They reveal your hand type so others can defend' },
          { id: 'illegal', label: 'Exposures are illegal in American mahjong' },
        ],
        correctId: 'info',
        explanation:
          'Useful exposures still leak information. Call when the tempo gain outweighs the reveal.',
      },
    ],
  },
]
