import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { useFrame, useThree } from '@react-three/fiber'
import { HOTSPOTS, SELECTION_BRIGHTNESS, VIDEO_ELEMENT_ID, videoToScreen } from '../../config/videoMap.js'
import { useExperienceStore } from '../../store/useExperienceStore.js'
import { fitDistance } from '../../three/models.jsx'
import { createNoiseTexture, createWoodTexture } from '../../three/textures.js'

const { clamp, lerp, smoothstep } = THREE.MathUtils
const CAMERA_Y = 3.3
const CAMERA_Z = 8
const TARGET_Y = 3.2
const PIT_START_SCALE = 3.6 // Videodaki çekirdeğin ekrandaki boyutuna yakın.

const BEAD_COUNT = 33
const BEAD_RADIUS = 0.125
const RING_RADIUS = 1.4
const CENTER = new THREE.Vector3(0, 3.5, 0) // Tüm boncuk koordinatları buna göre.
const RAW_COLOR = new THREE.Color('#b08d68')
const POLISHED_COLOR = new THREE.Color('#6d2a17')

const dummy = new THREE.Object3D()
const axisRotation = new THREE.Quaternion()

function createBeads() {
  // Başlangıç noktası halkanın en altı: imame ilk boncuğa bağlanır.
  const controlPoints = Array.from({ length: 12 }, (_, index) => {
    const angle = -Math.PI / 2 + (index / 12) * Math.PI * 2
    return new THREE.Vector3(Math.cos(angle) * RING_RADIUS, Math.sin(angle) * RING_RADIUS * 1.12, 0)
  })
  const ring = new THREE.CatmullRomCurve3(controlPoints, true, 'centripetal')
  const ringPoints = ring.getSpacedPoints(BEAD_COUNT).slice(0, BEAD_COUNT)

  return ringPoints.map((ringPoint, index) => ({
    ringPoint,
    offset: new THREE.Vector3().randomDirection().multiplyScalar(index === 0 ? 0 : 0.6 + Math.random() * 1.4),
    axis: new THREE.Vector3().randomDirection(),
    quaternion: new THREE.Quaternion().random(),
    spinSpeed: 7 + Math.random() * 6,
    bobPhase: Math.random() * Math.PI * 2,
    ringDelay: (index / BEAD_COUNT) * 0.4,
  }))
}

export function TesbihScene() {
  const completeScene = useExperienceStore((s) => s.completeScene)
  const startScene = useExperienceStore((s) => s.startScene)

  const camera = useThree((state) => state.camera)
  const size = useThree((state) => state.size)
  const rosary = useRef(null)
  const beads = useRef(null)
  const beadMaterial = useRef(null)
  const imame = useRef(null)
  const spotlight = useRef(null)
  const motion = useRef({ fade: 0, drop: 0, scatter: 0, polish: 0, ring: 0, imame: 0 })

  const assets = useMemo(
    () => ({
      data: createBeads(),
      geometry: new THREE.SphereGeometry(BEAD_RADIUS, 24, 18),
      wood: createWoodTexture(),
      bump: createNoiseTexture(),
      pitStart: new THREE.Vector3(),
      dropEnd: new THREE.Vector3(0, -0.4, 1),
    }),
    [],
  )

  // Kamerayı kurar ve videodaki çekirdeğin ekran konumunu sahne düzlemine indirir.
  useLayoutEffect(() => {
    camera.aspect = size.width / size.height
    camera.position.set(0, CAMERA_Y, fitDistance(CAMERA_Z, camera.aspect))
    camera.lookAt(0, TARGET_Y, 0)
    camera.updateProjectionMatrix()
    camera.updateMatrixWorld()

    const { u, v } = HOTSPOTS.pit
    const { x, y } = videoToScreen(u, v, size.width, size.height)
    const ray = new THREE.Vector3((x / size.width) * 2 - 1, 1 - (y / size.height) * 2, 0.5)
      .unproject(camera)
      .sub(camera.position)
      .normalize()
    assets.pitStart
      .copy(camera.position)
      .addScaledVector(ray, -camera.position.z / ray.z)
      .sub(CENTER)
  }, [assets, camera, size])

  useEffect(() => {
    const video = document.getElementById(VIDEO_ELEMENT_ID)
    return () => {
      video.style.filter = ''
    }
  }, [])

  // Videodaki çekirdeğe tıklama bu sahneyi açtığı için timeline hemen başlar.
  useEffect(() => {
    startScene()
    const m = motion.current
    const timeline = gsap
      .timeline({ onComplete: completeScene })
      .to(m, { fade: 1, duration: 2.2, ease: 'sine.inOut' }, 0)
      .to(m, { drop: 1, duration: 1.3, ease: 'power2.in' }, 0.2)
      .to(m, { scatter: 1, duration: 1.2, ease: 'power3.out' }, 1.3)
      .to(m, { polish: 1, duration: 2.2, ease: 'sine.inOut' }, 2.2)
      .to(m, { ring: 1, duration: 2.2, ease: 'power3.inOut' }, 3.8)
      .to(m, { imame: 1, duration: 0.8, ease: 'back.out(1.6)' }, 5.9)
    return () => timeline.kill()
  }, [startScene, completeScene])

  useFrame(({ clock }, delta) => {
    const m = motion.current
    const time = clock.elapsedTime

    // Canvas saydam: arkadaki video karanlığa gömülür, boncuklar önde kalır.
    document.getElementById(VIDEO_ELEMENT_ID).style.filter = `brightness(${SELECTION_BRIGHTNESS * (1 - m.fade)})`
    spotlight.current.intensity = m.fade * 22

    const material = beadMaterial.current
    material.roughness = lerp(0.95, 0.16, m.polish)
    material.clearcoat = m.polish
    material.bumpScale = lerp(3, 0, m.polish)
    material.color.lerpColors(RAW_COLOR, POLISHED_COLOR, m.polish)

    assets.data.forEach((bead, index) => {
      const ringT = clamp((m.ring * 1.4 - bead.ringDelay) / 1, 0, 1)
      const spin = bead.spinSpeed * m.scatter * (1 - ringT) * delta
      bead.quaternion.multiply(axisRotation.setFromAxisAngle(bead.axis, spin)).normalize()

      dummy.position
        .lerpVectors(assets.pitStart, assets.dropEnd, m.drop)
        .addScaledVector(bead.offset, m.scatter)
      dummy.position.y += Math.sin(time * 1.4 + bead.bobPhase) * 0.1 * m.scatter * (1 - ringT)
      dummy.position.lerp(bead.ringPoint, ringT)
      dummy.quaternion.copy(bead.quaternion)

      // Oval ham çekirdek, cilalandıkça tam yuvarlak boncuğa döner.
      const visible = index === 0 ? lerp(PIT_START_SCALE, 1, m.drop) : smoothstep(m.scatter, 0, 0.5)
      const oval = lerp(0.8, 1, m.polish)
      dummy.scale.set(visible * oval, visible, visible * oval)
      dummy.updateMatrix()
      beads.current.setMatrixAt(index, dummy.matrix)
    })
    beads.current.instanceMatrix.needsUpdate = true

    imame.current.scale.setScalar(m.imame)
    rosary.current.rotation.y = Math.sin(time * 0.5) * 0.3 * m.ring

  })

  return (
    <>
      <hemisphereLight args={['#fff1e0', '#3a2118', 0.8]} />
      <directionalLight position={[5, 9, 6]} intensity={1.6} color="#fff0dc" />

      <group ref={rosary} position={CENTER}>
        <pointLight ref={spotlight} position={[1.5, 2, 3.5]} color="#ffe2c0" intensity={0} />
        <instancedMesh ref={beads} args={[assets.geometry, undefined, BEAD_COUNT]} frustumCulled={false}>
          <meshPhysicalMaterial
            ref={beadMaterial}
            map={assets.wood}
            bumpMap={assets.bump}
            clearcoatRoughness={0.12}
          />
        </instancedMesh>
        <Imame ref={imame} />
      </group>
    </>
  )
}

const TASSEL_STRANDS = Array.from({ length: 14 }, (_, index) => (index / 14) * Math.PI * 2)

function Imame({ ref }) {
  return (
    <group ref={ref} position={[0, -RING_RADIUS * 1.12 - BEAD_RADIUS, 0]} scale={0}>
      <mesh position-y={-0.12}>
        <sphereGeometry args={[0.13, 20, 14]} />
        <meshPhysicalMaterial color="#6d2a17" roughness={0.16} clearcoat={1} />
      </mesh>
      <mesh position-y={-0.5}>
        <cylinderGeometry args={[0.06, 0.1, 0.55, 16]} />
        <meshPhysicalMaterial color="#6d2a17" roughness={0.16} clearcoat={1} />
      </mesh>
      {TASSEL_STRANDS.map((angle) => (
        <mesh
          key={angle}
          position={[Math.cos(angle) * 0.1, -1.02, Math.sin(angle) * 0.1]}
          rotation={[Math.sin(angle) * 0.14, 0, -Math.cos(angle) * 0.14]}
        >
          <cylinderGeometry args={[0.012, 0.008, 0.55, 5]} />
          <meshStandardMaterial color="#c79a3e" roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
