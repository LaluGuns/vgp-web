"use client";

import { useEffect, useRef, useState } from "react";
import { useFocusSessionStore } from "@/lib/stores/focus-session-store";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";

/**
 * Context Bookmark — appears when the timer is paused mid-focus.
 * Captures a one-line "where I left off" note (cuts attention residue; Leroy 2009),
 * which is then surfaced on the dial when work resumes.
 */
export function ContextModal() {
  const open = useFocusSessionStore((s) => s.contextModalOpen);
  const setBookmark = useFocusSessionStore((s) => s.setBookmark);
  const close = useFocusSessionStore((s) => s.closeContextModal);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    // Defer out of the sync effect body: seed the field + focus once the modal is up.
    const id = setTimeout(() => {
      setText(useFocusSessionStore.getState().contextBookmark);
      inputRef.current?.focus();
    }, 60);
    return () => clearTimeout(id);
  }, [open]);

  if (!open) return null;

  function save() {
    setBookmark(text.trim());
    close();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in-0">
      <div className="glass-card w-full max-w-sm p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center gap-2 text-primary">
          <Bookmark className="h-4 w-4" />
          <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Context Bookmark</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-white tracking-tight">
            What are you working on?
          </h3>
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            One line so you drop straight back in. Refocusing after a break averages ~23 min — this kills it.
          </p>
        </div>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
          maxLength={140}
          placeholder="e.g. Wiring the auth webhook handler…"
          className="w-full bg-secondary/40 border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={close}>
            Skip
          </Button>
          <Button size="sm" onClick={save}>
            Save & continue
          </Button>
        </div>
      </div>
    </div>
  );
}
