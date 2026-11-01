import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { VIDEO_ELEMENT_ID, VIDEO_POSTER, VIDEO_URL } from '../config/videoMap.js'
import { transient, useExperienceStore } from '../store/useExperienceStore.js'

const END_MARGIN = 0.05 // Son saniyeye tam seek bazı tarayıcılarda siyah kare verir.
const SEEK_THRESHOLD = 1 / 48

/** Scroll ile sürülen video: oynatılmaz, her karede hedef zamana seek edilir. */
export function HarvestVideo() {
  const video = useRef(null)

  useEffect(() => {
    const element = video.current
    let objectUrl = null
    let disposed = false

    const ready = () => useExperienceStore.getState().beginGrowth()
    element.addEventListener('canplaythrough', ready, { once: true })

    // Dosya belleğe alınır: seek ağ beklemez, Safari'de de scrub akıcı kalır.
    fetch(VIDEO_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Video yüklenemedi: ${response.status}`)
        return response.blob()
      })
      .then((blob) => {
        if (disposed) return
        objectUrl = URL.createObjectURL(blob)
        element.src = objectUrl
      })
      .catch(() => {
        if (!disposed) element.src = VIDEO_URL
      })

    const seek = () => {
      if (element.seeking || !Number.isFinite(element.duration)) return
      const target = transient.growth * (element.duration - END_MARGIN)
      if (Math.abs(element.currentTime - target) > SEEK_THRESHOLD) element.currentTime = target
    }
    gsap.ticker.add(seek)

    return () => {
      disposed = true
      gsap.ticker.remove(seek)
      element.removeEventListener('canplaythrough', ready)
      element.removeAttribute('src')
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [])

  return (
    <video
      ref={video}
      id={VIDEO_ELEMENT_ID}
      className="absolute inset-0 size-full object-cover"
      poster={VIDEO_POSTER}
      muted
      playsInline
      preload="auto"
      aria-label="Harput Kalesi'nden vişne hasadına uzanan video"
    />
  )
}
