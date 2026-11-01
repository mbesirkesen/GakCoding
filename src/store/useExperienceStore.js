import { create } from 'zustand'

/**
 * Akış: intro → growth → selection → scene
 * Sahne içi: sceneStage = idle → playing → done
 */

// Her karede değişen değerler React'e girmez; useFrame buradan okur.
export const transient = { growth: 0 }

export const useExperienceStore = create((set) => ({
  phase: 'intro',
  selectedPath: null, // 'leaf' | 'pit' | 'cherry' | null
  hoveredPath: null, // 3D obje ile HTML liste aynı vurguyu paylaşır.
  sceneStage: 'idle',
  cart: [],

  setHoveredPath: (hoveredPath) => set({ hoveredPath }),

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
  returnToGarden: () => set({ phase: 'selection', selectedPath: null, sceneStage: 'idle' }),

  addToCart: (product) =>
    set((s) => {
      const existing = s.cart.find((line) => line.id === product.id)
      return {
        cart: existing
          ? s.cart.map((line) => (line === existing ? { ...line, qty: line.qty + 1 } : line))
          : [...s.cart, { ...product, qty: 1 }],
      }
    }),
}))
