"use client";

import { useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HARVEST, type ModuleId, type Phase } from "@/core/loop";
import { Cherry, Leaf, Pit } from "./parts";

interface Props {
  phase: Phase;
  module: ModuleId;
  target: MutableRefObject<number>;
}

function ModuleObject({ id, get }: { id: ModuleId; get: () => number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => {
    if (g.current) {
      g.current.rotation.y = get() * Math.PI * 3;
      g.current.rotation.x = Math.sin(get() * Math.PI * 2) * 0.25;
    }
  });
  return (
    <group ref={g} scale={2.2}>
      {id === "cekirdek" && <Pit scale={1.2} />}
      {id === "yaprak" && <Leaf position={[0, 0, 0]} scale={2.4} rotation={[0.5, 0, 0.2]} />}
      {id === "visne" && <Cherry />}
    </group>
  );
}

/** HUB ve ürün modülleri: her zaman hasat ışığı. Ana akış kare oynatıcıdadır (FrameCanvas). */
export default function World({ phase, module, target }: Props) {
  const sm = useRef(0);
  const hubSpin = useRef<THREE.Group>(null);
  const get = () => sm.current;

  useFrame((state, dt) => {
    sm.current += (target.current - sm.current) * Math.min(1, dt * 5);
    const sky = new THREE.Color(HARVEST.sky);
    state.scene.background = sky;
    state.scene.fog = new THREE.Fog(sky, 18, 60);
    state.camera.position.set(0, 0.3, 6.5);
    state.camera.lookAt(0, 0, 0);
    if (hubSpin.current) hubSpin.current.rotation.y += dt * 0.25;
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 10, 6]} intensity={2.2} color={HARVEST.light} />
      <hemisphereLight args={["#ffffff", "#6f5a3a", 0.5]} />

      {phase === "hub" && (
        <group ref={hubSpin}>
          <group position={[-3.2, 0, 0]} scale={1.6}>
            <Pit scale={1.1} />
          </group>
          <group scale={1.6}>
            <Leaf position={[0, 0, 0]} scale={2} rotation={[0.5, 0, 0.2]} />
          </group>
          <group position={[3.2, 0, 0]} scale={1.6}>
            <Cherry />
          </group>
        </group>
      )}

      {phase === "module" && <ModuleObject id={module} get={get} />}
    </>
  );
}
