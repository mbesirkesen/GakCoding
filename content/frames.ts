/**
 * Kare dizisi ayarları. Video gelince kareleri public/frames/<klasör>/ altına
 * frame_001.webp, frame_002.webp ... adıyla at ve `count` değerini gerçek kare sayısına eşitle.
 * Kareler yoksa kodla çizilen yer tutucu animasyon oynar (bkz. components/FrameCanvas.tsx).
 * start/end: ana akış scroll ilerlemesi (0..1) içinde klibin aralığı; klipler sıralı ve boşluksuz olmalı.
 */
export interface FrameClip {
  id: string;
  dir: string;
  count: number;
  ext: "webp" | "jpg" | "png";
  start: number;
  end: number;
}

export const FRAME_CLIPS: FrameClip[] = [
  { id: "harput-tur", dir: "/frames/01-harput-tur", count: 48, ext: "webp", start: 0, end: 0.4 },
  { id: "bahce-zoom", dir: "/frames/02-bahce-zoom", count: 72, ext: "webp", start: 0.4, end: 0.65 },
  { id: "visne-buyume", dir: "/frames/03-visne-buyume", count: 120, ext: "webp", start: 0.65, end: 1 },
];

export const frameUrl = (c: FrameClip, i: number) => `${c.dir}/frame_${String(i + 1).padStart(3, "0")}.${c.ext}`;
