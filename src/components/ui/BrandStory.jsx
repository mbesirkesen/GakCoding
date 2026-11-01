import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { BRAND } from '../../config/brand.js'
import { useExperienceStore } from '../../store/useExperienceStore.js'

export function BrandStory() {
  const open = useExperienceStore((s) => s.brandOpen)
  return open ? <BrandPanel /> : null
}

function BrandPanel() {
  const setBrandOpen = useExperienceStore((s) => s.setBrandOpen)
  const root = useRef(null)
  const closeButton = useRef(null)

  useEffect(() => {
    const previousFocus = document.activeElement
    closeButton.current.focus()
    const close = (event) => event.key === 'Escape' && setBrandOpen(false)
    window.addEventListener('keydown', close)

    const context = gsap.context(() => {
      gsap
        .timeline()
        .from(root.current, { yPercent: 100, duration: 0.6, ease: 'power3.inOut' })
        .from('[data-reveal]', { autoAlpha: 0, y: 28, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, '-=0.15')
    }, root)

    return () => {
      window.removeEventListener('keydown', close)
      context.revert()
      previousFocus?.focus?.()
    }
  }, [setBrandOpen])

  return (
    <section
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${BRAND.name} hikâyesi`}
      className="fixed inset-0 z-40 flex flex-col justify-between gap-8 overflow-y-auto overscroll-contain bg-cherry px-[var(--gutter)] py-5 text-cream"
    >
      <div className="flex items-center justify-between">
        <p className="label m-0">Hikâyemiz</p>
        <button
          ref={closeButton}
          onClick={() => setBrandOpen(false)}
          className="label flex h-11 cursor-pointer items-center rounded-full bg-cream px-5 text-ink"
        >
          Kapat
        </button>
      </div>

      <div>
        <h2
          data-reveal
          className="m-0 text-[clamp(3.5rem,15vw,15rem)] leading-[0.85] font-medium tracking-[-0.055em]"
        >
          {BRAND.wordmark}.
        </h2>
        <p
          data-reveal
          className="m-0 mt-6 max-w-[24ch] text-[clamp(1.5rem,3.4vw,3rem)] leading-[1.08] tracking-[-0.025em]"
        >
          {BRAND.meaning}
        </p>
        <p data-reveal className="m-0 mt-4 max-w-[48ch] text-lg leading-snug opacity-85">
          {BRAND.story}
        </p>
      </div>

      <ol className="m-0 grid list-none gap-4 p-0 sm:grid-cols-3 sm:gap-[2vw]">
        {BRAND.values.map(({ title, text }, index) => (
          <li key={title} data-reveal className="border-t border-cream/40 pt-3">
            <span className="label">0{index + 1}</span>
            <h3 className="m-0 mt-1 text-2xl font-normal tracking-[-0.02em]">{title}</h3>
            <p className="m-0 mt-1 leading-snug opacity-85">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
