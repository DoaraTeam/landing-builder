"use client";

import { useRef, useState } from "react";

// Canvas zoom level plus fit-to-width. Extracted verbatim from
// EditableLandingPage.tsx.
export function useCanvasZoom() {
  // Zoom applies only to this page's canvas, not the surrounding editor chrome.
  const [zoomPercent, setZoomPercent] = useState(100);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasContentRef = useRef<HTMLDivElement>(null);

  // Compute the zoom percentage that makes the canvas fit the currently
  // available width. CSS transform (used to apply zoom) is purely a paint-time
  // effect — it doesn't change the element's own layout size — so
  // content.scrollWidth is already the natural, unzoomed width regardless of
  // the current zoomPercent and needs no compensation for it.
  const handleFitZoom = () => {
    const wrapper = canvasWrapperRef.current;
    const content = canvasContentRef.current;
    if (!wrapper || !content) return;

    const naturalWidth = content.scrollWidth;
    if (naturalWidth <= 0) return;

    const fitPercent = Math.round(
      Math.min(200, Math.max(25, (wrapper.clientWidth / naturalWidth) * 100))
    );
    setZoomPercent(fitPercent);
  };

  return { zoomPercent, setZoomPercent, canvasWrapperRef, canvasContentRef, handleFitZoom };
}
