import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PATHS } from '../../config/paths.js'
import {
  ANIMATION_SECONDS,
  DISSOLVE_SECONDS,
  ICE_CREAM,
  SCENES,
  SHADE_OUT_SECONDS,
  STILL_FRAMES,
} from '../../config/iceCream.js'
import { SELECTION_BRIGHTNESS } from '../../config/videoMap.js'
import { useExperienceStore } from '../../store/useExperienceStore.js'
import { frameUrl, onFramesProgress, startFrameRenderer } from '../../ui/frameSequence.js'

gsap.registerPlugin(ScrollTrigger)

const FADE = 0.2
const SLIDE = 36
const heading = 'font-serif leading-[1.02] font-normal tracking-[-0.01em]'
const legible = '[text-shadow:0_2px_24px_rgba(22,11,12,.6)]'

export function IceCreamLanding() {
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  return reduced ? <StillStory /> : <ScrubStory />
}

/** Video kareleri canvas'ta; metinler aynı scroll ilerlemesine bağlı bir timeline'dan sürülür. */
function ScrubStory() {
  const scroller = useRef(null)
  const track = useRef(null)
  const canvas = useRef(null)
  const [loaded, setLoaded] = useState(0)
  const ready = loaded >= 1

  useEffect(() => onFramesProgress(setLoaded), [])

  useEffect(() => {
    if (!ready) return
    const area = scroller.current
    const progress = { value: 0 }
    area.focus({ preventScroll: true })
    // Son karede canvas eriyip altındaki seçim karesini açar; sonra seçim ekranına geçilir.
    const stopRenderer = startFrameRenderer(canvas.current, () => progress.value, () => {
      useExperienceStore.getState().returnToGarden()
    })

    const context = gsap.context(() => {
      // Seçim karesinin karartmasından açılır; geçişte parlaklık atlamaz.
      gsap.fromTo(
        canvas.current,
        { autoAlpha: 1, filter: `brightness(${SELECTION_BRIGHTNESS})` },
        { filter: 'brightness(1)', duration: 0.9, ease: 'power1.out' },
      )

      const scrollTrigger = {
        scroller: area,
        trigger: track.current,
        start: 'top top',
        end: 'bottom bottom',
      }
      ScrollTrigger.create({
        ...scrollTrigger,
        onUpdate: (self) => {
          progress.value = self.progress
        },
      })

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { ...scrollTrigger, scrub: 0.3 },
      })
      timeline.set({}, {}, ANIMATION_SECONDS)

      Object.entries(SCENES).forEach(([id, scene]) => {
        const target = `[data-scene="${id}"]`
        const items = id === 'process' ? '[data-scene="process"] li' : target
        if (scene.in !== undefined) {
          timeline.set(target, { autoAlpha: 1 }, scene.in)
          timeline.fromTo(
            items,
            { autoAlpha: 0, y: SLIDE },
            { autoAlpha: 1, y: 0, duration: FADE, stagger: 0.06 },
            scene.in,
          )
        }
        if (scene.out !== undefined) {
          timeline.to(target, { autoAlpha: 0, y: -SLIDE, duration: FADE }, scene.out - FADE)
        }
      })

      timeline.to(
        '[data-shade]',
        { autoAlpha: 0, duration: SHADE_OUT_SECONDS[1] - SHADE_OUT_SECONDS[0] },
        SHADE_OUT_SECONDS[0],
      )
      timeline.to(
        canvas.current,
        { autoAlpha: 0, duration: DISSOLVE_SECONDS[1] - DISSOLVE_SECONDS[0] },
        DISSOLVE_SECONDS[0],
      )
    }, area)

    return () => {
      stopRenderer()
      context.revert()
    }
  }, [ready])

  return (
    <div
      ref={scroller}
      tabIndex={0}
      aria-label="Vişne dondurma hikâyesi, kaydırarak ilerletin"
      className={`hidden-scrollbar absolute inset-0 overscroll-contain text-krem outline-none ${
        ready ? 'overflow-y-auto' : 'overflow-hidden'
      }`}
    >
      <div ref={track} className="relative h-[750vh]">
        <div className="sticky top-0 h-dvh overflow-hidden">
          <canvas ref={canvas} className="invisible absolute inset-0 size-full" />
          {ready && (
            <>
              <EdgeShade />
              <SceneBlocks animated />
            </>
          )}
        </div>
      </div>
      {!ready && <Loader value={loaded} />}
    </div>
  )
}

/** Hareket azaltma tercihi: scrubbing yok, her sahne sabit görseliyle sırayla gelir. */
function StillStory() {
  const scenes = {
    hero: <HeroBlock />,
    origin: <OriginBlock />,
    process: <ProcessBlock />,
    pour: <PourBlock />,
    product: <ProductBlock />,
    cta: <CtaBlock />,
  }

  return (
    <div className="hidden-scrollbar absolute inset-0 overflow-y-auto overscroll-contain text-krem">
      {Object.entries(scenes).map(([id, block]) => (
        <section key={id} className="relative h-dvh overflow-hidden">
          <img src={frameUrl(STILL_FRAMES[id])} alt="" className="absolute inset-0 size-full object-cover" />
          {id === 'hero' && <EdgeShade />}
          {block}
        </section>
      ))}
    </div>
  )
}

function EdgeShade() {
  return (
    <div
      data-shade
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(22,11,12,.55),transparent_32%,transparent_68%,rgba(22,11,12,.55)),linear-gradient(to_top,rgba(22,11,12,.5),transparent_30%)]"
    />
  )
}

function SceneBlocks({ animated }) {
  const hidden = animated ? 'invisible' : ''
  return (
    <>
      <HeroBlock />
      <OriginBlock className={hidden} />
      <ProcessBlock className={hidden} />
      <PourBlock className={hidden} />
      <ProductBlock className={hidden} />
      <CtaBlock className={hidden} />
    </>
  )
}

function HeroBlock() {
  return (
    <div data-scene="hero" className={`absolute inset-0 text-center ${legible}`}>
      <h2 className={`${heading} m-0 mt-[13vh] text-[clamp(3.75rem,11vw,10rem)]`}>{ICE_CREAM.brand}</h2>
      <p className="m-0 mx-auto mt-3 max-w-[32ch] px-4 text-[clamp(1.05rem,1.8vw,1.5rem)] leading-snug">
        {ICE_CREAM.slogan}
      </p>
      <div className="label absolute inset-x-0 bottom-6 flex flex-col items-center gap-2">
        Kaydır
        <svg className="size-5 animate-bounce" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 4v15m0 0-6-6m6 6 6-6" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </div>
    </div>
  )
}

function OriginBlock({ className = '' }) {
  const { title, text } = ICE_CREAM.origin
  return (
    <div
      data-scene="origin"
      className={`absolute top-1/2 left-[var(--gutter)] w-[min(30vw,26rem)] -translate-y-1/2 max-md:top-24 max-md:w-[80vw] max-md:translate-y-0 text-ink ${className}`}
    >
      <h3 className={`${heading} m-0 text-[clamp(2.25rem,4.4vw,4rem)]`}>{title}</h3>
      <p className="m-0 mt-4 text-[clamp(1rem,1.4vw,1.2rem)] leading-snug">{text}</p>
    </div>
  )
}

function ProcessBlock({ className = '' }) {
  return (
    <ul
      data-scene="process"
      className={`absolute top-1/2 right-[var(--gutter)] m-0 flex w-[min(22vw,20rem)] -translate-y-1/2 list-none flex-col gap-4 p-0 text-right text-ink max-md:top-24 max-md:w-[80vw] max-md:translate-y-0 ${className}`}
    >
      {ICE_CREAM.process.map((item) => (
        <li key={item} className={`${heading} border-b border-copper pb-3 text-[clamp(1.5rem,2.1vw,2rem)]`}>
          {item}
        </li>
      ))}
    </ul>
  )
}

function PourBlock({ className = '' }) {
  const { title, text } = ICE_CREAM.pour
  return (
    <div
      data-scene="pour"
      className={`absolute top-1/2 left-[var(--gutter)] w-[min(30vw,26rem)] -translate-y-1/2 text-ink max-md:top-24 max-md:w-[80vw] max-md:translate-y-0 ${className}`}
    >
      <h3 className={`${heading} m-0 text-[clamp(2.25rem,4.4vw,4rem)]`}>{title}</h3>
      <p className="m-0 mt-4 text-[clamp(1rem,1.4vw,1.2rem)] leading-snug">{text}</p>
    </div>
  )
}

function ProductBlock({ className = '' }) {
  const { name } = PATHS.cherry.product
  const { notes, weight } = ICE_CREAM.product
  return (
    <div
      data-scene="product"
      className={`absolute inset-x-[var(--gutter)] bottom-4 mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-[20px] bg-krem px-5 py-3 text-ink shadow-[0_8px_32px_rgba(22,11,12,.16)] ${className}`}
    >
      <h3 className={`${heading} m-0 text-[clamp(1.4rem,2.4vw,2rem)] text-cherry-deep`}>{name}</h3>
      <div className="text-right text-sm leading-snug">
        <p className="m-0">{notes}</p>
        <p className="label m-0 mt-1 text-copper">{weight}</p>
      </div>
    </div>
  )
}

function CtaBlock({ className = '' }) {
  return (
    <h3
      data-scene="cta"
      className={`${heading} absolute top-20 left-[var(--gutter)] m-0 text-[clamp(2.25rem,4.4vw,4rem)] whitespace-nowrap text-ink ${className}`}
    >
      {ICE_CREAM.cta.title}
    </h3>
  )
}

function Loader({ value }) {
  const percent = Math.round(value * 100)
  return (
    <div
      role="status"
      aria-label={`Yükleniyor, yüzde ${percent}`}
      className="absolute inset-x-0 bottom-[10vh] mx-auto w-[min(70vw,20rem)] text-center"
    >
      <p className="label m-0 mb-2">Hazırlanıyor · %{percent}</p>
      <div className="h-0.5 bg-krem/30">
        <div className="h-full bg-krem" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
