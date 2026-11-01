import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import gsap from 'gsap'
import { useCursor } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useExperienceStore } from '../../store/useExperienceStore.js'
import { useSceneCamera } from '../../three/models.jsx'
import { createBarTexture, createLogoTexture, createNoiseTexture } from '../../three/textures.js'
import { SparkPool } from '../../three/SparkPool.js'
import { WrapperSheet } from '../../three/WrapperSheet.jsx'

const { clamp, randFloatSpread } = THREE.MathUtils

const ATTRACT_FORCE = 55
const BOUNDARY_RADIUS = 6.5
const MIN_SPARK_IMPACT = 1.5
const SPARK_COOLDOWN_MS = 35
export const BAR_SIZE = { width: 2.6, height: 0.9, depth: 0.5 }

const INGREDIENTS = [
  { key: 'cherry', count: 12, radius: 0.24, scale: [1, 1, 1], color: '#8e1230', roughness: 0.3 },
  { key: 'date', count: 9, radius: 0.24, scale: [1.5, 0.75, 0.75], color: '#4b2413', roughness: 0.75, bumpy: true },
  { key: 'oat', count: 22, radius: 0.13, scale: [1, 0.35, 0.75], color: '#d9a93f', roughness: 0.6 },
  { key: 'nut', count: 10, radius: 0.19, scale: [1, 0.8, 0.9], color: '#a06a35', roughness: 0.55, bumpy: true },
]

function createPhysics(onImpact) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) })
  world.defaultContactMaterial.restitution = 0.35
  world.defaultContactMaterial.friction = 0.15

  const items = INGREDIENTS.flatMap((type, typeIndex) =>
    Array.from({ length: type.count }, (_, instanceIndex) => {
      const direction = new THREE.Vector3().randomDirection().multiplyScalar(3 + Math.random() * 2.5)
      const body = new CANNON.Body({
        mass: type.radius * 4,
        shape: new CANNON.Sphere(type.radius),
        position: new CANNON.Vec3(direction.x * 1.3, direction.y * 0.75, direction.z * 0.5),
        linearDamping: 0.12,
        angularDamping: 0.02,
      })
      body.velocity.set(randFloatSpread(0.5), randFloatSpread(0.5), randFloatSpread(0.3))
      body.angularVelocity.set(randFloatSpread(1.6), randFloatSpread(1.6), randFloatSpread(1.6))
      body.addEventListener('collide', (event) => {
        onImpact(body.position, Math.abs(event.contact.getImpactVelocityAlongNormal()))
      })
      world.addBody(body)
      return {
        body,
        typeIndex,
        instanceIndex,
        scale: type.radius,
        from: new THREE.Vector3(),
        barTarget: new THREE.Vector3(
          randFloatSpread(BAR_SIZE.width * 0.8),
          randFloatSpread(BAR_SIZE.height * 0.7),
          randFloatSpread(BAR_SIZE.depth * 0.6),
        ),
      }
    }),
  )
  return { world, items }
}

const force = new CANNON.Vec3()
const dummy = new THREE.Object3D()

export function EnergyBarScene() {
  useSceneCamera([0, 0, 7.6], [0, 0, 0])

  const startScene = useExperienceStore((s) => s.startScene)
  const completeScene = useExperienceStore((s) => s.completeScene)
  const started = useExperienceStore((s) => s.sceneStage !== 'idle')

  const meshes = useRef([])
  const bar = useRef(null)
  const product = useRef(null)
  const logo = useRef(null)
  const flash = useRef(null)
  const timeline = useRef(null)
  const stage = useRef('drift') // drift → attract → merge
  const lastSpark = useRef(0)
  const motion = useRef({ merge: 0, bar: 0, wrapIn: 0, fold: 0, crimp: 0, seal: 0, flash: 0 })

  const [hovered, setHovered] = useState(false)
  useCursor(hovered && !started)

  const assets = useMemo(() => {
    const sparks = new SparkPool(420)
    const physics = createPhysics((position, impact) => {
      const now = performance.now()
      if (stage.current !== 'attract' || impact < MIN_SPARK_IMPACT) return
      if (now - lastSpark.current < SPARK_COOLDOWN_MS) return
      lastSpark.current = now
      sparks.emit(position, 10, 2.5)
    })
    const barGeometry = new THREE.BoxGeometry(BAR_SIZE.width, BAR_SIZE.height, BAR_SIZE.depth, 36, 14, 8)
    const position = barGeometry.attributes.position
    for (let i = 0; i < position.count; i++) {
      // Vertex'ler kaymasın diye gürültü konumdan türer: yüzler ayrışmaz.
      const [x, y, z] = [position.getX(i), position.getY(i), position.getZ(i)]
      const bump = Math.sin(x * 13 + y * 7) * Math.cos(y * 17 + z * 11) * 0.022
      position.setXYZ(i, x * (1 + bump), y * (1 + bump * 2), z * (1 + bump * 2))
    }
    barGeometry.computeVertexNormals()
    return {
      ...physics,
      sparks,
      barGeometry,
      barMap: createBarTexture(),
      bump: createNoiseTexture(),
      logoMap: createLogoTexture(),
      ingredientGeometries: INGREDIENTS.map(({ key }) =>
        key === 'nut' ? new THREE.IcosahedronGeometry(1, 1) : new THREE.SphereGeometry(1, 18, 14),
      ),
    }
  }, [])

  useLayoutEffect(() => {
    assets.items.forEach(({ typeIndex }) => (meshes.current[typeIndex].frustumCulled = false))
  }, [assets])
  useEffect(() => () => timeline.current?.kill(), [])

  const play = () => {
    if (timeline.current) return
    startScene()
    stage.current = 'attract'
    const m = motion.current

    timeline.current = gsap
      .timeline({ onComplete: completeScene })
      .call(
        () => {
          stage.current = 'merge'
          assets.items.forEach((item) => item.from.copy(item.body.position))
          assets.sparks.emit(new THREE.Vector3(), 200, 6)
        },
        null,
        1.8,
      )
      .to(m, { flash: 1, duration: 0.15 }, 1.8)
      .to(m, { flash: 0, duration: 1.1, ease: 'power2.out' }, 1.95)
      .to(m, { merge: 1, duration: 1, ease: 'power2.inOut' }, 1.8)
      .to(m, { bar: 1, duration: 0.8, ease: 'back.out(1.4)' }, 2.2)
      .to(m, { wrapIn: 1, duration: 1.3, ease: 'power2.out' }, 3.1)
      .to(m, { fold: 1, duration: 1.6, ease: 'sine.inOut' }, 4.3)
      .to(m, { crimp: 1, duration: 0.5, ease: 'power2.inOut' }, 5.8)
      .to(m, { seal: 1, duration: 0.5, ease: 'back.out(2)' }, 6.3)
  }

  useFrame(({ clock }, delta) => {
    const m = motion.current

    if (stage.current !== 'merge') {
      assets.items.forEach(({ body }) => {
        const distance = body.position.length()
        if (stage.current === 'attract') {
          force.copy(body.position).scale((-ATTRACT_FORCE * body.mass) / Math.max(distance, 0.3), force)
          body.applyForce(force)
        } else if (distance > BOUNDARY_RADIUS) {
          body.position.scale(BOUNDARY_RADIUS / distance, body.position)
          body.velocity.scale(-0.5, body.velocity)
        }
      })
      assets.world.step(1 / 60, delta, 3)
    }

    assets.items.forEach((item) => {
      const { body, typeIndex, instanceIndex, scale, from, barTarget } = item
      if (stage.current === 'merge') {
        dummy.position.lerpVectors(from, barTarget, m.merge)
      } else {
        dummy.position.set(body.position.x, body.position.y, body.position.z)
      }
      dummy.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)
      const [sx, sy, sz] = INGREDIENTS[typeIndex].scale
      const shrink = scale * clamp(1 - m.merge, 0, 1)
      dummy.scale.set(sx * shrink, sy * shrink, sz * shrink)
      dummy.updateMatrix()
      meshes.current[typeIndex].setMatrixAt(instanceIndex, dummy.matrix)
    })
    meshes.current.forEach((mesh) => (mesh.instanceMatrix.needsUpdate = true))

    assets.sparks.update(delta)

    bar.current.visible = m.bar > 0
    bar.current.scale.setScalar(Math.max(m.bar, 0.001))
    flash.current.intensity = m.flash * 60

    logo.current.visible = m.seal > 0
    logo.current.material.opacity = clamp(m.seal, 0, 1)
    logo.current.scale.setScalar(1.5 - 0.5 * m.seal)

    product.current.rotation.y = Math.sin(clock.elapsedTime * 0.6) * 0.3 * m.seal
    product.current.rotation.x = Math.sin(clock.elapsedTime * 0.45) * 0.08 * m.seal
  })

  return (
    <>
      <color attach="background" args={['#140a0c']} />
      <hemisphereLight args={['#ffe9d2', '#140a0c', 1.1]} />
      <directionalLight position={[4, 6, 6]} intensity={2.4} color="#fff0dc" />
      <pointLight ref={flash} color="#ffb060" intensity={0} />

      {/* Görünmez tıklama yüzeyi: sahnenin her yeri çekimi başlatır. */}
      <mesh
        position-z={-2}
        onClick={play}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {INGREDIENTS.map((type, index) => (
        <instancedMesh
          key={type.key}
          ref={(mesh) => {
            meshes.current[index] = mesh
          }}
          args={[assets.ingredientGeometries[index], undefined, type.count]}
        >
          <meshStandardMaterial
            color={type.color}
            roughness={type.roughness}
            bumpMap={type.bumpy ? assets.bump : null}
            bumpScale={2}
          />
        </instancedMesh>
      ))}

      <points geometry={assets.sparks.geometry} frustumCulled={false}>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <group ref={product}>
        <mesh ref={bar} geometry={assets.barGeometry}>
          <meshStandardMaterial map={assets.barMap} bumpMap={assets.bump} bumpScale={3} roughness={0.9} />
        </mesh>
        <WrapperSheet motion={motion} barSize={BAR_SIZE} />
        <mesh ref={logo} position-z={BAR_SIZE.depth / 2 + 0.06} renderOrder={1}>
          <planeGeometry args={[1.5, 0.53]} />
          <meshBasicMaterial map={assets.logoMap} transparent depthWrite={false} />
        </mesh>
      </group>
    </>
  )
}
