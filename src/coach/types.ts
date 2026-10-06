export type Explanation = {
  readonly kind: 'discard' | 'call' | 'charleston' | 'win' | 'none'
  readonly verdict: 'good' | 'ok' | 'bad' | 'neutral'
  readonly summary: string
  readonly detail: string
}

export type Hint = {
  readonly type: string
  readonly text: string
}
