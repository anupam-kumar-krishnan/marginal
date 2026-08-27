"use client";

import { useEffect, useState } from "react";
import { useNotesStore } from "@/store/useNotesStore";
import Sidebar from "@/components/notes/Sidebar";
import CoverHeader from "@/components/notes/CoverHeader";
import NoteEditor from "@/components/notes/NoteEditor";

export default function NotesPage() {
  const hasHydrated = useNotesStore((s) => s.hasHydrated);
  const pages = useNotesStore((s) => s.pages);
  const activePageId = useNotesStore((s) => s.activePageId);
  const createPage = useNotesStore((s) => s.createPage);
  const setActivePage = useNotesStore((s) => s.setActivePage);
  const [collapsed, setCollapsed] = useState(false);

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
            <CoverHeader page={activePage} />
            <div className="px-6 pt-8 md:px-10">
              <NoteEditor key={activePage.id} page={activePage} />
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
