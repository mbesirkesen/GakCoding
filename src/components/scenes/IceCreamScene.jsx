import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ICE_CREAM_VIDEO_URL, SELECTION_BRIGHTNESS } from '../../config/videoMap.js'
import { useExperienceStore } from '../../store/useExperienceStore.js'
import { loadVideo, scrubVideo } from '../../ui/videoScrub.js'

gsap.registerPlugin(ScrollTrigger)

const STARTED_AT = 0.003
const FINISHED_AT = 0.995

/** Vişnenin dondurmaya dönüşümü: seçim karesinden başlar, kendi scroll alanında ilerler. */
export function IceCreamScene() {
  const scroller = useRef(null)
  const track = useRef(null)
  const video = useRef(null)

  useEffect(() => {
    const element = video.current
    const area = scroller.current
    const progress = { value: 0 }
    let disposed = false
    area.focus({ preventScroll: true }) // Ok ve boşluk tuşları da kaydırsın.

    const onUpdate = () => {
      const { sceneStage, startScene, completeScene, resumeScene } = useExperienceStore.getState()
      if (progress.value >= FINISHED_AT) {
        if (sceneStage !== 'done') completeScene()
      } else if (sceneStage === 'done') {
        resumeScene() // Geri kaydırınca ürün kartı çekilir.
      } else if (progress.value > STARTED_AT) {
        startScene()
      }
    }

    // Seçim ekranındaki karartmayla aynı parlaklıktan açılır; geçiş kesik görünmez.
    const reveal = () => {
      gsap.fromTo(
        element,
        { autoAlpha: 1, filter: `brightness(${SELECTION_BRIGHTNESS})` },
        { filter: 'brightness(1)', duration: 0.9, ease: 'power1.out' },
      )
    }
    element.addEventListener('loadeddata', reveal, { once: true })
    loadVideo(ICE_CREAM_VIDEO_URL).then((url) => {
      if (!disposed) element.src = url
    })

    const stopScrub = scrubVideo(element, () => progress.value)
    const context = gsap.context(() => {
      gsap.to(progress, {
        value: 1,
        ease: 'none',
        onUpdate,
        scrollTrigger: {
          scroller: area,
          trigger: track.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      })
    })

    return () => {
      disposed = true
      stopScrub()
      context.revert()
      gsap.killTweensOf(element)
      element.removeEventListener('loadeddata', reveal)
    }
  }, [])

  return (
    <div
      ref={scroller}
      tabIndex={0}
      aria-label="Vişne dondurma videosu, kaydırarak ilerletin"
      className="hidden-scrollbar absolute inset-0 overflow-y-auto overscroll-contain outline-none"
    >
      <div ref={track} className="relative h-[450vh]">
        <video
          ref={video}
          className="invisible sticky top-0 h-screen w-full object-cover"
          muted
          playsInline
          preload="auto"
        />
      </div>
    </div>
  )
}
