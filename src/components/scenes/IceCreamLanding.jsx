import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PATHS } from '../../config/paths.js'
import {
  ANIMATION_SECONDS,
  FOOTER_POSTER,
  FOOTER_VIDEO_URL,
  ICE_CREAM,
  SCENES,
  STILL_FRAMES,
} from '../../config/iceCream.js'
import { SELECTION_BRIGHTNESS } from '../../config/videoMap.js'
import { useExperienceStore } from '../../store/useExperienceStore.js'
import { frameUrl, onFramesProgress, startFrameRenderer } from '../../ui/frameSequence.js'
import { backToGarden } from '../../ui/wipe.js'

gsap.registerPlugin(ScrollTrigger)

const FADE = 0.2
const END_TOLERANCE = 2 // Tarayıcıların küsuratlı scroll değerlerini tolere eder.
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
  const footer = useRef(null)
  const [loaded, setLoaded] = useState(0)
  const ready = loaded >= 1

  useEffect(() => onFramesProgress(setLoaded), [])

  useEffect(() => {
    if (!ready) return
    const area = scroller.current
    const progress = { value: 0 }
    area.focus({ preventScroll: true })
    const stopRenderer = startFrameRenderer(canvas.current, () => progress.value)

    // Sona varınca hikâye başa bağlanır: seçim karesi footer'ın arkasındaki kareyle aynıdır.
    const loopAtEnd = () => {
      if (area.scrollTop + area.clientHeight >= area.scrollHeight - END_TOLERANCE) {
        area.removeEventListener('scroll', loopAtEnd)
        useExperienceStore.getState().returnToGarden()
      }
    }
    area.addEventListener('scroll', loopAtEnd, { passive: true })

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
        scrollTrigger: { ...scrollTrigger, scrub: 0.5 },
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

      // Footer içeriği çekilir, karartma seçim ekranının parlaklığına iner.
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            scroller: area,
            trigger: footer.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.4,
          },
        })
        .to('[data-footer-content]', { autoAlpha: 0, y: -SLIDE, duration: 0.45 }, 0.45)
        .to('[data-footer-shade]', { opacity: 0 }, 0.45)
        .to('[data-footer-dim]', { opacity: 1 - SELECTION_BRIGHTNESS }, 0.45)
    }, area)

    return () => {
      area.removeEventListener('scroll', loopAtEnd)
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
      <div ref={track} className="relative h-[600vh]">
        <div className="sticky top-0 h-dvh overflow-hidden">
          <canvas ref={canvas} className="invisible absolute inset-0 size-full" />
          {ready && (
            <>
              <EdgeShade />
              <SceneBlocks onOrder={() => footer.current?.scrollIntoView({ behavior: 'smooth' })} animated />
            </>
          )}
        </div>
      </div>
      <Footer ref={footer} autoplay rootRef={scroller} />
      {!ready && <Loader value={loaded} />}
    </div>
  )
}

/** Hareket azaltma tercihi: scrubbing yok, her sahne sabit görseliyle sırayla gelir. */
function StillStory() {
  const footer = useRef(null)
  const scenes = {
    hero: <HeroBlock />,
    origin: <OriginBlock />,
    process: <ProcessBlock />,
    product: <ProductBlock />,
    cta: <CtaBlock onOrder={() => footer.current?.scrollIntoView()} />,
  }

  return (
    <div className="hidden-scrollbar absolute inset-0 overflow-y-auto overscroll-contain text-krem">
      {Object.entries(scenes).map(([id, block]) => (
        <section key={id} className="relative h-dvh overflow-hidden">
          <img src={frameUrl(STILL_FRAMES[id])} alt="" className="absolute inset-0 size-full object-cover" />
          <EdgeShade />
          {block}
        </section>
      ))}
      <Footer ref={footer} />
    </div>
  )
}

function EdgeShade() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(22,11,12,.55),transparent_32%,transparent_68%,rgba(22,11,12,.55)),linear-gradient(to_top,rgba(22,11,12,.5),transparent_30%)]"
    />
  )
}

function SceneBlocks({ onOrder, animated }) {
  const hidden = animated ? 'invisible' : ''
  return (
    <>
      <HeroBlock />
      <OriginBlock className={hidden} />
      <ProcessBlock className={hidden} />
      <ProductBlock className={hidden} />
      <CtaBlock className={hidden} onOrder={onOrder} />
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
      className={`absolute top-1/2 left-[var(--gutter)] w-[min(30vw,26rem)] -translate-y-1/2 max-md:top-24 max-md:w-[80vw] max-md:translate-y-0 ${legible} ${className}`}
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
      className={`absolute top-1/2 right-[var(--gutter)] m-0 flex w-[min(28vw,24rem)] -translate-y-1/2 list-none flex-col gap-4 p-0 text-right max-md:top-24 max-md:w-[80vw] max-md:translate-y-0 ${legible} ${className}`}
    >
      {ICE_CREAM.process.map((item) => (
        <li key={item} className={`${heading} border-b border-copper pb-3 text-[clamp(1.6rem,2.8vw,2.5rem)]`}>
          {item}
        </li>
      ))}
    </ul>
  )
}

function ProductBlock({ className = '' }) {
  const { name } = PATHS.cherry.product
  const { notes, weight } = ICE_CREAM.product
  return (
    <div
      data-scene="product"
      className={`absolute inset-x-[var(--gutter)] bottom-4 mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-[20px] bg-krem px-5 py-3 text-ink ${className}`}
    >
      <h3 className={`${heading} m-0 text-[clamp(1.4rem,2.4vw,2rem)] text-cherry-deep`}>{name}</h3>
      <div className="text-right text-sm leading-snug">
        <p className="m-0">{notes}</p>
        <p className="label m-0 mt-1 text-copper">{weight}</p>
      </div>
    </div>
  )
}

function CtaBlock({ className = '', onOrder }) {
  const { title, button } = ICE_CREAM.cta
  return (
    <div
      data-scene="cta"
      className={`absolute top-1/2 left-[var(--gutter)] w-[min(30vw,26rem)] -translate-y-1/2 max-md:top-auto max-md:bottom-8 max-md:w-[calc(100%-2*var(--gutter))] max-md:translate-y-0 ${legible} ${className}`}
    >
      <h3 className={`${heading} m-0 text-[clamp(2.5rem,5vw,4.75rem)]`}>{title}</h3>
      <button
        onClick={onOrder}
        className="mt-6 h-14 cursor-pointer rounded-full bg-cherry-deep px-9 text-lg font-medium text-krem shadow-[0_8px_32px_rgba(22,11,12,.45)] transition-transform hover:scale-105 max-md:w-full"
      >
        {button}
      </button>
    </div>
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

function Footer({ ref, autoplay = false, rootRef }) {
  const video = useRef(null)

  // Döngü yalnızca footer görünürken oynar.
  useEffect(() => {
    if (!autoplay) return
    const element = video.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) element.play().catch(() => {})
        else element.pause()
      },
      { root: rootRef?.current ?? null },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [autoplay, rootRef])

  const { address, contact, social } = ICE_CREAM.footer
  return (
    <div ref={ref} className={autoplay ? 'relative h-[200dvh]' : 'relative'}>
    <footer
      className={`${autoplay ? 'sticky top-0' : 'relative'} flex h-dvh flex-col justify-end overflow-hidden px-[var(--gutter)] pb-8`}
    >
      <video
        ref={video}
        className="absolute inset-0 size-full object-cover"
        src={FOOTER_VIDEO_URL}
        poster={FOOTER_POSTER}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div data-footer-dim className="absolute inset-0 bg-black opacity-0" aria-hidden />
      <div
        data-footer-shade
        className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/65 to-ink/10"
        aria-hidden
      />
      <div data-footer-content className="relative">
        <h2 className={`${heading} m-0 mb-8 text-[clamp(3rem,8vw,7rem)]`}>{ICE_CREAM.brand}</h2>
        <div className="grid gap-5 border-t border-copper pt-5 sm:grid-cols-3">
          <FooterColumn title="Adres" lines={[address]} />
          <FooterColumn title="İletişim" lines={contact} />
          <FooterColumn title="Sosyal medya" lines={social} />
        </div>
        <button onClick={backToGarden} className="label mt-6 cursor-pointer text-krem underline underline-offset-4">
          Hasadını Seç’e dön
        </button>
      </div>
    </footer>
    </div>
  )
}

function FooterColumn({ title, lines }) {
  return (
    <div>
      <p className="label m-0 mb-2 text-copper">{title}</p>
      {lines.map((line) => (
        <p key={line} className="m-0 leading-snug">
          {line}
        </p>
      ))}
    </div>
  )
}
