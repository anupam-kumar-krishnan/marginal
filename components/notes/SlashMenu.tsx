"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { slashCommands } from "@/lib/slashCommands";
import type { BlockType } from "@/lib/types";

interface SlashMenuProps {
  query: string;
  selectedIndex: number;
  onSelect: (type: BlockType) => void;
  onHover: (index: number) => void;
}

export default function SlashMenu({
  query,
  selectedIndex,
  onSelect,
  onHover,
}: SlashMenuProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const q = query.toLowerCase().trim();
  const filtered = q
    ? slashCommands.filter(
        (c) =>
          c.label.toLowerCase().includes(q) ||
          c.keywords.some((k) => k.includes(q))
      )
    : slashCommands;

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as
      | HTMLElement
      | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.14, ease: "easeOut" }}
        className="absolute left-0 top-[calc(100%+6px)] z-30 w-72 overflow-hidden rounded-xl border border-line bg-surface shadow-xl"
      >
        <div className="border-b border-line px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          Blocks
        </div>
        <div ref={listRef} className="max-h-72 overflow-y-auto p-1.5">
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-sm text-ink-soft">
              No matching blocks
            </div>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.type}
              onMouseEnter={() => onHover(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(cmd.type);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${
                i === selectedIndex ? "bg-moss-soft" : "hover:bg-paper-soft"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-paper font-mono text-[13px] text-ink-soft">
                {cmd.icon}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13.5px] font-medium">
                  {cmd.label}
                </span>
                <span className="block truncate text-[11.5px] text-ink-soft">
                  {cmd.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function filteredCommandCount(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return slashCommands.length;
  return slashCommands.filter(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.includes(q))
  ).length;
}

export function getFilteredCommands(query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return slashCommands;
  return slashCommands.filter(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.includes(q))
  );
}
