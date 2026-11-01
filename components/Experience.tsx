"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { ARAYUZ, EKIP_DOLDURACAK } from "@/content/tr";
import FrameCanvas from "./FrameCanvas";
import World from "./scene/World";
import { MODULES, PHASE_SCREENS, type ModuleId, type Phase } from "@/core/loop";



const MAIN_CUTS = [0, 0.4, 0.65, 0.92];

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const subscribeNoop = () => () => {};
function detectMode(): "3d" | "fallback" {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || !webglOk() ? "fallback" : "3d";
}

export default function Experience() {
  const mode = useSyncExternalStore(subscribeNoop, detectMode, () => "pending" as const);
  const [phase, setPhase] = useState<Phase>("main");
  const [cycle, setCycle] = useState(0);
  const [mod, setMod] = useState<ModuleId>("cekirdek");
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);
  const target = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode !== "pending") document.documentElement.dataset.mode = mode;
  }, [mode]);

  const go = useCallback((next: () => void) => {
    setFading(true);
    window.setTimeout(() => {
      next();
      target.current = 0;
      setIdx(0);
      if (scroller.current) scroller.current.scrollTop = 0;
      setFading(false);
    }, 450);
  }, []);

  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el || fading) return;
    const max = el.scrollHeight - el.clientHeight;
    const p = max > 0 ? el.scrollTop / max : 0;
    target.current = p;
    if (phase === "main") {
      let i = 0;
      MAIN_CUTS.forEach((c, k) => {
        if (p >= c) i = k;
      });
      setIdx(i);
      if (p > 0.995) go(() => setPhase("hub"));
    } else if (phase === "module") {
      setIdx(Math.min(3, Math.floor(p * 4)));
      if (p > 0.995) go(() => {
        setCycle((c) => c + 1);
        setPhase("main");
      });
    }
  }, [phase, fading, go]);

  if (mode === "pending") return null;
  if (mode === "fallback") return <StaticStory />;

  const screens = PHASE_SCREENS[phase];
  let text = "";
  if (phase === "main") text = EKIP_DOLDURACAK.bolumler[idx]?.metin ?? "";
  if (phase === "module") {
    const t = EKIP_DOLDURACAK.modulMetinleri[mod];
    text = idx < 3 ? t.bolumler[idx] : t.bitis;
  }

  return (
    <div className="deney" data-phase={phase}>
      <div className="tuval" aria-hidden="true">
        {phase === "main" ? (
          <FrameCanvas key={cycle} target={target} cycle={cycle} />
        ) : (
          <Canvas camera={{ fov: 45, position: [0, 0.3, 6.5] }} dpr={[1, 1.75]}>
            <World key={`${phase}-${mod}`} phase={phase} module={mod} target={target} />
          </Canvas>
        )}
      </div>

      <div
        ref={scroller}
        className="kaydirici"
        onScroll={onScroll}
        tabIndex={0}
        role="region"
        aria-label={ARAYUZ.siteBasligi}
        style={{ pointerEvents: phase === "hub" ? "none" : "auto" }}
      >
        <div style={{ height: `${screens * 100}vh` }} />
      </div>

      <header className="ust-serit">
        <span className="logo-yer">{EKIP_DOLDURACAK.marka}</span>
        {phase !== "hub" && (
          <button type="button" className="atla" onClick={() => go(() => setPhase("hub"))}>
            {ARAYUZ.atla}
          </button>
        )}
      </header>

      {phase !== "hub" && (
        <div className="metin-kutu" aria-live="polite">
          {phase === "main" && <h1 className="baslik">{EKIP_DOLDURACAK.bolumler[idx]?.baslik}</h1>}
          <p>{text}</p>
        </div>
      )}

      {phase === "hub" && (
        <div className="hub-kutu">
          <h2 className="baslik">{EKIP_DOLDURACAK.hub.baslik}</h2>
          <p>{EKIP_DOLDURACAK.hub.yonerge}</p>
          <div className="hub-dallar" role="group" aria-label={ARAYUZ.hubSec}>
            {MODULES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() =>
                  go(() => {
                    setMod(m);
                    setPhase("module");
                  })
                }
              >
                {EKIP_DOLDURACAK.urunler[m]}
              </button>
            ))}
          </div>
          <button type="button" className="atla" onClick={() => go(() => { setCycle((c) => c + 1); setPhase("main"); })}>
            {ARAYUZ.donguyeDon}
          </button>
        </div>
      )}

      <div className={`gecis${fading ? " acik" : ""}`} aria-hidden="true" />
    </div>
  );
}

/** WebGL yok veya hareket azaltma açık: aynı içerik statik akış olarak. */
function StaticStory() {
  return (
    <main className="statik-hikaye">
      <h1>{ARAYUZ.siteBasligi}</h1>
      {EKIP_DOLDURACAK.bolumler.map((b) => (
        <section key={b.id}>
          <h2>{b.baslik}</h2>
          <p>{b.metin}</p>
        </section>
      ))}
    </main>
  );
}
