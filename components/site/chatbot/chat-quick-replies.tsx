"use client";

export function ChatQuickReplies({
  replies,
  onSelect,
}: {
  replies: string[];
  onSelect: (reply: string) => void;
}) {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 py-2">
      {replies.map((reply, i) => (
        <button
          key={i}
          onClick={() => onSelect(reply)}
          type="button"
          className="rounded-full border border-black/10 bg-surface/90 px-3 py-1 text-xs font-medium text-text/90 shadow-2xs backdrop-blur hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition active:scale-95"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
