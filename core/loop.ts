/** Görünmez döngü: ana akış -> HUB -> ürün modülü -> bir sonraki döngü. */
export type ModuleId = "cekirdek" | "yaprak" | "visne";
export type Phase = "main" | "hub" | "module";

export const MODULES: ModuleId[] = ["cekirdek", "yaprak", "visne"];
/** Her fazın scroll uzunluğu (ekran yüksekliği katı). */
export const PHASE_SCREENS = { main: 10, hub: 1, module: 4 } as const;

export interface Season {
  name: string;
  sky: string;
  light: string;
  ground: string;
}

/** Döngü başlangıç mevsimi; sahne büyürken hasat (yaz) ışığına akar. */
export const START_SEASONS: Season[] = [
  { name: "ilkbahar sabahı", sky: "#cfe3d6", light: "#fff1d6", ground: "#7d9a5a" },
  { name: "yaz öğleni", sky: "#bfe0f2", light: "#fffbe8", ground: "#8fa24d" },
  { name: "sonbahar akşamı", sky: "#e2b48c", light: "#ffb877", ground: "#9a7a3e" },
  { name: "kış kırağı", sky: "#d8e2ea", light: "#dfe9f5", ground: "#aab6b3" },
];
export const HARVEST: Season = { name: "hasat (yaz)", sky: "#f6d9a8", light: "#ffd9a0", ground: "#a5a24a" };

export function startSeason(cycle: number): Season {
  return START_SEASONS[((cycle % 4) + 4) % 4];
}
