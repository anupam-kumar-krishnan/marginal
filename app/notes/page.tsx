"use client";

import { useEffect, useRef, useState } from "react";
import { useNotesStore } from "@/store/useNotesStore";
import Sidebar from "@/components/notes/Sidebar";
import CoverHeader from "@/components/notes/CoverHeader";
import NoteEditor, {
  type NoteEditorHandle,
} from "@/components/notes/NoteEditor";

export default function NotesPage() {
  const hasHydrated = useNotesStore((s) => s.hasHydrated);
  const pages = useNotesStore((s) => s.pages);
  const activePageId = useNotesStore((s) => s.activePageId);
  const createPage = useNotesStore((s) => s.createPage);
  const setActivePage = useNotesStore((s) => s.setActivePage);
  const [collapsed, setCollapsed] = useState(false);

  const editorRef = useRef<NoteEditorHandle>(null);

  useEffect(() => {
    if (!hasHydrated) return;
    if (pages.length === 0) {
      createPage("blank");
    } else if (!activePageId || !pages.find((p) => p.id === activePageId)) {
      setActivePage(pages[0].id);
    }
  }, [hasHydrated, pages, activePageId, createPage, setActivePage]);

  const ready = hasHydrated && pages.length > 0 && !!activePageId;

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center bg-paper text-ink-soft">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-moss" />
          Loading your notes…
        </div>
      </div>
    );
  }

  const activePage = pages.find((p) => p.id === activePageId) ?? pages[0];

  return (
    <div className="flex h-dvh overflow-hidden bg-paper text-ink">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
      />
      <main className="flex-1 overflow-y-auto">
        {activePage ? (
          <div className="pb-32">
            <CoverHeader
              page={activePage}
              onTitleEnter={() => editorRef.current?.focusFirst()}
            />
            <div
              className="px-6 pt-8 md:px-10"
              style={{
                maxWidth: activePage.fullWidth ? "100%" : "48rem",
                marginLeft: activePage.fullWidth ? undefined : "auto",
                marginRight: activePage.fullWidth ? undefined : "auto",
                // In full-width mode the content runs edge-to-edge, so
                // it sits right under the sidebar's resize handle /
                // stripe border. This padding needs to comfortably fit
                // the full -left-16 (64px) gutter offset used by the
                // block hover-controls in NoteEditor.tsx *plus* a gap
                // before the text — 6rem (96px) puts the controls
                // ~32px past the sidebar's stripe edge (24px) and
                // ~14px clear of the text start. If you resize the
                // sidebar's stripe strip or the gutter's button count,
                // recheck this number rather than shrinking the
                // gutter offset instead. Narrow (non-full-width) mode
                // is unaffected.
                paddingLeft: activePage.fullWidth ? "6rem" : undefined,
              }}
            >
              <NoteEditor
                ref={editorRef}
                key={activePage.id}
                page={activePage}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-ink-soft">
            Select or create a page to get started.
          </div>
        )}
      </main>
    </div>
  );
}
