import { useEffect } from 'react'
import gsap from 'gsap'
import { PATHS } from '../../config/paths.js'
import { HOTSPOTS, VIDEO_ELEMENT_ID, videoToScreen } from '../../config/videoMap.js'
import { useExperienceStore } from '../../store/useExperienceStore.js'
import { useViewport } from '../../ui/useViewport.js'
import { choosePath } from '../../ui/wipe.js'

const HOVER_ZOOM = 1.08

/** Son karedeki yaprak, çekirdek ve meyvenin üzerine yerleşen tıklama hedefleri. */
export function VideoHotspots() {
  const hoveredPath = useExperienceStore((s) => s.hoveredPath)
  const setHoveredPath = useExperienceStore((s) => s.setHoveredPath)
  const { width, height } = useViewport()

  // Üzerine gelinen obje, kendi noktası sabit kalarak büyür.
  useEffect(() => {
    const video = document.getElementById(VIDEO_ELEMENT_ID)
    const hotspot = HOTSPOTS[hoveredPath]
    if (hotspot) {
      const { x, y } = videoToScreen(hotspot.u, hotspot.v, width, height)
      gsap.to(video, { scale: HOVER_ZOOM, transformOrigin: `${x}px ${y}px`, duration: 0.7, ease: 'power3.out' })
    } else {
      gsap.to(video, { scale: 1, duration: 0.7, ease: 'power3.out' })
    }
  }, [hoveredPath, width, height])

  useEffect(
    () => () => {
      const video = document.getElementById(VIDEO_ELEMENT_ID)
      gsap.killTweensOf(video)
      gsap.set(video, { clearProps: 'transform,transformOrigin' })
    },
    [],
  )

  return Object.entries(HOTSPOTS).map(([path, { u, v, radius }]) => {
    const { x, y, frameWidth } = videoToScreen(u, v, width, height)
    if (x < 0 || x > width) return null
    const size = radius * 2 * frameWidth
    const active = hoveredPath === path

    return (
      <button
        key={path}
        aria-label={PATHS[path].label}
        onClick={() => choosePath(path)}
        onPointerEnter={() => setHoveredPath(path)}
        onPointerLeave={() => setHoveredPath(null)}
        style={{ left: x - size / 2, top: y - size / 2, width: size, height: size }}
        className="pointer-events-auto absolute flex cursor-pointer items-center justify-center rounded-full"
      >
        {/* Görünen yalnızca nokta; tıklama alanı objenin tamamıdır. */}
        <span className="relative flex size-3" aria-hidden>
          <span
            className={`absolute inset-0 rounded-full bg-cream/70 ${active ? '' : 'animate-ping [animation-duration:2.4s]'}`}
          />
          <span className="relative size-3 rounded-full bg-cream shadow-[0_0_12px_rgba(22,11,12,.5)]" />
        </span>
        <span
          className={`label absolute top-1/2 left-1/2 mt-4 -translate-x-1/2 rounded-full bg-cream px-3 py-1 text-ink transition-opacity duration-300 ${
            active ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {PATHS[path].label}
        </span>
      </button>
    )
  })
}
