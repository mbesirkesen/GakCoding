import gsap from 'gsap'
import { useExperienceStore } from '../store/useExperienceStore.js'

let panel = null
let busy = false

export const registerWipe = (element) => {
  panel = element
}

/** Sahne değişimini vişne perdesinin arkasında yapar; kesme görünmez. */
function wipe(action) {
  if (busy) return
  if (!panel) return action()
  busy = true
  gsap
    .timeline({
      onComplete: () => {
        busy = false
      },
    })
    .set(panel, { yPercent: 100, visibility: 'visible' })
    .to(panel, { yPercent: 0, duration: 0.45, ease: 'power3.inOut', onComplete: action })
    .to(panel, { yPercent: -100, duration: 0.55, ease: 'power3.inOut' }, '+=0.12')
    .set(panel, { visibility: 'hidden' })
}

export function choosePath(path) {
  const { selectPath } = useExperienceStore.getState()
  // Çekirdek sahnesi ağaçtan kesintisiz devam eder, perde kullanılmaz.
  if (path === 'pit') selectPath(path)
  else wipe(() => selectPath(path))
}

export const backToGarden = () => wipe(useExperienceStore.getState().returnToGarden)
