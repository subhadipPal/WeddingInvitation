'use client'
import { useEffect, useRef } from 'react'

const PETAL_COLOR = '#8a1538' // deep rose red — Wireframes.md §F.5
const PETAL_COUNT = 20

function rnd(min: number, max: number) { return min + Math.random() * (max - min) }
function randInt(min: number, max: number) { return Math.floor(rnd(min, max + 1)) }

export default function MicPetalOverlay() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const style = document.createElement('style')
    style.textContent = `
      @media (prefers-reduced-motion: no-preference) {
        @keyframes mic-petal-fall {
          0%   { top: -5%; opacity: 0.9; }
          100% { top: 105%; opacity: 0.1; }
        }
        @keyframes mic-petal-sway-a {
          0%   { transform: rotate(0deg)   translateX(0); }
          30%  { transform: rotate(25deg)  translateX(30px); }
          60%  { transform: rotate(-10deg) translateX(-15px); }
          100% { transform: rotate(20deg)  translateX(20px); }
        }
        @keyframes mic-petal-sway-b {
          0%   { transform: rotate(15deg)  translateX(0); }
          40%  { transform: rotate(-20deg) translateX(-25px); }
          80%  { transform: rotate(30deg)  translateX(25px); }
          100% { transform: rotate(5deg)   translateX(-10px); }
        }
        @keyframes mic-petal-sway-c {
          0%   { transform: rotate(-5deg)  translateX(0); }
          50%  { transform: rotate(30deg)  translateX(35px); }
          100% { transform: rotate(-15deg) translateX(-20px); }
        }
      }
    `
    document.head.appendChild(style)

    const swayAnims = ['mic-petal-sway-a', 'mic-petal-sway-b', 'mic-petal-sway-c']

    const nodes: HTMLDivElement[] = Array.from({ length: PETAL_COUNT }, () => {
      const size = rnd(9, 17)
      const fallDur = rnd(9, 18)
      const swayDur = rnd(2.5, 5)
      const delay = rnd(0, fallDur * 0.9)
      const sway = swayAnims[randInt(0, swayAnims.length - 1)]
      const br = `${randInt(12, 22)}px ${randInt(1, 4)}px`

      const el = document.createElement('div')
      el.style.cssText = `
        pointer-events: none;
        position: absolute;
        left: ${rnd(2, 98)}vw;
        top: -5%;
        width: ${size}px;
        height: ${Math.round(size * 1.25)}px;
        background: ${PETAL_COLOR};
        border-radius: ${br};
        opacity: 0.88;
        animation:
          mic-petal-fall ${fallDur}s linear ${delay}s 1 forwards,
          ${sway} ${swayDur}s ease-in-out ${delay}s 1 forwards;
      `
      el.addEventListener('animationend', () => el.remove(), { once: true })
      container.appendChild(el)
      return el
    })

    return () => { nodes.forEach(n => n.isConnected && n.remove()); style.remove() }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  )
}
