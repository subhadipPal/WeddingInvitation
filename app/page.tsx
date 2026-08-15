import { readdirSync } from 'fs'
import { join } from 'path'
import ScrollInvitation from '@/components/ScrollInvitation'

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
  return <ScrollInvitation lang="de" photos={getPhotoList()} />
}
