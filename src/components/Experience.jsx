import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { useExperienceStore } from '../store/useExperienceStore.js'
import { HarvestVideo } from './HarvestVideo.jsx'
import { EnergyBarScene } from './scenes/EnergyBarScene.jsx'
import { TeaScene } from './scenes/TeaScene.jsx'
import { TesbihScene } from './scenes/TesbihScene.jsx'

const SCENE_BY_PATH = { leaf: TeaScene, pit: TesbihScene, cherry: EnergyBarScene }
const MAX_DPR = 1.75

export function Experience() {
  const selectedPath = useExperienceStore((s) => s.selectedPath)
  const [dpr, setDpr] = useState(MAX_DPR)
  const ActiveScene = SCENE_BY_PATH[selectedPath]

  return (
    <div id="stage" className="stage-frame fixed inset-0 bg-ink">
      <HarvestVideo />
      {/* WebGL yalnızca sahnelerde çalışır; video scrub'ı GPU'yu paylaşmaz. */}
      {ActiveScene && (
        <div className="absolute inset-0">
          <Canvas
            dpr={dpr}
            camera={{ fov: 40, near: 0.1, far: 120, position: [0, 3.3, 8] }}
            gl={{ antialias: true, powerPreference: 'high-performance', localClippingEnabled: true }}
          >
            {/* 60 FPS altına düşünce çözünürlükten feda edilir. */}
            <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(MAX_DPR)} />

            {/* Harici HDR yok: cam ve cila yansımaları yerel olarak üretilir. */}
            <Environment resolution={128}>
              <Lightformer form="rect" intensity={3} position={[0, 5, 3]} scale={[8, 4, 1]} />
              <Lightformer form="rect" intensity={1.5} color="#ffd9c2" position={[-5, 1, 2]} scale={[3, 6, 1]} />
              <Lightformer form="rect" intensity={1} color="#ffb3a0" position={[5, 0, 2]} scale={[3, 6, 1]} />
            </Environment>

            <ActiveScene key={selectedPath} />
          </Canvas>
        </div>
      )}
    </div>
  )
}
