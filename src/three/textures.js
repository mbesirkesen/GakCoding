import * as THREE from 'three'

function canvasTexture(size, draw, { color = true, repeat = false, height = size } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = height
  draw(canvas.getContext('2d'), size, height)
  const texture = new THREE.CanvasTexture(canvas)
  if (color) texture.colorSpace = THREE.SRGBColorSpace
  if (repeat) texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  return texture
}

/** Ham çekirdek pürüzü için bump map; çekirdek ve bar yüzeyi kullanır. */
export const createNoiseTexture = () =>
  canvasTexture(
    256,
    (ctx, size) => {
      const image = ctx.createImageData(size, size)
      for (let i = 0; i < image.data.length; i += 4) {
        const value = 90 + Math.random() * 165
        image.data.set([value, value, value, 255], i)
      }
      ctx.putImageData(image, 0, 0)
    },
    { color: false, repeat: true },
  )

export const createWoodTexture = () =>
  canvasTexture(
    256,
    (ctx, size) => {
      ctx.fillStyle = '#c59a70'
      ctx.fillRect(0, 0, size, size)
      for (let i = 0; i < 70; i++) {
        const y = Math.random() * size
        ctx.strokeStyle = `rgba(70,35,15,${0.08 + Math.random() * 0.22})`
        ctx.lineWidth = 1 + Math.random() * 3
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.bezierCurveTo(size / 3, y + 10, (2 * size) / 3, y - 10, size, y)
        ctx.stroke()
      }
    },
    { repeat: true },
  )

/** Ham bar yüzeyi: kırmızı, altın ve kahve benekler. */
export const createBarTexture = () =>
  canvasTexture(
    256,
    (ctx, size) => {
      ctx.fillStyle = '#6b3a22'
      ctx.fillRect(0, 0, size, size)
      const colors = ['#8e1230', '#d6a23f', '#3b1d10', '#b97f3b']
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = colors[i % colors.length]
        ctx.beginPath()
        ctx.arc(Math.random() * size, Math.random() * size, 2 + Math.random() * 7, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    { repeat: true },
  )

// Yer tutucu logo: gerçek marka dosyası gelince burası değiştirilecek.
export const createLogoTexture = () =>
  canvasTexture(
    512,
    (ctx, width, height) => {
      ctx.clearRect(0, 0, width, height)
      ctx.strokeStyle = '#f6ece0'
      ctx.lineWidth = 6
      ctx.strokeRect(8, 8, width - 16, height - 16)
      ctx.fillStyle = '#f6ece0'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = '700 72px Georgia, serif'
      ctx.fillText('HARPUT', width / 2, height / 2)
    },
    { height: 180 },
  )
