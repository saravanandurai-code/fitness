# Fitraa

**Train. Track. Transform.**

Fitraa is a personal commitment system for staying consistent with an active lifestyle. You create
a 30-day routine and Fitraa helps you keep showing up:

**Set goal → Create routine → Complete daily tasks → Build streak → Review progress**

React Native + Expo + TypeScript, built for iOS and Android. This is not a web app; the web target
exists only so the UI can be previewed and screenshotted during development.

## Running it

```bash
cd fitraa
npm install
npm start          # then press i / a, or scan the QR code with Expo Go
```

| Script | What it does |
| --- | --- |
| `npm start` | Expo dev server (iOS, Android, Expo Go) |
| `npm run ios` / `npm run android` | Open directly on a simulator or device |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests for the domain layer (Vitest) |
| `npm run lint` | oxlint |
| `npm run export:web` | Static web build, used for UI previews only |

**No backend is required to run it.** With no Supabase project configured the whole journey is
stored on the device, so a fresh clone works immediately.

## Supabase

Copy `.env.example` to `.env`, fill in the two values from your project (Settings → API), and apply
the schema:

```bash
cp .env.example .env
# then, in the Supabase SQL editor or via the CLI:
supabase db execute --file src/lib/supabase/schema.sql
```

Setting the env vars flips the app onto Supabase: email/password auth appears, and journeys,
routines, logs and achievements move to Postgres. `schema.sql` creates the five tables with row
level security so a client can only reach its own rows, plus a trigger that creates a profile for
every new auth user.

The switch happens in one place — `src/lib/data/index.ts` picks `supabaseRepository` or
`localRepository` behind a single `Repository` interface, so no screen knows where data lives.

## Screens

| Screen | What it does |
| --- | --- |
| **Onboarding** | Four steps: welcome and name, goal, routine targets, start the journey. |
| **Today** | Goal, journey day, a completion ring, the four task rows, and the current streak. Completing a task takes one tap. |
| **Plan** | The routine as set, with an edit sheet for the four targets. |
| **Progress** | 30-day bar, consistency, best streak, per-task completion, and a calendar. |
| **Achievements** | Seven badges; locked ones show progress. |
| **Profile** | Name, current journey, reminders, units, export, delete account. |

## Two decisions worth knowing

**Rest days are not misses.** A routine of "5 workouts a week" means that once five are logged, the
remaining days need no workout — they count as complete. `isWorkoutRequired()` in
`src/features/daily-log/progress.ts` handles this, and it is what stops a correct rest day from
breaking a streak.

**Today never breaks your streak while it is in progress.** `currentStreak()` counts back from
today if today is complete, otherwise from yesterday — so an unfinished morning does not read as a
zero.

## Project layout

```
src/
├── app/                    Expo Router routes
│   ├── (auth)/sign-in      Only reachable when Supabase is configured
│   ├── (tabs)/             today · plan · progress · achievements · profile
│   ├── onboarding/         welcome · goal · routine · start
│   ├── edit-plan.tsx       Modal route
│   └── index.tsx           Entry gate: auth → onboarding → today
├── components/
│   ├── ui/                 Button, Card, ProgressRing, ProgressBar, Input, Modal,
│   │                       Badge, Avatar, Chip, Stepper, StepDots, Screen, Warrior
│   ├── today/              TaskRow, CompletionToast
│   ├── progress/           CalendarGrid
│   └── achievements/       AchievementCard
├── features/               Domain logic, no React Native imports
│   ├── auth/               Supabase session hook
│   ├── journey/            JourneyProvider, streak, stats
│   ├── routine/            Onboarding draft state
│   ├── daily-log/          Day progress and the weekly workout quota
│   └── achievements/       Badge definitions and evaluation
├── lib/
│   ├── data/               Repository interface, local and Supabase adapters
│   ├── supabase/           Client, row types, schema.sql
│   └── utils/date.ts       Local-date helpers
├── constants/              Theme tokens, goals, defaults
└── types/                  The data model
```

Achievements are derived from the logs rather than stored as the source of truth, so they can never
drift out of sync with the journey; unlock timestamps are the only thing persisted.

## Design direction

Dark, athletic and premium: near-black surfaces, one volt accent (`#CCF34A`), a flame accent
reserved for streaks, a muted colour per task, heavy tight display type and generous spacing. The
warrior mark appears only on onboarding, achievements, empty states and journey completion.

## Not in this MVP

Apple Health / HealthKit, Health Connect, wearables, AI workout or nutrition generation, social
features, leaderboards, payments, physical rewards, food and calorie databases, GPS, advanced
workout logging and analytics. Reminders are a stored preference only — no notification scheduling
yet.
