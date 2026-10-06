import { z } from 'zod'

export const levelIdSchema = z.enum(['beginner', 'intermediate', 'advanced'])
export type LevelId = z.infer<typeof levelIdSchema>

export const explainerDepthSchema = z.enum([
  'off',
  'brief',
  'detailed',
  'analytical',
])
export type ExplainerDepth = z.infer<typeof explainerDepthSchema>

export const decisionTypeSchema = z.enum([
  'discard',
  'call',
  'charleston',
  'win',
])
export type DecisionType = z.infer<typeof decisionTypeSchema>

export const hintTypeSchema = z.enum([
  'tilesAway',
  'bestPattern',
  'safeDiscard',
  'callAdvice',
  'charlestonAdvice',
  'showOdds',
])
export type HintType = z.infer<typeof hintTypeSchema>

export const undoConfigSchema = z.union([
  z.object({
    mode: z.literal('unlimited'),
  }),
  z.object({
    mode: z.literal('limited'),
    limit: z.number().int().positive(),
  }),
])
export type UndoConfig = z.infer<typeof undoConfigSchema>

export const aiConfigSchema = z.object({
  thinkDelayMs: z.number().int().nonnegative(),
  strength: z.number().min(0).max(1),
  mistakeRate: z.number().min(0).max(1),
})

export const explainerConfigSchema = z.object({
  depth: explainerDepthSchema,
  decisionTypes: z.array(decisionTypeSchema).min(0),
})

export const hintsConfigSchema = z.object({
  allowed: z.array(hintTypeSchema),
})

export const lessonSetSchema = z.object({
  id: z.string().min(1),
  lessons: z.array(z.string().min(1)),
})

export const levelConfigSchema = z.object({
  id: levelIdSchema,
  label: z.string().min(1),
  ai: aiConfigSchema,
  explainer: explainerConfigSchema,
  hints: hintsConfigSchema,
  undo: undoConfigSchema,
  warnVsDeadHand: z.boolean(),
  lessonSet: lessonSetSchema,
})

export type LevelConfig = z.infer<typeof levelConfigSchema>

/** Format Zod issues into a short, readable message for callers/tests. */
export function formatLevelConfigError(
  levelLabel: string,
  error: z.ZodError,
): string {
  const details = error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)'
      return `${path}: ${issue.message}`
    })
    .join('; ')
  return `Invalid level config for "${levelLabel}": ${details}`
}
