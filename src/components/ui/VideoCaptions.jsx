import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { HOTSPOTS, videoTimeAt, videoToScreen, VIDEO_DURATION } from '../../config/videoMap.js'
import { transient } from '../../store/useExperienceStore.js'
import { useViewport } from '../../ui/useViewport.js'

const FADE = 0.4
const RISE = 18
const PIT_CAPTION_WIDTH = 220
const NARROW_BREAKPOINT = 640

// Süreler video saniyesidir; her metnin başı videodaki gerçek ana oturur.
const CUES = [
  { id: 'castle', out: 1.3 }, // Video bu metinle açılır, yalnızca söner.
  { id: 'seed', in: 2.35, out: 4.6 }, // 2,3'e kadar dalış sürer, tohum sonra görünür.
  { id: 'tree', in: 5, out: 7 },
  { id: 'pit', in: 8.1, out: 9.5 }, // Vişne 8,0–8,3 arasında yarılır.
]

const shadow = '[text-shadow:0_1px_24px_rgba(22,11,12,.65)]'

/** Videoyla aynı zaman değerinden sürülen metinler: kareyle arada kayma olmaz. */
export function VideoCaptions() {
  const root = useRef(null)
  const { width, height } = useViewport()
  const pit = videoToScreen(HOTSPOTS.pit.u, HOTSPOTS.pit.v, width, height)
  const gap = HOTSPOTS.pit.radius * pit.frameWidth
  // Dar ekranda kesitin yanı boş değil: metin vişnelerin altına iner.
  const narrow = width < NARROW_BREAKPOINT

  useEffect(() => {
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
      timeline.set({}, {}, VIDEO_DURATION) // Süre videoyla eşit kalsın.

      CUES.forEach((cue) => {
        const target = `[data-caption="${cue.id}"]`
        if (cue.in !== undefined) {
          timeline.fromTo(
            target,
            { autoAlpha: 0, y: RISE },
            { autoAlpha: 1, y: 0, duration: FADE, ease: 'power2.out', immediateRender: true },
            cue.in,
          )
        }
        timeline.to(target, { autoAlpha: 0, y: -RISE, duration: FADE, ease: 'power2.in' }, cue.out)
      })

      const sync = () => {
        const time = videoTimeAt(transient.growth)
        if (time !== timeline.time()) timeline.time(time)
      }
      gsap.ticker.add(sync)
      gsap.from('[data-caption-intro]', { autoAlpha: 0, y: RISE, duration: 1, delay: 0.3, ease: 'power2.out' })
      return () => gsap.ticker.remove(sync)
    }, root)
    return () => context.revert()
  }, [])

  return (
    <div ref={root} className={`absolute inset-0 overflow-hidden text-cream ${shadow}`}>
      <div data-caption-intro className="absolute inset-x-[var(--gutter)] bottom-[13vh] text-center">
        <p
          data-caption="castle"
          className="m-0 text-[clamp(1.25rem,2.6vw,2.25rem)] leading-tight font-normal tracking-[-0.02em]"
        >
          Tarihin ve Doğanın Kesişim Noktası: Harput
        </p>
      </div>

      <div
        data-caption="seed"
        className="invisible absolute top-1/2 left-[var(--gutter)] w-[min(38vw,30rem)] -translate-y-1/2 max-sm:top-[22%] max-sm:w-[78vw]"
      >
        <h2 className="m-0 text-[clamp(2rem,4.6vw,4.25rem)] leading-[1.02] font-normal tracking-[-0.03em]">
          Bir Çekirdekten Doğan Mucize
        </h2>
        <p className="m-0 mt-4 text-[clamp(1rem,1.5vw,1.25rem)] leading-snug">
          Bereketli topraklarda filizlenen doğal yaşam
        </p>
      </div>

      {/* Kutu yok: köşeden yayılan karartma, parlak gökyüzünde yazıyı okunur tutar. */}
      <div
        data-caption="tree"
        className="invisible absolute top-0 right-0 h-[60vh] w-[75vw] bg-[radial-gradient(ellipse_at_top_right,rgba(22,11,12,.78)_0%,rgba(22,11,12,.45)_38%,transparent_72%)] sm:w-[60vw]"
      >
        <p className="label absolute top-24 right-[var(--gutter)] m-0">Harput bahçelerinden</p>
        <h2 className="absolute top-32 right-[var(--gutter)] m-0 max-w-[12ch] text-right text-[clamp(2.25rem,5vw,4.75rem)] leading-[1] font-normal tracking-[-0.03em]">
          Premium Elazığ Vişnesi
        </h2>
      </div>

      {/* Konum çekirdeğe bağlı: her ekran oranında kesitin hemen yanında kalır. */}
      <div
        data-caption="pit"
        className="invisible absolute flex items-center gap-3"
        style={
          narrow
            ? { left: 16, top: height - 88 }
            : { left: pit.x + gap + 90, top: pit.y, width: PIT_CAPTION_WIDTH }
        }
      >
        <span className="h-px w-8 shrink-0 bg-cream max-sm:hidden" aria-hidden />
        <p className="m-0 text-[clamp(1.25rem,2vw,1.75rem)] leading-tight tracking-[-0.02em]">
          Özündeki Saklı Değer
        </p>
      </div>
    </div>
  )
}
