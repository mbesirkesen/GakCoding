import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { VIDEO_ELEMENT_ID } from '../config/videoMap.js'
import { transient, useExperienceStore } from '../store/useExperienceStore.js'

gsap.registerPlugin(ScrollTrigger)

const SELECTION_AT = 0.999
const REWIND_AT = 0.985 // Aralık, sınırda menünün açılıp kapanmasını önler.

/** Scroll'u transient.growth'a çevirir; video ve metinler bu değeri izler. */
export function ScrollDriver() {
  const track = useRef(null)
  const phase = useExperienceStore((s) => s.phase)

  // Seçim ekranı kapanınca karartma kalkar; temizlikleri bittikten sonra çalışması için effect'te.
  useEffect(() => {
    if (phase !== 'growth') return
    const tween = gsap.to(document.getElementById(VIDEO_ELEMENT_ID), {
      filter: 'brightness(1)',
      duration: 0.5,
      ease: 'power1.out',
    })
    return () => tween.kill()
  }, [phase])

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.to(transient, {
        growth: 1,
        ease: 'none',
        scrollTrigger: { trigger: track.current, start: 'top top', end: 'bottom bottom', scrub: 1 },
        onUpdate: () => {
          // Scrub yumuşatması bitmeden kilitlememek için sayfanın değil tween'in sonu beklenir.
          const { phase, reachSelection, resumeGrowth } = useExperienceStore.getState()
          if (transient.growth >= SELECTION_AT) {
            reachSelection()
          } else if (phase === 'selection' && transient.growth < REWIND_AT) {
            resumeGrowth()
          }
        },
      })

      gsap.fromTo(
        document.getElementById('stage'),
        { clipPath: 'inset(25vh 5vw 9vh 5vw round 20px)' },
        {
          clipPath: 'inset(0vh 0vw 0vh 0vw round 0px)',
          ease: 'none',
          scrollTrigger: { start: 0, end: () => window.innerHeight * 0.9, scrub: true },
        },
      )

    }, track)
    return () => context.revert()
  }, [])

  return <div ref={track} className="pointer-events-none h-[600vh]" aria-hidden />
}
