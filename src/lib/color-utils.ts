// Overlay colors are stored as an rgba() string (e.g. "rgba(0,0,0,0.5)") so
// opacity travels with the color in one field. These helpers convert between
// that and the hex + percentage the color-picker/slider inputs work in —
// extracted from ComponentEditor's background-image overlay editor, where
// the same parsing was previously inlined 2-3 times.

export function overlayToHex(overlay: string): string {
  if (overlay.startsWith("rgba")) {
    const match = overlay.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1], 10).toString(16).padStart(2, "0");
      const g = parseInt(match[2], 10).toString(16).padStart(2, "0");
      const b = parseInt(match[3], 10).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }
  }
  return overlay || "#000000";
}

export function hexToOverlay(hex: string, currentOverlay: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const opacity = getOverlayOpacity(currentOverlay);
  return `rgba(${r},${g},${b},${opacity})`;
}

export function getOverlayOpacity(overlay: string): number {
  const opacityMatch = overlay.match(/[\d.]+\)$/);
  return opacityMatch ? parseFloat(opacityMatch[0].replace(")", "")) : 0.5;
}

export function setOverlayOpacity(overlay: string, opacityPercent: number): string {
  const opacity = opacityPercent / 100;
  if (overlay.startsWith("rgba")) {
    return overlay.replace(/[\d.]+\)$/, `${opacity})`);
  }
  return `rgba(0,0,0,${opacity})`;
}
