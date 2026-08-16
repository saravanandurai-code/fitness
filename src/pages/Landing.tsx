import { Link, Navigate } from 'react-router-dom'
import { Card } from '../components/ui'
import { useAppState } from '../state/store'

const FEATURES = [
  {
    emoji: '🌤️',
    title: 'A calm daily view',
    body: 'Sleep, movement, food, water and habits in one screen — with one suggestion, not twenty numbers.',
  },
  {
    emoji: '🏋️',
    title: 'Workouts that fit',
    body: 'Pick a simple plan, log sets and reps, and see your weekly count. Training is one part of the day, not all of it.',
  },
  {
    emoji: '😴',
    title: 'Sleep you can see',
    body: 'Log bedtime and wake-up, track your average and how consistent your schedule really is.',
  },
  {
    emoji: '🥗',
    title: 'Food without counting',
    body: 'Log meals in plain words. Track protein and water. Better choices, not perfect eating.',
  },
  {
    emoji: '🔥',
    title: 'Habits without guilt',
    body: 'Three to five habits you actually keep. A missed day is just a day, never a broken streak.',
  },
  {
    emoji: '✨',
    title: 'A companion that knows your week',
    body: 'Ask what to do today, whether to train, or why you feel tired — answered from what you tracked.',
  },
]

const LOOP = ['Plan', 'Live', 'Track', 'Reflect', 'Improve']

export default function Landing() {
  const state = useAppState()
  if (state.onboarded) return <Navigate to="/" replace />

  return (
    <div className="landing">
      <div className="landing-inner">
        <header className="row-between">
          <div className="brand">
            <span className="brand-mark" aria-hidden="true">
              S
            </span>
            <span className="brand-name">Sarv</span>
          </div>
          <Link to="/onboarding" className="btn btn-sm">
            Get started
          </Link>
        </header>

        <section className="landing-hero">
          <p className="landing-tag">Live better, every day.</p>
          <h1>A simple way to build healthy routines around the life you already live.</h1>
          <p className="landing-sub">
            Work, workout, eat, sleep, live. Sarv keeps track of the parts that matter and answers
            one question each morning — <em>am I taking care of myself while living my normal life?</em>
          </p>
          <div className="landing-cta">
            <Link to="/onboarding" className="btn">
              Set up my routine
            </Link>
            <span className="small muted">Takes about two minutes · Your data stays in this browser</span>
          </div>
        </section>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <Card key={f.title} className="feature">
              <div className="feature-emoji" aria-hidden="true">
                {f.emoji}
              </div>
              <h3>{f.title}</h3>
              <p className="small muted">{f.body}</p>
            </Card>
          ))}
        </div>

        <Card style={{ marginTop: 32 }}>
          <span className="section-label">The daily loop</span>
          <div className="loop-steps">
            {LOOP.map((step, i) => (
              <span key={step} className="row" style={{ gap: 8 }}>
                <span className="loop-step">{step}</span>
                {i < LOOP.length - 1 ? (
                  <span className="loop-arrow" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </span>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>
            Set realistic goals, go through your normal day, track what matters, understand how it
            went, and make one better choice tomorrow. That is the whole product.
          </p>
        </Card>

        <p className="footnote" style={{ marginTop: 28 }}>
          Sarv is a lifestyle companion, not a medical product. Scores and suggestions are guidance
          only and should not replace advice from a qualified healthcare professional.
        </p>
      </div>
    </div>
  )
}
