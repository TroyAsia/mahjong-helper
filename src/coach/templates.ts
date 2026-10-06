import type { Explanation } from './types'

export function discardGood(patternName: string, away: number): Explanation {
  return {
    kind: 'discard',
    verdict: 'good',
    summary: 'Solid discard',
    detail: `That discard keeps you close to ${patternName} (${away} away).`,
  }
}

export function discardBad(patternName: string, before: number, after: number): Explanation {
  return {
    kind: 'discard',
    verdict: 'bad',
    summary: 'Costly discard',
    detail: `That break moved you from ${before} to ${after} away on ${patternName}.`,
  }
}

export function discardOk(away: number): Explanation {
  return {
    kind: 'discard',
    verdict: 'ok',
    summary: 'Reasonable discard',
    detail: `You are about ${away} tiles away from a practice pattern.`,
  }
}

export function callGood(
  patternName: string,
  before: number,
  after: number,
): Explanation {
  return {
    kind: 'call',
    verdict: 'good',
    summary: 'Helpful call',
    detail: `Calling moved you from ${before} to ${after} away on ${patternName}. The set fits your pattern, so exposing it costs little.`,
  }
}

export function callOk(patternName: string, away: number): Explanation {
  return {
    kind: 'call',
    verdict: 'ok',
    summary: 'Call with no real gain',
    detail: `You are still ${away} away on ${patternName}. A call that doesn't bring you closer just shows your opponents your tiles.`,
  }
}

export function callBad(
  newPattern: string,
  oldPattern: string,
  before: number,
  after: number,
): Explanation {
  const switched = newPattern !== oldPattern
  return {
    kind: 'call',
    verdict: 'bad',
    summary: 'Risky call',
    detail: switched
      ? `That call locks you into ${newPattern} (${after} away) and drops ${oldPattern}, where you were only ${before} away.`
      : `That call left you ${after} away on ${newPattern}, worse than the ${before} away you had before.`,
  }
}

export function passGood(): Explanation {
  return {
    kind: 'call',
    verdict: 'good',
    summary: 'Smart pass',
    detail:
      'Calling that discard would not have brought you closer to a pattern, so keeping your hand hidden was right.',
  }
}

export function passMissedCall(patternName: string, gain: number): Explanation {
  return {
    kind: 'call',
    verdict: 'ok',
    summary: 'Missed a helpful call',
    detail: `Calling would have moved you ${gain} tile${gain === 1 ? '' : 's'} closer on ${patternName}.`,
  }
}

export function passMissedWin(): Explanation {
  return {
    kind: 'call',
    verdict: 'bad',
    summary: 'You could have won',
    detail:
      'That discard completed your hand. You can declare Mahjong on a discard instead of passing.',
  }
}

export function charlestonGood(patternName: string): Explanation {
  return {
    kind: 'charleston',
    verdict: 'good',
    summary: 'Good pass',
    detail: `None of those tiles help ${patternName}, your closest pattern.`,
  }
}

export function charlestonOk(patternName: string): Explanation {
  return {
    kind: 'charleston',
    verdict: 'ok',
    summary: 'Acceptable pass',
    detail: `One of those tiles was useful for ${patternName}. Try keeping tiles that fit your closest pattern.`,
  }
}

export function charlestonBad(patternName: string, cost: number): Explanation {
  return {
    kind: 'charleston',
    verdict: 'bad',
    summary: 'Costly pass',
    detail: `You passed ${cost} tiles that fit ${patternName}. Pass tiles that don't belong to your closest pattern.`,
  }
}

export function noExplanation(): Explanation {
  return {
    kind: 'none',
    verdict: 'neutral',
    summary: '',
    detail: '',
  }
}
