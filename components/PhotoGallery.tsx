'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Props { photos: string[] }

export default function PhotoGallery({ photos }: Props) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (photos.length <= 1) return
    const id = setInterval(() => setCurrent(c => (c + 1) % photos.length), 4000)
    return () => clearInterval(id)
  }, [photos.length])

  if (!photos.length) return null

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl overflow-hidden aspect-[4/3] border border-[#c9a84c]/30">
      {photos.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image src={src} alt={`Julia & Ravi ${i + 1}`} fill className="object-cover" priority={i === 0} />
        </div>
      ))}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-[#c9a84c]' : 'bg-[#f5f0e8]/40'}`}
          />
        ))}
      </div>
    </div>
  )
}
