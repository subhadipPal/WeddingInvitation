'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

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

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = () =>
    fetch('/api/guests').then(r => r.json()).then(d => setGuests(d.guests ?? []))

  useEffect(() => { load() }, [])

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const deleteGuest = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    await fetch('/api/guests', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    await load()
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
    <body><h1>Julia & Ravi — Gästeliste</h1><p>Hochzeit 22. & Feier 23. Januar 2027 · Berlin · ${guests.length} Gäste</p>
    <table><thead><tr><th>Name</th><th>Kontakt</th><th>Eingeladen</th><th>RSVP 22</th><th>RSVP 23</th><th>Notiz</th><th>Link</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`
    const w = window.open('', '_blank')!
    w.document.write(html); w.document.close(); w.print()
  }

  const confirmed = guests.filter(g => g.rsvp?.attending23).length
  const declined = guests.filter(g => g.rsvp && !g.rsvp.attending23).length
  const pending = guests.filter(g => !g.rsvp).length

  return (
    <div className="min-h-screen text-[#f5f0e8] p-6"
      style={{ background: 'radial-gradient(ellipse at 20% 0%, #5a1010 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, #2a0505 0%, transparent 50%), #1a0505' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-script text-4xl text-[#c9a84c]">Julia & Ravi</h1>
            <p className="font-serif text-[#f5f0e8]/50 text-sm tracking-widest uppercase mt-1">Gästeverwaltung</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCsv}
              className="border border-[#c9a84c]/60 text-[#c9a84c] px-3 py-2 rounded-lg font-serif text-xs hover:bg-[#c9a84c]/10 transition-colors">
              CSV
            </button>
            <button onClick={printPdf}
              className="border border-[#c9a84c]/60 text-[#c9a84c] px-3 py-2 rounded-lg font-serif text-xs hover:bg-[#c9a84c]/10 transition-colors">
              PDF drucken
            </button>
            <Link href="/admin/create"
              className="bg-[#c9a84c] text-[#1a0a0a] px-4 py-2 rounded-lg font-serif text-sm font-semibold hover:bg-[#e0bd6e] transition-colors">
              + Gast hinzufügen
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Eingeladen', value: guests.length, color: '#c9a84c' },
            { label: 'Zusagen', value: confirmed, color: '#4ade80' },
            { label: 'Absagen', value: declined, color: '#f87171' },
            { label: 'Ausstehend', value: pending, color: '#94a3b8' },
          ].map(s => (
            <div key={s.label} className="bg-[#3a0808]/50 border border-[#c9a84c]/20 rounded-xl p-4 text-center">
              <div className="text-3xl font-serif" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-serif text-[#f5f0e8]/50 mt-1 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-[#c9a84c]/20">
          <table className="w-full font-serif text-sm">
            <thead>
              <tr className="bg-[#3a0808]/80 text-[#c9a84c] text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Kontakt</th>
                <th className="px-4 py-3 text-left">Eingeladen</th>
                <th className="px-4 py-3 text-center">RSVP 22</th>
                <th className="px-4 py-3 text-center">RSVP 23</th>
                <th className="px-4 py-3 text-left">Notiz</th>
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
                    className={`border-t border-[#c9a84c]/10 transition-colors hover:bg-[#c9a84c]/5 ${i % 2 === 0 ? 'bg-[#1a0505]' : 'bg-[#3a0808]/20'}`}>
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
                          className="text-xs bg-[#3a0808] border border-[#c9a84c]/30 px-2 py-1 rounded hover:border-[#c9a84c] transition-colors text-[#c9a84c]">
                          {copied === `de-${g.id}` ? '✓' : 'DE'}
                        </button>
                        <button onClick={() => copyLink(linkEn, `en-${g.id}`)}
                          className="text-xs bg-[#3a0808] border border-[#c9a84c]/30 px-2 py-1 rounded hover:border-[#c9a84c] transition-colors text-[#c9a84c]">
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
                    Noch keine Gäste hinzugefügt.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
