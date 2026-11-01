import { useEffect } from 'react'
import { Experience } from './components/Experience.jsx'
import { ScrollDriver } from './components/ScrollDriver.jsx'
import { Overlay } from './components/ui/Overlay.jsx'
import { useExperienceStore } from './store/useExperienceStore.js'

export default function App() {
  const phase = useExperienceStore((s) => s.phase)

  // Scroll yalnızca büyüme aşamasında serbest; ağaç tamamlanınca kilitlenir.
  useEffect(() => {
    document.documentElement.style.overflow = phase === 'growth' ? '' : 'hidden'
  }, [phase])

  return (
    <main>
      <Experience />
      <ScrollDriver />
      <a
        href="/"
        className="fixed top-5 left-[var(--gutter)] z-20 flex h-11 items-center rounded-full bg-cream px-5 text-lg font-medium tracking-[0.12em] text-ink no-underline"
      >
        HARPUT
      </a>
      <Overlay />
    </main>
  )
}
