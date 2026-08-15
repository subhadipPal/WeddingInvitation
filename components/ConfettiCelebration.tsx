'use client'
import { useEffect, useRef } from 'react'

export default function ConfettiCelebration() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const colors = ['#c9a84c', '#f5f0e8', '#4a0a0a', '#e8c97e', '#fff']
    const petals = Array.from({ length: 60 }).map(() => {
      const el = document.createElement('div')
      el.style.cssText = `
        position:absolute; width:8px; height:8px; border-radius:50%;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        left:${Math.random() * 100}%;
        animation: petal-fall ${1.5 + Math.random() * 2}s ease-in ${Math.random() * 0.5}s forwards;
      `
      container.appendChild(el)
      return el
    })
    return () => petals.forEach(p => p.remove())
  }, [])

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-50 overflow-hidden" />
}
