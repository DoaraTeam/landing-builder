// Renders a <script type="application/ld+json"> tag. Server Component only
// (no "use client") — dangerouslySetInnerHTML here is just JSON.stringify
// output, not user-facing HTML, so it's the standard/safe pattern for
// structured data in Next.js.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    // eslint-disable-next-line react/no-danger
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
