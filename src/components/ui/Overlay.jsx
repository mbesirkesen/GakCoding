import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { BRAND } from '../../config/brand.js'
import { PATHS } from '../../config/paths.js'
import { BrandStory } from './BrandStory.jsx'
import { SELECTION_BRIGHTNESS, VIDEO_ELEMENT_ID } from '../../config/videoMap.js'
import { SceneCaptions } from './SceneCaptions.jsx'
import { VideoCaptions } from './VideoCaptions.jsx'
import { VideoHotspots } from './VideoHotspots.jsx'
import { useExperienceStore } from '../../store/useExperienceStore.js'
import { backToGarden, choosePath, registerWipe } from '../../ui/wipe.js'

export function Overlay() {
  const phase = useExperienceStore((s) => s.phase)

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-10">
        {(phase === 'intro' || phase === 'growth') && (
          <>
            <VideoCaptions />
            <Hero />
          </>
        )}
        {phase === 'selection' && <HarvestPrompt />}
        {phase === 'scene' && <SceneUI />}
        <TopActions />
      </div>
      <BrandStory />
      <div
        ref={registerWipe}
        className="pointer-events-none invisible fixed inset-0 z-30 flex items-center justify-center bg-cherry text-[length:var(--text-large)] tracking-[-0.04em] text-cream"
        aria-hidden
      >
        {BRAND.wordmark}.
      </div>
    </>
  )
}

function Pill({ children, onClick, tone = 'ink' }) {
  const tones = { ink: 'bg-ink text-cream', light: 'bg-cream text-ink shadow-[0_0_0_1px_rgba(22,11,12,.14)]' }
  return (
    <button
      onClick={onClick}
      className={`label pointer-events-auto flex h-11 cursor-pointer items-center gap-3 rounded-full px-5 transition-transform hover:scale-105 ${tones[tone]}`}
    >
      {children}
      <span className="size-1 rounded-full bg-current" />
    </button>
  )
}

function Hero() {
  const root = useRef(null)
  const phase = useExperienceStore((s) => s.phase)

  // Başlık scroll ile söner; React'i her scroll karesinde render etmemek için GSAP yazar.
  useEffect(() => {
    const scrollTrigger = { start: 0, end: () => window.innerHeight * 0.45, scrub: true }
    const tween = gsap.to(root.current, { autoAlpha: 0, ease: 'none', scrollTrigger })
    // Büyük wordmark sönerken küçük logo devralır; marka hiç ekrandan çıkmaz.
    const pill = gsap.fromTo(
      '#brand-pill',
      { autoAlpha: 0 },
      { autoAlpha: 1, ease: 'none', scrollTrigger: { ...scrollTrigger } },
    )
    return () => {
      for (const animation of [tween, pill]) {
        animation.scrollTrigger?.kill()
        animation.kill()
      }
      // Scroll hızlı atlansa bile hero'dan sonra logo görünür kalır.
      gsap.set('#brand-pill', { autoAlpha: 1 })
    }
  }, [])

  return (
    <div ref={root} className="absolute inset-0 px-[var(--gutter)]">
      <div className="absolute inset-x-[var(--gutter)] top-5 flex h-[calc(25vh-2rem)] flex-col justify-between sm:flex-row sm:items-end">
        <h1 className="m-0 text-[clamp(3.25rem,min(13vw,19vh),11rem)] leading-[0.8] font-medium tracking-[-0.055em] max-sm:mt-14">
          {BRAND.wordmark}
          <span className="text-cherry">.</span>
        </h1>
        <p className="m-0 max-w-[24ch] text-[clamp(1rem,1.7vw,1.5rem)] leading-[1.12] tracking-[-0.02em] sm:mb-1 sm:text-right">
          {BRAND.promise}
        </p>
      </div>
      <div className="label absolute inset-x-[var(--gutter)] bottom-[3vh] flex justify-between">
        <span aria-hidden>+</span>
        <span>{phase === 'growth' ? 'Kaydırarak büyüt' : 'Hasat hazırlanıyor'}</span>
        <span aria-hidden>+</span>
      </div>
    </div>
  )
}

function HarvestPrompt() {
  const hoveredPath = useExperienceStore((s) => s.hoveredPath)
  const setHoveredPath = useExperienceStore((s) => s.setHoveredPath)
  const root = useRef(null)

  useEffect(() => {
    const tween = gsap.from(root.current.querySelectorAll('[data-rise]'), {
      yPercent: 110,
      duration: 0.9,
      stagger: 0.06,
      ease: 'power3.out',
    })
    const dim = gsap.to(document.getElementById(VIDEO_ELEMENT_ID), {
      filter: `brightness(${SELECTION_BRIGHTNESS})`,
      duration: 1.2,
      ease: 'power1.out',
    })
    return () => {
      tween.revert()
      dim.kill()
    }
  }, [])

  return (
    <div ref={root} className="absolute inset-0 text-cream">
      <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-gradient-to-t from-ink/80 to-transparent" />
      <VideoHotspots />
      <div className="absolute inset-x-[var(--gutter)] bottom-[4vh] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="overflow-hidden">
        <p data-rise className="label m-0 mb-2">
          {BRAND.name} · Tek ağaç, üç hasat
        </p>
        <h2 className="m-0 overflow-hidden pb-[0.1em] text-[clamp(2rem,4vw,3.75rem)] leading-none font-normal tracking-[-0.03em]">
          <span data-rise className="block">
            Hasadını Seç
          </span>
        </h2>
      </div>
      {/* Ağaçtaki objelerin klavye ve dokunmatik karşılığı; hover iki yönde eşlenir. */}
      <ol className="pointer-events-auto m-0 w-full list-none overflow-hidden p-0 sm:w-80">
        {Object.entries(PATHS).map(([path, { label, result }], index) => (
          <li key={path} data-rise className="border-t border-cream/40">
            <button
              onClick={() => choosePath(path)}
              onPointerEnter={() => setHoveredPath(path)}
              onPointerLeave={() => setHoveredPath(null)}
              onFocus={() => setHoveredPath(path)}
              onBlur={() => setHoveredPath(null)}
              className={`flex w-full cursor-pointer items-baseline gap-3 py-2 text-left transition-[color,padding] ${
                hoveredPath === path ? 'pl-2 text-[#ff8c9b]' : ''
              }`}
            >
              <span className="label">0{index + 1}</span>
              <span className="text-2xl tracking-[-0.02em]">{label}</span>
              <span className="label ml-auto">{result}</span>
            </button>
          </li>
        ))}
      </ol>
      </div>
    </div>
  )
}

function SceneUI() {
  const selectedPath = useExperienceStore((s) => s.selectedPath)
  const sceneStage = useExperienceStore((s) => s.sceneStage)
  const { hint, label, product, captions, lightBackdrop = false } = PATHS[selectedPath]

  return (
    <>
      {sceneStage === 'idle' && hint && (
        <p className="label absolute inset-x-0 bottom-[6vh] m-0 text-center text-cream">{hint}</p>
      )}
      {captions && <SceneCaptions path={selectedPath} />}
      {sceneStage === 'done' && <ProductReveal label={label} product={product} lightBackdrop={lightBackdrop} />}
    </>
  )
}

function ProductReveal({ label, product, lightBackdrop }) {
  const root = useRef(null)

  useEffect(() => {
    const tween = gsap.from(root.current.children, {
      autoAlpha: 0,
      y: 32,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
    })
    return () => tween.revert()
  }, [])

  return (
    <div
      ref={root}
      className={`absolute inset-x-[var(--gutter)] bottom-[4vh] flex items-end justify-between gap-6 ${
        lightBackdrop ? 'text-ink' : 'text-cream [text-shadow:0_1px_24px_rgba(22,11,12,.6)]'
      }`}
    >
      <div className="hidden max-w-[32vw] sm:block">
        <p className="label m-0 mb-3">
          {BRAND.name} · Hasat — {label}
        </p>
        <h2 className="m-0 text-[clamp(2.25rem,4.6vw,5rem)] leading-[0.98] font-normal tracking-[-0.03em]">
          {product.name}
        </h2>
      </div>
      <div className="pointer-events-auto w-full rounded-[20px] bg-cream p-4 text-ink shadow-[0_8px_32px_rgba(22,11,12,.14)] [text-shadow:none] sm:w-80 sm:p-5">
        <h3 className="m-0 text-xl font-normal tracking-[-0.02em] sm:hidden">{product.name}</h3>
        <p className="m-0 text-base leading-snug">{product.description}</p>
      </div>
    </div>
  )
}

function TopActions() {
  const inScene = useExperienceStore((s) => s.phase === 'scene')
  const setBrandOpen = useExperienceStore((s) => s.setBrandOpen)

  return (
    <div className="absolute top-5 right-[var(--gutter)] flex gap-2">
      <div className={inScene ? 'max-sm:hidden' : ''}>
        <Pill tone="light" onClick={() => setBrandOpen(true)}>
          Hikâyemiz
        </Pill>
      </div>
      {inScene && (
        <Pill tone="light" onClick={backToGarden}>
          ← <span className="max-sm:hidden">Bahçeye dön</span>
          <span className="sm:hidden">Geri</span>
        </Pill>
      )}
    </div>
  )
}
