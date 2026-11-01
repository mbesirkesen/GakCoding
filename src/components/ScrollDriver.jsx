import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { transient, useExperienceStore } from '../store/useExperienceStore.js'

gsap.registerPlugin(ScrollTrigger)

const CHAPTERS = [
  { top: '115vh', align: 'left', color: 'text-cream', lines: ['Harput’un', 'toprağına düşer.'] },
  { top: '225vh', align: 'right', color: 'text-cream', lines: ['Sabırla', 'filizlenir.'] },
  { top: '335vh', align: 'left', color: 'text-cream', lines: ['Dal dal', 'yükselir.'] },
  { top: '445vh', align: 'right', color: 'text-cream', lines: ['Ve meyveye', 'durur.'] },
]

/** Scroll'u transient.growth'a çevirir; video, bölüm yazıları ve çerçeve buradan sürülür. */
export function ScrollDriver() {
  const track = useRef(null)
  const finished = useExperienceStore((s) => s.phase === 'selection' || s.phase === 'scene')

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.to(transient, {
        growth: 1,
        ease: 'none',
        scrollTrigger: { trigger: track.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
        onUpdate: () => {
          // Scrub yumuşatması bitmeden kilitlememek için sayfanın değil tween'in sonu beklenir.
          if (transient.growth >= 0.999) useExperienceStore.getState().reachSelection()
        },
      })

      gsap.fromTo(
        document.getElementById('stage'), // Scope dışında: track'in içinde değil.
        { clipPath: 'inset(25vh 5vw 9vh 5vw round 20px)' },
        {
          clipPath: 'inset(0vh 0vw 0vh 0vw round 0px)',
          ease: 'none',
          scrollTrigger: { start: 0, end: () => window.innerHeight * 0.9, scrub: true },
        },
      )

      gsap.utils.toArray('[data-line]').forEach((line) => {
        gsap.from(line, {
          yPercent: 110,
          ease: 'none',
          scrollTrigger: { trigger: line.parentElement, start: 'top 92%', end: 'top 58%', scrub: 0.4 },
        })
      })
    }, track)
    return () => context.revert()
  }, [])

  return (
    <div
      ref={track}
      className={`pointer-events-none relative h-[600vh] overflow-hidden ${finished ? 'invisible' : ''}`}
      aria-hidden
    >
      <div className="absolute inset-0">
        {CHAPTERS.map(({ top, align, color, lines }) => (
          <p
            key={top}
            style={{ top }}
            className={`absolute inset-x-[var(--gutter)] m-0 ${color} [text-shadow:0_2px_32px_rgba(22,11,12,.45)] text-[length:var(--text-giant)] leading-[0.98] font-normal tracking-[-0.03em] ${
              align === 'right' ? 'text-right' : ''
            }`}
          >
            {lines.map((line) => (
              <span key={line} className="block overflow-hidden pb-[0.12em]">
                <span data-line className="block">
                  {line}
                </span>
              </span>
            ))}
          </p>
        ))}
      </div>
    </div>
  )
}
