const MAX_LENGTH = 50_000;
const DOCUMENT_LEVEL_TAG = /<\s*(!doctype|html|head|body)\b/i;
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);
const TAG_PATTERN = /<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*?(\/)?>/g;

// `<`/`>` inside a script body (e.g. `if (a < b)`) aren't HTML tags — strip
// script/comment bodies to opaque placeholders before scanning for tags, so
// they can never be mistaken for markup.
function stripOpaqueBodies(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "<script></script>");
}

function hasBalancedTags(html: string): boolean {
  const stack: string[] = [];
  let match: RegExpExecArray | null;
  TAG_PATTERN.lastIndex = 0;
  while ((match = TAG_PATTERN.exec(html))) {
    const [raw, name, selfClosing] = match;
    const tag = name.toLowerCase();
    if (selfClosing || VOID_TAGS.has(tag)) continue;

    if (raw.startsWith("</")) {
      if (stack.pop() !== tag) return false;
    } else {
      stack.push(tag);
    }
  }
  return stack.length === 0;
}

/**
 * Catches the mistakes that would actually break the page — a truncated
 * copy-paste (missing closing tag), an entire document pasted instead of a
 * snippet, or something absurdly large — without trying to sanitize the
 * script content itself. That's out of scope by design: this field's whole
 * purpose is running the page owner's own analytics/widget scripts, which
 * routinely include inline JS the same way any legitimate snippet does.
 * Returns an error message, or null if the code is fine to save.
 */
export function validateCustomCode(code: string): string | null {
  const trimmed = code.trim();
  if (!trimmed) return null;

  if (trimmed.length > MAX_LENGTH) {
    return `Code is too long (max ${MAX_LENGTH.toLocaleString()} characters).`;
  }

  if (DOCUMENT_LEVEL_TAG.test(trimmed)) {
    return "Paste only the snippet itself (e.g. the <script> tag) — not a full HTML document.";
  }

  if (!hasBalancedTags(stripOpaqueBodies(trimmed))) {
    return "Unbalanced HTML tags — check for a missing closing tag (e.g. </script>).";
  }

  return null;
}
