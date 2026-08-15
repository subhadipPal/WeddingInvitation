import { readdirSync } from 'fs'
import { join } from 'path'
import MandalaDecor from '@/components/MandalaDecor'
import EnvelopeAnimation from '@/components/EnvelopeAnimation'
import MusicPlayer from '@/components/MusicPlayer'
import PhotoGallery from '@/components/PhotoGallery'
import CountdownTimer from '@/components/CountdownTimer'
import LanguageToggle from '@/components/LanguageToggle'

function getPhotoList(): string[] {
  try {
    const dir = join(process.cwd(), 'public', 'photos')
    return readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .map(f => `/photos/${f}`)
  } catch {
    return []
  }
}

export default function HomePage() {
  const photos = getPhotoList()

  return (
    <main className="relative min-h-screen bg-[#1a0a0a] overflow-hidden flex flex-col">
      <MandalaDecor />

      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle lang="de" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-16 z-10">
        <p className="font-serif text-[#c9a84c]/70 text-xs tracking-[0.4em] uppercase">Save the Date</p>

        <h1 className="font-script text-5xl sm:text-7xl text-[#c9a84c] text-center leading-tight">
          Julia Schulze<br />&amp;<br />Subhadip Pal
        </h1>
        <p className="font-serif text-[#f5f0e8]/50 text-sm tracking-widest uppercase">aka Ravi</p>

        <div className="w-24 h-px bg-[#c9a84c]/50" />

        <EnvelopeAnimation lang="de" />

        <div className="mt-4">
          <CountdownTimer lang="de" />
        </div>
      </div>

      {photos.length > 0 && (
        <div className="px-4 pb-16 z-10 max-w-2xl mx-auto w-full">
          <div className="w-24 h-px bg-[#c9a84c]/50 mx-auto mb-8" />
          <PhotoGallery photos={photos} />
        </div>
      )}

      <MusicPlayer />
    </main>
  )
}
