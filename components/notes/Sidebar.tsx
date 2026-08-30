"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Plus,
  Trash2,
  Copy,
  PanelLeftClose,
  PanelLeftOpen,
  NotebookPen,
  ArrowLeft,
} from "lucide-react";
import { useNotesStore } from "@/store/useNotesStore";
import ThemeToggle from "./ThemeToggle";
import FontToggle from "./FontToggle";
import TemplatePicker from "./TemplatePicker";

export default function Sidebar({
  collapsed,
  onToggleCollapsed,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const pages = useNotesStore((s) => s.pages);
  const activePageId = useNotesStore((s) => s.activePageId);
  const setActivePage = useNotesStore((s) => s.setActivePage);
  const createPage = useNotesStore((s) => s.createPage);
  const deletePage = useNotesStore((s) => s.deletePage);
  const duplicatePage = useNotesStore((s) => s.duplicatePage);
  const [pickerOpen, setPickerOpen] = useState(false);

  const sorted = [...pages].sort((a, b) => b.updatedAt - a.updatedAt);

  if (collapsed) {
    return (
      <div className="flex h-full w-14 flex-col items-center gap-4 border-r border-line bg-paper-soft py-4">
        <button
          onClick={onToggleCollapsed}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper hover:text-ink"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
        <button
          onClick={() => setPickerOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper hover:text-ink"
          aria-label="New page"
        >
          <Plus size={18} />
        </button>
        <TemplatePicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onPick={(id) => {
            createPage(id);
            setPickerOpen(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full w-72 flex-col border-r border-line bg-paper-soft">
      <div className="flex items-center justify-between px-4 pt-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-ink-soft transition hover:text-ink"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink font-display text-sm font-medium text-paper">
              M
            </span>
            <span className="font-display text-lg font-medium">Marginal</span>
          </div>
        </Link>
        <button
          onClick={onToggleCollapsed}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper hover:text-ink"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose size={17} />
        </button>
      </div>

      {/* <div className="flex items-center gap-2 px-4 pb-3 pt-4">
        <NotebookPen size={18} className="text-moss" />
        <span className="font-display text-lg font-medium">Marginal</span>
      </div> */}

      <div className="px-3">
        <button
          onClick={() => setPickerOpen(true)}
          className="flex mt-5 w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-soft transition hover:bg-paper hover:text-ink"
        >
          <Plus size={16} />
          New page
        </button>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto px-2 pb-3">
        {sorted.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-ink-soft">
            No pages yet. Create your first one.
          </p>
        )}
        {sorted.map((page) => (
          <motion.div
            layout
            key={page.id}
            className="group relative"
            onClick={() => setActivePage(page.id)}
          >
            <button
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13.5px] transition ${
                activePageId === page.id
                  ? "bg-surface font-medium shadow-sm"
                  : "hover:bg-paper"
              }`}
            >
              <span className="shrink-0">{page.icon || "📄"}</span>
              <span className="truncate">{page.title || "Untitled"}</span>
            </button>
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 gap-0.5 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  duplicatePage(page.id);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md text-ink-soft hover:bg-line hover:text-ink"
                aria-label="Duplicate"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePage(page.id);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-md text-ink-soft hover:bg-red-100 hover:text-red-600"
                aria-label="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-line px-4 py-3">
        <span className="text-xs text-ink-soft">Saved on this device</span>
        <div className="flex items-center gap-1.5">
          <FontToggle />
          <ThemeToggle compact />
        </div>
      </div>

      <TemplatePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(id) => {
          createPage(id);
          setPickerOpen(false);
        }}
      />
    </div>
  );
}
