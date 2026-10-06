# AGENTS.md — American Mahjong Trainer

## How to work (read first)

1. **One build step at a time.** Do only the step the user names (or the next unchecked step in "Build steps"). Never start the next step on your own.
2. **Brief explanations only.** Give a short explanation (2-4 sentences) for important steps: architecture decisions, new modules, anything that changes a layer boundary. For routine steps, just state what changed.
3. **Finish a step completely:** code, tests, and the verification listed for that step. Run `npm test` and `npm run lint` before declaring it done.
4. **Prefer targeted edits over rewrites.** Change only what the step needs. Don't reformat or restructure unrelated files.
5. **Stop at the end of each step.** Report: what was built, how it was verified, and the next step's name. Then wait.
6. If a rule is ambiguous or a step would break a convention below, ask instead of guessing.

## Goal

A web app that teaches people American mahjong through guided lessons, practice games against AI opponents, undo/takeback, and a move explainer that says why a move was good or bad. Teaching quality matters more than simulation fidelity.

## Target users (skill levels)

| Level | Who | Needs |
|---|---|---|
| `beginner` | New to the game | Plain language, heavy scaffolding, unlimited undo, frequent hints |
| `intermediate` | Know the rules, learning strategy | Hand selection, defense, Charleston strategy, scoring and payments |
| `advanced` | Want to optimize | Odds, equity analysis, decision comparison |

**Build order: beginner fully first. Intermediate and advanced come only after beginner is complete (see Phase 2).**

## Rules summary (American / NMJL-style)

- 152 tiles: Bams, Cracks, Dots (1-9 x4 each), 4 Winds x4, 3 Dragons x4, 8 Flowers, 8 Jokers.
- Dragons map to suits: Green = Bam, Red = Crak, White = Dot.
- 13 tiles each, dealer gets 14. Seats: East, South, West, North. Play runs counterclockwise.
- A hand wins only by matching a pattern on a card. There is no free-form "4 sets + pair" and **no chows**.
- **Charleston:** mandatory first round (right, across, left); optional second round (left, across, right); optional courtesy pass across.
- **Calls:** a discard may be called only to complete a pung, kong, quint, or sextet in the hand's pattern, or to win. Called sets are exposed.
- **Jokers:** substitute only in sets of 3+, never in pairs or singles. Cannot be called from discards. An exposed joker can be swapped for the real tile it represents.
- Illegal moves create a dead hand (beginner level: warn and offer undo instead).
- Empty wall = draw game.
- **Do not reproduce the official NMJL card (copyrighted).** Use original practice patterns in the same style, labeled "not the official card."
- Scoring and payments are out of scope for beginner. They arrive in the intermediate level.

## Tech stack

- Vite + React + TypeScript (strict mode)
- Zustand (app state, undo stack)
- Immer (immutable updates)
- Zod (validate level configs and pattern data)
- Vitest (unit tests)
- ESLint with `no-restricted-imports` enforcing layers
- localStorage for progress and settings
- No backend, no accounts, no env vars

## Folder structure

```
mahjong-trainer/
├─ package.json, vite.config.ts, tsconfig.json, README.md, AGENTS.md
└─ src/
   ├─ engine/          # PURE TS. Rules only.
   │  ├─ types.ts      # Tile, Seat, GameState, Action
   │  ├─ tiles.ts      # 152-tile set, seeded shuffle
   │  ├─ setup.ts      # deal, wall, initial state
   │  ├─ reducer.ts    # (state, action) -> new state
   │  ├─ legalMoves.ts # getLegalActions(state, seat)
   │  ├─ charleston.ts
   │  ├─ calls.ts      # pung/kong/quint, joker swap
   │  ├─ patterns.ts   # matcher + tiles-away calculator
   │  └─ __tests__/
   ├─ content/
   │  ├─ patterns/practiceCard.ts   # original hands as data
   │  ├─ glossary.ts
   │  └─ lessons/{beginner,intermediate,advanced}/
   ├─ ai/              # imports engine only
   │  ├─ types.ts      # Bot = (view, aiConfig) => Action
   │  ├─ view.ts       # hides other players' tiles
   │  ├─ evaluate.ts
   │  ├─ bots/{randomLegal,patternBot}.ts
   │  └─ __tests__/
   ├─ coach/           # hints + explainer, imports engine only
   │  ├─ explain.ts    # (before, action, after, explainerConfig) -> Explanation
   │  ├─ hint.ts       # (state, seat, hintsConfig) -> Hint
   │  └─ templates.ts
   ├─ levels/
   │  ├─ schema.ts     # Zod schema + LevelConfig, LevelId types
   │  ├─ beginner.json
   │  ├─ intermediate.json
   │  ├─ advanced.json
   │  └─ index.ts      # loadLevel(id) -> validated LevelConfig
   ├─ app/             # glue: only layer that sees everything
   │  ├─ gameStore.ts      # present/past/future + undo/redo
   │  ├─ gameLoop.ts       # runs bots, applies actions
   │  ├─ settingsStore.ts  # holds `level: LevelId`, display options
   │  ├─ useLevelConfig.ts # selector: level -> LevelConfig
   │  └─ persistence.ts
   └─ ui/
      ├─ components/   # Tile, Rack, DiscardPile, Tooltip
      ├─ screens/      # Home, LessonRunner, PracticeGame, CharlestonTrainer
      └─ styles/
```

### Layer dependency rule (enforced by lint)

- `engine` imports **nothing** from this project (no React, no ai, no coach, no app, no ui, no levels).
- `ai` and `coach` import `engine` only (plus config *types* from `levels/schema`).
- `levels` imports nothing except Zod.
- `app` may import everything.
- `ui` imports `app` (and `content`) only. It never imports `engine`, `ai`, or `coach` directly.

## Coding conventions

**Rules engine**
- Pure functions only: same input gives same output. No `Date`, `Math.random`, `console`, I/O, or mutation of arguments. Randomness comes from a seed stored in `GameState.rngSeed`.
- No UI code or UI concepts (no JSX, DOM, strings meant for display, or CSS) in `engine/`.
- `GameState` is plain JSON: no classes, no functions, no `Map`/`Set`. All fields `readonly`.
- Update state through the reducer with Immer's `produce`. Never mutate.
- Every reducer action is validated against `getLegalActions`. Illegal actions return an error result, not an exception.
- Add an invariant check (152 tiles conserved, no duplicates) used in tests.

**Undo**
- Every snapshot is a `GameState`. `dispatch` pushes `present` onto `past`, then applies the reducer. `undo()` rewinds to the player's last decision point, skipping bot moves.

**Levels (single source of truth)**
- App state holds one value: `level: LevelId` (`'beginner' | 'intermediate' | 'advanced'`).
- Everything level-dependent (AI strength, mistake rate, bot delay, explainer depth and decision types, allowed hints, undo limits, warn-vs-dead-hand, lesson set) must read from `LevelConfig` obtained via `useLevelConfig()` (UI/app) or passed as an argument (ai/coach).
- **Never write `if (level === 'beginner')` (or similar) outside `levels/` and `useLevelConfig.ts`.** If a behavior differs by level, add a field to the schema and the three JSON files.
- Adding a level means filling in a JSON file and content, not changing engine code.

**General**
- TypeScript `strict`. No `any`. Prefer discriminated unions for `Action` and `Explanation`.
- Small files, small functions. Name functions by what they return (`getLegalActions`, `tilesAway`).
- Tests live next to the code in `__tests__/`. Every engine, ai, and coach function gets a test.
- UI: accessible by default. Suit markers must not rely on color alone; all interactive elements are keyboard reachable; layout works at 375px.
- No new dependencies without asking.

## Build steps

Check off a step only when its verification passes. Do one step at a time.

### Phase 1: Beginner (build fully first)

**Milestone 1: Playable skeleton**
- [x] **1. Scaffold (1h).** Vite + React + TS, Vitest, ESLint layer rules, empty folders. *Verify:* dev server loads, `npm test` passes, a bad import (engine importing ui) fails lint.
- [x] **2. Tiles and dealing (2h).** `types.ts`, `tiles.ts`, `setup.ts`. *Verify:* 152 tiles, 8 jokers, 8 flowers, same seed gives same deal, hands are 13/13/13/14.
- [x] **3. Draw/discard reducer (3h).** `reducer.ts`, `legalMoves.ts` (draw and discard only). *Verify:* random legal play reaches an empty wall with tile-conservation invariant intact.
- [x] **4. Store with undo (2h).** `gameStore.ts` with `present/past/future`. *Verify:* dispatch-then-undo equals prior state; undo skips bot moves.
- [x] **5. First playable (4h).** Tile/Rack/DiscardPile components, PracticeGame screen, random-legal bot, `gameLoop`, undo button. *Verify:* play vs 3 bots to the end of the wall in the browser; undo works.

**Milestone 2: A real game you can win**
- [x] **6. Patterns and win detection (4h).** `practiceCard.ts` (10-15 original hands, Zod-validated), matcher with joker rules, tiles-away calculator. *Verify:* tests for winning/near-winning hands, jokers rejected in pairs/singles; declare a win in the browser.
- [x] **7. Level config and level in app state (1.5h).** `schema.ts`, `beginner.json` (plus intermediate/advanced stubs with valid values), `loadLevel()`, `settingsStore.level`, `useLevelConfig()`. Bots read `ai.thinkDelayMs` and `ai.strength`. *Verify:* bad config throws a readable error; changing config visibly changes bot speed; grep shows no `level ===` checks outside `levels/` and `useLevelConfig.ts`.
- [ ] **8. Pattern bot (4h).** `evaluate.ts`, `patternBot.ts` using `strength` and `mistakeRate`. *Verify:* simulation of 500 games shows pattern bot beats random bot on average tiles-away; strength 0 behaves like random.

**Milestone 3: Coaching**
- [ ] **9. Pattern meter and hints (3h).** `coach/hint.ts`, meter UI, hint button filtered by `hints.allowed`. *Verify:* hint types not in config are never returned; meter updates after each draw/discard.
- [ ] **10. Discard explainer (4h).** `explain.ts`, `templates.ts`, explanation panel gated by `explainer.depth`. *Verify:* fixtures for good discard, bad discard (breaks a near-complete pattern), and `depth: off` shows nothing.

**Milestone 4: Full American rules**
- [ ] **11. Calls and jokers (5h).** Call-or-pass prompt, exposed melds, joker swap, no-chow rule, friendly illegal-move messages. *Verify:* jokers can't be called from discards; calls only complete 3+ sets; swap returns the correct tile; illegal call shows a message.
- [ ] **12. Call/pass explainer (2h).** Templates for call decisions using the pattern meter. *Verify:* fixtures for "good call" and "call that wrecked your hand."
- [ ] **13. Charleston and trainer (5h).** `charleston.ts` (right, across, left, optional second, courtesy pass), trainer screen, pass explainer. *Verify:* engine tests for pass order and optional-stop rule; trainer gives feedback in the browser.

**Milestone 5: Teaching layer and ship**
- [x] **14. Lessons and glossary (6h).** Lesson runner, beginner lessons/exercises, tap-for-definition tooltips. *Verify:* complete every lesson in order; every glossary term in lesson text has a working tooltip.
- [ ] **15. Persistence and polish (3h).** localStorage for progress and settings (including `level`), responsive layout, color-blind-safe suit markers. *Verify:* refresh keeps progress; usable at 375px; Lighthouse accessibility 90+.
- [ ] **16. Deploy to Vercel (2h).** Confirm `npm run build` (`tsc && vite build`) succeeds. Write `README.md` with install, run, test, build, and deploy instructions (import repo in Vercel, preset Vite, build command `npm run build`, output `dist`). No backend, no env vars, no server code. *Verify:* fresh clone then `npm install && npm run build && npm run preview` works; play a full game and lesson on the live URL.

**Do not begin Phase 2 until all Phase 1 steps are checked and the user says to continue.**

### Phase 2: Other levels (only after Phase 1 is done and deployed)

Each step below is added by editing JSON, content, and coach templates. Engine changes are allowed only for new rules (e.g., scoring). Level-dependent behavior must still flow through `LevelConfig` and `level` in app state.

- [ ] **17. Level selector UI.** Let the user switch `level` in settings; persist it. *Verify:* switching level changes AI strength, explainer depth, and hints with no code branches on level.
- [ ] **18. Intermediate level.** Fill in `intermediate.json`; add scoring and payments (engine, pure), hand-selection and defense hints, Charleston strategy explainer, intermediate lessons. *Verify:* scoring tests; explainer depth `detailed`; stronger bot via config only.
- [ ] **19. Advanced level.** Fill in `advanced.json`; add odds/equity calculations (pure, in `engine/` or a new pure module), `showOdds` hint, `analytical` explainer, advanced lessons. *Verify:* probability tests against known cases; hints include odds; bot strength near max via config only.
- [ ] **20. Redeploy.** Re-run build, update README with level info. *Verify:* `npm run build` passes; all three levels playable on the live URL.

## Definition of done (every step)

- Code and tests written; `npm test` and `npm run lint` pass.
- Layer rules intact (engine free of UI/other-layer imports; engine functions pure).
- No hard-coded level checks outside `levels/` and `useLevelConfig.ts`.
- Brief report to the user, then stop.
