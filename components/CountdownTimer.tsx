'use client'
import { useEffect, useState } from 'react'
import { t, type Lang } from '@/lib/i18n'

interface Props { lang: Lang }

const WEDDING_DATE = new Date('2027-01-22T00:00:00')

export default function CountdownTimer({ lang }: Props) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const tick = () => {
      const diff = WEDDING_DATE.getTime() - Date.now()
      if (diff <= 0) return
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex gap-6 justify-center">
      {[
        { value: timeLeft.days,    label: t('countdownDays', lang) },
        { value: timeLeft.hours,   label: t('countdownHours', lang) },
        { value: timeLeft.minutes, label: t('countdownMinutes', lang) },
        { value: timeLeft.seconds, label: t('countdownSeconds', lang) },
      ].map(({ value, label }) => (
        <div key={label} className="text-center">
          <div className="text-2xl sm:text-4xl font-serif text-[#c9a84c] tabular-nums">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-xs font-serif text-[#f5f0e8]/60 uppercase tracking-widest mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}
