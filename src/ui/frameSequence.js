import { FRAME_COUNT } from '../config/iceCream.js'

const MOBILE_MAX_WIDTH = 768
const MAX_PIXEL_RATIO = 1.5
const EASING = 0.2

let sequence = null

const frameDirectory = () => (window.innerWidth <= MOBILE_MAX_WIDTH ? 'frames-960' : 'frames')

export const frameUrl = (number) =>
  `/${frameDirectory()}/${String(number).padStart(4, '0')}.webp`

/** Kareleri bir kez indirir; seçim ekranına gelmeden hazır olması için erken çağrılır. */
export function preloadFrames() {
  if (sequence) return sequence

  sequence = { images: new Array(FRAME_COUNT), loaded: 0, listeners: new Set() }
  const settle = () => {
    sequence.loaded += 1
    sequence.listeners.forEach((listener) => listener(sequence.loaded / FRAME_COUNT))
  }

  for (let index = 0; index < FRAME_COUNT; index += 1) {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => {
      sequence.images[index] = image
      image.decode().catch(() => {}).finally(settle)
    }
    image.onerror = settle // Eksik karede en yakın yüklenen kare gösterilir.
    image.src = frameUrl(index + 1)
  }
  return sequence
}

export function onFramesProgress(listener) {
  const { listeners, loaded } = preloadFrames()
  listeners.add(listener)
  listener(loaded / FRAME_COUNT)
  return () => listeners.delete(listener)
}

function nearestFrame(images, index) {
  for (let distance = 0; distance < FRAME_COUNT; distance += 1) {
    const image = images[index - distance] ?? images[index + distance]
    if (image) return image
  }
  return null
}

/** object-fit: cover gibi çizer. Scroll yalnızca hedefi yazar; çizim requestAnimationFrame'de olur. */
export function startFrameRenderer(canvas, getProgress) {
  const { images } = preloadFrames()
  const context = canvas.getContext('2d', { alpha: false })
  let current = getProgress() * (FRAME_COUNT - 1)
  let drawn = -1
  let handle = 0

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
    canvas.width = Math.round(canvas.clientWidth * ratio)
    canvas.height = Math.round(canvas.clientHeight * ratio)
    drawn = -1
  }

  const draw = (index) => {
    const image = nearestFrame(images, index)
    if (!image) return
    const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight)
    const width = image.naturalWidth * scale
    const height = image.naturalHeight * scale
    context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
    drawn = index
  }

  const tick = () => {
    handle = requestAnimationFrame(tick)
    const target = getProgress() * (FRAME_COUNT - 1)
    current += (target - current) * EASING
    if (Math.abs(target - current) < 0.01) current = target
    const index = Math.round(current)
    if (index !== drawn) draw(index)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(canvas)
  resize()
  tick()

  return () => {
    cancelAnimationFrame(handle)
    observer.disconnect()
  }
}
