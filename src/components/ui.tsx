import type { ReactNode } from 'react'
import { useEffect } from 'react'

export function Card({
  children,
  className = '',
  ...rest
}: { children: ReactNode; className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  )
}

export function CardTitle({ title, action }: { title: ReactNode; action?: ReactNode }) {
  return (
    <div className="card-title">
      <h2>{title}</h2>
      {action}
    </div>
  )
}

export function Meter({ ratio, accent }: { ratio: number; accent?: string }) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100
  return (
    <div className="meter" role="presentation">
      <div className="meter-fill" style={{ width: `${pct}%`, background: accent }} />
    </div>
  )
}

export function Ring({
  value,
  size = 104,
  stroke = 9,
  caption = 'Score',
}: {
  value: number
  size?: number
  stroke?: number
  caption?: string
}) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(100, value)) / 100
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} />
        <circle
          className="ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
        />
      </svg>
      <div className="ring-label">
        <div className="ring-number mono-num">{Math.round(value)}</div>
        <div className="ring-caption">{caption}</div>
      </div>
    </div>
  )
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
}: {
  title: ReactNode
  subtitle?: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {subtitle ? <p className="small muted">{subtitle}</p> : null}
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
        {footer}
      </div>
    </div>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="segmented" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={o.value === value}
          className={o.value === value ? 'active' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Wraps a single form control — the <label> makes the caption clickable. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  )
}

/**
 * Same look as Field, but for a group of controls (chips, several inputs).
 * A <label> must not wrap multiple or non-labelable controls, so this is a
 * plain group with an accessible name instead.
 */
export function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="field" role="group" aria-label={label}>
      <span className="label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </div>
  )
}

export function Empty({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="empty stack-sm">
      <div className="strong">{title}</div>
      {body ? <p className="small">{body}</p> : null}
      {action ? <div style={{ marginTop: 6 }}>{action}</div> : null}
    </div>
  )
}
