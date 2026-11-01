"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type Getter = () => number;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const GREEN = new THREE.Color("#5f8f3a");
const BORDO = new THREE.Color("#7A1230");

/** Yuvarlak, etli, parlak vişne; uzun ince yeşil sap. Olgunluk ve ölçek her karede okunur. */
export function Cherry({
  ripen = () => 1,
  size = () => 1,
  tone = 0,
}: {
  ripen?: Getter;
  size?: Getter;
  /** doğal renk varyasyonu (-1..1) */
  tone?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  useFrame(() => {
    const s = size();
    group.current?.scale.setScalar(Math.max(0.0001, s));
    if (group.current) group.current.visible = s > 0.002;
    if (mat.current) {
      mat.current.color.copy(GREEN).lerp(BORDO, ripen());
      if (tone) mat.current.color.offsetHSL(0, 0, tone * 0.025);
    }
  });
  return (
    <group ref={group}>
      <mesh scale={[1, 0.94, 1]}>
        <sphereGeometry args={[0.5, 40, 30]} />
        <meshPhysicalMaterial ref={mat} roughness={0.28} clearcoat={1} clearcoatRoughness={0.12} />
      </mesh>
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.012, 0.016, 1.0, 8]} />
        <meshStandardMaterial color="#4f7a34" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function Leaf({ position, rotation = [0, 0, 0], scale = 1 }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} rotation={rotation} scale={[0.5 * scale, 0.04 * scale, 0.24 * scale]}>
      <sphereGeometry args={[1, 16, 10]} />
      <meshStandardMaterial color="#1f4d2b" roughness={0.6} />
    </mesh>
  );
}

/** Çekirdek: vişneden çıkmış gibi krem-kahve, hafif sivri oval. */
export function Pit({ scale = 1 }: { scale?: number }) {
  return (
    <mesh scale={[0.5 * scale, 0.62 * scale, 0.4 * scale]}>
      <sphereGeometry args={[1, 32, 24]} />
      <meshStandardMaterial color="#c9a77c" roughness={0.85} />
    </mesh>
  );
}

