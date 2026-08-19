'use client'
import { useState } from 'react'
import type { Lang, Translations } from '@/lib/i18n'
import ConfettiCelebration from './ConfettiCelebration'

type Choice = 'yes' | 'no' | 'maybe' | null

interface ChoiceButtonsProps {
  value: Choice
  onChange: (c: Choice) => void
  translations: Translations
}

function ChoiceButtons({ value, onChange, translations }: ChoiceButtonsProps) {
  return (
    <div className="flex gap-3">
      {(['yes', 'no'] as const).map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`flex-1 py-2.5 rounded-lg font-serif text-sm border transition-all ${
            value === c
              ? 'bg-[#c9a84c] text-[#1a0a0a] border-[#c9a84c] font-semibold'
              : 'bg-transparent text-[#f5f0e8] border-[#c9a84c]/40 hover:border-[#c9a84c]'
          }`}
        >
          {c === 'yes' ? translations.rsvpYes : translations.rsvpNo}
        </button>
      ))}
    </div>
  )
}

interface Props {
  token: string
  invitedDays: '22+23' | '23'
  lang: Lang
  translations: Translations
  existingRsvp?: { attending22: boolean | null; attending23: boolean; note: string | null; address?: string | null } | null
}

export default function RsvpForm({ token, invitedDays, lang, translations, existingRsvp }: Props) {
  const [choice22, setChoice22] = useState<Choice>(
    existingRsvp?.attending22 === true ? 'yes' : existingRsvp?.attending22 === false ? 'no' : null
  )
  const [choice23, setChoice23] = useState<Choice>(
    existingRsvp?.attending23 === true ? 'yes' : existingRsvp?.attending23 === false ? 'no' : null
  )
  const [address, setAddress] = useState(existingRsvp?.address ?? '')
  const [addressTouched, setAddressTouched] = useState(false)
  const [note, setNote] = useState(existingRsvp?.note ?? '')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const isAttending = choice23 === 'yes' || (invitedDays === '22+23' && choice22 === 'yes')
  const addressRequired = isAttending
  const addressMissing = addressTouched && addressRequired && !address.trim()

  const choiceToBoolean = (c: Choice): boolean => c === 'yes'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setAddressTouched(true)
    if (!choice23) return
    if (addressRequired && !address.trim()) return
    setLoading(true)
    await fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        attending22: invitedDays === '22+23' ? choiceToBoolean(choice22) : undefined,
        attending23: choiceToBoolean(choice23),
        address: address.trim(),
        note: note || null,
      }),
    })
    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <>
        <ConfettiCelebration />
        <div className="text-center py-12">
          <p className="font-script text-5xl text-[#c9a84c] mb-4">🎉</p>
          <p className="font-serif text-xl text-[#f5f0e8]">{translations.rsvpConfirmation}</p>
        </div>
      </>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-md mx-auto">

      {invitedDays === '22+23' && (
        <div className="bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl p-4">
          <p className="font-serif text-[#c9a84c] text-sm mb-3">{translations.inviteDate22}</p>
          <ChoiceButtons value={choice22} onChange={setChoice22} translations={translations} />
        </div>
      )}

      <div className="bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl p-4">
        <p className="font-serif text-[#c9a84c] text-sm mb-3">{translations.inviteDate23}</p>
        <ChoiceButtons value={choice23} onChange={setChoice23} translations={translations} />
      </div>

      {/* Address — mandatory only if attending */}
      {addressRequired && (
      <div
        className="rounded-xl p-4 flex flex-col gap-3"
        style={{
          background: 'linear-gradient(135deg,rgba(74,10,10,0.55) 0%,rgba(30,10,10,0.7) 100%)',
          border: addressMissing ? '1.5px solid #c9a84c' : '1px solid rgba(201,168,76,0.45)',
          animation: !address.trim() ? 'address-pulse 3s ease-in-out infinite' : 'none',
          boxShadow: !address.trim() ? '0 0 16px rgba(201,168,76,0.18)' : 'none',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">✉️</span>
          <label className="font-serif text-[#c9a84c] text-sm font-semibold tracking-wide">
            {translations.rsvpAddressLabel}
            <span className="text-[#e05555] ml-1">*</span>
          </label>
        </div>
        <p className="font-serif text-[#f5f0e8]/70 text-xs leading-relaxed italic">
          {translations.rsvpAddressRequired}
        </p>
        <textarea
          value={address}
          onChange={e => setAddress(e.target.value)}
          onBlur={() => setAddressTouched(true)}
          placeholder={translations.rsvpAddressPlaceholder}
          rows={3}
          className={`w-full bg-[#1a0a0a]/60 rounded-lg px-4 py-3 text-[#f5f0e8] font-serif text-sm focus:outline-none resize-none transition-all placeholder:text-[#f5f0e8]/30 ${
            addressMissing
              ? 'border-2 border-[#e05555]'
              : 'border border-[#c9a84c]/40 focus:border-[#c9a84c]'
          }`}
        />
        {addressMissing && (
          <p className="text-[#e05555] text-xs font-serif animate-pulse">
            {lang === 'de' ? 'Bitte gib deine Adresse ein.' : 'Please enter your address.'}
          </p>
        )}
      </div>
      )}

      <div>
        <label className="block font-serif text-sm text-[#f5f0e8]/60 mb-2">{translations.rsvpNote}</label>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={translations.rsvpNotePlaceholder}
          rows={3}
          className="w-full bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl px-4 py-3 text-[#f5f0e8] font-serif text-sm focus:outline-none focus:border-[#c9a84c] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !choice23}
        className="bg-[#c9a84c] text-[#1a0a0a] font-serif font-semibold py-3 rounded-xl hover:bg-[#c9a84c]/80 transition-colors disabled:opacity-40"
      >
        {loading ? '...' : existingRsvp ? translations.rsvpUpdate : translations.rsvpSubmit}
      </button>

    </form>
  )
}
