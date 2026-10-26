'use client'
import { useState } from 'react'
import ConfettiCelebration from './ConfettiCelebration'

type TriState = boolean | null  // null = unanswered

interface Content {
  heading: string
  greeting: string         // "Liebe/r {name},"
  greetingMulti: string    // "Liebe {name},"
  question22: string
  question23: string
  yes: string
  no: string
  addressLabel: string
  addressPlaceholder: string
  noteLabel: string
  notePlaceholder: string
  submit: string
  update: string
  confirmation: string     // singular
  confirmationMulti: string
}

interface Props {
  micToken: string
  guestName: string
  isMulti: boolean
  showDay22: boolean  // based on invited_days — '22+23' guests see the 22 question
  content: Content
  initialRsvp: {
    attending22: boolean | null
    attending23: boolean | null
    address: string | null
    note: string | null
  } | null
}

function interpolateName(template: string, name: string) {
  return template.replace('{name}', name)
}

/** MIC RSVP — optional. All answers nullable. Submit disabled only if every
 *  field is empty. On success, confetti + confirmation + button flips to "update". */
export default function MicRsvpForm({
  micToken,
  guestName,
  isMulti,
  showDay22,
  content,
  initialRsvp,
}: Props) {
  const [attending22, setAttending22] = useState<TriState>(initialRsvp?.attending22 ?? null)
  const [attending23, setAttending23] = useState<TriState>(initialRsvp?.attending23 ?? null)
  const [address, setAddress] = useState(initialRsvp?.address ?? '')
  const [note, setNote] = useState(initialRsvp?.note ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(!!initialRsvp)
  const [celebrating, setCelebrating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const greeting = interpolateName(isMulti ? content.greetingMulti : content.greeting, guestName)
  const confirmation = isMulti ? content.confirmationMulti : content.confirmation
  const buttonLabel = submitted ? content.update : content.submit

  const hasAnyAnswer =
    attending22 !== null ||
    attending23 !== null ||
    address.trim().length > 0 ||
    note.trim().length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasAnyAnswer) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/mic-rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mic_token: micToken,
          attending22: showDay22 ? attending22 : null,
          attending23,
          address: address.trim() || null,
          note: note.trim() || null,
        }),
      })
      if (!res.ok) {
        setError('Senden fehlgeschlagen. Bitte erneut versuchen.')
      } else {
        setSubmitted(true)
        setCelebrating(true)
        setTimeout(() => setCelebrating(false), 3500)
      }
    } catch {
      setError('Keine Verbindung. Bitte erneut versuchen.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex flex-col gap-5">
      {celebrating && <ConfettiCelebration />}

      <p className="font-serif text-[#c9a84c] text-xs tracking-[0.4em] uppercase text-center">
        {content.heading}
      </p>
      <p className="font-script text-3xl text-[#f5f0e8] text-center">{greeting}</p>

      {showDay22 && (
        <div className="bg-black/30 backdrop-blur-sm border border-[#c9a84c]/30 rounded-xl p-4">
          <p className="font-serif text-[#f5f0e8] text-sm mb-3">{content.question22}</p>
          <ChoiceButtons value={attending22} onChange={setAttending22} yes={content.yes} no={content.no} />
        </div>
      )}

      <div className="bg-black/30 backdrop-blur-sm border border-[#c9a84c]/30 rounded-xl p-4">
        <p className="font-serif text-[#f5f0e8] text-sm mb-3">{content.question23}</p>
        <ChoiceButtons value={attending23} onChange={setAttending23} yes={content.yes} no={content.no} />
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="font-serif text-[#c9a84c] text-[10px] uppercase tracking-wider">{content.addressLabel}</span>
        <textarea
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder={content.addressPlaceholder}
          rows={2}
          className="w-full bg-black/30 border border-[#c9a84c]/30 rounded-lg px-3 py-2 text-[#f5f0e8] font-serif text-sm focus:border-[#c9a84c] focus:outline-none placeholder:text-[#f5f0e8]/30 resize-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-serif text-[#c9a84c] text-[10px] uppercase tracking-wider">{content.noteLabel}</span>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={content.notePlaceholder}
          rows={3}
          className="w-full bg-black/30 border border-[#c9a84c]/30 rounded-lg px-3 py-2 text-[#f5f0e8] font-serif text-sm focus:border-[#c9a84c] focus:outline-none placeholder:text-[#f5f0e8]/30 resize-none"
        />
      </label>

      <button
        type="submit"
        disabled={!hasAnyAnswer || submitting}
        className="w-full py-3 rounded-lg bg-[#c9a84c] text-[#1a0a0a] font-serif text-sm font-semibold hover:bg-[#e0bd6e] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {submitting ? '…' : buttonLabel}
      </button>

      {submitted && !submitting && !error && (
        <p className="text-center font-serif text-[#f5f0e8]/80 text-sm">{confirmation}</p>
      )}
      {error && <p className="text-center font-serif text-red-400 text-sm">{error}</p>}
    </form>
  )
}

function ChoiceButtons({
  value,
  onChange,
  yes,
  no,
}: { value: TriState; onChange: (v: TriState) => void; yes: string; no: string }) {
  const btn = (active: boolean) =>
    `flex-1 py-2.5 rounded-lg font-serif text-sm border transition-all ${
      active
        ? 'bg-[#c9a84c] text-[#1a0a0a] border-[#c9a84c] font-semibold'
        : 'bg-transparent text-[#f5f0e8] border-[#c9a84c]/40 hover:border-[#c9a84c]'
    }`
  return (
    <div className="flex gap-3">
      <button type="button" onClick={() => onChange(value === true ? null : true)} className={btn(value === true)}>
        {yes}
      </button>
      <button type="button" onClick={() => onChange(value === false ? null : false)} className={btn(value === false)}>
        {no}
      </button>
    </div>
  )
}
