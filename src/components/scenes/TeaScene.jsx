import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { transient, useExperienceStore } from '../../store/useExperienceStore.js'
import { createLeafGeometry, useSceneCamera } from '../../three/models.jsx'
import { leafDissolveShader } from '../../three/shaders/leafDissolve.js'

const { lerp } = THREE.MathUtils

const LEAF_TIP_Y = 1.45
const GLASS_REST_Y = -2.5
const GLASS_START_Y = -8
const LIQUID_FLOOR = 0.1
const LIQUID_HEIGHT = 1.8
const SCENE_SECONDS = 8 // Animasyon ~6,8 sn'de biter; son yazı için kısa bir bekleme eklenir.

// [yarıçap, yükseklik]: ince belli çay bardağı.
const GLASS_PROFILE = [
  [0, 0], [0.56, 0], [0.6, 0.08], [0.47, 0.7], [0.42, 1.05], [0.47, 1.5], [0.64, 2.2],
]
const INNER_SCALE = 0.9

function profileRadius(y) {
  const upper = GLASS_PROFILE.findIndex(([, py]) => py >= y)
  if (upper <= 0) return GLASS_PROFILE[1][0]
  const [r0, y0] = GLASS_PROFILE[upper - 1]
  const [r1, y1] = GLASS_PROFILE[upper]
  return lerp(r0, r1, (y - y0) / (y1 - y0))
}

const SIDE_LEAVES = [
  { position: [-1.8, -0.55, -0.3], rotation: [0.3, 0.4, 2.7], scale: 0.42 },
  { position: [1.5, -0.1, -0.4], rotation: [-0.2, -0.5, 3.5], scale: 0.48 },
  { position: [2.9, 0.65, 0.2], rotation: [0.2, 0.3, -2.4], scale: 0.36 },
]

export function TeaScene() {
  useSceneCamera([0, 0, 10.5], [0, 0.2, 0])

  const startScene = useExperienceStore((s) => s.startScene)
  const completeScene = useExperienceStore((s) => s.completeScene)
  const started = useExperienceStore((s) => s.sceneStage !== 'idle')

  const branch = useRef(null)
  const glass = useRef(null)
  const stream = useRef(null)
  const surface = useRef(null)
  const timeline = useRef(null)
  const motion = useRef({ dissolve: 0, head: 0, tail: 0, glassY: GLASS_START_Y, fill: 0, spin: 2 })

  const [hovered, setHovered] = useState(false)
  useCursor(hovered && !started)

  const assets = useMemo(() => {
    const toPoints = (scale) => GLASS_PROFILE.map(([r, y]) => new THREE.Vector2(r * scale, y))
    const liquidProfile = toPoints(INNER_SCALE).filter((point) => point.y <= LIQUID_FLOOR + LIQUID_HEIGHT)
    return {
      leaf: createLeafGeometry(24, 48),
      // Az kenar + flatShading: yuvarlak bardakta görünmeyen dönüş fasetlerde okunur.
      glass: new THREE.LatheGeometry(toPoints(1), 14),
      liquid: new THREE.LatheGeometry(
        [...liquidProfile, new THREE.Vector2(profileRadius(2) * INNER_SCALE, 2)],
        48,
      ),
      stream: new THREE.CylinderGeometry(0.05, 0.05, 1, 12, 1, true).translate(0, -0.5, 0),
      leafUniforms: { uDissolve: { value: 0 } },
      clipPlane: new THREE.Plane(new THREE.Vector3(0, -1, 0), GLASS_START_Y),
    }
  }, [])

  useEffect(() => {
    transient.sceneTime = 0 // Önceki sahneden kalan zaman yazıları açmasın.
    return () => timeline.current?.kill()
  }, [])

  const play = () => {
    if (timeline.current) return
    startScene()
    const m = motion.current
    timeline.current = gsap
      .timeline({ onComplete: completeScene })
      // Yazılar (SceneCaptions) bu saniyeyi izler; ürün kartı yazılar bitince açılır.
      .to(transient, { sceneTime: SCENE_SECONDS, duration: SCENE_SECONDS, ease: 'none' }, 0)
      .to(assets.leafUniforms.uDissolve, { value: 1, duration: 2.6, ease: 'sine.inOut' }, 0)
      .to(m, { dissolve: 1, duration: 2.6, ease: 'sine.inOut' }, 0)
      .to(m, { head: 1, duration: 1.6, ease: 'power2.in' }, 1)
      .to(m, { glassY: GLASS_REST_Y, duration: 1.6, ease: 'power3.out' }, 1.3)
      .to(m, { fill: 1, duration: 3, ease: 'sine.inOut' }, 2.8)
      .to(m, { tail: 1, duration: 0.7, ease: 'power2.in' }, 5.3)
      .to(m, { spin: 0, duration: 1.4, ease: 'power2.out' }, 5.4)
  }

  useFrame(({ clock }, delta) => {
    const m = motion.current
    const time = clock.elapsedTime

    branch.current.rotation.z = Math.sin(time * 1.1) * 0.035 + Math.sin(time * 2.3) * 0.012

    glass.current.position.y = m.glassY
    glass.current.rotation.y += m.spin * delta

    const level = LIQUID_FLOOR + m.fill * LIQUID_HEIGHT
    const surfaceY = m.glassY + level
    assets.clipPlane.constant = surfaceY
    surface.current.visible = m.fill > 0
    surface.current.position.y = level
    surface.current.scale.setScalar(profileRadius(level) * INNER_SCALE)

    // Akış tepeden başlar, yüzeye iner; bitişte kuyruğu da yüzeye ulaşır.
    const head = lerp(LEAF_TIP_Y, surfaceY, m.head)
    const tail = lerp(LEAF_TIP_Y, surfaceY, m.tail)
    stream.current.visible = m.head > 0 && m.tail < 1
    stream.current.position.y = tail
    stream.current.scale.y = Math.max(tail - head, 0.001)
    const width = 1 + Math.sin(time * 14) * 0.12
    stream.current.scale.x = stream.current.scale.z = width
  })

  return (
    <>
      <color attach="background" args={['#140a0c']} />
      <hemisphereLight args={['#fff1e0', '#140a0c', 1.2]} />
      <directionalLight position={[3, 6, 5]} intensity={2.5} color="#ffe8cc" />
      <pointLight position={[-3, 1, 3]} intensity={18} color="#ff7a86" />

      <group ref={branch} position={[0, 2.65, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2 - 0.1]} position={[0.8, 0.15, -0.1]}>
          <cylinderGeometry args={[0.05, 0.15, 7.5, 10]} />
          <meshStandardMaterial color="#3a2118" roughness={0.95} />
        </mesh>
        {SIDE_LEAVES.map(({ position, rotation, scale }) => (
          <mesh key={position[0]} geometry={assets.leaf} position={position} rotation={rotation} scale={scale}>
            <meshStandardMaterial color="#2c5426" roughness={0.65} side={THREE.DoubleSide} />
          </mesh>
        ))}
        <mesh
          geometry={assets.leaf}
          position={[0, -0.6, 0]}
          rotation={[0, 0, Math.PI]}
          scale={0.6}
          onClick={play}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <shaderMaterial
            args={[{ ...leafDissolveShader, uniforms: assets.leafUniforms }]}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <mesh ref={stream} geometry={assets.stream}>
        <meshPhysicalMaterial color="#a0122c" roughness={0.15} clearcoat={1} />
      </mesh>

      <group ref={glass}>
        {/* Sıvı önce çizilir; yatay kesme düzlemi Y dönüşünden etkilenmez. */}
        <mesh geometry={assets.liquid} renderOrder={1}>
          <meshPhysicalMaterial
            color="#9c1029"
            roughness={0.1}
            clearcoat={1}
            side={THREE.DoubleSide}
            clippingPlanes={[assets.clipPlane]}
          />
        </mesh>
        <mesh ref={surface} rotation-x={-Math.PI / 2} renderOrder={1}>
          <circleGeometry args={[1, 48]} />
          <meshPhysicalMaterial color="#b3162f" roughness={0.05} clearcoat={1} />
        </mesh>
        <mesh geometry={assets.glass} renderOrder={2}>
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.2}
            roughness={0.04}
            metalness={0.1}
            envMapIntensity={2}
            flatShading
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </>
  )
}
