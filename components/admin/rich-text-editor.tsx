"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";
import { Bold, Italic, List, ListOrdered, Heading3 } from "lucide-react";

/**
 * Bold/italic/lists rich text editor for the About page's admin fields.
 * Deliberately not a full WYSIWYG suite — the toolbar is capped to what
 * spec-appropriate marketing copy actually needs (Tiptap StarterKit
 * default extension set is bigger; only the ones surfaced in the toolbar
 * below are reachable from the UI, so nothing except p/strong/em/ul/ol/
 * li/br/h3 is actually produced).
 *
 * Plugs into the existing native `<form action={serverAction}>` pattern
 * (see /admin/settings) without turning the whole form into a client
 * component: mirrors its HTML into a controlled hidden <input>, so a
 * normal form submit picks it up via FormData like any other field.
 * Controlled (React-owned `value`), not an imperative ref write — an
 * earlier version set `.value` directly on the DOM node, which could
 * desync from what actually got submitted (e.g. under Strict
 * Mode/Turbopack HMR double-invoking the editor) and silently save
 * empty content. React re-rendering the input from state on every
 * keystroke removes that failure mode entirely. The server-side
 * sanitizer (lib/validation/sanitize-rich-text.ts) is the real trust
 * boundary — this component only controls what an admin *can* produce,
 * not what's safe to render.
 */
export function RichTextEditor({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
}) {
  const [html, setHtml] = useState(defaultValue || "");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [3] },
        // Keep the schema narrow — no blockquote/code/hr/horizontalRule
        // reachable, since nothing in the toolbar creates them and an
        // unused-but-permitted node is just extra sanitizer surface.
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        code: false,
      }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: defaultValue || "",
    editorProps: {
      attributes: {
        class: "rich-text-input",
        "aria-label": label,
      },
    },
    onUpdate: ({ editor }) => {
      // Empty doc still renders "<p></p>" — normalize to "" so the
      // repository's "empty string = not filled in yet" fallback logic
      // (see /about page) keeps working.
      setHtml(editor.isEmpty ? "" : editor.getHTML());
    },
    immediatelyRender: false,
  });

  return (
    <div className="form-field">
      <span>{label}</span>
      <input type="hidden" name={name} value={html} readOnly />
      <div className="rte-shell">
        <div className="rte-toolbar" role="toolbar" aria-label={`${label} formatting`}>
          <RteButton
            label="Bold"
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold size={15} aria-hidden="true" />
          </RteButton>
          <RteButton
            label="Italic"
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic size={15} aria-hidden="true" />
          </RteButton>
          <RteButton
            label="Heading"
            active={editor?.isActive("heading", { level: 3 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 size={15} aria-hidden="true" />
          </RteButton>
          <RteButton
            label="Bullet list"
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List size={15} aria-hidden="true" />
          </RteButton>
          <RteButton
            label="Numbered list"
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={15} aria-hidden="true" />
          </RteButton>
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

function RteButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={Boolean(active)}
      onClick={onClick}
      className={`rte-btn ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}