import { useEffect, useRef, useState } from 'react'
import { COMPANION_PROMPTS, askCompanion } from '../lib/advice'
import { todayISO } from '../lib/date'
import { getWeekSummary } from '../lib/summary'
import { useAppState } from '../state/store'
import { Modal } from './ui'

interface Message {
  id: number
  role: 'user' | 'ai'
  text: string
}

export default function Companion() {
  const state = useAppState()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [followUps, setFollowUps] = useState<string[]>(COMPANION_PROMPTS.slice(0, 3))
  const chatRef = useRef<HTMLDivElement>(null)
  const counter = useRef(0)

  const nextId = () => {
    counter.current += 1
    return counter.current
  }

  useEffect(() => {
    if (open && messages.length === 0) {
      const name = state.profile?.name.split(' ')[0]
      setMessages([
        {
          id: nextId(),
          role: 'ai',
          text: `Hi${name ? ` ${name}` : ''} 👋 I can look at what you've tracked — sleep, workouts, food, water and habits — and suggest what fits your day. Ask me anything below.`,
        },
      ])
    }
  }, [open, messages.length, state.profile])

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const ask = (question: string) => {
    const trimmed = question.trim()
    if (!trimmed) return
    const today = todayISO()
    const reply = askCompanion(state, trimmed, { today, week: getWeekSummary(state, today) })
    setMessages((prev) => [
      ...prev,
      { id: nextId(), role: 'user', text: trimmed },
      { id: nextId(), role: 'ai', text: reply.text },
    ])
    setFollowUps(reply.followUps ?? COMPANION_PROMPTS.slice(0, 3))
    setInput('')
  }

  if (!state.onboarded) return null

  return (
    <>
      <button type="button" className="companion-fab" onClick={() => setOpen(true)}>
        <span aria-hidden="true">✨</span> Ask Sarv
      </button>

      {open ? (
        <Modal
          title="Your health companion"
          subtitle="Answers use only what you've tracked in Sarv."
          onClose={() => setOpen(false)}
        >
          <div className="chat" ref={chatRef}>
            {messages.map((m) => (
              <div key={m.id} className={`bubble ${m.role === 'ai' ? 'bubble-ai' : 'bubble-user'}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="chat-prompts" style={{ marginTop: 12 }}>
            {followUps.map((p) => (
              <button key={p} type="button" className="chip" onClick={() => ask(p)}>
                {p}
              </button>
            ))}
          </div>

          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault()
              ask(input)
            }}
          >
            <input
              className="input"
              value={input}
              placeholder="Ask about your day…"
              onChange={(e) => setInput(e.target.value)}
              aria-label="Ask the companion a question"
            />
            <button type="submit" className="btn" disabled={!input.trim()}>
              Ask
            </button>
          </form>

          <p className="footnote" style={{ marginTop: 12 }}>
            Sarv offers general lifestyle guidance based on what you track. It does not diagnose
            conditions and is not a substitute for professional medical advice.
          </p>
        </Modal>
      ) : null}
    </>
  )
}
