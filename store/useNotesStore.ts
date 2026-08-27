import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Block, Page } from "@/lib/types";
import { getTemplate } from "@/lib/templates";

interface NotesState {
  pages: Page[];
  activePageId: string | null;
  theme: "light" | "dark";
  hasHydrated: boolean;

  setHasHydrated: (v: boolean) => void;
  setActivePage: (id: string) => void;
  createPage: (templateId?: string) => string;
  deletePage: (id: string) => void;
  duplicatePage: (id: string) => void;
  updateTitle: (id: string, title: string) => void;
  updateIcon: (id: string, icon: string) => void;
  updateCover: (id: string, cover: string | null) => void;
  updateCoverPosition: (id: string, pos: number) => void;
  setBlocks: (id: string, blocks: Block[]) => void;
  toggleTheme: () => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      pages: [],
      activePageId: null,
      theme: "light",
      hasHydrated: false,

      setHasHydrated: (v) => set({ hasHydrated: v }),

      setActivePage: (id) => set({ activePageId: id }),

      createPage: (templateId = "blank") => {
        const tpl = getTemplate(templateId);
        const now = Date.now();
        const page: Page = {
          id: nanoid(10),
          title: tpl.id === "blank" ? "" : tpl.title,
          icon: tpl.icon,
          cover: null,
          blocks: tpl.blocks(),
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ pages: [page, ...s.pages], activePageId: page.id }));
        return page.id;
      },

      deletePage: (id) => {
        const { pages, activePageId } = get();
        const remaining = pages.filter((p) => p.id !== id);
        set({
          pages: remaining,
          activePageId:
            activePageId === id ? remaining[0]?.id ?? null : activePageId,
        });
      },

      duplicatePage: (id) => {
        const page = get().pages.find((p) => p.id === id);
        if (!page) return;
        const copy: Page = {
          ...page,
          id: nanoid(10),
          title: page.title ? `${page.title} (copy)` : "",
          blocks: page.blocks.map((b) => ({ ...b, id: nanoid(8) })),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((s) => ({ pages: [copy, ...s.pages], activePageId: copy.id }));
      },

      updateTitle: (id, title) =>
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id ? { ...p, title, updatedAt: Date.now() } : p
          ),
        })),

      updateIcon: (id, icon) =>
        set((s) => ({
          pages: s.pages.map((p) => (p.id === id ? { ...p, icon } : p)),
        })),

      updateCover: (id, cover) =>
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id ? { ...p, cover, coverPosition: 50 } : p
          ),
        })),

      updateCoverPosition: (id, pos) =>
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id ? { ...p, coverPosition: pos } : p
          ),
        })),

      setBlocks: (id, blocks) =>
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id ? { ...p, blocks, updatedAt: Date.now() } : p
          ),
        })),

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "notion-notes-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
