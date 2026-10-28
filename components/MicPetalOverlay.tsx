'use client'
import { useEffect, useRef } from 'react'

// White and silver snowflake colours only
const FLAKE_COLORS = ['#ffffff', '#e8e8e8', '#c8d8e8', '#dce8f0']
const FLAKE_COUNT = 15
// Unicode snowflake characters for variety
const FLAKE_CHARS = ['❄', '❅', '❆', '✦', '✧']

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
        @keyframes mic-flake-fall {
          0%   { top: -5%; opacity: 0.9; }
          100% { top: 105%; opacity: 0.15; }
        }
        @keyframes mic-flake-spin-a {
          0%   { transform: rotate(0deg)   translateX(0); }
          30%  { transform: rotate(72deg)  translateX(20px); }
          60%  { transform: rotate(144deg) translateX(-15px); }
          100% { transform: rotate(360deg) translateX(10px); }
        }
        @keyframes mic-flake-spin-b {
          0%   { transform: rotate(0deg)   translateX(0); }
          40%  { transform: rotate(-90deg) translateX(-18px); }
          80%  { transform: rotate(-200deg) translateX(22px); }
          100% { transform: rotate(-360deg) translateX(-8px); }
        }
        @keyframes mic-flake-spin-c {
          0%   { transform: rotate(0deg)  translateX(0); }
          50%  { transform: rotate(180deg) translateX(25px); }
          100% { transform: rotate(360deg) translateX(-12px); }
        }
      }
    `
    document.head.appendChild(style)

    const spinAnims = ['mic-flake-spin-a', 'mic-flake-spin-b', 'mic-flake-spin-c']

    function spawnFlake(el: HTMLDivElement, initialDelay?: number) {
      const size = rnd(10, 20)
      const fallDur = rnd(12, 24)
      const spinDur = rnd(4, 9)
      const delay = initialDelay ?? 0
      const spin = spinAnims[randInt(0, spinAnims.length - 1)]
      const color = FLAKE_COLORS[randInt(0, FLAKE_COLORS.length - 1)]
      const char = FLAKE_CHARS[randInt(0, FLAKE_CHARS.length - 1)]

      const node = document.createElement('div')
      node.textContent = char
      node.style.cssText = `
        pointer-events: none;
        position: absolute;
        left: ${rnd(2, 98)}vw;
        top: -5%;
        font-size: ${size}px;
        line-height: 1;
        color: ${color};
        text-shadow: 0 0 6px rgba(200,230,255,0.6);
        opacity: 0.88;
        user-select: none;
        animation:
          mic-flake-fall ${fallDur}s linear ${delay}s 1 forwards,
          ${spin} ${spinDur}s linear ${delay}s infinite;
      `
      node.addEventListener('animationend', (e: AnimationEvent) => {
        if (e.animationName === 'mic-flake-fall') {
          node.remove()
          if (el.isConnected) spawnFlake(el)
        }
      })
      el.appendChild(node)
      return node
    }

    function spawnFlakes(el: HTMLDivElement) {
      return Array.from({ length: FLAKE_COUNT }, () => spawnFlake(el, rnd(0, 3)))
    }

    let nodes: HTMLDivElement[] = []
    const onOpen = () => { nodes = spawnFlakes(container) }
    window.addEventListener('mic:curtain-opened', onOpen, { once: true })

    return () => {
      window.removeEventListener('mic:curtain-opened', onOpen)
      nodes.forEach(n => n.isConnected && n.remove())
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
