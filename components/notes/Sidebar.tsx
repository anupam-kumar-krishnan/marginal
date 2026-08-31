"use client";

import { useEffect, useRef, useState } from "react";
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
  MoveHorizontal,
} from "lucide-react";
import { useNotesStore } from "@/store/useNotesStore";
import type { Page } from "@/lib/types";
import ThemeToggle from "./ThemeToggle";
import FontToggle from "./FontToggle";
import TemplatePicker from "./TemplatePicker";
import { PageIcon } from "./PageIcon";

const DEFAULT_SIDEBAR_WIDTH = 288; // matches the previous fixed w-72
const MIN_SIDEBAR_WIDTH = 220;
const MAX_SIDEBAR_WIDTH = 420;

function hasKanbanBlock(page: Page) {
  return page.blocks.some((b) => b.type === "kanban");
}

function FullWidthToggle({
  checked,
  onChange,
  disabled,
  disabledReason,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <button
      onClick={() => {
        if (disabled) return;
        onChange(!checked);
      }}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-ink-soft transition ${
        disabled
          ? "cursor-not-allowed opacity-70"
          : "hover:bg-paper hover:text-ink"
      }`}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
    >
      <span className="flex items-center gap-2">
        <MoveHorizontal size={16} />
        Full width
      </span>
      <span
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-moss" : "bg-line"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4.5" : "translate-x-0.75"
          }`}
        />
      </span>
    </button>
  );
}

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
  const setFullWidth = useNotesStore((s) => s.setFullWidth);
  const [pickerOpen, setPickerOpen] = useState(false);

  // --- Resizable width, with a hover/drag-highlighted handle in place
  // of the old plain 1px divider. Uses pointer capture directly on the
  // handle element (rather than window listeners) so the drag keeps
  // working reliably even if the cursor moves fast or briefly leaves
  // the handle's hit area. ---
  const [width, setWidth] = useState(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ startX: number; startWidth: number } | null>(
    null,
  );

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    resizeStartRef.current = { startX: e.clientX, startWidth: width };
    setIsResizing(true);
  };

  const handleResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = resizeStartRef.current;
    if (!start) return;
    const delta = e.clientX - start.startX;
    const next = Math.min(
      MAX_SIDEBAR_WIDTH,
      Math.max(MIN_SIDEBAR_WIDTH, start.startWidth + delta),
    );
    setWidth(next);
  };

  const endResize = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    resizeStartRef.current = null;
    setIsResizing(false);
  };

  const sorted = [...pages].sort((a, b) => b.updatedAt - a.updatedAt);
  const activePage = pages.find((p) => p.id === activePageId);
  const activePageHasKanban = activePage ? hasKanbanBlock(activePage) : false;

  useEffect(() => {
    if (activePage && activePageHasKanban && !activePage.fullWidth) {
      setFullWidth(activePage.id, true);
    }
  }, [activePage, activePageHasKanban, setFullWidth]);

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
    <div
      className={`relative flex h-full shrink-0 flex-col border-r border-line bg-paper-soft ${
        isResizing ? "select-none" : ""
      }`}
      style={{ width }}
    >
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
              <span className="shrink-0">
                <PageIcon
                  icon={page.icon}
                  color={page.iconColor}
                  size={16}
                  className="text-base"
                />
              </span>
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

      {activePage && (
        <div className="border-t border-line px-2 py-2">
          <FullWidthToggle
            checked={activePageHasKanban ? true : !!activePage.fullWidth}
            onChange={(next) => setFullWidth(activePage.id, next)}
            disabled={activePageHasKanban}
            disabledReason="Pages with a Kanban board are always full width"
          />
        </div>
      )}

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

      {/* Diagonal hairline-stripe border, sits along the right edge of
          the sidebar (purely decorative, so it's pointer-events-none
          and sits below the resize handle in z-index). Has its own
          solid sidebar-matching background so the page content behind
          it (e.g. a cover image) never shows through — the stripes are
          painted on top of that solid fill, not instead of it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 top-0 z-10 h-full w-6 bg-paper-soft"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent 0px, transparent 3px, var(--color-line, rgba(255,255,255,0.35)) 3px, var(--color-line, rgba(255,255,255,0.35)) 4px)",
        }}
      />

      {/* Resize handle: a wider invisible hit-zone straddling the
          border, with a thin visible bar that lights up (moss accent,
          matching the theme) on hover or while dragging — replacing
          the old plain 1px border-line divider. Pointer capture keeps
          the drag tracking even if the cursor moves faster than the
          hit-zone, or briefly leaves it. Sits above the stripe layer
          so dragging still works. */}
      <div
        onPointerDown={startResize}
        onPointerMove={handleResizeMove}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        style={{ touchAction: "none" }}
        className="group/resize absolute -right-2 top-0 z-20 h-full w-4 cursor-col-resize"
      >
        <div
          className={`mx-auto h-full w-0.75 rounded-full transition-colors ${
            isResizing
              ? "bg-moss"
              : "bg-transparent group-hover/resize:bg-moss/60"
          }`}
        />
      </div>
    </div>
  );
}
