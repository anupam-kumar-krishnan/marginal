"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImageIcon, X, RefreshCw, Check, Move } from "lucide-react";
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

// Curated solid colors and gradients for cover backgrounds.
// Stored directly as CSS `background` values on page.cover.
const SOLID_COVERS = [
  "#7BAB8E",
  "#5B8FB9",
  "#A78BFA",
  "#EF7C8E",
  "#F2A65A",
  "#8E8D8A",
  "#2F3E33",
  "#1F2937",
];

const GRADIENT_COVERS = [
  "linear-gradient(135deg, #ff00cc, #333399)",
  "linear-gradient(135deg, #11998e, #38ef7d)",
  "linear-gradient(135deg, #ff0084, #33001b)",
  "linear-gradient(135deg, #56CCF2, #2F80ED)",
  "linear-gradient(135deg, #F2A65A, #EF7C8E)",
  "linear-gradient(120deg, #FDE68A, #FCA5A5)",
  "linear-gradient(120deg, #34D399, #3B82F6)",
  "linear-gradient(135deg, #FDFC47, #24FE41)",
];

// An uploaded cover is a data/blob/http URL; anything else (hex or a
// linear-gradient string) is a plain CSS background value, which can't
// be repositioned since there's no image to pan.
function isImageCover(cover: string) {
  return (
    cover.startsWith("data:") ||
    cover.startsWith("http") ||
    cover.startsWith("blob:")
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function CoverPicker({
  current,
  onPick,
  onUploadClick,
  onClose,
  align = "right",
}: {
  current: string | null;
  onPick: (value: string) => void;
  onUploadClick: () => void;
  onClose: () => void;
  align?: "left" | "right";
}) {
  const [tab, setTab] = useState<"color" | "gradient" | "upload">("color");
  const swatches = tab === "color" ? SOLID_COVERS : GRADIENT_COVERS;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.97 }}
        transition={{ duration: 0.14 }}
        className={`absolute z-40 w-72 rounded-xl border border-line bg-surface p-3 shadow-xl ${
          align === "right" ? "right-0" : "left-0"
        } top-[calc(100%+8px)]`}
      >
        <div className="flex gap-1 rounded-lg bg-paper-soft p-1">
          {(["color", "gradient", "upload"] as const).map((t) => (
            <button
              key={t}
              onClick={() => (t === "upload" ? onUploadClick() : setTab(t))}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition ${
                tab === t
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab !== "upload" && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {swatches.map((value) => (
              <button
                key={value}
                onClick={() => {
                  onPick(value);
                  onClose();
                }}
                className="relative h-12 w-full overflow-hidden rounded-lg border border-line/60 transition hover:scale-[1.04]"
                style={{ background: value }}
                aria-label={`Use this ${tab} cover`}
              >
                {current === value && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Check size={16} className="text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}

export default function CoverHeader({
  page,
  onTitleEnter,
}: {
  page: Page;
  // Called when the user presses Enter in the title. The parent owns the
  // body editor, so it decides what "next line" means (e.g. focusing the
  // first block of the editor below the title).
  onTitleEnter?: () => void;
}) {
  const updateTitle = useNotesStore((s) => s.updateTitle);
  const updateIcon = useNotesStore((s) => s.updateIcon);
  const updateCover = useNotesStore((s) => s.updateCover);
  // Add `coverPosition?: number` (0-100, vertical anchor) to your Page type
  // and an updateCoverPosition(id, value) action to the store — see note
  // at the bottom of this file for the store snippet.
  const updateCoverPosition = useNotesStore((s) => s.updateCoverPosition);

  const titleRef = useRef<HTMLHeadingElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverFrameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startY: number; startPos: number } | null>(null);

  const [showEmoji, setShowEmoji] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [repositioning, setRepositioning] = useState(false);
  const [localPos, setLocalPos] = useState(page.coverPosition ?? 50);

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.innerText = page.title;
    }
  }, [page.id]);

  useEffect(() => {
    setLocalPos(page.coverPosition ?? 50);
  }, [page.id, page.cover]);

  const handleCoverFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => updateCover(page.id, reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!repositioning) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { startY: e.clientY, startPos: localPos };
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!repositioning || !dragState.current) return;
    const height = coverFrameRef.current?.offsetHeight || 1;
    const deltaPercent =
      ((e.clientY - dragState.current.startY) / height) * 100;
    setLocalPos(clamp(dragState.current.startPos - deltaPercent, 0, 100));
  };

  const handleDragEnd = () => {
    dragState.current = null;
  };

  const finishRepositioning = () => {
    setRepositioning(false);
    updateCoverPosition?.(page.id, localPos);
  };

  const cancelRepositioning = () => {
    setRepositioning(false);
    setLocalPos(page.coverPosition ?? 50);
  };

  const coverIsImage = !!page.cover && isImageCover(page.cover);

  return (
    <div>
      {page.cover ? (
        <div ref={coverFrameRef} className="group relative h-56 w-full md:h-64">
          <div
            className={`absolute inset-0 overflow-hidden ${
              repositioning ? "cursor-grab active:cursor-grabbing" : ""
            }`}
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
            onPointerCancel={handleDragEnd}
          >
            {coverIsImage ? (
              <img
                src={page.cover}
                alt=""
                draggable={false}
                className="h-full w-full select-none object-cover touch-none"
                style={{ objectPosition: `center ${localPos}%` }}
              />
            ) : (
              <div
                className="h-full w-full"
                style={{ background: page.cover }}
              />
            )}
          </div>

          {repositioning ? (
            <>
              <span className="absolute left-3 top-3 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur">
                Drag to reposition
              </span>
              <div className="absolute bottom-3 right-3 flex gap-2">
                <button
                  onClick={cancelRepositioning}
                  className="flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/70"
                >
                  Cancel
                </button>
                <button
                  onClick={finishRepositioning}
                  className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-ink transition hover:bg-white/90"
                >
                  <Check size={12} /> Save position
                </button>
              </div>
            </>
          ) : (
            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition group-hover:opacity-100">
              {coverIsImage && (
                <button
                  onClick={() => setRepositioning(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/70"
                >
                  <Move size={12} /> Reposition
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowCoverPicker((v) => !v)}
                  className="flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/70"
                >
                  <RefreshCw size={12} /> Change cover
                </button>
                <AnimatePresence>
                  {showCoverPicker && (
                    <CoverPicker
                      current={page.cover}
                      onPick={(value) => updateCover(page.id, value)}
                      onUploadClick={() => {
                        setShowCoverPicker(false);
                        coverInputRef.current?.click();
                      }}
                      onClose={() => setShowCoverPicker(false)}
                      align="right"
                    />
                  )}
                </AnimatePresence>
              </div>
              <button
                onClick={() => updateCover(page.id, null)}
                className="flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/70"
              >
                <X size={12} /> Remove
              </button>
            </div>
          )}
        </div>
      ) : null}

      <div className="max-w-3xl px-6 md:px-10">
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
            <div className="relative flex gap-2 pb-1 opacity-0 transition group-hover:opacity-100 hover:opacity-100">
              <button
                onClick={() => setShowCoverPicker((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-ink-soft transition hover:bg-paper-soft hover:text-ink"
              >
                <ImageIcon size={13} /> Add cover
              </button>
              <AnimatePresence>
                {showCoverPicker && (
                  <CoverPicker
                    current={page.cover}
                    onPick={(value) => updateCover(page.id, value)}
                    onUploadClick={() => {
                      setShowCoverPicker(false);
                      coverInputRef.current?.click();
                    }}
                    onClose={() => setShowCoverPicker(false)}
                    align="left"
                  />
                )}
              </AnimatePresence>
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
            if (e.key === "Enter") {
              // The title is single-line, so swallow the newline...
              e.preventDefault();
              // ...and hand off to the parent, which owns the body editor
              // and knows how to move focus into its first block.
              onTitleEnter?.();
            }
          }}
          className="mt-4 w-full font-display text-4xl font-medium leading-tight outline-none md:text-5xl"
        />
      </div>
    </div>
  );
}

// --- Store / type additions needed for repositioning to persist ---
//
// type Page = {
//   ...
//   coverPosition?: number; // 0-100, vertical anchor for object-position
// };
//
// updateCoverPosition: (id: string, position: number) =>
//   set((state) => ({
//     pages: state.pages.map((p) =>
//       p.id === id ? { ...p, coverPosition: position } : p
//     ),
//   })),

// --- Wiring it up in the parent page component ---
//
// The body editor lives outside this component, so CoverHeader can't
// reach into it directly. Pass a callback that focuses it:
//
// function PageView({ page }: { page: Page }) {
//   const bodyEditorRef = useRef<{ focus: () => void }>(null);
//
//   return (
//     <>
//       <CoverHeader
//         page={page}
//         onTitleEnter={() => bodyEditorRef.current?.focus()}
//       />
//       <BodyEditor ref={bodyEditorRef} page={page} />
//     </>
//   );
// }
//
// `BodyEditor` should expose a `focus()` method (e.g. via
// `useImperativeHandle` if it's a custom contentEditable, or by calling
// `editor.commands.focus()` if you're using Tiptap/ProseMirror).
