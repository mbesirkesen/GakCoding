import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { transient, useExperienceStore } from '../store/useExperienceStore.js'

gsap.registerPlugin(ScrollTrigger)

/** Scroll'u transient.growth'a çevirir; video ve metinler bu değeri izler. */
export function ScrollDriver() {
  const track = useRef(null)

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
