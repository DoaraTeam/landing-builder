// Content-Security-Policy is deliberately not locked down to script-src
// 'self' only: Next.js's App Router hydration bootstrap and this app's
// extensive use of inline `style={{...}}` (per-theme colors throughout
// src/components/landing) both rely on inline script/style, so 'unsafe-inline'
// stays on script-src/style-src rather than breaking either. img-src is wide
// open because users paste arbitrary external image URLs (logos, avatars) —
// tightening it to specific hosts would break that feature.
//
// frame-src/frame-ancestors are 'self' (not 'none'/DENY) on purpose: the "/"
// marketing page embeds "/editor" in an iframe (see
// src/components/editor-showcase.tsx) — a stricter policy would block that
// same-origin embed.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src * data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable if/when this app is deployed as a Docker image — produces a
  // minimal .next/standalone server bundle instead of the full build output.
  // output: "standalone",

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
