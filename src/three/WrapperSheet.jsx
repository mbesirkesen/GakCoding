import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

const { smoothstep, lerp } = THREE.MathUtils

const COLUMNS = 24
const ROWS = 56
const SHEET_WIDTH = 3.3
const OFFSCREEN_X = 9
const CLEARANCE = 0.03

/**
 * Prosedürel sarma (fizik tabanlı cloth değil): ambalaj önden barı kaplar, kenarları
 * katlanma çizgisinden itibaren bar kesitini izler. Serbest uç teğet boyunca uzar, bu yüzden
 * kağıt bara hiç girmez. Gerçek cloth gerekirse yalnızca bu bileşen değişir.
 */
export function WrapperSheet({ motion, barSize }) {
  const mesh = useRef(null)
  const drawnKey = useRef('')

  const sheet = useMemo(() => {
    const halfH = barSize.height / 2 + CLEARANCE
    const depth = barSize.depth + CLEARANCE * 2
    const halfPerimeter = 2 * halfH + depth
    const geometry = new THREE.PlaneGeometry(SHEET_WIDTH, halfPerimeter * 2, COLUMNS, ROWS)
    return {
      geometry,
      halfH,
      depth,
      front: depth / 2,
      halfPerimeter,
      rest: geometry.attributes.position.array.slice(),
      barHalfWidth: barSize.width / 2,
    }
  }, [barSize])

  useFrame(({ clock }) => {
    const { wrapIn, fold, crimp } = motion.current
    const position = mesh.current?.geometry.attributes.position
    if (!position) return

    mesh.current.visible = wrapIn > 0
    mesh.current.position.x = lerp(OFFSCREEN_X, 0, wrapIn)
    mesh.current.rotation.z = (1 - wrapIn) * -0.5

    // Hareket bitince vertex'ler ve normaller yeniden hesaplanmaz.
    const settled = fold === 1 && crimp === 1
    const key = `${wrapIn}|${fold}|${crimp}`
    if (settled && drawnKey.current === key) return
    drawnKey.current = key

    const { rest, halfH, depth, front, halfPerimeter, barHalfWidth } = sheet
    const limit = fold * halfPerimeter
    const flutter = (1 - fold) * 0.05

    for (let i = 0; i < position.count; i++) {
      const x = rest[i * 3]
      const signedArc = rest[i * 3 + 1]
      const arc = Math.abs(signedArc)
      const sign = Math.sign(signedArc) || 1
      const wrapped = Math.min(arc, limit)
      const free = arc - wrapped

      // Bar kesiti boyunca ön → üst/alt → arka yürüyüşü.
      let y
      let z
      if (wrapped <= halfH) {
        y = wrapped
        z = front
      } else if (wrapped <= halfH + depth) {
        y = halfH
        z = front - (wrapped - halfH)
      } else {
        y = halfH - (wrapped - halfH - depth)
        z = -front
      }

      // Katlanma çizgisindeki teğet; köşede yumuşak dönerek kağıt kıvrımı verir.
      const turnA = smoothstep(wrapped, halfH - 0.08, halfH + 0.08)
      const turnB = smoothstep(wrapped, halfH + depth - 0.08, halfH + depth + 0.08)
      const tangentY = 1 - turnA - turnB
      const tangentZ = -turnA + turnB
      y += tangentY * free
      z += tangentZ * free + Math.sin(arc * 3 + clock.elapsedTime * 5) * flutter * free

      // Uçlar kıstırılır: ambalajın dikişli kenarı.
      const pinch = smoothstep(Math.abs(x), barHalfWidth + 0.08, barHalfWidth + 0.2) * crimp * 0.82
      position.setXYZ(i, x, sign * y * (1 - pinch), z * (1 - pinch))
    }
    position.needsUpdate = true
    mesh.current.geometry.computeVertexNormals()
  })

  return (
    <mesh ref={mesh} geometry={sheet.geometry} visible={false} frustumCulled={false}>
      <meshStandardMaterial color="#6e1228" roughness={0.88} side={THREE.DoubleSide} />
    </mesh>
  )
}
