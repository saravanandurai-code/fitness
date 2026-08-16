import { useMemo, useState } from 'react'
import { Card, CardTitle, Meter } from '../components/ui'
import { weeklyProgressMessage } from '../lib/advice'
import { addDays, formatDuration, formatShortDate, shortDayLabel, startOfWeek, todayISO } from '../lib/date'
import { getWeekSummary } from '../lib/summary'
import type { WeekSummary } from '../lib/summary'
import { useAppState } from '../state/store'

function Trend({
  label,
  current,
  previous,
  format,
  higherIsBetter = true,
}: {
  label: string
  current: number
  previous: number
  format: (n: number) => string
  higherIsBetter?: boolean
}) {
  const diff = current - previous
  const better = higherIsBetter ? diff > 0 : diff < 0
  const className = diff === 0 ? 'trend-flat' : better ? 'trend-up' : 'trend-down'
  const arrow = diff === 0 ? '→' : diff > 0 ? '↑' : '↓'
  return (
    <div className="trend">
      <span className="small">{label}</span>
      <span className="row" style={{ gap: 10 }}>
        <span className="strong mono-num">{format(current)}</span>
        <span className={`tiny ${className}`}>
          {previous === 0 && current === 0
            ? 'no data yet'
            : diff === 0
              ? `${arrow} same as last week`
              : `${arrow} ${format(Math.abs(diff))} vs last week`}
        </span>
      </span>
    </div>
  )
}

export default function Progress() {
  const state = useAppState()
  const today = todayISO()
  const [offset, setOffset] = useState(0)

  const anchor = addDays(startOfWeek(today), offset * 7)
  const week: WeekSummary = useMemo(() => getWeekSummary(state, anchor, today), [state, anchor, today])
  const previous: WeekSummary = useMemo(
    () => getWeekSummary(state, addDays(anchor, -7), today),
    [state, anchor, today],
  )
  const message = useMemo(() => weeklyProgressMessage(week, previous), [week, previous])

  const maxScore = 100

  return (
    <div className="stack">
      <div className="page-head row-between">
        <div>
          <h1>Progress</h1>
          <p className="muted small">Is your lifestyle getting a little easier to keep up?</p>
        </div>
        <div className="day-nav">
          <button
            type="button"
            className="btn-icon"
            aria-label="Previous week"
            onClick={() => setOffset(offset - 1)}
          >
            ‹
          </button>
          <span className="small strong nowrap">
            {offset === 0 ? 'This week' : `${formatShortDate(week.start)} – ${formatShortDate(week.end)}`}
          </span>
          <button
            type="button"
            className="btn-icon"
            aria-label="Next week"
            disabled={offset >= 0}
            onClick={() => setOffset(offset + 1)}
          >
            ›
          </button>
        </div>
      </div>

      <Card className="stack-sm">
        <CardTitle
          title="Healthy days"
          action={<span className="pill pill-brand">{week.healthyDays} this week</span>}
        />
        <p className="small muted">
          A healthy day is one where at least three of sleep, movement, nutrition, hydration and
          habits landed close to your goals. The aim is a few of these every week — not seven.
        </p>
        <div className="weekbars" style={{ marginTop: 8 }}>
          {week.scores.map((s) => (
            <div key={s.date} className={`weekbar${s.date === today ? ' is-today' : ''}`}>
              <div className="weekbar-track">
                <div
                  className={`weekbar-fill${s.hasData ? '' : ' empty'}`}
                  style={{ height: `${s.hasData ? Math.max(6, (s.score / maxScore) * 100) : 4}%` }}
                  title={s.hasData ? `Score ${s.score}` : 'Nothing tracked'}
                />
              </div>
              <span className="weekbar-label">{shortDayLabel(s.date)}</span>
            </div>
          ))}
        </div>
        <div className="legend" style={{ marginTop: 4 }}>
          <span className="row" style={{ gap: 6 }}>
            <span className="legend-swatch" style={{ background: 'var(--brand)' }} /> Daily balance
            score
          </span>
          <span className="row" style={{ gap: 6 }}>
            <span className="legend-swatch" style={{ background: 'color-mix(in srgb, var(--ink) 12%, transparent)' }} />{' '}
            Nothing tracked
          </span>
        </div>
      </Card>

      <Card>
        <CardTitle title={offset === 0 ? 'This week' : 'That week'} />
        <div className="tiles">
          <div className="tile" data-accent="workout" style={{ cursor: 'default' }}>
            <div className="tile-head">
              <span aria-hidden="true">🏋️</span> Workouts
            </div>
            <div className="tile-value">{week.workouts}</div>
            <div className="tile-sub">target {week.workoutTarget} a week</div>
            <Meter ratio={week.workouts / Math.max(1, week.workoutTarget)} accent="var(--c-workout)" />
          </div>

          <div className="tile" data-accent="sleep" style={{ cursor: 'default' }}>
            <div className="tile-head">
              <span aria-hidden="true">😴</span> Avg sleep
            </div>
            <div className="tile-value">
              {week.sleepNights ? formatDuration(week.avgSleepMinutes) : '—'}
            </div>
            <div className="tile-sub">{week.sleepNights} nights logged</div>
            <Meter ratio={week.avgSleepMinutes / state.targets.sleepMinutes} accent="var(--c-sleep)" />
          </div>

          <div className="tile" data-accent="move" style={{ cursor: 'default' }}>
            <div className="tile-head">
              <span aria-hidden="true">🚶</span> Avg steps
            </div>
            <div className="tile-value">{week.avgSteps.toLocaleString()}</div>
            <div className="tile-sub">goal {state.targets.steps.toLocaleString()}</div>
            <Meter ratio={week.avgSteps / state.targets.steps} accent="var(--c-move)" />
          </div>

          <div className="tile" data-accent="water" style={{ cursor: 'default' }}>
            <div className="tile-head">
              <span aria-hidden="true">💧</span> Hydration
            </div>
            <div className="tile-value">{week.hydrationPercent}%</div>
            <div className="tile-sub">of your daily water goal</div>
            <Meter ratio={week.hydrationPercent / 100} accent="var(--c-water)" />
          </div>

          <div className="tile" data-accent="habit" style={{ cursor: 'default' }}>
            <div className="tile-head">
              <span aria-hidden="true">🔥</span> Habits
            </div>
            <div className="tile-value">{week.habitPercent}%</div>
            <div className="tile-sub">
              {week.habitsCompleted} / {week.habitsPossible} completed
            </div>
            <Meter ratio={week.habitPercent / 100} accent="var(--c-habit)" />
          </div>

          <div className="tile" style={{ cursor: 'default' }}>
            <div className="tile-head">
              <span aria-hidden="true">⚖️</span> Avg balance
            </div>
            <div className="tile-value">{week.avgScore || '—'}</div>
            <div className="tile-sub">across tracked days</div>
            <Meter ratio={week.avgScore / 100} />
          </div>
        </div>
      </Card>

      <Card className="stack-sm">
        <CardTitle title="Compared with last week" />
        <Trend
          label="Average sleep"
          current={week.avgSleepMinutes}
          previous={previous.avgSleepMinutes}
          format={(n) => (n ? formatDuration(n) : '—')}
        />
        <Trend
          label="Workouts"
          current={week.workouts}
          previous={previous.workouts}
          format={(n) => `${n}`}
        />
        <Trend
          label="Average steps"
          current={week.avgSteps}
          previous={previous.avgSteps}
          format={(n) => n.toLocaleString()}
        />
        <Trend
          label="Habit completion"
          current={week.habitPercent}
          previous={previous.habitPercent}
          format={(n) => `${n}%`}
        />
        <Trend
          label="Bedtime consistency"
          current={week.bedTimeSpread ?? 0}
          previous={previous.bedTimeSpread ?? 0}
          format={(n) => (n ? `±${Math.round(n)}m` : '—')}
          higherIsBetter={false}
        />
      </Card>

      <section className="reco">
        <span className="section-label">What this says</span>
        <h3 style={{ marginTop: 6 }}>{message.headline}</h3>
        <p className="small">{message.body}</p>
      </section>

      <p className="footnote">
        Sarv keeps analytics deliberately light. If a number here doesn't lead to a simple next
        action, it probably doesn't belong on this screen.
      </p>
    </div>
  )
}
