# Sarv

**Live better, every day.**
A simple way to build healthy routines around the life you already live.

Sarv is a web MVP of a healthy-lifestyle companion for working professionals. It answers one
question each day — *am I taking care of myself while living my normal life?* — and keeps everything
else deliberately small: sleep, movement, food, water and a handful of habits.

Work. Workout. Eat. Sleep. Live.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build` | Type-check and build to `docs/` (what GitHub Pages serves) |
| `npm run preview` | Serve the production build |
| `npm test` | Run the unit tests (Vitest) |
| `npm run lint` | Lint with oxlint |

No backend or account is required. Everything you track is stored in the browser's
`localStorage` under the key `sarv.state.v1`, and can be exported as JSON from **Profile → Your
data**. The routing uses a hash router, so the built `docs/` folder can be served from any static
host without server rewrites.

## Live deployment

**https://saravanandurai-code.github.io/fitness/**

The site is served by GitHub Pages straight from the branch: **Settings → Pages → Source
"Deploy from a branch" → branch `claude/sarv-lifestyle-app-mvp-4v97bd`, folder `/docs`.**

`npm run build` therefore outputs to `docs/`, and that folder is committed. The
`Build Sarv` workflow rebuilds and re-commits it on every push, so the live site follows the
source without any manual publishing step.

The Vite `base` is `/fitness/` to match the project URL. For a root-domain host (Netlify, Vercel,
a custom domain) build with `BASE_PATH=/ npm run build` instead.

## What's in the MVP

| Area | What it does |
| --- | --- |
| **Onboarding** | Five steps — profile, goal, routine, targets, habits. Targets and suggested habits adapt to the chosen goal. |
| **Home** | Today's date, sleep, workout, activity, water, nutrition, habits, a daily balance score, and one short recommendation. Quick updates for water, steps, sleep, meals and workouts. |
| **Workout** | Curated plans (Full Body, Push/Pull/Legs, Upper/Lower, Easy Movement) or a custom session. Track sets, reps, weight and duration; complete a session and see a summary; weekly count and history. |
| **Sleep** | Manual bedtime / wake-up entry with calculated duration, optional quality, weekly average, usual bedtime, and schedule consistency. Every entry is labelled as entered by you. |
| **Nutrition** | Meals in plain words (breakfast, lunch, dinner, snacks), protein, optional calories, and glass-by-glass water tracking. |
| **Habits** | Three to five daily or weekly habits, one-tap completion, a week view, and pausing instead of deleting. |
| **Progress** | Weekly workouts, average sleep, average steps, hydration, habit completion, healthy days, trends against last week, and a plain-language summary. |
| **Ask Sarv** | A companion, reachable from anywhere, that answers questions like *should I workout today?* using only what you have tracked. |

### The daily balance score

A 0–100 guidance indicator, weighted across sleep (25), nutrition (20), movement (15), workout
(15), habits (15) and hydration (10). Two deliberate design decisions:

- The workout component is **pace-aware**: if your week is on track for your target, a rest day
  scores full marks. Rest is part of the plan.
- A weekly habit that has already met its weekly target counts as complete on the days you don't
  tick it.

The score is positioned as guidance, never as a verdict — a low number is described as a busy day,
not a bad one.

### A "healthy day"

The core product metric is *healthy days per week*: a day where at least three of sleep, movement,
nutrition, hydration and habits landed at 70% or more of your goals. The goal is consistency, not
perfection.

## Project layout

```
src/
  lib/            Domain layer — no React
    types.ts        Data model (user, daily health, workout, nutrition, habit)
    date.ts         Local-date, duration and time-of-day helpers
    defaults.ts     Targets, goals, habit library, exercise library, workout plans
    summary.ts      Day summary, balance score, weekly summary, healthy days
    advice.ts       Daily recommendation, weekly progress message, AI companion
    storage.ts      localStorage load/save/migrate
    sample.ts       Two weeks of believable sample history
    __tests__/      Vitest unit tests for the domain layer
  state/store.tsx  React context store and all app actions
  components/      Layout, companion, and UI primitives
  pages/           Landing, Onboarding, Home, Workout, Sleep, Nutrition, Habits, Progress, Profile
  styles.css       Design tokens and all component styles (light + dark)
```

The domain layer is plain TypeScript and fully unit-tested; React components read from it through
the store. Adding a real backend later means replacing `storage.ts` and the store internals — the
rest is unaffected.

## The AI Health Companion

The companion is **rule-based in this MVP**, not a language model. It classifies the question
(plan / workout / missed session / food / tiredness / sleep / hydration / week) and composes an
answer from your actual data — last night's sleep, days since your last workout, protein so far,
water, habits — so it never invents numbers and works offline. Health answers carry an explicit
note that this is general lifestyle guidance and not medical advice.

Swapping in a model-backed companion later is a matter of replacing `askCompanion()` in
`src/lib/advice.ts`, keeping the same data-summary input.

## Design principles this MVP follows

1. **Simple over comprehensive** — not every metric is on screen.
2. **Lifestyle over fitness** — the workout is one tile of six.
3. **Consistency over perfection** — a missed habit reads as "yesterday didn't go as planned", never "streak broken".
4. **Action over analytics** — every insight ends in one small next step.
5. **Personal over generic** — targets, habits and advice follow your stated routine.
6. **Calm over addictive** — reminders are quiet and in-app only.
7. **Human over clinical** — a companion, not a medical dashboard.

## Not in this MVP

Native apps, wearable and health-platform sync (automatic sleep and step tracking), a food
database with calorie recognition, social features, and push notifications. Sleep and steps are
manually entered and labelled as such, so automatic sources can be distinguished when they arrive.

---

Sarv is a lifestyle companion, not a medical product. Scores and suggestions are general guidance
and should not replace advice from a qualified healthcare professional.
