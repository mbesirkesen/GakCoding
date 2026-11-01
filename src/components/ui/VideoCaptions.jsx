import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { videoTimeAt, VIDEO_DURATION } from '../../config/videoMap.js'
import { transient } from '../../store/useExperienceStore.js'

const FADE = 0.4
const RISE = 18

// Süreler video saniyesidir; her metnin başı videodaki gerçek ana oturur.
// Vişne cümleleri TÜRKPATENT sicil belgesi No 1273’ten (08.12.2022). Belge yıl, kişi veya efsane yazmaz.
const CUES = [
  { id: 'castle', out: 1.9 }, // Kale karesi. Dalış bulanıklaşırken söner, çekirdek yazısından önce biter.
  { id: 'seed', in: 2.35, out: 4.6 }, // 2,3'e kadar dalış sürer, tohum sonra görünür.
  { id: 'tree', in: 4.85, out: 6.35 }, // Fidan ve ilk meyve: vişne nedir.
  { id: 'fruit', in: 6.5, out: 8.0 }, // İki vişne asılıyken: ayırt edici özellik.
  { id: 'harvest', in: 8.15, out: 9.5 }, // Kesit açılınca: hasat ve kullanım. Seçim ekranından önce söner.
]

const shadow = '[text-shadow:0_1px_24px_rgba(22,11,12,.65)]'

/** Videoyla aynı zaman değerinden sürülen metinler: kareyle arada kayma olmaz. */
export function VideoCaptions() {
  const root = useRef(null)

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
      <div data-caption-intro className="absolute bottom-[12vh] left-[var(--gutter)] w-[min(36rem,78vw)] text-left">
        <div data-caption="castle">
          <p className="label m-0">Harput</p>
          <h2 className="m-0 mt-2 max-w-[16ch] text-[clamp(1.7rem,3.2vw,2.85rem)] leading-[1.02] font-normal tracking-[-0.03em]">
            Kayalığın üstündeki şehir
          </h2>
          <p className="m-0 mt-3 max-w-[44ch] text-[clamp(0.95rem,1.3vw,1.125rem)] leading-snug">
            Elazığ’ın eski merkezi burası. Kale, derin uçurumlarla çevrili bir kayanın üstünde durur.
          </p>
          <p className="m-0 mt-2 max-w-[48ch] text-[clamp(0.95rem,1.3vw,1.125rem)] leading-snug">
            1834’te Reşid Mehmed Paşa merkezi ovaya indirdi. 1867’de şehre Mamuretülaziz denildi; halk Elaziz dedi.
            1937’de ad Elazığ oldu.
          </p>
        </div>
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

      <div
        data-caption="tree"
        className="invisible absolute right-[var(--gutter)] bottom-[11vh] w-[min(18rem,36vw)] text-right"
      >
        <p className="label m-0">Elazığ vişnesi · mahreç</p>
        <h2 className="m-0 mt-2 max-w-[16ch] text-[clamp(1.45rem,2.3vw,2.1rem)] leading-[1.02] font-normal tracking-[-0.03em]">
          Prunus cerasus.
        </h2>
        <p className="m-0 mt-3 max-w-[46ch] text-[clamp(0.95rem,1.3vw,1.125rem)] leading-snug">
          Yuvarlak, eti dolu bir vişne. Olgunlaşınca rengi bordo olur.
        </p>
        <p className="m-0 mt-2 max-w-[48ch] text-[clamp(0.95rem,1.3vw,1.125rem)] leading-snug">
          Geçmişi eskiye dayanır. 8 Aralık 2022’de tescil edildi; ünü Elazığ ile bağlıdır.
        </p>
      </div>

      <div
        data-caption="fruit"
        className="invisible absolute right-[var(--gutter)] bottom-[11vh] w-[min(18rem,36vw)] text-right"
      >
        <p className="label m-0">Ayırt eden</p>
        <h2 className="m-0 mt-2 max-w-[18ch] text-[clamp(1.45rem,2.3vw,2.1rem)] leading-[1.02] font-normal tracking-[-0.03em]">
          Mayhoş, çok sulu, lifli.
        </h2>
        <p className="m-0 mt-3 text-[clamp(0.95rem,1.3vw,1.125rem)] leading-snug">
          Orta yumuşak. Saplı 4,50–6 gram, sapsız 4,48–5,58 gram.
        </p>
        <p className="m-0 mt-2 text-[clamp(0.95rem,1.3vw,1.125rem)] leading-snug">
          Ağaç bir anaca gerek duymaz. Kendi tohumundan ya da köklü çelikten yetişir.
        </p>
      </div>

      <div
        data-caption="harvest"
        className="invisible absolute right-[var(--gutter)] bottom-[11vh] w-[min(18rem,36vw)] text-right"
      >
        <p className="label m-0">Hasat</p>
        <h2 className="m-0 mt-2 max-w-[16ch] text-[clamp(1.45rem,2.3vw,2.1rem)] leading-[1.02] font-normal tracking-[-0.03em]">
          Bir defada, sapıyla.
        </h2>
        <p className="m-0 mt-3 max-w-[46ch] text-[clamp(0.95rem,1.3vw,1.125rem)] leading-snug">
          İklimin izin verdiği anda, haziran sonu ile temmuzda elle toplanır. Ağaç başına verim 25 kilo kadardır.
        </p>
        <p className="m-0 mt-2 max-w-[48ch] text-[clamp(0.95rem,1.3vw,1.125rem)] leading-snug">
          Sofraya gelir. Dondurmaya, meyveli yoğurda, meyve suyuna ve recele de gider.
        </p>
      </div>
    </div>
  )
}
