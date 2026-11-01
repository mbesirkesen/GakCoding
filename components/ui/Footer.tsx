"use client";

import { useEffect, useRef, useState } from "react";
import { ARAYUZ } from "@/content/tr";
import KunyeContent from "./KunyeContent";

/** Sabit, ince altbilgi şeridi. Yalnızca bağlantı/düğmeler pointer olayı alır. */
export default function Footer() {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    closer.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const f = panel.current.querySelectorAll<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])");
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const trigger = opener.current;
    return () => {
      document.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [open]);

  return (
    <footer className="footer-serit">
      <span className="footer-metin">GakCoding örnek çalışmasıdır</span>
      <span aria-hidden="true"> · </span>
      <button ref={opener} type="button" className="footer-btn" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        {ARAYUZ.kunye}
      </button>
      {open && (
        <div className="kunye-panel-kapsam" onClick={() => setOpen(false)}>
          <div ref={panel} className="kunye-panel" role="dialog" aria-modal="true" aria-label={ARAYUZ.kunye} onClick={(e) => e.stopPropagation()}>
            <KunyeContent />
            <button ref={closer} type="button" className="footer-btn kapat" onClick={() => setOpen(false)}>
              {ARAYUZ.kunyeKapat}
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
