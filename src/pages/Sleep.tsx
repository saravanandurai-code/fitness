import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardTitle, Field, FieldGroup, Meter } from '../components/ui'
import {
  addDays,
  formatDuration,
  formatTime,
  lastNDays,
  minutesToHHMM,
  relativeDayLabel,
  shortDayLabel,
  sleepMinutes,
  todayISO,
} from '../lib/date'
import { getWeekSummary } from '../lib/summary'
import { useActions, useAppState } from '../state/store'
import type { SleepQuality } from '../lib/types'

const QUALITIES: { value: SleepQuality; label: string; emoji: string }[] = [
  { value: 'poor', label: 'Poor', emoji: '😖' },
  { value: 'okay', label: 'Okay', emoji: '😐' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'great', label: 'Great', emoji: '😄' },
]

export default function Sleep() {
  const state = useAppState()
  const actions = useActions()
  const today = todayISO()

  const [date, setDate] = useState(today)
  const existing = state.sleep[date]

  const [bedTime, setBedTime] = useState(existing?.bedTime ?? state.profile?.typicalSleepTime ?? '23:30')
  const [wakeTime, setWakeTime] = useState(existing?.wakeTime ?? state.profile?.typicalWakeTime ?? '07:00')
  const [quality, setQuality] = useState<SleepQuality | undefined>(existing?.quality)
  const [saved, setSaved] = useState(false)

  const stateRef = useRef(state)
  stateRef.current = state

  // Re-load the form whenever the selected night changes.
  useEffect(() => {
    const entry = stateRef.current.sleep[date]
    const profile = stateRef.current.profile
    setBedTime(entry?.bedTime ?? profile?.typicalSleepTime ?? '23:30')
    setWakeTime(entry?.wakeTime ?? profile?.typicalWakeTime ?? '07:00')
    setQuality(entry?.quality)
    setSaved(false)
  }, [date])

  const draftMinutes = sleepMinutes(bedTime, wakeTime)
  const target = state.targets.sleepMinutes
  const week = useMemo(() => getWeekSummary(state, today), [state, today])
  const recent = lastNDays(today, 7)

  const save = () => {
    actions.saveSleep({ date, bedTime, wakeTime, quality })
    setSaved(true)
  }

  return (
    <div className="stack">
      <div className="page-head">
        <h1>Sleep</h1>
        <p className="muted small">
          Enough sleep, at roughly the same time each night, does more for your day than anything
          else you can track here.
        </p>
      </div>

      <Card className="stack">
        <CardTitle
          title="Log a night"
          action={
            <div className="day-nav">
              <button
                type="button"
                className="btn-icon"
                aria-label="Previous day"
                onClick={() => setDate(addDays(date, -1))}
              >
                ‹
              </button>
              <span className="small strong nowrap">{relativeDayLabel(date, today)}</span>
              <button
                type="button"
                className="btn-icon"
                aria-label="Next day"
                disabled={date >= today}
                onClick={() => setDate(addDays(date, 1))}
              >
                ›
              </button>
            </div>
          }
        />

        <div className="field-row">
          <Field label="Sleep time">
            <input className="input" type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)} />
          </Field>
          <Field label="Wake-up time">
            <input className="input" type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} />
          </Field>
        </div>

        <div className="row-between">
          <div>
            <div className="section-label">Sleep duration</div>
            <div className="tile-value">{formatDuration(draftMinutes)}</div>
            <div className="tile-sub">
              {formatDuration(draftMinutes)} / {formatDuration(target)} target
            </div>
          </div>
          <span className="source-tag">Entered by you</span>
        </div>
        <Meter ratio={draftMinutes / target} accent="var(--c-sleep)" />

        <FieldGroup label="How did it feel? (optional)">
          <div className="row wrap">
            {QUALITIES.map((q) => (
              <button
                key={q.value}
                type="button"
                className={`chip${quality === q.value ? ' selected' : ''}`}
                onClick={() => setQuality(quality === q.value ? undefined : q.value)}
              >
                <span aria-hidden="true">{q.emoji}</span> {q.label}
              </button>
            ))}
          </div>
        </FieldGroup>

        <div className="row" style={{ justifyContent: 'flex-end', gap: 10 }}>
          {existing ? (
            <button type="button" className="btn btn-ghost" onClick={() => actions.deleteSleep(date)}>
              Remove entry
            </button>
          ) : null}
          <button type="button" className="btn" onClick={save}>
            {existing ? 'Update sleep' : 'Save sleep'}
          </button>
        </div>
        {saved ? <p className="small muted center">Saved — nice work keeping it up to date.</p> : null}
      </Card>

      <Card className="stack-sm">
        <CardTitle title="This week" action={<span className="pill">{week.sleepNights} nights logged</span>} />
        <div className="tiles">
          <div className="tile" style={{ cursor: 'default' }}>
            <div className="tile-head">Average sleep</div>
            <div className="tile-value">
              {week.sleepNights ? formatDuration(week.avgSleepMinutes) : '—'}
            </div>
            <div className="tile-sub">target {formatDuration(target)}</div>
            <Meter ratio={week.avgSleepMinutes / target} accent="var(--c-sleep)" />
          </div>
          <div className="tile" style={{ cursor: 'default' }}>
            <div className="tile-head">Usual bedtime</div>
            <div className="tile-value">
              {week.avgBedTime === null ? '—' : formatTime(minutesToHHMM(week.avgBedTime))}
            </div>
            <div className="tile-sub">
              {week.avgWakeTime === null
                ? 'Log a few nights to see this'
                : `wake ${formatTime(minutesToHHMM(week.avgWakeTime))}`}
            </div>
          </div>
          <div className="tile" style={{ cursor: 'default' }}>
            <div className="tile-head">Schedule consistency</div>
            <div className="tile-value">
              {week.bedTimeSpread === null ? '—' : `±${week.bedTimeSpread}m`}
            </div>
            <div className="tile-sub">
              {week.bedTimeSpread === null
                ? 'Needs two or more nights'
                : week.bedTimeSpread <= 30
                  ? 'Very consistent bedtime'
                  : week.bedTimeSpread <= 60
                    ? 'Fairly consistent'
                    : 'Bedtime moves around a lot'}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle title="Recent nights" />
        <div>
          {recent
            .slice()
            .reverse()
            .map((d) => {
              const entry = state.sleep[d]
              return (
                <div key={d} className="history-item">
                  <div>
                    <div className="strong small">
                      {shortDayLabel(d)} · {relativeDayLabel(d, today)}
                    </div>
                    <div className="tiny muted">
                      {entry
                        ? `${formatTime(entry.bedTime)} → ${formatTime(entry.wakeTime)}${
                            entry.quality ? ` · ${entry.quality}` : ''
                          }`
                        : 'Not logged'}
                    </div>
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <span className="mono-num strong">
                      {entry ? formatDuration(entry.minutes) : '—'}
                    </span>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDate(d)}>
                      {entry ? 'Edit' : 'Add'}
                    </button>
                  </div>
                </div>
              )
            })}
        </div>
        <p className="footnote" style={{ marginTop: 12 }}>
          All sleep here is entered by you. Automatic tracking from phones and wearables is planned
          for a later version, and will be labelled separately when it arrives.
        </p>
      </Card>
    </div>
  )
}
