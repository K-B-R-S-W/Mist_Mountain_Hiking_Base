import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * Sanitizes rich text coming from the admin About-page editor before it
 * ever reaches the database. This is the actual security boundary for
 * that content — the Tiptap editor's own output is trusted as much as
 * any other client input, i.e. not at all. Run this on save, not on
 * render, so the allowlist can tighten later without needing a backfill
 * of already-sanitized rows.
 *
 * Allowlist: bold/italic/lists/paragraphs/one heading level. No
 * attributes at all (no href, no style, no class) — nothing in this
 * editor's toolbar needs one, and disallowing them entirely removes an
 * entire class of XSS vector (javascript: hrefs, style-based attacks)
 * without having to reason about which attributes are "safe".
 */
const ALLOWED_TAGS = ["p", "strong", "em", "b", "i", "ul", "ol", "li", "br", "h3"];

export function sanitizeRichText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {},
    // Collapse anything Tiptap might emit that isn't in the allowlist
    // (e.g. a pasted <div> or <span>) down to its text content instead
    // of dropping the content entirely.
    nonTextTags: ["style", "script", "textarea", "option"],
  }).trim();
}
