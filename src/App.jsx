import { useEffect } from 'react'
import { Experience } from './components/Experience.jsx'
import { ScrollDriver } from './components/ScrollDriver.jsx'
import { Overlay } from './components/ui/Overlay.jsx'
import { BRAND } from './config/brand.js'
import { useExperienceStore } from './store/useExperienceStore.js'

export default function App() {
  const phase = useExperienceStore((s) => s.phase)
  const brandOpen = useExperienceStore((s) => s.brandOpen)

  // Scroll yalnızca büyüme aşamasında serbest; ağaç tamamlanınca kilitlenir.
  useEffect(() => {
    document.documentElement.style.overflow = phase === 'growth' && !brandOpen ? '' : 'hidden'
  }, [phase, brandOpen])

  return (
    <main>
      <Experience />
      <ScrollDriver />
      <a
        id="brand-pill"
        href="/"
        aria-label={BRAND.name}
        className="fixed top-5 left-[var(--gutter)] z-20 flex h-11 items-center rounded-full bg-cream px-5 text-xl font-medium tracking-[-0.03em] text-ink no-underline"
      >
        {BRAND.wordmark}
        <span className="text-cherry">.</span>
      </a>
      <Overlay />
    </main>
  )
}
