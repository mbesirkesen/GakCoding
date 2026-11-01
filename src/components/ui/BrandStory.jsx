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
  const requestClose = useRef(() => {})

  useEffect(() => {
    const previousFocus = document.activeElement
    closeButton.current.focus()
    let intro = null
    let closing = false

    const context = gsap.context(() => {
      intro = gsap
        .timeline()
        .from(root.current, { yPercent: 100, duration: 0.6, ease: 'power3.inOut' })
        .from('[data-reveal]', { autoAlpha: 0, y: 28, duration: 0.7, stagger: 0.07, ease: 'power3.out' }, '-=0.15')
    }, root)

    // Açılışın tersi: içerik çekilir, panel aşağı iner; store ancak animasyon bitince güncellenir.
    requestClose.current = () => {
      if (closing) return
      closing = true
      intro.kill()
      context.add(() => {
        gsap
          .timeline({ onComplete: () => setBrandOpen(false) })
          .to('[data-reveal]', { autoAlpha: 0, y: -16, duration: 0.25, stagger: 0.02, ease: 'power2.in' })
          .to(root.current, { yPercent: 100, duration: 0.55, ease: 'power3.inOut' }, '-=0.1')
      })
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') requestClose.current()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
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
      className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-cherry px-[var(--gutter)] py-5 text-cream"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[1400px] flex-col gap-12 pb-8 sm:gap-16">
        <div className="flex items-center justify-between">
          <p className="label m-0">Hikâyemiz</p>
          <button
            ref={closeButton}
            onClick={() => requestClose.current()}
            className="label flex h-11 cursor-pointer items-center rounded-full bg-cream px-5 text-ink"
          >
            Kapat
          </button>
        </div>

        <div data-reveal className="min-w-0">
          <h2 className="m-0 max-w-full text-[clamp(3.25rem,11.2vw,9.5rem)] leading-[0.84] font-medium tracking-[-0.06em]">
            {BRAND.wordmark}.
          </h2>
          <p className="m-0 mt-5 max-w-[16ch] text-[clamp(1.5rem,2.5vw,2.15rem)] leading-[1.08] tracking-[-0.03em]">
            {BRAND.meaning}
          </p>
        </div>

        <figure data-reveal className="m-0 border-t border-cream/35 pt-6">
          <blockquote className="m-0 text-[clamp(2rem,5vw,4.25rem)] leading-[0.95] font-medium tracking-[-0.045em]">
            “{BRAND.quote}”
          </blockquote>
          <figcaption className="label mt-4 opacity-80">{BRAND.origin}</figcaption>
        </figure>

        <div className="grid min-w-0 gap-10 lg:grid-cols-12 lg:gap-[4vw]">
          <div className="flex min-w-0 max-w-[46ch] flex-col gap-5 text-[1.0625rem] leading-snug lg:col-span-7">
            {BRAND.story.map((paragraph) => (
              <p key={paragraph} data-reveal className="m-0">
                {paragraph}
              </p>
            ))}
          </div>
          <ol className="m-0 min-w-0 list-none p-0 lg:col-span-5">
            {BRAND.roots.map(({ word, text }, index) => (
              <li key={word} data-reveal className="grid grid-cols-[auto_1fr] gap-x-4 border-t border-cream/35 py-4">
                <span className="label pt-1 opacity-70">0{index + 1}</span>
                <div>
                  <h3 className="m-0 text-2xl font-normal tracking-[-0.03em]">{word}</h3>
                  <p className="m-0 mt-1 leading-snug opacity-80">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <ol className="m-0 mt-auto grid list-none gap-4 p-0 sm:grid-cols-3 sm:gap-[2vw]">
          {BRAND.values.map(({ title, text }, index) => (
            <li key={title} data-reveal className="border-t border-cream/40 pt-3">
              <span className="label">0{index + 1}</span>
              <h3 className="m-0 mt-1 text-2xl font-normal tracking-[-0.02em]">{title}</h3>
              <p className="m-0 mt-1 leading-snug opacity-85">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
