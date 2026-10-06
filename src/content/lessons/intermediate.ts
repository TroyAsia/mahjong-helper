import type { InteractiveLesson } from './types'

export const intermediateLessons: readonly InteractiveLesson[] = [
  {
    id: 'which-to-discard',
    title: 'Which tiles to discard',
    summary: 'Protect your closest pattern; throw the orphans.',
    minutes: 5,
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
        type: 'scenario',
        prompt: 'Pick the better discard.',
        situation:
          'Closest hand wants Bam kongs. You hold three 1 Bam, three 2 Bam, and a stray West with no wind plan.',
        tiles: [
          { kind: 'suit', suit: 'bam', rank: 1 },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'wind', wind: 'west' },
        ],
        choices: [
          { id: '1b', label: 'Discard 1 Bam' },
          { id: 'west', label: 'Discard West' },
        ],
        correctId: 'west',
        explanation:
          'West is not serving the Bam pattern. Keep the Bam sets progressing.',
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
      {
        type: 'scenario',
        prompt: 'Should you break the pair?',
        situation:
          'You are 1 away with a pair of Easts needed. You also have a useless 9 Dot. Wall is still long.',
        choices: [
          { id: 'east', label: 'Discard an East to “stay flexible”' },
          { id: 'dot', label: 'Discard 9 Dot and keep the East pair' },
        ],
        correctId: 'dot',
        explanation:
          'Do not break a key pair for flexibility when a clear orphan exists. Keep the win path.',
      },
    ],
  },
  {
    id: 'defending',
    title: 'Defending',
    summary: 'Read exposures and avoid dealing the obvious tile.',
    minutes: 5,
    steps: [
      {
        type: 'teach',
        body: [
          'Defense means noticing when someone is close — then avoiding their likely waits.',
          '[[exposure|Exposures]] shout what they are collecting. Multiple pung exposures often mean they need a pair or one last set.',
          'If you must choose between a slightly worse personal discard and feeding an obvious call, lean safe.',
        ],
      },
      {
        type: 'scenario',
        prompt: 'Who looks dangerous?',
        situation:
          'South has exposed pung Green, pung Red, pung White. Wall is getting short.',
        choices: [
          { id: 'south', label: 'South — dragon pungs suggest a focused honor hand' },
          { id: 'quiet', label: 'Nobody — exposures do not matter' },
        ],
        correctId: 'south',
        explanation:
          'Three dragon pungs is a loud, focused shape. Be careful throwing the tiles that finish common dragon hands (pairs, winds, flowers depending on the card).',
      },
      {
        type: 'quiz',
        prompt: 'A player just exposed a kong of 7 Crak. Which is usually safer to throw?',
        choices: [
          { id: '7c', label: 'Another 7 Crak' },
          { id: 'orphan', label: 'A tile that is already heavily discarded and unused in their exposures' },
        ],
        correctId: 'orphan',
        explanation:
          'Matching their exposed set can be deadly if they still want more of that tile family. Prefer tiles that look dead.',
      },
      {
        type: 'scenario',
        prompt: 'Offense vs defense.',
        situation:
          'You are 2 away. West has two big exposures and has been calling aggressively. Your “best” offensive discard is a tile West has been collecting.',
        choices: [
          { id: 'feed', label: 'Throw West’s tile — chase your hand' },
          { id: 'safe', label: 'Throw a safer tile even if you stay 2–3 away' },
        ],
        correctId: 'safe',
        explanation:
          'Dealing into a ready hand loses now. A slightly slower shape is better than feeding the table leader.',
      },
    ],
  },
  {
    id: 'scoring-basics',
    title: 'Scoring mindset',
    summary: 'Value vs speed — choose what the table needs.',
    minutes: 4,
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
        prompt: 'Opponents have heavy exposures and the wall is short. You can aim for a rare high hand (5 away) or a simple hand (1 away). What is usually better?',
        choices: [
          { id: 'rare', label: 'Rare high hand' },
          { id: 'simple', label: 'Simple hand that can finish soon' },
        ],
        correctId: 'simple',
        explanation:
          'Late wall + hot table → prioritize finishing. Big value needs time and quiet tables.',
      },
      {
        type: 'scenario',
        prompt: 'Pick a plan.',
        situation:
          'Early deal, nobody has exposed. You are 3 away from a higher pattern and 2 away from a cheap one.',
        choices: [
          { id: 'flex', label: 'Stay flexible a few turns; see which tiles arrive' },
          { id: 'force', label: 'Force the cheap hand immediately no matter what' },
        ],
        correctId: 'flex',
        explanation:
          'Early and quiet: you can probe both paths for a bit. Commit when draws clarify.',
      },
    ],
  },
  {
    id: 'charleston-strategy',
    title: 'Charleston strategy',
    summary: 'Pass junk; keep your direction.',
    minutes: 5,
    steps: [
      {
        type: 'teach',
        body: [
          'The [[charleston|Charleston]] reshapes your hand before play: right, across, left; optional second (left, across, right); optional courtesy across.',
          'Pass tiles outside the suits/honors you want to keep. Do not pass the pairs and pung starts you already like.',
          'Stop the optional Charleston if your hand is already focused — more passing can scramble a good deal.',
        ],
      },
      {
        type: 'scenario',
        prompt: 'What do you pass first?',
        situation:
          'You like Craks and Red dragon. Your hand also has two lonely Bams and a Dot.',
        tiles: [
          { kind: 'suit', suit: 'crak', rank: 5 },
          { kind: 'dragon', dragon: 'red' },
          { kind: 'suit', suit: 'bam', rank: 2 },
          { kind: 'suit', suit: 'dot', rank: 9 },
        ],
        choices: [
          { id: 'keep-pass-crak', label: 'Pass Craks and Red to “see what comes back”' },
          { id: 'pass-orphans', label: 'Pass the Bam and Dot orphans; keep Crak/Red' },
        ],
        correctId: 'pass-orphans',
        explanation:
          'Pass what you do not want. Keep the tiles that define your direction.',
      },
      {
        type: 'quiz',
        prompt: 'Your hand is already a clear Bam ladder after the first Charleston. Should you always play the optional second?',
        choices: [
          { id: 'always', label: 'Yes — more passes always help' },
          { id: 'maybe', label: 'Not always — you can stop if the hand is focused' },
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
    summary: 'Exposures help — until they trap you.',
    minutes: 5,
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
        type: 'scenario',
        prompt: 'Good call or wreck?',
        situation:
          'Pattern needs pung South. You hold two Souths. South is discarded. Calling drops you from 3 away to 2 away.',
        choices: [
          { id: 'good', label: 'Good call' },
          { id: 'wreck', label: 'Wreck — never call winds' },
        ],
        correctId: 'good',
        explanation:
          'The call completes a set the pattern requires and improves tiles-away. Take it.',
      },
      {
        type: 'scenario',
        prompt: 'Good call or wreck?',
        situation:
          'You are building a Dot runway. Someone discards Green dragon. You have two Greens. Calling would start a dragon pung you do not need.',
        choices: [
          { id: 'good', label: 'Call — free pung' },
          { id: 'wreck', label: 'Pass — it hijacks your Dot plan' },
        ],
        correctId: 'wreck',
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
