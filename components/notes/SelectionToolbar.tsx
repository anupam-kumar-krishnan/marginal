"use client";

import { useEffect, useRef, useState } from "react";
import { Link2, Code2, MoreHorizontal } from "lucide-react";

const TEXT_COLORS = [
  "#EAEAEA",
  "#F28B82",
  "#F3A65A",
  "#F6D186",
  "#8FD19E",
  "#8EC5FC",
  "#B9A3E3",
  "#F49AC2",
];

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Floating formatting toolbar. Shows whenever there's a non-collapsed
 * text selection inside an element marked data-rich-editable — that
 * covers paragraphs/headings/etc. (via Editable) and table cells, so it
 * works "irrespective of table" as requested.
 *
 * Formatting is applied with document.execCommand, which is deprecated
 * but is still the simplest way to manipulate rich text inside a
 * contentEditable without pulling in a full editor library. Blocks now
 * store their content as HTML (see Block.tsx's Editable/table cell
 * changes) so these marks persist.
 */
export default function SelectionToolbar() {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [showColors, setShowColors] = useState(false);
  const [showMore, setShowMore] = useState(false);
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
      // While the link input is focused, the browser reports the
      // editor's selection as collapsed/empty — that's just focus
      // having moved to the input, not the user deselecting text.
      // Ignore it so the popover doesn't get torn down mid-typing.
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
    // Capture phase so this runs before the toolbar's own onMouseDown
    // preventDefault (attached via React's bubble-phase delegation),
    // avoiding any ordering ambiguity between the two.
    document.addEventListener("mousedown", onOutsideMouseDown, true);
    return () =>
      document.removeEventListener("mousedown", onOutsideMouseDown, true);
  }, [showLinkInput]);

  if (!rect) return null;

  const apply = (command: string, value?: string) => {
    document.execCommand(command, false, value);
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
    // The selection must be captured now, before the <input> below
    // steals focus — once that happens, window.getSelection() no
    // longer reflects the text that was highlighted in the editor.
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
    // Lightweight visual placeholder, not real LaTeX/KaTeX rendering.
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
              className="absolute left-0 top-[calc(100%+6px)] z-10 grid grid-cols-4 gap-1.5 rounded-lg border border-black/40 bg-neutral-900 p-2 shadow-xl"
            >
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    apply("foreColor", c);
                    setShowColors(false);
                  }}
                  className="h-5 w-5 rounded-full border border-white/20"
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
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
