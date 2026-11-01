import gsap from 'gsap'
import { videoTimeAt } from '../config/videoMap.js'

const SEEK_THRESHOLD = 1 / 48
const cache = new Map()

/** Dosyayı belleğe alır: seek ağ beklemez, Safari'de de scrub akıcı kalır. */
export function loadVideo(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`Video yüklenemedi: ${response.status}`)
          return response.blob()
        })
        .then((blob) => URL.createObjectURL(blob))
        .catch(() => url), // Bellek yolu başarısızsa doğrudan akışa düşülür.
    )
  }
  return cache.get(url)
}

/** Video oynatılmaz; her karede 0–1 ilerlemenin karşılığı olan zamana seek edilir. */
export function scrubVideo(element, getProgress) {
  const seek = () => {
    if (element.seeking || !Number.isFinite(element.duration)) return
    const target = videoTimeAt(getProgress(), element.duration)
    if (Math.abs(element.currentTime - target) > SEEK_THRESHOLD) element.currentTime = target
  }
  gsap.ticker.add(seek)
  return () => gsap.ticker.remove(seek)
}
