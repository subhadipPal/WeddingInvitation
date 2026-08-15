'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Guest {
  id: string
  token: string
  name: string
  email: string | null
  phone: string | null
  invitedDays: string
  createdAt: string
}

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/guests').then(r => r.json()).then(d => setGuests(d.guests ?? []))
  }, [])

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const exportCsv = () => {
    const header = 'Name,Email,Phone,Invited Days,Token,Link DE,Link EN'
    const rows = guests.map(g => {
      const base = window.location.origin
      return `"${g.name}","${g.email ?? ''}","${g.phone ?? ''}","${g.invitedDays}","${g.token}","${base}/de/invite/${g.token}","${base}/en/invite/${g.token}"`
    })
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'guests.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-[#1a0a0a] text-[#f5f0e8] p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-script text-4xl text-[#c9a84c]">Gästeverwaltung — Julia & Ravi</h1>
          <div className="flex gap-3">
            <button
              onClick={exportCsv}
              className="border border-[#c9a84c] text-[#c9a84c] px-4 py-2 rounded font-serif text-sm hover:bg-[#c9a84c]/20"
            >
              Als CSV exportieren
            </button>
            <Link
              href="/admin/create"
              className="bg-[#c9a84c] text-[#1a0a0a] px-4 py-2 rounded font-serif text-sm font-semibold hover:bg-[#c9a84c]/80"
            >
              + Gast hinzufügen
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-xl p-4 text-center w-48">
            <div className="text-3xl font-serif text-[#c9a84c]">{guests.length}</div>
            <div className="text-sm font-serif text-[#f5f0e8]/70 mt-1">Gesamt eingeladen</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#c9a84c]/20">
          <table className="w-full font-serif text-sm">
            <thead>
              <tr className="bg-[#4a0a0a]/60 text-[#c9a84c]">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Kontakt</th>
                <th className="px-4 py-3 text-left">Eingeladen</th>
                <th className="px-4 py-3 text-left">Deutsch-Link</th>
                <th className="px-4 py-3 text-left">English-Link</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g, i) => {
                const base = typeof window !== 'undefined' ? window.location.origin : ''
                const linkDe = `${base}/de/invite/${g.token}`
                const linkEn = `${base}/en/invite/${g.token}`
                return (
                  <tr
                    key={g.id}
                    className={`border-t border-[#c9a84c]/10 ${i % 2 === 0 ? 'bg-[#1a0a0a]' : 'bg-[#4a0a0a]/20'}`}
                  >
                    <td className="px-4 py-3 text-[#f5f0e8]">{g.name}</td>
                    <td className="px-4 py-3 text-[#f5f0e8]/70">{g.email ?? g.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-[#c9a84c]/20 text-[#c9a84c]">
                        {g.invitedDays === '22+23' ? '22 + 23 Jan' : '23 Jan'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyLink(linkDe, `de-${g.id}`)}
                        className="text-xs bg-[#4a0a0a] border border-[#c9a84c]/30 px-2 py-1 rounded hover:border-[#c9a84c] transition-colors"
                      >
                        {copied === `de-${g.id}` ? 'Kopiert!' : 'DE kopieren'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyLink(linkEn, `en-${g.id}`)}
                        className="text-xs bg-[#4a0a0a] border border-[#c9a84c]/30 px-2 py-1 rounded hover:border-[#c9a84c] transition-colors"
                      >
                        {copied === `en-${g.id}` ? 'Copied!' : 'EN copy'}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {guests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#f5f0e8]/40">
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
