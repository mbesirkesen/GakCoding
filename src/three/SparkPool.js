import * as THREE from 'three'

const PALETTE = [new THREE.Color('#ff3b4e'), new THREE.Color('#ffc14d')]
const DRAG = 2.2
const LIFETIME = 0.9

/** Sabit boyutlu partikül havuzu: renk siyaha söner, additive blend'de görünmez olur. */
export class SparkPool {
  constructor(capacity) {
    this.capacity = capacity
    this.cursor = 0
    this.positions = new Float32Array(capacity * 3)
    this.colors = new Float32Array(capacity * 3)
    this.velocities = new Float32Array(capacity * 3)
    this.life = new Float32Array(capacity)
    this.tints = new Uint8Array(capacity)
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3))
  }

  emit(origin, count, speed) {
    for (let n = 0; n < count; n++) {
      const i = this.cursor
      this.cursor = (i + 1) % this.capacity
      const a = Math.random() * Math.PI * 2
      const z = Math.random() * 2 - 1
      const r = Math.sqrt(1 - z * z)
      const s = speed * (0.3 + Math.random() * 0.7)
      this.positions.set([origin.x, origin.y, origin.z], i * 3)
      this.velocities.set([Math.cos(a) * r * s, Math.sin(a) * r * s, z * s], i * 3)
      this.life[i] = LIFETIME * (0.5 + Math.random() * 0.5)
      this.tints[i] = n % PALETTE.length
    }
  }

  update(delta) {
    const friction = Math.exp(-DRAG * delta)
    for (let i = 0; i < this.capacity; i++) {
      const i3 = i * 3
      this.life[i] = Math.max(this.life[i] - delta, 0)
      const brightness = this.life[i] / LIFETIME
      const color = PALETTE[this.tints[i]]
      this.colors[i3] = color.r * brightness
      this.colors[i3 + 1] = color.g * brightness
      this.colors[i3 + 2] = color.b * brightness
      for (let axis = 0; axis < 3; axis++) {
        this.velocities[i3 + axis] *= friction
        this.positions[i3 + axis] += this.velocities[i3 + axis] * delta
      }
    }
    this.geometry.attributes.position.needsUpdate = true
    this.geometry.attributes.color.needsUpdate = true
  }
}
