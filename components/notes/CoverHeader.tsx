"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ImageIcon,
  X,
  RefreshCw,
  Check,
  Move,
  Search,
  Shuffle,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useNotesStore } from "@/store/useNotesStore";
import type { Page } from "@/lib/types";
import { PageIcon } from "./PageIcon";

const EMOJI_CATEGORIES: { label: string; items: string[] }[] = [
  {
    label: "Smileys & People",
    items: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "🤣",
      "😂",
      "🙂",
      "🙃",
      "😉",
      "😊",
      "😇",
      "🥰",
      "😍",
      "🤩",
      "😘",
      "😗",
      "😚",
      "😙",
      "😋",
      "😛",
      "😜",
      "🤪",
      "😝",
      "🤑",
      "🤗",
      "🤭",
      "🤫",
      "🤔",
      "🤐",
      "🤨",
      "😐",
      "😑",
      "😶",
      "😏",
      "😒",
      "🙄",
      "😬",
      "🤥",
      "😌",
      "😔",
      "😪",
      "🤤",
      "😴",
      "😷",
      "🤒",
      "🤕",
      "🤢",
      "🤮",
      "🥳",
      "😎",
      "🤓",
      "🧐",
      "😕",
      "😟",
      "🙁",
      "☹️",
      "😮",
      "😯",
      "😲",
      "😳",
      "🥺",
      "😦",
      "😧",
      "😨",
      "😰",
      "😥",
      "😢",
      "😭",
      "😱",
      "😖",
      "😣",
      "😞",
      "😓",
      "😩",
      "😫",
      "🥱",
      "😤",
      "😡",
    ],
  },
  {
    label: "Nature",
    items: [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐸",
      "🐵",
      "🐔",
      "🐧",
      "🐦",
      "🦆",
      "🦉",
      "🦇",
      "🐺",
      "🐗",
      "🐴",
      "🦄",
      "🐝",
      "🦋",
      "🐌",
      "🐢",
      "🐍",
      "🐙",
      "🦑",
      "🦀",
      "🐠",
      "🐬",
      "🐳",
      "🦈",
      "🌵",
      "🌲",
      "🌳",
      "🌴",
      "🌱",
      "🌿",
      "☘️",
      "🍀",
      "🍃",
      "🍂",
      "🍁",
      "🌾",
      "💐",
      "🌷",
      "🌹",
      "🌺",
      "🌸",
      "🌼",
      "🌻",
      "🌞",
      "🌙",
      "⭐",
      "✨",
    ],
  },
  {
    label: "Food & Drink",
    items: [
      "🍏",
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🥝",
      "🍅",
      "🥑",
      "🥦",
      "🥕",
      "🌽",
      "🍞",
      "🥐",
      "🧀",
      "🥚",
      "🍳",
      "🥞",
      "🥓",
      "🍗",
      "🍔",
      "🍟",
      "🍕",
      "🌮",
      "🌯",
      "🥗",
      "🍝",
      "🍜",
      "🍣",
      "🍱",
      "🍤",
      "🍦",
      "🍩",
      "🍪",
      "🎂",
      "🍫",
      "🍿",
      "☕",
      "🍵",
      "🥤",
      "🍺",
      "🍷",
      "🍹",
      "🍾",
    ],
  },
  {
    label: "Activities",
    items: [
      "⚽",
      "🏀",
      "🏈",
      "⚾",
      "🎾",
      "🏐",
      "🏓",
      "🏸",
      "🥊",
      "🎽",
      "🛹",
      "🎿",
      "🏂",
      "🏋️",
      "🧘",
      "🏄",
      "🏊",
      "🚴",
      "🏆",
      "🥇",
      "🎖️",
      "🎪",
      "🎭",
      "🎨",
      "🎬",
      "🎤",
      "🎧",
      "🎼",
      "🎹",
      "🎸",
      "🎲",
      "🎯",
      "🎳",
      "🎮",
    ],
  },
  {
    label: "Travel & Places",
    items: [
      "🚗",
      "🚕",
      "🚙",
      "🚌",
      "🏎️",
      "🚓",
      "🚑",
      "🚒",
      "🚲",
      "🛵",
      "✈️",
      "🚀",
      "🛸",
      "🚁",
      "⛵",
      "🚢",
      "⚓",
      "🗺️",
      "🗽",
      "🗼",
      "🏰",
      "🎡",
      "🎢",
      "⛲",
      "🏖️",
      "🏝️",
      "🏜️",
      "🌋",
      "⛰️",
      "🏔️",
      "🏕️",
      "🏠",
      "🏢",
      "🏬",
      "🏥",
      "🏦",
      "🏨",
      "⛪",
      "🕌",
    ],
  },
  {
    label: "Objects",
    items: [
      "⌚",
      "📱",
      "💻",
      "🖥️",
      "🖨️",
      "📷",
      "📸",
      "🎥",
      "☎️",
      "📺",
      "🔋",
      "🔌",
      "💡",
      "🔦",
      "🕯️",
      "💸",
      "💰",
      "💳",
      "💎",
      "⚖️",
      "🔧",
      "🔨",
      "⚙️",
      "🔫",
      "🛡️",
      "📿",
      "🔭",
      "💊",
      "🚪",
      "🛏️",
      "🛋️",
      "🪞",
      "🚿",
      "🧻",
      "🧼",
      "💍",
      "👑",
      "🎩",
      "👓",
      "💼",
    ],
  },
  {
    label: "Symbols",
    items: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "💔",
      "✨",
      "☮️",
      "✝️",
      "☪️",
      "🕉️",
      "☸️",
      "♻️",
      "✅",
      "❌",
      "⭕",
      "🛑",
      "❗",
      "❓",
      "‼️",
      "⁉️",
      "⚠️",
      "🔱",
      "🌐",
      "💠",
      "🌀",
      "💤",
    ],
  },
];

const ICON_NAMES = [
  "Smile",
  "Heart",
  "Star",
  "Flag",
  "Anchor",
  "Image",
  "Plus",
  "Plane",
  "Rocket",
  "Truck",
  "Apple",
  "Lock",
  "Unlock",
  "Waves",
  "MapPin",
  "Scissors",
  "Archive",
  "Umbrella",
  "Home",
  "Book",
  "BookOpen",
  "Bookmark",
  "Briefcase",
  "Camera",
  "Coffee",
  "Compass",
  "Feather",
  "Gift",
  "Globe",
  "Key",
  "Lightbulb",
  "Moon",
  "Sun",
  "Music",
  "Palette",
  "PenTool",
  "Puzzle",
  "Shield",
  "ShoppingBag",
  "Sparkles",
  "Target",
  "Trophy",
  "Wallet",
  "Watch",
  "Zap",
  "Bell",
  "Calendar",
  "Car",
  "Cloud",
  "CloudRain",
  "Dumbbell",
  "Film",
  "Flame",
  "Flower2",
  "Ghost",
  "Gem",
  "Headphones",
  "Leaf",
  "Mic",
  "Package",
  "Paperclip",
  "PawPrint",
  "Pizza",
  "Ship",
  "ShoppingCart",
  "Snowflake",
  "Sunrise",
  "Sunset",
  "Tent",
  "ThumbsUp",
  "TreePine",
  "Wifi",
  "Wind",
  "Users",
  "User",
  "Building",
  "Building2",
  "Landmark",
  "GraduationCap",
  "Trees",
  "Mountain",
  "Fish",
  "Bird",
  "Bug",
  "Cat",
  "Dog",
  "Baby",
  "NotebookPen",
  "StickyNote",
] as const;

const ICON_COLORS = [
  "#EAEAEA",
  "#D9D9D9",
  "#F2C9A1",
  "#F6D186",
  "#F3A65A",
  "#8FD19E",
  "#8EC5FC",
  "#B9A3E3",
  "#F49AC2",
  "#F28B82",
];

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

function IconPicker({ page, onClose }: { page: Page; onClose: () => void }) {
  const updateIcon = useNotesStore((s) => s.updateIcon);
  const updateIconColor = useNotesStore((s) => s.updateIconColor);
  const [tab, setTab] = useState<"emoji" | "icons" | "upload">("emoji");
  const [query, setQuery] = useState("");
  const [showColors, setShowColors] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("marginal-recent-icons");
      if (raw) setRecent(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable storage
    }
  }, []);

  const pushRecent = (value: string) => {
    const next = [value, ...recent.filter((r) => r !== value)].slice(0, 10);
    setRecent(next);
    try {
      localStorage.setItem("marginal-recent-icons", JSON.stringify(next));
    } catch {
      // ignore storage errors (private mode, quota, etc.)
    }
  };

  const pickEmoji = (emoji: string) => {
    updateIcon(page.id, emoji);
    pushRecent(emoji);
    onClose();
  };

  const pickLucide = (name: string) => {
    const value = `lucide:${name}`;
    updateIcon(page.id, value);
    pushRecent(value);
    onClose();
  };

  const handleUploadFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      updateIcon(page.id, reader.result as string);
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const filteredCategories =
    tab === "emoji"
      ? EMOJI_CATEGORIES.filter((c) =>
          query ? c.label.toLowerCase().includes(query.toLowerCase()) : true,
        )
      : [];

  const filteredIcons =
    tab === "icons"
      ? ICON_NAMES.filter((n) => n.toLowerCase().includes(query.toLowerCase()))
      : [];

  const shuffle = () => {
    if (tab === "emoji") {
      const all = EMOJI_CATEGORIES.flatMap((c) => c.items);
      pickEmoji(all[Math.floor(Math.random() * all.length)]);
    } else if (tab === "icons") {
      pickLucide(ICON_NAMES[Math.floor(Math.random() * ICON_NAMES.length)]);
    }
  };

  const recentEmojis = recent.filter(
    (r) => !r.startsWith("lucide:") && !r.startsWith("data:"),
  );
  const recentIcons = recent.filter((r) => r.startsWith("lucide:"));

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.97 }}
        transition={{ duration: 0.14 }}
        className="absolute left-0 top-[calc(100%+8px)] z-40 w-80 rounded-xl border border-line bg-surface p-3 shadow-xl"
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex gap-3 text-sm">
            {(["emoji", "icons", "upload"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setQuery("");
                }}
                className={`capitalize transition ${
                  tab === t
                    ? "font-medium text-ink"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              updateIcon(page.id, "");
              updateIconColor(page.id, undefined);
              onClose();
            }}
            className="text-xs text-ink-soft hover:text-ink"
          >
            Remove
          </button>
        </div>

        {tab !== "upload" && (
          <div className="mb-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter..."
                className="w-full rounded-lg border border-line bg-paper px-7 py-1.5 text-sm outline-none focus:border-moss"
              />
            </div>
            <button
              onClick={shuffle}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line text-ink-soft transition hover:bg-paper-soft hover:text-ink"
              aria-label="Random"
            >
              <Shuffle size={14} />
            </button>
            {tab === "icons" && (
              <div className="relative">
                <button
                  onClick={() => setShowColors((v) => !v)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line"
                  style={{ background: page.iconColor || "#E5E5E5" }}
                  aria-label="Icon color"
                />
                <AnimatePresence>
                  {showColors && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 top-[calc(100%+6px)] z-50 rounded-lg border border-line bg-surface shadow-lg"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(5, 24px)",
                        gap: "10px",
                        padding: "10px",
                        width: "max-content",
                      }}
                    >
                      {ICON_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            updateIconColor(page.id, c);
                            setShowColors(false);
                          }}
                          aria-label={`Use color ${c}`}
                          style={{
                            appearance: "none",
                            WebkitAppearance: "none",
                            background: c,
                            width: "24px",
                            height: "24px",
                            minWidth: "24px",
                            minHeight: "24px",
                            maxWidth: "24px",
                            maxHeight: "24px",
                            padding: 0,
                            margin: 0,
                            border: "1px solid rgba(255,255,255,0.15)",
                            borderRadius: "9999px",
                            boxSizing: "border-box",
                            boxShadow:
                              page.iconColor === c
                                ? "0 0 0 2px var(--surface, #1c1c1c), 0 0 0 4px #3b82f6"
                                : "none",
                            cursor: "pointer",
                            display: "block",
                            lineHeight: 0,
                            flex: "none",
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        <div className="max-h-72 overflow-y-auto pr-1">
          {tab === "emoji" && (
            <>
              {recentEmojis.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                    Recent
                  </p>
                  <div className="grid grid-cols-8 gap-1">
                    {recentEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => pickEmoji(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-paper-soft"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {filteredCategories.map((cat) => (
                <div key={cat.label} className="mb-2">
                  <p className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                    {cat.label}
                  </p>
                  <div className="grid grid-cols-8 gap-1">
                    {cat.items.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => pickEmoji(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-paper-soft"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "icons" && (
            <>
              {recentIcons.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 px-1 text-[11px] font-medium uppercase tracking-wide text-ink-soft">
                    Recent
                  </p>
                  <div className="grid grid-cols-8 gap-1">
                    {recentIcons.map((value) => {
                      const name = value.slice("lucide:".length);
                      const Cmp = (LucideIcons as any)[name];
                      if (!Cmp) return null;
                      return (
                        <button
                          key={value}
                          onClick={() => pickLucide(name)}
                          title={name}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper-soft hover:text-ink"
                        >
                          <Cmp size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-8 gap-1">
                {filteredIcons.map((name) => {
                  const Cmp = (LucideIcons as any)[name];
                  if (!Cmp) return null;
                  return (
                    <button
                      key={name}
                      onClick={() => pickLucide(name)}
                      title={name}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition hover:bg-paper-soft hover:text-ink"
                    >
                      <Cmp size={16} />
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {tab === "upload" && (
            <div>
              <button
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-paper-soft px-4 py-6 text-sm text-ink-soft transition hover:border-moss hover:text-moss"
              >
                <ImageIcon size={16} />
                Upload an image
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFile(file);
                  e.target.value = "";
                }}
              />
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default function CoverHeader({
  page,
  onTitleEnter,
}: {
  page: Page;
  onTitleEnter?: () => void;
}) {
  const updateTitle = useNotesStore((s) => s.updateTitle);
  const updateCover = useNotesStore((s) => s.updateCover);
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

      <div
        className="px-6 md:px-10"
        style={{
          maxWidth: page.fullWidth ? "100%" : "48rem",
          marginLeft: page.fullWidth ? undefined : "auto",
          marginRight: page.fullWidth ? undefined : "auto",
        }}
      >
        <div
          className={`group flex items-center gap-3 ${page.cover ? "-mt-9" : "pt-14"}`}
        >
          <div className="relative">
            <button
              onClick={() => setShowEmoji((v) => !v)}
              className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-surface shadow-sm transition hover:scale-[1.03] ${
                page.cover ? "ring-4 ring-paper" : ""
              }`}
            >
              <PageIcon
                icon={page.icon}
                color={page.iconColor}
                size={40}
                className="text-4xl"
              />
            </button>
            <AnimatePresence>
              {showEmoji && (
                <IconPicker page={page} onClose={() => setShowEmoji(false)} />
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
              e.preventDefault();
              onTitleEnter?.();
            }
          }}
          className="mt-4 w-full font-display text-4xl font-medium leading-tight outline-none md:text-5xl"
        />
      </div>
    </div>
  );
}
