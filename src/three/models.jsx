import { useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'

/** Tepesi +Y'de sivrilen yaprak. UV'ler korunur; çözülme shader'ı onları kullanır. */
export function createLeafGeometry(widthSegments, heightSegments) {
  const geometry = new THREE.PlaneGeometry(1, 2, widthSegments, heightSegments)
  const position = geometry.attributes.position
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i)
    const y = position.getY(i)
    const v = (y + 1) / 2
    position.setX(i, x * Math.pow(Math.sin(Math.PI * v), 0.75))
    position.setZ(i, -0.25 * y * y + 0.1 * Math.abs(x))
  }
  geometry.computeVertexNormals()
  return geometry
}

/** Dar ekranda sahnenin kesilmemesi için kamera mesafesini açar. */
export const fitDistance = (distance, aspect) => distance * Math.max(1, 1.3 / aspect)

export function useSceneCamera(position, target) {
  const camera = useThree((state) => state.camera)
  const aspect = useThree((state) => state.size.width / state.size.height)
  const [x, y, z] = position
  const [tx, ty, tz] = target

  useEffect(() => {
    camera.position.set(x, y, fitDistance(z, aspect))
    camera.lookAt(tx, ty, tz)
  }, [camera, aspect, x, y, z, tx, ty, tz])
}
