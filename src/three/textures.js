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

/** Ham çekirdek pürüzü için bump map; tesbih çekirdekleri kullanır. */
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
