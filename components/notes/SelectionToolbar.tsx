"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, Code2, MoreHorizontal } from "lucide-react";

const TEXT_COLOR_OPTIONS: { name: string; value: string | null }[] = [
  { name: "Default", value: null },
  { name: "Gray", value: "#9B9A97" },
  { name: "Brown", value: "#8B6A4F" },
  { name: "Orange", value: "#D9730D" },
  { name: "Yellow", value: "#DFAB01" },
  { name: "Green", value: "#4DAB7A" },
  { name: "Blue", value: "#4F9BD9" },
  { name: "Purple", value: "#9A6DD7" },
  { name: "Pink", value: "#E255A1" },
  { name: "Red", value: "#E85252" },
];

const BG_COLOR_OPTIONS: { name: string; value: string | null }[] = [
  { name: "Default", value: null },
  { name: "Gray", value: "#454340" },
  { name: "Brown", value: "#452F23" },
  { name: "Orange", value: "#5C3B23" },
  { name: "Yellow", value: "#56452B" },
  { name: "Green", value: "#22392F" },
  { name: "Blue", value: "#1B3A4B" },
  { name: "Purple", value: "#352947" },
  { name: "Pink", value: "#472234" },
  { name: "Red", value: "#4A2626" },
];

type RecentColor = {
  kind: "text" | "background";
  name: string;
  value: string | null;
};

const RECENT_COLORS_KEY = "marginal-recent-colors";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function SelectionToolbar() {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [showColors, setShowColors] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [recentColors, setRecentColors] = useState<RecentColor[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_COLORS_KEY);
      if (raw) setRecentColors(JSON.parse(raw));
    } catch {}
  }, []);

  const pushRecentColor = (entry: RecentColor) => {
    setRecentColors((prev) => {
      const next = [
        entry,
        ...prev.filter(
          (c) => !(c.kind === entry.kind && c.value === entry.value),
        ),
      ].slice(0, 6);
      try {
        localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const savedRangeRef = useRef<Range | null>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const linkPopoverRef = useRef<HTMLDivElement>(null);
  const linkInputOpenRef = useRef(false);

  useEffect(() => {
    linkInputOpenRef.current = showLinkInput;
  }, [showLinkInput]);

  useEffect(() => {
    const onSelectionChange = () => {
      if (linkInputOpenRef.current) return;

      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setRect(null);
        setShowColors(false);
        setShowMore(false);
        setShowLinkInput(false);
        return;
      }
      const range = sel.getRangeAt(0);
      const node = range.commonAncestorContainer;
      const container =
        node.nodeType === 1 ? (node as Element) : node.parentElement;
      const editable = container?.closest("[data-rich-editable]");
      if (!editable) {
        setRect(null);
        return;
      }
      const r = range.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        setRect(null);
        return;
      }
      setRect(r);
    };

    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  useEffect(() => {
    if (!showLinkInput) return;
    const onOutsideMouseDown = (e: MouseEvent) => {
      if (
        linkPopoverRef.current &&
        !linkPopoverRef.current.contains(e.target as Node)
      ) {
        setShowLinkInput(false);
      }
    };

    document.addEventListener("mousedown", onOutsideMouseDown, true);
    return () =>
      document.removeEventListener("mousedown", onOutsideMouseDown, true);
  }, [showLinkInput]);

  if (!rect) return null;

  const apply = (command: string, value?: string) => {
    if (command === "foreColor" || command === "hiliteColor") {
      document.execCommand("styleWithCSS", false, "true");
    }
    document.execCommand(command, false, value);
  };

  const applyTextColor = (opt: { name: string; value: string | null }) => {
    apply("foreColor", opt.value ?? "inherit");
    pushRecentColor({ kind: "text", name: opt.name, value: opt.value });
    setShowColors(false);
  };

  const applyBgColor = (opt: { name: string; value: string | null }) => {
    apply("hiliteColor", opt.value ?? "transparent");
    pushRecentColor({ kind: "background", name: opt.name, value: opt.value });
    setShowColors(false);
  };

  const applyRecentColor = (entry: RecentColor) => {
    if (entry.kind === "text") {
      apply("foreColor", entry.value ?? "inherit");
    } else {
      apply("hiliteColor", entry.value ?? "transparent");
    }
    pushRecentColor(entry);
    setShowColors(false);
  };

  const applyCode = () => {
    const sel = window.getSelection();
    const text = sel?.toString() ?? "";
    if (!text) return;
    document.execCommand(
      "insertHTML",
      false,
      `<code class="rounded bg-paper-soft px-1 py-0.5 font-mono text-[0.85em]">${escapeHtml(
        text,
      )}</code>`,
    );
  };

  const openLinkInput = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
    setLinkValue("");
    setShowLinkInput(true);
    setShowColors(false);
    setShowMore(false);
    setTimeout(() => linkInputRef.current?.focus(), 0);
  };

  const confirmLink = () => {
    const url = linkValue.trim();
    if (url && savedRangeRef.current) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
      apply("createLink", /^https?:\/\//i.test(url) ? url : `https://${url}`);
    }
    setShowLinkInput(false);
    setLinkValue("");
  };

  const applyEquation = () => {
    const sel = window.getSelection();
    const text = sel?.toString() ?? "";
    if (!text) return;
    document.execCommand(
      "insertHTML",
      false,
      `<span class="font-mono italic text-moss">${escapeHtml(text)}</span>`,
    );
  };

  const top = rect.top + window.scrollY - 74;
  const left = rect.left + window.scrollX + rect.width / 2;

  const btn =
    "flex h-7 min-w-[1.75rem] items-center justify-center rounded px-1.5 text-[13px] font-medium text-white/90 transition hover:bg-white/10 hover:text-white";

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      style={{ top, left, transform: "translateX(-50%)" }}
      className="fixed z-50 flex flex-col gap-0.5 rounded-lg border border-black/40 bg-neutral-900 p-1 shadow-xl"
    >
      <div className="flex items-center gap-0.5">
        <div className="relative">
          <button
            onClick={() => setShowColors((v) => !v)}
            className={btn}
            aria-label="Text color"
          >
            A
          </button>
          {showColors && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              className="absolute left-0 top-[calc(100%+6px)] z-10 w-64 rounded-lg border border-black/40 bg-neutral-900 p-2.5 shadow-xl"
            >
              {recentColors.length > 0 && (
                <div className="mb-2.5">
                  <p className="mb-1.5 px-0.5 text-[11px] font-medium text-white/50">
                    Recently used
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {recentColors.map((c) => (
                      <button
                        key={`${c.kind}-${c.value}`}
                        onClick={() => applyRecentColor(c)}
                        title={`${c.name} ${c.kind}`}
                        className="h-6 w-6 rounded-md transition hover:ring-1 hover:ring-white/25"
                        style={{
                          background:
                            c.kind === "background"
                              ? (c.value ?? "transparent")
                              : "#2a2a2a",
                          color:
                            c.kind === "text" ? (c.value ?? "#fff") : "#fff",
                        }}
                      >
                        {c.kind === "text" && (
                          <span className="text-[11px] font-semibold">A</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="mb-1.5 px-0.5 text-[11px] font-medium text-white/50">
                Text color
              </p>
              <div className="mb-2.5 grid grid-cols-5 gap-1">
                {TEXT_COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => applyTextColor(opt)}
                    title={opt.name}
                    className="flex h-7 items-center justify-center rounded-md bg-white/4 text-[13px] font-semibold transition hover:bg-white/10 hover:ring-1 hover:ring-white/25"
                    style={{ color: opt.value ?? "#ffffff" }}
                  >
                    A
                  </button>
                ))}
              </div>

              <p className="mb-1.5 px-0.5 text-[11px] font-medium text-white/50">
                Background color
              </p>
              <div className="grid grid-cols-5 gap-1">
                {BG_COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.name}
                    onClick={() => applyBgColor(opt)}
                    title={opt.name}
                    className={`h-7 rounded-md transition hover:ring-1 hover:ring-white/25 ${
                      opt.value === null ? "outline outline-white/15" : ""
                    }`}
                    style={{ background: opt.value ?? "transparent" }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => apply("bold")}
          className={`${btn} font-bold`}
          aria-label="Bold"
        >
          B
        </button>
        <button
          onClick={() => apply("italic")}
          className={`${btn} italic`}
          aria-label="Italic"
        >
          I
        </button>
        <button
          onClick={() => apply("underline")}
          className={`${btn} underline`}
          aria-label="Underline"
        >
          U
        </button>
        <button
          onClick={() => apply("removeFormat")}
          className={btn}
          aria-label="Clear formatting"
        >
          Tx
        </button>
      </div>
      <div className="flex items-center gap-0.5">
        <div className="relative">
          <button onClick={openLinkInput} className={btn} aria-label="Link">
            <Link2 size={14} />
          </button>
          {showLinkInput && (
            <div
              ref={linkPopoverRef}
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute left-0 top-[calc(100%+6px)] z-10 w-64 rounded-lg border border-black/40 bg-neutral-900 p-1.5 shadow-xl"
            >
              <input
                ref={linkInputRef}
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmLink();
                  } else if (e.key === "Escape") {
                    e.preventDefault();
                    setShowLinkInput(false);
                  }
                }}
                placeholder="Paste link or search pages"
                className="w-full rounded-md border border-white/15 bg-neutral-800 px-3 py-2 text-[13px] text-white placeholder-white/40 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}
        </div>
        <button
          onClick={() => apply("strikeThrough")}
          className={`${btn} line-through`}
          aria-label="Strikethrough"
        >
          S
        </button>
        <button onClick={applyCode} className={btn} aria-label="Inline code">
          <Code2 size={14} />
        </button>
        <button onClick={applyEquation} className={btn} aria-label="Equation">
          {"\u221Ax"}
        </button>
        <div className="relative">
          <button
            onClick={() => setShowMore((v) => !v)}
            className={btn}
            aria-label="More"
          >
            <MoreHorizontal size={14} />
          </button>
          {showMore && (
            <div
              onMouseDown={(e) => e.preventDefault()}
              className="absolute right-0 top-[calc(100%+6px)] z-10 flex flex-col rounded-lg border border-black/40 bg-neutral-900 p-1 shadow-xl"
            >
              <button
                onClick={() => {
                  apply("superscript");
                  setShowMore(false);
                }}
                className="rounded px-2.5 py-1.5 text-left text-xs text-white/90 hover:bg-white/10"
              >
                Superscript
              </button>
              <button
                onClick={() => {
                  apply("subscript");
                  setShowMore(false);
                }}
                className="rounded px-2.5 py-1.5 text-left text-xs text-white/90 hover:bg-white/10"
              >
                Subscript
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
