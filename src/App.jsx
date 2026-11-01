import { useEffect } from 'react'
import { Experience } from './components/Experience.jsx'
import { ScrollDriver } from './components/ScrollDriver.jsx'
import { Overlay } from './components/ui/Overlay.jsx'
import { BRAND } from './config/brand.js'
import { useExperienceStore } from './store/useExperienceStore.js'

export default function App() {
  const phase = useExperienceStore((s) => s.phase)
  const brandOpen = useExperienceStore((s) => s.brandOpen)

  // Seçim ekranında da serbest: yukarı kaydırınca video geri sarılır.
  useEffect(() => {
    const scrollable = (phase === 'growth' || phase === 'selection') && !brandOpen
    document.documentElement.style.overflow = scrollable ? '' : 'hidden'
  }, [phase, brandOpen])

  return (
    <main>
      <Experience />
      <ScrollDriver />
      <a
        id="brand-pill"
        href="/"
        aria-label={BRAND.name}
        className="fixed top-5 left-[var(--gutter)] z-20 flex h-11 items-center gap-2 rounded-full bg-cream px-3.5 pr-5 text-xl font-medium tracking-[-0.03em] text-ink no-underline"
      >
        <img src="/logo.png" alt="" aria-hidden className="h-8 w-auto" />
        {BRAND.wordmark}
        <span className="text-cherry">.</span>
      </a>
      <Overlay />
    </main>
  )
}
