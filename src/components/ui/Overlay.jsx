import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { PATHS } from '../../config/paths.js'
import { VideoHotspots } from './VideoHotspots.jsx'
import { useExperienceStore } from '../../store/useExperienceStore.js'
import { backToGarden, choosePath, registerWipe } from '../../ui/wipe.js'

export function Overlay() {
  const phase = useExperienceStore((s) => s.phase)

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-10">
        {(phase === 'intro' || phase === 'growth') && <Hero />}
        {phase === 'selection' && <HarvestPrompt />}
        {phase === 'scene' && <SceneUI />}
        <TopActions />
      </div>
      <div
        ref={registerWipe}
        className="pointer-events-none invisible fixed inset-0 z-30 bg-cherry"
        aria-hidden
      />
    </>
  )
}

function Pill({ children, onClick, tone = 'ink' }) {
  const tones = { ink: 'bg-ink text-cream', cherry: 'bg-cherry text-cream', light: 'bg-cream text-ink' }
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
    const tween = gsap.to(root.current, {
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: { start: 0, end: () => window.innerHeight * 0.45, scrub: true },
    })
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <div ref={root} className="absolute inset-0 px-[var(--gutter)]">
      <h1 className="absolute top-20 m-0 max-w-[22ch] text-[clamp(1.4rem,3vw,2.6rem)] leading-[1.08] font-normal tracking-[-0.02em] sm:top-6 sm:left-[28vw]">
        Harput vişnesi tohumdan hasada, kaydırdıkça büyür.
      </h1>
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
    return () => tween.revert()
  }, [])

  return (
    <div ref={root} className="absolute inset-0 text-cream">
      <div className="absolute inset-x-0 bottom-0 h-[55vh] bg-gradient-to-t from-ink/80 to-transparent" />
      <VideoHotspots />
      <div className="absolute inset-x-[var(--gutter)] bottom-[4vh] flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <h2 className="m-0 overflow-hidden pb-[0.1em] text-[clamp(2rem,4vw,3.75rem)] leading-none font-normal tracking-[-0.03em]">
        <span data-rise className="block">
          Hasadını seç.
        </span>
      </h2>
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
  const { hint, label, product } = PATHS[selectedPath]

  return (
    <>
      {sceneStage === 'idle' && hint && (
        <p className="label absolute inset-x-0 bottom-[6vh] m-0 text-center text-cream">{hint}</p>
      )}
      {sceneStage === 'done' && <ProductReveal label={label} product={product} />}
    </>
  )
}

function ProductReveal({ label, product }) {
  const addToCart = useExperienceStore((s) => s.addToCart)
  const root = useRef(null)
  const [added, setAdded] = useState(false)

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
      className="absolute inset-x-[var(--gutter)] bottom-[4vh] flex items-end justify-between gap-6 text-cream"
    >
      <div className="hidden max-w-[32vw] sm:block">
        <p className="label m-0 mb-3">Hasat — {label}</p>
        <h2 className="m-0 text-[clamp(2.25rem,4.6vw,5rem)] leading-[0.98] font-normal tracking-[-0.03em]">
          {product.name}
        </h2>
      </div>
      <div className="pointer-events-auto w-full rounded-[20px] bg-cream p-4 text-ink sm:w-80 sm:p-5">
        <h3 className="m-0 text-xl font-normal tracking-[-0.02em] sm:hidden">{product.name}</h3>
        <p className="m-0 text-base leading-snug">{product.description}</p>
        <div className="mt-3 flex items-center justify-between sm:mt-5">
          <span className="text-2xl tracking-[-0.02em]">{product.price} TL</span>
          <Pill
            tone="cherry"
            onClick={() => {
              addToCart(product)
              setAdded(true)
            }}
          >
            {added ? 'Sepete Eklendi' : 'Sepete Ekle'}
          </Pill>
        </div>
      </div>
    </div>
  )
}

function TopActions() {
  const inScene = useExperienceStore((s) => s.phase === 'scene')
  const count = useExperienceStore((s) => s.cart.reduce((sum, line) => sum + line.qty, 0))

  return (
    <div className="absolute top-5 right-[var(--gutter)] flex gap-2">
      {inScene && (
        <Pill tone="light" onClick={backToGarden}>
          ← Bahçeye dön
        </Pill>
      )}
      {count > 0 && <div className="label flex h-11 items-center rounded-full bg-cherry px-5 text-cream">Sepet {count}</div>}
    </div>
  )
}
