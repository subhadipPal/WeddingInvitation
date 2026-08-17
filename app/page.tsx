import { readdirSync } from 'fs'
import { join } from 'path'
import { loadTranslations } from '@/lib/i18n'
import ScrollInvitation from '@/components/ScrollInvitation'

function getPhotoList(): string[] {
  try {
    const dir = join(process.cwd(), 'public', 'photos')
    return readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f) && f !== 'background.jpeg')
      .sort()
      .map(f => `/photos/${f}`)
  } catch {
    return []
  }
}

export default async function HomePage() {
  const translations = await loadTranslations('de')
  return <ScrollInvitation lang="de" translations={translations} photos={getPhotoList()} />
}
