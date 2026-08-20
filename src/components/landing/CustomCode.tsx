// Renders a page's custom code snippet (analytics/chat-widget scripts) as
// real, executing markup. Safe specifically because this runs inside a
// Server Component: the output becomes part of the document the browser
// parses on first load, where <script> tags execute normally — unlike a
// client-side `el.innerHTML = ...` mutation, which browsers deliberately
// don't execute for security. Shared by every public render path so the
// injection logic (and that safety reasoning) lives in exactly one place.
export function CustomCode({ code }: { code?: string }) {
  if (!code) return null;
  return <div dangerouslySetInnerHTML={{ __html: code }} />;
}
