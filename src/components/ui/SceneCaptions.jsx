import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { PATHS } from '../../config/paths.js'
import { transient } from '../../store/useExperienceStore.js'

const FADE = 0.4
const RISE = 18
const DURATION = 10 // Dönüşüm videosunun süresi (sn).

/** Dönüşüm videosuyla aynı zaman değerinden sürülen yazılar; sağ ve sol sırayla girer. */
export function SceneCaptions({ path }) {
  const root = useRef(null)
  const captions = PATHS[path].captions

  useEffect(() => {
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
      timeline.set({}, {}, DURATION)
      captions.forEach((cue, index) => {
        const target = `[data-cue="${index}"]`
        timeline.fromTo(
          target,
          { autoAlpha: 0, y: RISE },
          { autoAlpha: 1, y: 0, duration: FADE, ease: 'power2.out', immediateRender: true },
          cue.in,
        )
        timeline.to(target, { autoAlpha: 0, y: -RISE, duration: FADE, ease: 'power2.in' }, cue.out)
      })
      const sync = () => {
        if (transient.sceneTime !== timeline.time()) timeline.time(transient.sceneTime)
      }
      gsap.ticker.add(sync)
      return () => gsap.ticker.remove(sync)
    }, root)
    return () => context.revert()
  }, [captions])

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden text-cream [text-shadow:0_1px_24px_rgba(22,11,12,.75)]">
      {captions.map((cue, index) => {
        const left = cue.side === 'left'
        return (
          <div
            key={cue.title}
            data-cue={index}
            className={`invisible absolute top-[38%] w-[min(34vw,28rem)] max-sm:top-[14%] max-sm:w-[80vw] ${
              left ? 'left-[var(--gutter)]' : 'right-[var(--gutter)] text-right max-sm:left-auto'
            }`}
          >
            <p className="label m-0 mb-3">{cue.kicker}</p>
            <h2 className="m-0 text-[clamp(1.75rem,3.8vw,3.5rem)] leading-[1.02] font-normal tracking-[-0.03em]">
              {cue.title}
            </h2>
            <p className="m-0 mt-4 text-[clamp(1rem,1.4vw,1.2rem)] leading-snug">{cue.text}</p>
          </div>
        )
      })}
    </div>
  )
}
