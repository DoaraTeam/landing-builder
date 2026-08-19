"use client";

import { useEffect } from "react";

// Defensive backstop for a recurring Radix Dialog/Sheet/AlertDialog bug
// class: while one of these is open, Radix sets
// document.body.style.pointerEvents = "none" to block background
// interaction, and clears it once the last one closes. If a big enough React
// update (e.g. a remounted/reset subtree elsewhere on the page) lands in the
// same tick as the overlay's own close, Radix's own cleanup can lose that
// race and leave the style stuck — the whole app goes silently unclickable
// with no visible error. We've hit and fixed several individual triggers for
// this (deferring the state update via setTimeout so it lands after the
// overlay finishes closing), but new ones keep surfacing wherever an
// onSave-then-close pattern exists. This watches for exactly the stuck state
// — pointer-events: none with no overlay actually open — and clears it, as a
// safety net on top of fixing root causes as they're found.
export function RadixPointerEventsGuard() {
  useEffect(() => {
    const hasOpenOverlay = () =>
      !!document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]'
      );

    const clearIfStuck = () => {
      if (document.body.style.pointerEvents === "none" && !hasOpenOverlay()) {
        document.body.style.pointerEvents = "";
      }
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === "style") {
          // Give Radix's own close cleanup a chance to run first.
          setTimeout(clearIfStuck, 50);
          break;
        }
      }
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ["style"] });

    return () => observer.disconnect();
  }, []);

  return null;
}
