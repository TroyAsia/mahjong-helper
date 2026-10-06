import { describe, expect, it } from 'vitest'
import { enginePatterns, practiceCard } from '../practiceCard'

describe('practiceCard', () => {
  it('loads zod-validated practice patterns', () => {
    expect(practiceCard.patterns.length).toBeGreaterThanOrEqual(10)
    expect(enginePatterns().length).toBe(practiceCard.patterns.length)
  })
})
