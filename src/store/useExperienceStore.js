import { create } from 'zustand'

/**
 * Akış: intro → growth → selection → scene
 * Sahne içi: sceneStage = idle → playing → done
 */

// Her karede değişen değerler React'e girmez; video ve metinler buradan okur.
export const transient = { growth: 0, sceneTime: 0 } // sceneTime: dönüşüm videosunun saniyesi

export const useExperienceStore = create((set) => ({
  phase: 'intro',
  selectedPath: null, // 'leaf' | 'pit' | 'cherry' | null
  brandOpen: false,
  hoveredPath: null, // 3D obje ile HTML liste aynı vurguyu paylaşır.
  sceneStage: 'idle',

  setHoveredPath: (hoveredPath) => set({ hoveredPath }),
  setBrandOpen: (brandOpen) => set({ brandOpen }),

  beginGrowth: () => set((s) => (s.phase === 'intro' ? { phase: 'growth' } : s)),
  reachSelection: () => set((s) => (s.phase === 'growth' ? { phase: 'selection' } : s)),

  selectPath: (path) =>
    set((s) =>
      s.phase === 'selection'
        ? { phase: 'scene', selectedPath: path, sceneStage: 'idle', hoveredPath: null }
        : s,
    ),
  startScene: () => set((s) => (s.sceneStage === 'idle' ? { sceneStage: 'playing' } : s)),
  completeScene: () => set({ sceneStage: 'done' }),
  resumeScene: () => set({ sceneStage: 'playing' }),
  returnToGarden: () => set({ phase: 'selection', selectedPath: null, sceneStage: 'idle' }),
}))
