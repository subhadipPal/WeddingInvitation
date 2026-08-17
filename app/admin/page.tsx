'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { translations as defaults, GUEST_FACING_KEYS, type Translations } from '@/lib/i18n'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Rsvp {
  attending22: boolean | null
  attending23: boolean
  note: string | null
}

interface Guest {
  id: string
  token: string
  name: string
  email: string | null
  phone: string | null
  invitedDays: string
  createdAt: string
  rsvp: Rsvp | null
}

type Tab = 'guests' | 'content'
type ContentState = { de: Record<string, string>; en: Record<string, string> }

// ── Content key groups for the editor UI ───────────────────────────────────────

const CONTENT_GROUPS: { label: string; keys: (keyof Translations)[] }[] = [
  {
    label: 'General',
    keys: ['coupleNames', 'saveTheDate', 'tapToOpen'],
  },
  {
    label: 'Countdown labels',
    keys: ['countdownDays', 'countdownHours', 'countdownMinutes', 'countdownSeconds'],
  },
  {
    label: 'Invitation',
    keys: ['inviteHeading', 'inviteBody22and23', 'inviteBody23only', 'inviteDate22', 'inviteDate23', 'inviteClosing', 'calendarLabel'],
  },
  {
    label: 'No-guest closing (shown when link has no token)',
    keys: ['noGuestClosingBody', 'noGuestClosingSign'],
  },
  {
    label: 'RSVP',
    keys: ['rsvpGreeting', 'rsvpInvited22and23', 'rsvpInvited23only', 'rsvpQuestion', 'rsvpYes', 'rsvpNo', 'rsvpMaybe', 'rsvpNote', 'rsvpNotePlaceholder', 'rsvpSubmit', 'rsvpUpdate', 'rsvpConfirmation'],
  },
]

// ── Human-readable labels for each key ────────────────────────────────────────

const KEY_LABELS: Partial<Record<keyof Translations, string>> = {
  coupleNames: 'Couple names',
  saveTheDate: '"Save the Date" label',
  tapToOpen: '"Tap to open" envelope text',
  countdownDays: 'Days label',
  countdownHours: 'Hours label',
  countdownMinutes: 'Minutes label',
  countdownSeconds: 'Seconds label',
  inviteHeading: 'Main heading ("We\'re saying yes!")',
  inviteBody22and23: 'Invitation body — guests invited to both days',
  inviteBody23only: 'Invitation body — guests invited to celebration only',
  inviteDate22: 'Date line — wedding day (22 Jan)',
  inviteDate23: 'Date line — celebration day (23 Jan)',
  inviteClosing: 'Closing sign-off',
  calendarLabel: 'Calendar section header ("Mark your calendar")',
  noGuestClosingBody: 'Closing paragraph (shown when no guest token in URL)',
  noGuestClosingSign: 'Closing sign (shown when no guest token in URL)',
  rsvpGreeting: 'RSVP greeting prefix ("Dear")',
  rsvpInvited22and23: 'RSVP — invited to both days line',
  rsvpInvited23only: 'RSVP — invited to celebration only line',
  rsvpQuestion: 'RSVP question ("Will you be joining us?")',
  rsvpYes: 'RSVP Yes button',
  rsvpNo: 'RSVP No button',
  rsvpMaybe: 'RSVP Maybe button',
  rsvpNote: 'Note field label',
  rsvpNotePlaceholder: 'Note field placeholder',
  rsvpSubmit: 'Submit button',
  rsvpUpdate: 'Update button (when re-submitting)',
  rsvpConfirmation: 'Confirmation message after submit',
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function defaultContent(): ContentState {
  return {
    de: Object.fromEntries(GUEST_FACING_KEYS.map(k => [k, defaults.de[k]])),
    en: Object.fromEntries(GUEST_FACING_KEYS.map(k => [k, defaults.en[k]])),
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('guests')

  // Guests tab state
  const [guests, setGuests] = useState<Guest[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Content tab state
  const [content, setContent] = useState<ContentState>(defaultContent())
  const [contentLoading, setContentLoading] = useState(false)
  const [savingContent, setSavingContent] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Guests tab logic ────────────────────────────────────────────────────────

  const loadGuests = useCallback(() =>
    fetch('/api/guests').then(r => r.json()).then(d => setGuests(d.guests ?? [])), [])

  useEffect(() => { loadGuests() }, [loadGuests])

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteGuest = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    await fetch('/api/guests', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await loadGuests()
    setDeleting(null)
  }

  const exportCsv = () => {
    const header = 'Name,Email,Phone,Invited Days,RSVP 22,RSVP 23,Note,Token,Link DE,Link EN'
    const rows = guests.map(g => {
      const base = window.location.origin
      const r = g.rsvp
      return `"${g.name}","${g.email ?? ''}","${g.phone ?? ''}","${g.invitedDays}","${r ? (r.attending22 === null ? '?' : r.attending22 ? 'Yes' : 'No') : ''}","${r ? (r.attending23 ? 'Yes' : 'No') : ''}","${r?.note ?? ''}","${g.token}","${base}/de/invite/${g.token}","${base}/en/invite/${g.token}"`
    })
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'guests.csv'; a.click()
  }

  const printPdf = () => {
    const base = window.location.origin
    const rows = guests.map(g => {
      const r = g.rsvp
      const rsvp22 = g.invitedDays === '22+23' ? (r ? (r.attending22 === null ? '?' : r.attending22 ? '✓' : '✗') : '–') : '—'
      const rsvp23 = r ? (r.attending23 ? '✓' : '✗') : '–'
      return `<tr>
        <td>${g.name}</td>
        <td>${g.email ?? g.phone ?? '—'}</td>
        <td>${g.invitedDays === '22+23' ? '22 + 23 Jan' : '23 Jan'}</td>
        <td style="text-align:center">${rsvp22}</td>
        <td style="text-align:center">${rsvp23}</td>
        <td>${r?.note ?? ''}</td>
        <td style="font-size:10px">${base}/de/invite/${g.token}</td>
      </tr>`
    }).join('')
    const html = `<!DOCTYPE html><html><head><title>Julia & Ravi — Guest List</title>
    <style>body{font-family:Georgia,serif;padding:24px}h1{font-size:22px;margin-bottom:4px;color:#3a0808}p{font-size:12px;color:#666;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:12px}th{background:#3a0808;color:#c9a84c;padding:6px 8px;text-align:left}
    td{padding:5px 8px;border-bottom:1px solid #ddd}tr:nth-child(even) td{background:#fdf8f0}
    @media print{button{display:none}}</style></head>
    <body><h1>Julia & Ravi — Guest List</h1><p>Wedding 22 Jan & Celebration 23 Jan 2027 · Berlin · ${guests.length} guests</p>
    <table><thead><tr><th>Name</th><th>Contact</th><th>Invited</th><th>RSVP 22</th><th>RSVP 23</th><th>Note</th><th>Link</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`
    const w = window.open('', '_blank')!
    w.document.write(html); w.document.close(); w.print()
  }

  const confirmed = guests.filter(g => g.rsvp?.attending23).length
  const declined = guests.filter(g => g.rsvp && !g.rsvp.attending23).length
  const pending = guests.filter(g => !g.rsvp).length

  // ── Content tab logic ───────────────────────────────────────────────────────

  useEffect(() => {
    if (tab !== 'content') return
    setContentLoading(true)
    fetch('/api/content')
      .then(r => r.json())
      .then((d: ContentState) => setContent(d))
      .catch(() => {/* keep defaults */})
      .finally(() => setContentLoading(false))
  }, [tab])

  const handleContentChange = (lang: 'de' | 'en', key: string, value: string) => {
    setContent(prev => ({ ...prev, [lang]: { ...prev[lang], [key]: value } }))
  }

  const handleSaveContent = async () => {
    setSavingContent(true)
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      })
      setSaveStatus(res.ok ? 'saved' : 'error')
    } catch {
      setSaveStatus('error')
    }
    setSavingContent(false)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => setSaveStatus('idle'), 3000)
  }

  const handleResetDefaults = () => {
    if (!confirm('Reset all text to built-in defaults? This does not save — click Save to persist.')) return
    setContent(defaultContent())
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen text-[#f5f0e8] p-6 relative"
      style={{ backgroundImage: 'url(/photos/rose/roses.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      <div className="relative z-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-script text-4xl text-[#c9a84c]">Julia & Ravi</h1>
            <p className="font-serif text-[#f5f0e8]/50 text-sm tracking-widest uppercase mt-1">Guest Management</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCsv}
              className="border border-[#c9a84c]/60 text-[#c9a84c] px-3 py-2 rounded-lg font-serif text-xs hover:bg-[#c9a84c]/10 transition-colors">
              CSV
            </button>
            <button onClick={printPdf}
              className="border border-[#c9a84c]/60 text-[#c9a84c] px-3 py-2 rounded-lg font-serif text-xs hover:bg-[#c9a84c]/10 transition-colors">
              Print PDF
            </button>
            <Link href="/admin/create"
              className="bg-[#c9a84c] text-[#1a0a0a] px-4 py-2 rounded-lg font-serif text-sm font-semibold hover:bg-[#e0bd6e] transition-colors">
              + Add Guest
            </Link>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-black/30 rounded-xl p-1 w-fit">
          {(['guests', 'content'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-serif text-sm transition-all ${
                tab === t
                  ? 'bg-[#c9a84c] text-[#1a0a0a] font-semibold'
                  : 'text-[#f5f0e8]/60 hover:text-[#f5f0e8]'
              }`}
            >
              {t === 'guests' ? 'Guests' : 'Content'}
            </button>
          ))}
        </div>

        {/* ── Guests tab ── */}
        {tab === 'guests' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: 'Invited', value: guests.length, color: '#c9a84c' },
                { label: 'Confirmed', value: confirmed, color: '#4ade80' },
                { label: 'Declined', value: declined, color: '#f87171' },
                { label: 'Pending', value: pending, color: '#94a3b8' },
              ].map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-center shadow-lg">
                  <div className="text-3xl font-serif" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs font-serif text-[#f5f0e8]/50 mt-1 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/20 shadow-2xl bg-white/10 backdrop-blur-md">
              <table className="w-full font-serif text-sm">
                <thead>
                  <tr className="bg-black/30 text-[#c9a84c] text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Invited</th>
                    <th className="px-4 py-3 text-center">RSVP 22</th>
                    <th className="px-4 py-3 text-center">RSVP 23</th>
                    <th className="px-4 py-3 text-left">Note</th>
                    <th className="px-4 py-3 text-left">Links</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((g, i) => {
                    const base = typeof window !== 'undefined' ? window.location.origin : ''
                    const linkDe = `${base}/de/invite/${g.token}`
                    const linkEn = `${base}/en/invite/${g.token}`
                    const r = g.rsvp
                    const rsvpColor = (v: boolean | null | undefined) =>
                      v === true ? 'text-green-400' : v === false ? 'text-red-400' : 'text-[#f5f0e8]/30'
                    return (
                      <tr key={g.id}
                        className={`border-t border-white/10 transition-colors hover:bg-white/10 ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/5'}`}>
                        <td className="px-4 py-3 text-[#f5f0e8] font-medium">{g.name}</td>
                        <td className="px-4 py-3 text-[#f5f0e8]/60 text-xs">{g.email ?? g.phone ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/30">
                            {g.invitedDays === '22+23' ? '22 + 23 Jan' : '23 Jan'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-center text-base ${rsvpColor(r?.attending22)}`}>
                          {g.invitedDays === '22+23'
                            ? (r ? (r.attending22 === null ? '?' : r.attending22 ? '✓' : '✗') : '–')
                            : <span className="text-xs text-[#f5f0e8]/20">—</span>}
                        </td>
                        <td className={`px-4 py-3 text-center text-base ${rsvpColor(r?.attending23)}`}>
                          {r ? (r.attending23 ? '✓' : '✗') : '–'}
                        </td>
                        <td className="px-4 py-3 text-[#f5f0e8]/60 text-xs max-w-[140px] truncate">{r?.note ?? ''}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => copyLink(linkDe, `de-${g.id}`)}
                              className="text-xs bg-black/30 border border-[#c9a84c]/40 px-2 py-1 rounded hover:border-[#c9a84c] transition-colors text-[#c9a84c]">
                              {copied === `de-${g.id}` ? '✓' : 'DE'}
                            </button>
                            <button onClick={() => copyLink(linkEn, `en-${g.id}`)}
                              className="text-xs bg-black/30 border border-[#c9a84c]/40 px-2 py-1 rounded hover:border-[#c9a84c] transition-colors text-[#c9a84c]">
                              {copied === `en-${g.id}` ? '✓' : 'EN'}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteGuest(g.id, g.name)}
                            disabled={deleting === g.id}
                            className="text-xs text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-30 text-base">
                            {deleting === g.id ? '…' : '✕'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {guests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-[#f5f0e8]/30 font-serif">
                        No guests added yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Content tab ── */}
        {tab === 'content' && (
          <div className="max-w-5xl overflow-y-auto max-h-[calc(100vh-220px)] pr-2 scrollbar-gold">
            {contentLoading ? (
              <p className="font-serif text-[#f5f0e8]/40 py-12 text-center">Loading…</p>
            ) : (
              <>
                <p className="font-serif text-[#f5f0e8]/50 text-sm mb-6">
                  Edit guest-facing invitation text in both languages. Changes take effect immediately after saving.
                </p>

                {CONTENT_GROUPS.map(group => (
                  <div key={group.label} className="mb-8">
                    <h2 className="font-serif text-[#c9a84c] text-xs uppercase tracking-widest mb-4 border-b border-[#c9a84c]/20 pb-2">
                      {group.label}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {group.keys.map(key => (
                        <div key={key} className="bg-black/40 backdrop-blur-md border border-[#c9a84c]/20 rounded-xl p-4">
                          <p className="font-serif text-[#f5f0e8]/60 text-xs mb-3">
                            {KEY_LABELS[key] ?? key}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {(['de', 'en'] as const).map(lang => (
                              <div key={lang}>
                                <label className="block text-[#c9a84c]/70 text-xs font-serif mb-1 uppercase tracking-wider">
                                  {lang === 'de' ? 'German' : 'English'}
                                </label>
                                <textarea
                                  value={content[lang][key] ?? ''}
                                  onChange={e => handleContentChange(lang, key, e.target.value)}
                                  rows={key.includes('Body') || key.includes('body') ? 4 : 2}
                                  className="w-full bg-black/30 border border-[#c9a84c]/20 rounded-lg px-3 py-2 text-[#f5f0e8] font-serif text-sm focus:outline-none focus:border-[#c9a84c]/60 resize-y"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Action bar */}
                <div className="flex items-center gap-4 pt-4 pb-8 sticky bottom-0 bg-gradient-to-t from-black/60 to-transparent">
                  <button
                    onClick={handleSaveContent}
                    disabled={savingContent}
                    className="bg-[#c9a84c] text-[#1a0a0a] font-serif font-semibold px-6 py-2.5 rounded-xl hover:bg-[#e0bd6e] transition-colors disabled:opacity-40"
                  >
                    {savingContent ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={handleResetDefaults}
                    className="border border-[#c9a84c]/40 text-[#c9a84c] font-serif text-sm px-4 py-2.5 rounded-xl hover:bg-[#c9a84c]/10 transition-colors"
                  >
                    Reset to defaults
                  </button>
                  {saveStatus === 'saved' && (
                    <span className="font-serif text-green-400 text-sm">Saved ✓</span>
                  )}
                  {saveStatus === 'error' && (
                    <span className="font-serif text-red-400 text-sm">Save failed — try again</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        {/* Version footer */}
        <div className="mt-10 pb-4 text-center">
          <p className="font-serif text-[#f5f0e8]/20 text-xs tracking-widest">
            deploy {process.env.NEXT_PUBLIC_COMMIT_SHA ?? 'local'}
          </p>
        </div>
      </div>
    </div>
  )
}
