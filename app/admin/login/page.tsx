'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Falsches Passwort / Wrong password')
    }
  }

  return (
    <div className="min-h-screen bg-[#1a0a0a] flex items-center justify-center">
      <div className="bg-[#4a0a0a]/60 border border-[#c9a84c]/40 rounded-2xl p-10 w-full max-w-sm">
        <h1 className="font-script text-4xl text-[#c9a84c] text-center mb-8">Julia & Ravi</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Passwort / Password"
            className="bg-[#1a0a0a] border border-[#c9a84c]/40 rounded px-4 py-2 text-[#f5f0e8] font-serif focus:outline-none focus:border-[#c9a84c]"
          />
          {error && <p className="text-red-400 text-sm font-serif">{error}</p>}
          <button
            type="submit"
            className="bg-[#c9a84c] text-[#1a0a0a] font-serif font-semibold py-2 rounded hover:bg-[#c9a84c]/80 transition-colors"
          >
            Anmelden / Login
          </button>
        </form>
      </div>
    </div>
  )
}
