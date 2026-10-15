"use client";

import { useEffect, useSyncExternalStore } from "react";

const SEEN_KEY = "casio-calc:intro-seen:v1";
const VISIBLE_MS = 2200;

/*
 * Whether the splash has already been shown is genuinely external state — it lives in
 * localStorage — so it is exposed as a small store rather than mirrored into useState. The
 * server snapshot reports "already seen", so the splash never renders during SSR and there is
 * no hydration mismatch; React re-reads the client snapshot straight after hydration.
 */
let shownInMemory = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readSeen(): boolean {
  if (shownInMemory) return true;
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Storage unavailable (private mode): keep showing it, remembered for this page only.
    return false;
  }
}

function markSeen(): void {
  shownInMemory = true;
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Nothing to do — the splash simply appears again next visit.
  }
  for (const listener of listeners) listener();
}

const neverSeen = () => true;

/**
 * First-visit splash: "Casio Emulator by @parvezhossainme".
 *
 * Shown once per browser, then never again. It is purely decorative — `pointer-events: none`
 * everywhere — so the calculator underneath stays usable while it is on screen, and it also
 * dismisses on the first key press or tap.
 */
export function IntroOverlay() {
  const seen = useSyncExternalStore(subscribe, readSeen, neverSeen);

  useEffect(() => {
    if (seen) return;
    const timer = window.setTimeout(markSeen, VISIBLE_MS);
    window.addEventListener("keydown", markSeen);
    window.addEventListener("pointerdown", markSeen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", markSeen);
      window.removeEventListener("pointerdown", markSeen);
    };
  }, [seen]);

  return (
    <div className="calc-intro" data-visible={!seen} aria-hidden="true">
      <div className="calc-intro-inner">
        <p className="calc-intro-kicker">fx-991EX // ClassWiz</p>
        <p className="calc-intro-title">Casio Emulator</p>
        <p className="calc-intro-credit">
          by <span className="calc-intro-handle">@parvezhossainme</span>
        </p>
        <span className="calc-intro-bar" />
      </div>
    </div>
  );
}
