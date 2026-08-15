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

export default function HomePageEn() {
  const photos = getPhotoList()

  return (
    <main className="relative min-h-[100dvh] overflow-hidden flex flex-col">
      <MandalaDecor />

      <div className="absolute top-4 right-4 z-20">
        <LanguageToggle lang="en" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-8 z-10 min-h-[100dvh]">
        <p className="font-serif text-[#c9a84c]/70 text-[10px] tracking-[0.5em] uppercase">
          Save the Date
        </p>

        <h1 className="font-script text-4xl sm:text-6xl text-[#c9a84c] text-center leading-tight">
          Julia Schulze<br />&amp;<br />Subhadip Pal
        </h1>
        <p className="font-serif text-[#f5f0e8]/40 text-xs tracking-widest uppercase -mt-1">
          aka Ravi
        </p>

        <div className="w-16 h-px bg-[#c9a84c]/40 my-1" />

        <EnvelopeAnimation lang="en" />

        <div className="mt-2">
          <CountdownTimer lang="en" />
        </div>
      </div>

      {photos.length > 0 && (
        <div className="px-4 pb-12 z-10 max-w-lg mx-auto w-full">
          <div className="w-16 h-px bg-[#c9a84c]/40 mx-auto mb-6" />
          <PhotoGallery photos={photos} />
        </div>
      )}

      <MusicPlayer />
    </main>
  )
}
