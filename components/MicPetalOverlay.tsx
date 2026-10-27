'use client'
import { useEffect, useRef } from 'react'

// Petal colors: deep crimson + warm golden-marigold + dusty rose — Indian wedding palette
const COLORS = [
  '#8B0000', // deep crimson
  '#C41E3A', // rose crimson
  '#B22222', // firebrick red
  '#D4872A', // marigold gold
  '#C17817', // deep gold
  '#A0522D', // sienna marigold
  '#CD5C5C', // indian red
  '#E8956D', // coral rose
]

// sway keyframes: 9 variants matching reference site approach
const SWAY_COUNT = 9

function rnd(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function randInt(min: number, max: number) {
  return Math.floor(rnd(min, max + 1))
}

type PetalConfig = {
  id: number
  left: number        // vw position
  size: number        // px
  color: string
  fallDuration: number  // s
  blowAnim: string
  blowDuration: number
  swayAnim: number    // 0–8
  swayDuration: number
  delay: number       // s
  borderRadius: string
}

function makePetal(id: number): PetalConfig {
  const size = rnd(8, 18)
  const fallDuration = rnd(8, 16)
  const blowTypes = ['blow-soft-left', 'blow-medium-left', 'blow-soft-right', 'blow-medium-right']
  return {
    id,
    left: rnd(0, 100),
    size,
    color: COLORS[randInt(0, COLORS.length - 1)],
    fallDuration,
    blowAnim: blowTypes[randInt(0, blowTypes.length - 1)],
    blowDuration: rnd(25, 40),
    swayAnim: randInt(0, SWAY_COUNT - 1),
    swayDuration: rnd(2, 5),
    delay: rnd(0, fallDuration),
    borderRadius: `${randInt(10, 22)}px ${randInt(1, 4)}px`,
  }
}

export default function MicPetalOverlay() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const PETAL_COUNT = 55
    const petals: PetalConfig[] = Array.from({ length: PETAL_COUNT }, (_, i) => makePetal(i))

    // Inject keyframes into a style tag once
    const style = document.createElement('style')
    style.textContent = `
      @keyframes mic-fall {
        0%   { opacity: 0.9; top: 0px; }
        100% { opacity: 0.15; top: 100%; }
      }
      @keyframes mic-blow-soft-left {
        0%   { margin-left: 0; }
        100% { margin-left: -40vw; }
      }
      @keyframes mic-blow-medium-left {
        0%   { margin-left: 0; }
        100% { margin-left: -80vw; }
      }
      @keyframes mic-blow-soft-right {
        0%   { margin-left: 0; }
        100% { margin-left: 40vw; }
      }
      @keyframes mic-blow-medium-right {
        0%   { margin-left: 0; }
        100% { margin-left: 80vw; }
      }
      ${Array.from({ length: SWAY_COUNT }, (_, i) => {
        const base = i * 12
        return `
          @keyframes mic-sway-${i} {
            0%   { transform: rotate(${base - 5}deg); }
            40%  { transform: rotate(${base + 30}deg); }
            100% { transform: rotate(${base + 8}deg); }
          }
        `
      }).join('')}
    `
    document.head.appendChild(style)

    // Create DOM petal nodes
    const nodes: HTMLDivElement[] = petals.map(p => {
      const el = document.createElement('div')
      el.style.cssText = `
        pointer-events: none;
        position: absolute;
        left: ${p.left}vw;
        top: -20px;
        width: ${p.size}px;
        height: ${Math.round(p.size * 1.2)}px;
        background: ${p.color};
        border-radius: ${p.borderRadius};
        opacity: 0.85;
        animation:
          mic-fall ${p.fallDuration}s linear ${p.delay}s infinite,
          ${p.blowAnim.replace('blow-', 'mic-blow-')} ${p.blowDuration}s linear 0s infinite,
          mic-sway-${p.swayAnim} ${p.swayDuration}s linear 0s infinite;
      `
      container.appendChild(el)
      return el
    })

    return () => {
      nodes.forEach(n => n.remove())
      style.remove()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      aria-hidden="true"
    />
  )
}
