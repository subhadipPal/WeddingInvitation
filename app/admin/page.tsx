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
  isMulti: boolean
  createdAt: string
  rsvp: Rsvp | null
}

type Tab = 'guests' | 'content'
type ContentState = { de: Record<string, string>; en: Record<string, string> }

// ── Content key groups for the editor UI ───────────────────────────────────────

const CONTENT_GROUPS: { label: string; keys: (keyof Translations)[]; deOnly?: boolean }[] = [
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
    keys: ['inviteHeading', 'inviteBody22and23', 'inviteBody23only', 'section2Body22and23', 'section2Body23only', 'inviteDate22', 'inviteDate23', 'inviteClosing', 'calendarLabel'],
  },
  {
    label: 'No-guest closing (shown when link has no token)',
    keys: ['noGuestClosingBody', 'noGuestClosingSign'],
  },
  {
    label: 'RSVP',
    keys: ['rsvpGreeting', 'rsvpInvited22and23', 'rsvpInvited23only', 'rsvpQuestion', 'rsvpYes', 'rsvpNo', 'rsvpMaybe', 'rsvpNote', 'rsvpNotePlaceholder', 'rsvpSubmit', 'rsvpUpdate', 'rsvpConfirmation'],
  },
  {
    label: 'Multi-person invite — DE only (Ihr/Euch forms)',
    keys: ['inviteBody22and23Multi', 'inviteBody23onlyMulti', 'section2Body22and23Multi', 'section2Body23onlyMulti', 'rsvpGreetingMulti', 'rsvpInvited22and23Multi', 'rsvpInvited23onlyMulti', 'rsvpQuestionMulti', 'rsvpYesMulti', 'rsvpConfirmationMulti'],
    deOnly: true,
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
  inviteBody22and23Multi: '[Multi] Envelope card body — both days (DE)',
  inviteBody23onlyMulti: '[Multi] Envelope card body — celebration only (DE)',
  section2Body22and23: 'Page 2 body — guests invited to both days',
  section2Body23only: 'Page 2 body — guests invited to celebration only',
  section2Body22and23Multi: '[Multi] Page 2 body — both days (DE)',
  section2Body23onlyMulti: '[Multi] Page 2 body — celebration only (DE)',
  inviteDate22: 'Date line — wedding day (22 Jan)',
  inviteDate23: 'Date line — celebration day (23 Jan)',
  inviteClosing: 'Closing sign-off',
  calendarLabel: 'Calendar section header ("Mark your calendar")',
  noGuestClosingBody: 'Closing paragraph (shown when no guest token in URL)',
  noGuestClosingSign: 'Closing sign (shown when no guest token in URL)',
  rsvpGreeting: 'RSVP greeting prefix ("Dear")',
  rsvpGreetingMulti: '[Multi] RSVP greeting prefix (DE)',
  rsvpInvited22and23: 'RSVP — invited to both days line',
  rsvpInvited22and23Multi: '[Multi] RSVP — invited to both days (DE)',
  rsvpInvited23only: 'RSVP — invited to celebration only line',
  rsvpInvited23onlyMulti: '[Multi] RSVP — invited to celebration only (DE)',
  rsvpQuestion: 'RSVP question ("Will you be joining us?")',
  rsvpQuestionMulti: '[Multi] RSVP question (DE)',
  rsvpYes: 'RSVP Yes button',
  rsvpNo: 'RSVP No button',
  rsvpMaybe: 'RSVP Maybe button',
  rsvpNote: 'Note field label',
  rsvpNotePlaceholder: 'Note field placeholder',
  rsvpSubmit: 'Submit button',
  rsvpUpdate: 'Update button (when re-submitting)',
  rsvpConfirmation: 'Confirmation message after submit',
  rsvpConfirmationMulti: '[Multi] Confirmation message after submit (DE)',
  rsvpYesMulti: '[Multi] Yes button (DE)',
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
  const [savingContent, setSavingContent] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const contentRef = useRef<ContentState>(defaultContent())

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
    const controller = new AbortController()
    fetch('/api/content', { signal: controller.signal })
      .then(r => r.json())
      .then((d: ContentState) => setContent(d))
      .catch(() => {/* keep defaults on error */})
    return () => controller.abort()
  }, [tab])

  const handleContentChange = (lang: 'de' | 'en', key: string, value: string) => {
    setContent(prev => {
      const next = { ...prev, [lang]: { ...prev[lang], [key]: value } }
      contentRef.current = next
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => doSave(contentRef.current), 5000)
      setSaveStatus('idle')
      return next
    })
  }

  const doSave = async (data: ContentState) => {
    setSavingContent(true)
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
    if (!confirm('Reset all text to built-in defaults? Changes will auto-save after 30 seconds.')) return
    const defaults = defaultContent()
    contentRef.current = defaults
    setContent(defaults)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSave(contentRef.current), 5000)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const toastVisible = savingContent || saveStatus !== 'idle'

  return (
    <div className="h-screen text-[#f5f0e8] p-6 relative flex flex-col overflow-hidden"
      style={{ backgroundImage: 'url(/photos/rose/roses.jpeg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-7xl mx-auto flex-1 flex flex-col min-h-0">

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
          <div className="flex-1 overflow-y-auto min-h-0 scrollbar-gold">
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
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Contact</th>
                    <th className="px-4 py-3 text-left">Invited</th>
                    <th className="px-4 py-3 text-center">RSVP 22</th>
                    <th className="px-4 py-3 text-center">RSVP 23</th>
                    <th className="px-4 py-3 text-left hidden sm:table-cell">Note</th>
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
                        <td className="px-4 py-3 text-[#f5f0e8] font-medium">
                          <span>{g.name}</span>
                          {g.isMulti && (
                            <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-[#c9a84c]/10 text-[#c9a84c]/70 border border-[#c9a84c]/20 font-serif align-middle">Group</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#f5f0e8]/60 text-xs hidden sm:table-cell">{g.email ?? g.phone ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/30 whitespace-nowrap">
                            {g.invitedDays === '22+23' ? '22+23 Jan' : '23 Jan'}
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
                        <td className="px-4 py-3 text-[#f5f0e8]/60 text-xs max-w-[140px] truncate hidden sm:table-cell">{r?.note ?? ''}</td>
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
          </div>
        )}

        {/* ── Content tab ── */}
        {tab === 'content' && (
          <div className="max-w-5xl flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-6 scrollbar-gold">
                <div className="flex items-center justify-between mb-6">
                  <p className="font-serif text-[#f5f0e8]/50 text-sm">
                    Edit guest-facing invitation text. Auto-saves 5s after changes.
                  </p>
                  <button
                    onClick={handleResetDefaults}
                    className="shrink-0 border border-[#c9a84c]/40 text-[#c9a84c] font-serif text-xs px-3 py-1.5 rounded-lg hover:bg-[#c9a84c]/10 transition-colors ml-4"
                  >
                    Reset to defaults
                  </button>
                </div>

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
                          <div className={`grid gap-3 ${group.deOnly ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                            {(group.deOnly ? ['de'] as const : ['de', 'en'] as const).map(lang => (
                              <div key={lang}>
                                {!group.deOnly && (
                                  <label className="block text-[#c9a84c]/70 text-xs font-serif mb-1 uppercase tracking-wider">
                                    {lang === 'de' ? 'German' : 'English'}
                                  </label>
                                )}
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
            </div>

          {/* Status indicator */}
            <div className="flex items-center pt-3 pb-2 border-t border-[#c9a84c]/10 mt-2 min-h-[2rem]">
              {savingContent && (
                <span className="font-serif text-[#c9a84c]/60 text-xs">Saving…</span>
              )}
              {!savingContent && saveStatus === 'saved' && (
                <span className="font-serif text-green-400 text-xs">Saved ✓</span>
              )}
              {!savingContent && saveStatus === 'error' && (
                <span className="font-serif text-red-400 text-xs">Save failed — will retry on next change</span>
              )}
            </div>
          </div>
        )}
        {/* Version overlay */}
        <p className="fixed bottom-2 right-3 z-20 font-serif text-[#f5f0e8]/20 text-[10px] tracking-widest pointer-events-none">
          {process.env.NEXT_PUBLIC_COMMIT_SHA ?? 'local'}
        </p>

        {/* Save toast */}
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-serif text-sm shadow-2xl border backdrop-blur-md ${
            savingContent ? 'bg-black/70 border-[#c9a84c]/30 text-[#c9a84c]/70' :
            saveStatus === 'saved' ? 'bg-black/70 border-green-400/30 text-green-400' :
            'bg-black/70 border-red-400/30 text-red-400'
          }`}>
            {savingContent && <span className="animate-pulse">●</span>}
            {savingContent ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : '✕ Save failed'}
          </div>
        </div>
      </div>
    </div>
  )
}
