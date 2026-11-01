import { useEffect, useRef } from 'react'
import { ICE_CREAM_VIDEO_URL, ROSARY_VIDEO_URL, VIDEO_ELEMENT_ID, VIDEO_POSTER, VIDEO_URL } from '../config/videoMap.js'
import { transient, useExperienceStore } from '../store/useExperienceStore.js'
import { loadVideo, scrubVideo } from '../ui/videoScrub.js'

/** Kaleden hasada uzanan ana video; sayfa scroll'u ile sürülür. */
export function HarvestVideo() {
  const video = useRef(null)

  useEffect(() => {
    const element = video.current
    let disposed = false

    const ready = () => {
      useExperienceStore.getState().beginGrowth()
      // Seçimde bekletmemek için dönüşüm videoları önceden indirilir.
      loadVideo(ICE_CREAM_VIDEO_URL)
      loadVideo(ROSARY_VIDEO_URL)
    }
    element.addEventListener('canplaythrough', ready, { once: true })
    loadVideo(VIDEO_URL).then((url) => {
      if (!disposed) element.src = url
    })
    const stopScrub = scrubVideo(element, () => transient.growth)

    return () => {
      disposed = true
      stopScrub()
      element.removeEventListener('canplaythrough', ready)
      element.removeAttribute('src')
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
