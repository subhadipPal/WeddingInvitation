'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function CreateGuestPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', invitedDays: '23', isMulti: false })
  const [links, setLinks] = useState<{ linkDe: string; linkEn: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLinks({ linkDe: data.linkDe, linkEn: data.linkEn })
    setForm({ name: '', email: '', phone: '', invitedDays: '23', isMulti: false })
    setLoading(false)
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="h-screen overflow-y-auto bg-[#1a0a0a] text-[#f5f0e8]">
      <div className="max-w-xl mx-auto p-8 pb-24">
        <Link href="/admin" className="text-[#c9a84c] text-sm font-serif hover:underline mb-6 block">
          ← Zurück zur Übersicht
        </Link>
        <h1 className="font-script text-4xl text-[#c9a84c] mb-8">Gast hinzufügen</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-2xl p-6">
          {[
            { key: 'name', label: 'Name *', type: 'text', required: true },
            { key: 'email', label: 'E-Mail (optional)', type: 'email', required: false },
            { key: 'phone', label: 'Telefon/WhatsApp (optional)', type: 'tel', required: false },
          ].map(({ key, label, type, required }) => (
            <div key={key}>
              <label className="block text-[#c9a84c] text-sm font-serif mb-1">{label}</label>
              <input
                type={type}
                required={required}
                value={form[key as 'name' | 'email' | 'phone']}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-[#1a0a0a] border border-[#c9a84c]/30 rounded px-4 py-2 text-[#f5f0e8] font-serif focus:outline-none focus:border-[#c9a84c]"
              />
            </div>
          ))}

          <div>
            <label className="block text-[#c9a84c] text-sm font-serif mb-1">Eingeladen zu</label>
            <select
              value={form.invitedDays}
              onChange={e => setForm(f => ({ ...f, invitedDays: e.target.value }))}
              className="w-full bg-[#1a0a0a] border border-[#c9a84c]/30 rounded px-4 py-2 text-[#f5f0e8] font-serif focus:outline-none focus:border-[#c9a84c]"
            >
              <option value="23">23. Januar (Hochzeit)</option>
              <option value="22+23">22. + 23. Januar (beide Tage)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="isMulti"
              type="checkbox"
              checked={form.isMulti}
              onChange={e => setForm(f => ({ ...f, isMulti: e.target.checked }))}
              className="w-4 h-4 accent-[#c9a84c] cursor-pointer"
            />
            <label htmlFor="isMulti" className="text-[#c9a84c] text-sm font-serif cursor-pointer">
              Multi-person invite (couple / family) — uses "Ihr/Euch" in German
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#c9a84c] text-[#1a0a0a] font-serif font-semibold py-3 rounded hover:bg-[#c9a84c]/80 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Wird erstellt...' : 'Gast hinzufügen & Links generieren'}
          </button>
        </form>

        {links && (
          <div className="mt-6 bg-[#4a0a0a]/40 border border-[#c9a84c]/30 rounded-2xl p-6 space-y-4">
            <h2 className="text-[#c9a84c] font-serif font-semibold">Links generiert!</h2>
            {[
              { label: 'Deutsch-Link', value: links.linkDe, key: 'de' },
              { label: 'English Link', value: links.linkEn, key: 'en' },
            ].map(({ label, value, key }) => (
              <div key={key}>
                <p className="text-xs text-[#f5f0e8]/50 font-serif mb-1">{label}</p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={value}
                    className="flex-1 bg-[#1a0a0a] border border-[#c9a84c]/20 rounded px-3 py-1.5 text-sm text-[#f5f0e8] font-serif"
                  />
                  <button
                    onClick={() => copy(value, key)}
                    className="bg-[#c9a84c] text-[#1a0a0a] px-3 py-1.5 rounded text-sm font-serif font-semibold hover:bg-[#c9a84c]/80 whitespace-nowrap"
                  >
                    {copied === key ? 'Kopiert!' : 'Kopieren'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
