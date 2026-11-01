import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PATHS } from '../../config/paths.js'
import { SELECTION_BRIGHTNESS, VIDEO_ELEMENT_ID, videoTimeAt } from '../../config/videoMap.js'
import { transient, useExperienceStore } from '../../store/useExperienceStore.js'
import { loadVideo, scrubVideo } from '../../ui/videoScrub.js'

gsap.registerPlugin(ScrollTrigger)

const { mapRange, clamp } = gsap.utils

const VIDEO_DURATION = 9.96
const STARTED_AT = 0.003
const LOOPED_AT = 0.995 // Video bitti: seçim ekranına geçilir.
const DIM_FROM = 0.9

/**
 * Seçilen hasadın dönüşüm videosu: seçim karesinden başlar, kendi scroll alanında ilerler.
 * Bitişteki davranış config/paths.js içindeki endBrightness ile belirlenir.
 */
export function VideoScene({ path }) {
  const { video: videoUrl, productWindow, endBrightness, result } = PATHS[path]
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
      const { sceneStage, startScene, completeScene, resumeScene, returnToGarden } =
        useExperienceStore.getState()
      const time = videoTimeAt(progress.value, VIDEO_DURATION)
      transient.sceneTime = time
      if (progress.value >= LOOPED_AT) {
        // Seçim ekranı videonun karartmasını devralır; kareler arasında parlaklık atlamaz.
        document.getElementById(VIDEO_ELEMENT_ID).style.filter = `brightness(${endBrightness})`
        returnToGarden()
        return
      }

      // Seçim ekranının karartmasına yaklaşarak iner; iki video arasında parlaklık atlamaz.
      if (progress.value > DIM_FROM) {
        const brightness = mapRange(DIM_FROM, LOOPED_AT, 1, endBrightness, progress.value)
        element.style.filter = `brightness(${clamp(endBrightness, 1, brightness)})`
      }

      const showProduct = time >= productWindow[0] && time < productWindow[1]
      if (showProduct) {
        if (sceneStage !== 'done') completeScene()
      } else if (sceneStage === 'done') {
        resumeScene() // Pencere dışında ürün kartı çekilir.
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
    loadVideo(videoUrl).then((url) => {
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
  }, [videoUrl, endBrightness, productWindow])

  return (
    <div
      ref={scroller}
      tabIndex={0}
      aria-label={`${result} videosu, kaydırarak ilerletin`}
      className="hidden-scrollbar absolute inset-0 overflow-y-auto overscroll-contain outline-none"
    >
      <div ref={track} className="relative h-[560vh]">
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
