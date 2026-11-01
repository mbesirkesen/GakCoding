import { useExperienceStore } from '../store/useExperienceStore.js'
import { HarvestVideo } from './HarvestVideo.jsx'
import { IceCreamLanding } from './scenes/IceCreamLanding.jsx'
import { VideoScene } from './scenes/VideoScene.jsx'

const VIDEO_PATHS = ['leaf', 'pit']

export function Experience() {
  const selectedPath = useExperienceStore((s) => s.selectedPath)

  return (
    <div id="stage" className="stage-frame fixed inset-0 bg-ink">
      <HarvestVideo />
      {VIDEO_PATHS.includes(selectedPath) && <VideoScene key={selectedPath} path={selectedPath} />}
      {selectedPath === 'cherry' && <IceCreamLanding />}
    </div>
  )
}
