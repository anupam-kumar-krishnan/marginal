"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageIcon, X, RefreshCw } from "lucide-react";
import { useNotesStore } from "@/store/useNotesStore";
import type { Page } from "@/lib/types";

const EMOJIS = [
  "📝",
  "📄",
  "📌",
  "📚",
  "💡",
  "🎯",
  "🗓️",
  "✅",
  "🌱",
  "🔥",
  "☕",
  "🌙",
  "☀️",
  "🎧",
  "🧠",
  "💻",
  "🚀",
  "📈",
  "🧭",
  "🔖",
  "🍀",
  "🌊",
  "🏔️",
  "🎨",
  "🧩",
  "📦",
  "🛠️",
  "⚡",
  "🌸",
  "🕊️",
];

export default function CoverHeader({ page }: { page: Page }) {
  const updateTitle = useNotesStore((s) => s.updateTitle);
  const updateIcon = useNotesStore((s) => s.updateIcon);
  const updateCover = useNotesStore((s) => s.updateCover);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.innerText = page.title;
    }
  }, [page.id]);

  const handleCoverFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => updateCover(page.id, reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {page.cover ? (
        <div className="group relative h-56 w-full overflow-hidden md:h-64">
          <img src={page.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={() => coverInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/70"
            >
              <RefreshCw size={12} /> Change cover
            </button>
            <button
              onClick={() => updateCover(page.id, null)}
              className="flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/70"
            >
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <div
          className={`group flex items-center gap-3 ${page.cover ? "-mt-9" : "pt-14"}`}
        >
          <div className="relative">
            <button
              onClick={() => setShowEmoji((v) => !v)}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-surface text-4xl shadow-sm transition hover:scale-[1.03] ${
                page.cover ? "ring-4 ring-paper" : ""
              }`}
            >
              {page.icon || "📄"}
            </button>
            <AnimatePresence>
              {showEmoji && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowEmoji(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.14 }}
                    className="absolute left-0 top-[calc(100%+8px)] z-40 grid w-64 grid-cols-6 gap-1 rounded-xl border border-line bg-surface p-2.5 shadow-xl"
                  >
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          updateIcon(page.id, emoji);
                          setShowEmoji(false);
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition hover:bg-paper-soft"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {!page.cover && (
            <div className="flex gap-2 pb-1 opacity-0 transition group-hover:opacity-100 hover:opacity-100">
              <button
                onClick={() => coverInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-ink-soft transition hover:bg-paper-soft hover:text-ink"
              >
                <ImageIcon size={13} /> Add cover
              </button>
            </div>
          )}
        </div>

        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleCoverFile(file);
            e.target.value = "";
          }}
        />

        <h1
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          data-placeholder="Untitled"
          onInput={(e) => updateTitle(page.id, e.currentTarget.innerText)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          className="mt-4 w-full font-display text-4xl font-medium leading-tight outline-none md:text-5xl"
        />
      </div>
    </div>
  );
}
