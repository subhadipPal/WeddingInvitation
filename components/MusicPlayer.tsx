'use client'
import { useEffect, useRef, useState } from 'react'

export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.loop = true
    audio.volume = 0.5
  }, [])

  useEffect(() => {
    const start = () => {
      const audio = audioRef.current
      if (!audio || playing) return
      audio.play().then(() => setPlaying(true)).catch(() => {})
      document.removeEventListener('click', start)
    }
    document.addEventListener('click', start)
    return () => document.removeEventListener('click', start)
  }, [playing])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play().then(() => setPlaying(true)).catch(() => {}) }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !muted
    setMuted(!muted)
  }

  return (
    <>
      <audio ref={audioRef} src="/audio/forever-and-always.mp3" preload="auto" />
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#1a0a0a]/80 border border-[#c9a84c]/40 rounded-full px-4 py-2 backdrop-blur-sm">
        <button onClick={toggle} className="text-[#c9a84c] hover:text-[#f5f0e8] transition-colors text-lg">
          {playing ? '⏸' : '▶'}
        </button>
        <span className="text-xs font-serif text-[#f5f0e8]/60 hidden sm:block">Forever And Always</span>
        <button onClick={toggleMute} className="text-[#c9a84c]/60 hover:text-[#c9a84c] transition-colors text-sm ml-1">
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </>
  )
}
