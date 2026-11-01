export const VIDEO_ELEMENT_ID = 'harvest-video'
export const VIDEO_URL = '/media/harput-growth.mp4'
export const VIDEO_POSTER = '/media/harput-poster.jpg'

const FRAME = { width: 1920, height: 1080 }

// Videonun son karesindeki hedefler: u/v kareye, radius kare genişliğine oranlıdır.
export const HOTSPOTS = {
  leaf: { u: 0.713, v: 0.39, radius: 0.125 },
  pit: { u: 0.573, v: 0.662, radius: 0.06 },
  cherry: { u: 0.372, v: 0.69, radius: 0.11 },
}

/** object-fit: cover ile ölçeklenen karedeki bir noktanın ekran konumu. */
export function videoToScreen(u, v, viewportWidth, viewportHeight) {
  const scale = Math.max(viewportWidth / FRAME.width, viewportHeight / FRAME.height)
  const width = FRAME.width * scale
  const height = FRAME.height * scale
  return {
    x: (viewportWidth - width) / 2 + u * width,
    y: (viewportHeight - height) / 2 + v * height,
    frameWidth: width,
  }
}
