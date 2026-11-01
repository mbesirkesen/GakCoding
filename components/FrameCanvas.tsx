"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import { FRAME_CLIPS, frameUrl } from "@/content/frames";
import { HARVEST, startSeason } from "@/core/loop";
import { smooth } from "./scene/parts";

type Img = HTMLImageElement | null;

function mix(a: string, b: string, t: number) {
  const p = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16);
  const c = [0, 1, 2].map((i) => Math.round(p(a, i) + (p(b, i) - p(a, i)) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** Kareler yokken: Harput çevresi tur → bahçe zoom → vişne büyümesi, kodla çizilir. */
function drawPlaceholder(ctx: CanvasRenderingContext2D, w: number, h: number, p: number, cycle: number) {
  const season = startSeason(cycle);
  const k = smooth(0, 0.8, p);
  ctx.fillStyle = mix(season.sky, HARVEST.sky, k);
  ctx.fillRect(0, 0, w, h);

  const turn = smooth(0, 0.4, p);
  const zoom = 1 + smooth(0.4, 0.65, p) * 2.4;
  const gx = w * 0.72;
  const gy = h * 0.74;

  ctx.save();
  ctx.translate(gx, gy);
  ctx.scale(zoom, zoom);
  ctx.translate(-gx, -gy);

  const layers = [
    { par: 0.2, y: 0.5, amp: 0.05, col: "#8a8f6a" },
    { par: 0.5, y: 0.58, amp: 0.07, col: "#7d8a4f" },
    { par: 1, y: 0.68, amp: 0.06, col: mix(season.ground, HARVEST.ground, k) },
  ];
  for (const L of layers) {
    ctx.fillStyle = L.col;
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 12) {
      const u = (x - turn * L.par * w * 0.6) / w;
      ctx.lineTo(x, h * (L.y + Math.sin(u * 7) * L.amp + Math.sin(u * 17) * L.amp * 0.3));
    }
    ctx.lineTo(w, h);
    ctx.fill();
  }

  // Harput işareti (yer tutucu): ufukta küçük bir yerleşim
  ctx.fillStyle = "rgba(60,40,30,.7)";
  const hx = w * 0.3 - turn * w * 0.35;
  for (let i = 0; i < 9; i++) ctx.fillRect(hx + i * 10, h * 0.54 - (i % 3) * 6, 8, 8 + (i % 3) * 6);

  // Bahçe sıraları
  ctx.fillStyle = "#2f6a37";
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 9; c++) {
      ctx.beginPath();
      ctx.arc(gx - 90 + c * 22 + (r % 2) * 10, gy - 30 + r * 14, 6 + r, 0, 7);
      ctx.fill();
    }
  ctx.restore();

  // Toprak + filiz → vişne
  const g = smooth(0.65, 1, p);
  if (p > 0.6) {
    ctx.fillStyle = "#4a3426";
    ctx.fillRect(0, h * 0.86, w, h * 0.14);
    const bx = w * 0.5;
    const by = h * 0.86;
    const stem = g * h * 0.38;
    ctx.strokeStyle = "#3f6b2c";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by - stem);
    ctx.stroke();
    const ripe = smooth(0.62, 0.85, g);
    for (let i = 0; i < 6; i++) {
      const fx = bx + (i - 2.5) * 36;
      const fs = smooth(0.3, 0.5, g) * 16;
      ctx.strokeStyle = "#3f6b2c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx, by - stem);
      ctx.lineTo(fx, by - stem + 30);
      ctx.stroke();
      ctx.fillStyle = mix("#5f8f3a", "#7A1230", ripe);
      ctx.beginPath();
      ctx.arc(fx, by - stem + 30 + fs * 0.6, fs, 0, 7);
      ctx.fill();
    }
  }

  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.font = "12px system-ui";
  ctx.fillText("YER TUTUCU · gerçek kareler public/frames/ altına eklenecek", 20, h - 48);
}

export default function FrameCanvas({ target, cycle }: { target: MutableRefObject<number>; cycle: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const frames: Img[][] = FRAME_CLIPS.map((c) => new Array<Img>(c.count).fill(null));
    let real = false;
    let alive = true;

    const load = (ci: number, i: number) =>
      new Promise<void>((res) => {
        const im = new Image();
        im.onload = () => {
          frames[ci][i] = im;
          res();
        };
        im.onerror = () => res();
        im.src = frameUrl(FRAME_CLIPS[ci], i);
      });

    // İlk kareyi dene; yoksa yer tutucu. Varsa klip sırasıyla, 6'şar paralel yükle.
    (async () => {
      await load(0, 0);
      if (!frames[0][0]) return;
      real = true;
      for (let ci = 0; ci < FRAME_CLIPS.length && alive; ci++) {
        const n = FRAME_CLIPS[ci].count;
        for (let i = 0; i < n && alive; i += 6)
          await Promise.all(Array.from({ length: Math.min(6, n - i) }, (_, j) => load(ci, i + j)));
      }
    })();

    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = canvas.clientWidth * d;
      canvas.height = canvas.clientHeight * d;
    };
    resize();
    window.addEventListener("resize", resize);

    let sp = target.current;
    let raf = 0;
    const tick = () => {
      sp += (target.current - sp) * 0.14;
      const w = canvas.width;
      const h = canvas.height;
      if (real) {
        const ci = Math.max(0, FRAME_CLIPS.findIndex((c) => sp <= c.end));
        const c = FRAME_CLIPS[ci === -1 ? FRAME_CLIPS.length - 1 : ci];
        const arr = frames[FRAME_CLIPS.indexOf(c)];
        const t = Math.min(1, Math.max(0, (sp - c.start) / (c.end - c.start)));
        let i = Math.round(t * (c.count - 1));
        while (i > 0 && !arr[i]) i--;
        const im = arr[i];
        if (im) {
          const s = Math.max(w / im.naturalWidth, h / im.naturalHeight); // cover
          ctx.drawImage(im, (w - im.naturalWidth * s) / 2, (h - im.naturalHeight * s) / 2, im.naturalWidth * s, im.naturalHeight * s);
        }
      } else {
        drawPlaceholder(ctx, w, h, sp, cycle);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [target, cycle]);

  return <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />;
}
