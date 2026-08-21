// Guards only against values that would corrupt actual runtime number math
// (a NaN written into config, e.g. from typing non-numeric text into a
// number field) — not content/format opinions like empty strings or
// malformed URLs, which stay the user's own call and are visible the moment
// they preview the page.
function isNaNValue(value: unknown): boolean {
  return value !== undefined && value !== null && value !== "" && Number.isNaN(Number(value));
}

interface AnimationTiming {
  duration?: unknown;
  delay?: unknown;
}

export function validateAnimationConfig(animation: AnimationTiming | undefined): {
  duration?: string;
  delay?: string;
} {
  const errors: { duration?: string; delay?: string } = {};
  if (isNaNValue(animation?.duration)) errors.duration = "Duration phải là một số";
  if (isNaNValue(animation?.delay)) errors.delay = "Delay phải là một số";
  return errors;
}

interface OpenGraphImage {
  width?: unknown;
  height?: unknown;
}

export function validateOpenGraphImages(
  images: OpenGraphImage[] | undefined
): Record<number, { width?: string; height?: string }> {
  const errors: Record<number, { width?: string; height?: string }> = {};
  images?.forEach((image, index) => {
    const imageErrors: { width?: string; height?: string } = {};
    if (isNaNValue(image.width)) imageErrors.width = "Width phải là một số";
    if (isNaNValue(image.height)) imageErrors.height = "Height phải là một số";
    if (Object.keys(imageErrors).length > 0) errors[index] = imageErrors;
  });
  return errors;
}
