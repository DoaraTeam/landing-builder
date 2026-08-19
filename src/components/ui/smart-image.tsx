"use client";

import Image from "next/image";
import type { CSSProperties, ReactEventHandler } from "react";

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  // Pass fill for images inside a sized, position:relative container.
  // Otherwise width/height are required (next/image needs one or the other).
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  onError?: ReactEventHandler<HTMLImageElement>;
}

// next.config.mjs deliberately has no images.remotePatterns allowlist — users
// paste arbitrary external image URLs (logos, avatars, etc.), and there's no
// fixed set of domains to allow. next/image can only optimize sources it's
// configured to trust, so local assets (and data/blob URLs) go through it,
// while everything else falls back to a plain <img>.
function isOptimizableSrc(src: string): boolean {
  return src.startsWith("/") || src.startsWith("data:") || src.startsWith("blob:");
}

export function SmartImage({
  src,
  alt,
  className,
  style,
  fill,
  width,
  height,
  sizes,
  priority,
  onError,
}: SmartImageProps) {
  if (!src || !isOptimizableSrc(src)) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={style} onError={onError} />;
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        style={style}
        priority={priority}
        onError={onError}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 0}
      height={height || 0}
      sizes={sizes}
      className={className}
      style={style}
      priority={priority}
      onError={onError}
    />
  );
}
