"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import type {
  Block as BlockT,
  KanbanData,
  TableData,
  ToggleChild,
} from "@/lib/types";
import KanbanBoard from "@/components/notes/KanbanBoard";

interface BlockProps {
  block: BlockT;
  index: number;
  numberIndex?: number;
  registerRef: (
    id: string,
    el: HTMLDivElement | HTMLTextAreaElement | null,
  ) => void;
  onInput: (id: string, text: string) => void;
  onKeyDown: (
    id: string,
    e: React.KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>,
  ) => void;
  onToggleCheck: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  onRemoveImage: (id: string) => void;
  onImageResize: (id: string, widthPercent: number) => void;
  onFocusBlock: (id: string) => void;
  onKanbanChange: (id: string, data: KanbanData) => void;
  onToggleChange: (
    id: string,
    patch: { toggleCollapsed?: boolean; toggleChildren?: ToggleChild[] },
  ) => void;
  onTableChange: (id: string, table: TableData) => void;
  onOpenPage: (id: string, pageId?: string) => void;
  onCodeLanguageChange: (id: string, language: string) => void;
}

const placeholderFor = (type: BlockT["type"], index: number) => {
  if (index === 0) return "Write, or press \u2018/\u2019 for commands\u2026";
  switch (type) {
    case "heading1":
      return "Heading 1";
    case "heading2":
      return "Heading 2";
    case "heading3":
      return "Heading 3";
    case "quote":
      return "Quote";
    case "callout":
      return "Callout \u2014 make it stand out";
    case "code":
      return "Code";
    case "toggle":
      return "Toggle";
    default:
      return "Type \u2018/\u2019 for commands\u2026";
  }
};

const typeClass: Record<string, string> = {
  paragraph: "text-[15px] leading-7",
  heading1: "text-3xl md:text-4xl font-display font-medium leading-tight",
  heading2: "text-2xl md:text-3xl font-display font-medium leading-snug",
  heading3: "text-xl md:text-2xl font-display font-medium leading-snug",
  quote: "text-lg italic leading-7 border-l-2 border-moss pl-4",
  code: "font-mono text-sm leading-6 bg-paper-soft rounded-lg p-4 block",
  callout: "text-[15px] leading-7",
  toggle: "text-[15px] leading-7 font-medium",
};

const CODE_LANGUAGES = [
  { value: "auto", label: "Auto-detect" },
  { value: "plaintext", label: "Plain Text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash" },
  { value: "json", label: "JSON" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "sql", label: "SQL" },
  { value: "markdown", label: "Markdown" },
  { value: "yaml", label: "YAML" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
];

/**
 * Lightweight heuristic language detection so code blocks can guess
 * their language as the user types, without pulling in a full
 * detection library (e.g. highlight.js's highlightAuto). Checked in
 * order from most-specific/unambiguous signal to least.
 */
function detectLanguage(code: string): string {
  const src = code ?? "";
  const trimmed = src.trim();
  if (!trimmed) return "plaintext";

  // JSON — cheap to confirm definitively by parsing.
  if (trimmed[0] === "{" || trimmed[0] === "[") {
    try {
      JSON.parse(trimmed);
      return "json";
    } catch {
      // fall through — could still be JS/TS object literal etc.
    }
  }

  const hasJsxTag =
    /<\/?[A-Z][\w.]*[^>]*>/.test(src) || /<>[\s\S]*<\/>/.test(src);
  const hasTsSignals =
    /:\s*(string|number|boolean|any|void|unknown|React\.\w+)\b/.test(src) ||
    /\binterface\s+\w+/.test(src) ||
    /\btype\s+\w+\s*=/.test(src) ||
    /\bimplements\s+\w+/.test(src);

  if (hasJsxTag) return hasTsSignals ? "tsx" : "jsx";

  if (
    /<!doctype html>/i.test(src) ||
    /<html[\s>]/i.test(src) ||
    (/<head[\s>]/i.test(src) && /<body[\s>]/i.test(src))
  ) {
    return "html";
  }

  if (
    !/\b(function|const|let|var)\b/.test(src) &&
    /[.#]?[\w-]+\s*\{[^{}]*:[^{}]*;[^{}]*\}/.test(src)
  ) {
    return "css";
  }

  if (
    /^\s*(def |import |from\s+\S+\s+import|elif\b|print\()/m.test(src) &&
    !/;\s*$/m.test(src)
  ) {
    return "python";
  }

  if (
    /^#!.*\b(bash|sh|zsh)\b/.test(src) ||
    (/\becho\s+["'$]/.test(src) && /\bfi\b/.test(src)) ||
    (/\bthen\b/.test(src) && /\bfi\b/.test(src))
  ) {
    return "bash";
  }

  if (
    /\bSELECT\b[\s\S]*\bFROM\b/i.test(src) ||
    /\bCREATE\s+TABLE\b/i.test(src) ||
    /\bINSERT\s+INTO\b/i.test(src)
  ) {
    return "sql";
  }

  if (/\bpackage\s+main\b/.test(src) && /\bfunc\s+\w+\(/.test(src)) {
    return "go";
  }

  if (
    /\bfn\s+\w+\(/.test(src) &&
    (/::/.test(src) || /\blet\s+mut\b/.test(src) || /println!/.test(src))
  ) {
    return "rust";
  }

  if (/\bpublic\s+(class|static)\b/.test(src) && /;\s*$/m.test(src)) {
    return "java";
  }

  if (hasTsSignals) return "typescript";

  if (
    /^---/m.test(src) &&
    /^\s*[\w-]+:\s*\S/m.test(src) &&
    !/[{};]/.test(src)
  ) {
    return "yaml";
  }

  if (/^#{1,6}\s+\S/m.test(src) || /\[.+\]\(.+\)/.test(src)) {
    return "markdown";
  }

  if (
    /\b(const|let|var)\s+\w+\s*=/.test(src) ||
    /=>/.test(src) ||
    /\bfunction\s+\w+\(/.test(src) ||
    /\bconsole\.\w+\(/.test(src) ||
    /\brequire\(/.test(src)
  ) {
    return "javascript";
  }

  return "plaintext";
}

function Editable({
  block,
  index,
  className,
  registerRef,
  onInput,
  onKeyDown,
  onFocusBlock,
}: {
  block: BlockT;
  index: number;
  className: string;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  onInput: (id: string, text: string) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocusBlock: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.innerHTML = block.content;
    }
  }, [block.id, block.type]);

  return (
    <div
      ref={(el) => {
        ref.current = el;
        registerRef(block.id, el);
      }}
      contentEditable
      suppressContentEditableWarning
      data-rich-editable
      data-placeholder={placeholderFor(block.type, index)}
      className={`${className} w-full outline-none`}
      onInput={(e) => onInput(block.id, e.currentTarget.innerHTML)}
      onKeyDown={(e) => onKeyDown(block.id, e)}
      onFocus={() => onFocusBlock(block.id)}
    />
  );
}

/**
 * Code block with live Prism syntax highlighting.
 *
 * Implementation note: contentEditable can't render syntax-highlighted
 * markup and stay reliably editable at the same time (caret placement
 * and undo/redo break easily once you swap innerHTML on every
 * keystroke). Instead we stack two layers of identical size/typography:
 *   1. A visible, non-interactive SyntaxHighlighter showing colored code.
 *   2. An invisible (text made transparent) contentEditable on top that
 *      holds the real caret/selection and receives all input.
 * The two layers are kept in sync on content change and on scroll.
 */
function LanguagePicker({
  value,
  detectedLanguage,
  onChange,
}: {
  value: string;
  detectedLanguage?: string;
  onChange: (language: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current =
    CODE_LANGUAGES.find((l) => l.value === value) ?? CODE_LANGUAGES[0];
  const detectedMeta =
    value === "auto" && detectedLanguage
      ? CODE_LANGUAGES.find((l) => l.value === detectedLanguage)
      : undefined;

  const buttonLabel =
    detectedMeta && detectedMeta.value !== "plaintext"
      ? `Auto \u00B7 ${detectedMeta.label}`
      : current.label;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-soft transition hover:bg-line/40 hover:text-ink"
      >
        {buttonLabel}
        <span
          className={`text-[9px] transition-transform ${open ? "rotate-180" : ""}`}
        >
          {"\u25BE"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 max-h-64 w-44 overflow-y-auto rounded-lg border border-line bg-paper py-1 shadow-lg">
          {CODE_LANGUAGES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => {
                onChange(l.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs transition ${
                l.value === value
                  ? "bg-moss/10 text-moss"
                  : "text-ink-soft hover:bg-paper-soft hover:text-ink"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CodeBlock({
  block,
  index,
  registerRef,
  onInput,
  onKeyDown,
  onFocusBlock,
  onLanguageChange,
}: {
  block: BlockT;
  index: number;
  registerRef: (
    id: string,
    el: HTMLDivElement | HTMLTextAreaElement | null,
  ) => void;
  onInput: (id: string, text: string) => void;
  onKeyDown: (
    id: string,
    e: React.KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>,
  ) => void;
  onFocusBlock: (id: string) => void;
  onLanguageChange: (id: string, language: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // "auto" (the default for new code blocks) means we detect the
  // language live from the block's content on every render; picking
  // a specific language from the dropdown pins it and stops detection.
  const selectedLanguage = block.codeLanguage || "auto";
  const isAuto = selectedLanguage === "auto";
  const detected = isAuto ? detectLanguage(block.content) : selectedLanguage;
  const highlightLanguage = detected === "plaintext" ? "text" : detected;
  const [height, setHeight] = useState<number>();

  const updateHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    setHeight(el.scrollHeight);
  };

  useEffect(() => {
    updateHeight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.content]);

  return (
    <div className="rounded-lg bg-paper-soft">
      <div className="flex items-center justify-between rounded-t-lg border-b border-line/60 px-2 py-1">
        <LanguagePicker
          value={selectedLanguage}
          detectedLanguage={isAuto ? detected : undefined}
          onChange={(lang) => onLanguageChange(block.id, lang)}
        />
      </div>

      <div
        className="relative overflow-hidden rounded-b-lg"
        style={{ height: height ? `${height}px` : undefined }}
      >
        {/* Highlighted layer — visual only, not interactive */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-4 py-3 font-mono text-sm leading-6"
        >
          <SyntaxHighlighter
            language={highlightLanguage}
            style={oneLight}
            customStyle={{
              margin: 0,
              padding: 0,
              background: "transparent",
              fontSize: "inherit",
              fontFamily: "inherit",
              lineHeight: "inherit",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
            codeTagProps={{ style: { fontFamily: "inherit" } }}
          >
            {block.content ? block.content : " "}
          </SyntaxHighlighter>
        </div>

        {/* Editable layer — a real textarea, so Enter/newlines, caret
            placement, and selection are all native browser behavior
            instead of fragile contentEditable + execCommand hacks. */}
        <textarea
          ref={(el) => {
            textareaRef.current = el;
            registerRef(block.id, el);
          }}
          value={block.content}
          spellCheck={false}
          placeholder={placeholderFor(block.type ?? "code", index)}
          className="absolute inset-0 h-full w-full resize-none overflow-hidden whitespace-pre-wrap break-words bg-transparent px-4 py-3 font-mono text-sm leading-6 text-transparent caret-ink outline-none selection:bg-ink/15 selection:text-transparent placeholder:text-ink-soft"
          style={{ WebkitTextFillColor: "transparent" }}
          onChange={(e) => onInput(block.id, e.target.value)}
          onKeyDown={(e) => onKeyDown(block.id, e)}
          onFocus={() => onFocusBlock(block.id)}
        />
      </div>
    </div>
  );
}

/**
 * One editable line inside a toggle's collapsible body. Deliberately
 * simple (no slash menu, no block-type switching) — this is a plain
 * text line, not a full nested Block.
 */
function ToggleChildLine({
  child,
  onChange,
  onEnter,
  onRemove,
}: {
  child: ToggleChild;
  onChange: (id: string, content: string) => void;
  onEnter: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && document.activeElement !== ref.current) {
      ref.current.innerHTML = child.content;
    }
  }, [child.id]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-rich-editable
      data-placeholder="Empty"
      className="text-[15px] leading-6 outline-none"
      onInput={(e) => onChange(child.id, e.currentTarget.innerHTML)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter(child.id);
        } else if (e.key === "Backspace" && e.currentTarget.innerText === "") {
          e.preventDefault();
          onRemove(child.id);
        }
      }}
    />
  );
}

const DRAG_ROW_UNIT = 36;
const DRAG_COL_UNIT = 100;

function TableEditor({
  table,
  onChange,
}: {
  table: TableData;
  onChange: (table: TableData) => void;
}) {
  const rows = table.rows.length ? table.rows : [["", "", ""]];
  const [hoverZone, setHoverZone] = useState<"row" | "col" | null>(null);
  const didDragRef = useRef(false);
  const dragState = useRef<{
    mode: "row" | "col";
    start: number;
    startCount: number;
    baseRows: string[][];
  } | null>(null);

  const updateCell = (r: number, c: number, value: string) => {
    const next = rows.map((row) => row.slice());
    next[r][c] = value;
    onChange({ rows: next });
  };

  const addRow = () => {
    const cols = rows[0]?.length ?? 3;
    onChange({ rows: [...rows, Array(cols).fill("")] });
  };

  const addColumn = () => {
    onChange({ rows: rows.map((row) => [...row, ""]) });
  };

  const handleDragMove = (e: PointerEvent) => {
    const ds = dragState.current;
    if (!ds) return;
    const delta =
      ds.mode === "row" ? e.clientY - ds.start : e.clientX - ds.start;
    const unit = ds.mode === "row" ? DRAG_ROW_UNIT : DRAG_COL_UNIT;
    const change = Math.round(delta / unit);
    if (change !== 0) didDragRef.current = true;
    const targetCount = Math.max(1, ds.startCount + change);

    if (ds.mode === "row") {
      const cols = ds.baseRows[0]?.length ?? 1;
      let next = ds.baseRows.map((row) => row.slice());
      if (targetCount > next.length) {
        while (next.length < targetCount) next.push(Array(cols).fill(""));
      } else {
        next = next.slice(0, targetCount);
      }
      onChange({ rows: next });
    } else {
      const next = ds.baseRows.map((row) => {
        const copy = row.slice();
        if (targetCount > copy.length) {
          while (copy.length < targetCount) copy.push("");
        } else {
          copy.length = targetCount;
        }
        return copy;
      });
      onChange({ rows: next });
    }
  };

  const handleDragEnd = () => {
    dragState.current = null;
    window.removeEventListener("pointermove", handleDragMove);
    window.removeEventListener("pointerup", handleDragEnd);
  };

  const startDrag = (mode: "row" | "col", e: React.PointerEvent) => {
    e.preventDefault();
    didDragRef.current = false;
    const baseRows = rows.map((row) => row.slice());
    dragState.current = {
      mode,
      start: mode === "row" ? e.clientY : e.clientX,
      startCount: mode === "row" ? baseRows.length : (baseRows[0]?.length ?? 1),
      baseRows,
    };
    window.addEventListener("pointermove", handleDragMove);
    window.addEventListener("pointerup", handleDragEnd);
  };

  return (
    <div className="relative inline-block w-full pb-4 pr-4">
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full table-fixed border-collapse text-sm">
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="border border-line p-0 align-top">
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      data-rich-editable
                      className="min-h-9 px-2.5 py-1.5 outline-none focus:bg-paper-soft"
                      ref={(el) => {
                        if (
                          el &&
                          document.activeElement !== el &&
                          el.innerHTML !== cell
                        ) {
                          el.innerHTML = cell;
                        }
                      }}
                      onInput={(e) =>
                        updateCell(r, c, e.currentTarget.innerHTML)
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        onMouseEnter={() => setHoverZone("row")}
        onMouseLeave={() => setHoverZone(null)}
        onPointerDown={(e) => startDrag("row", e)}
        onClick={() => {
          if (!didDragRef.current) addRow();
        }}
        className="absolute inset-x-0 bottom-2 z-10 h-3 cursor-row-resize"
      >
        <div
          className={`mx-auto h-0.75 rounded-full transition-colors ${
            hoverZone === "row" ? "bg-moss" : "bg-transparent"
          }`}
        />
      </div>
      {hoverZone === "row" && (
        <div className="pointer-events-none absolute -bottom-11 right-0 z-20 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] leading-tight text-white shadow-lg">
          Click to add a new row
          <br />
          Drag to add or remove rows
        </div>
      )}

      <div
        onMouseEnter={() => setHoverZone("col")}
        onMouseLeave={() => setHoverZone(null)}
        onPointerDown={(e) => startDrag("col", e)}
        onClick={() => {
          if (!didDragRef.current) addColumn();
        }}
        className="absolute inset-y-0 right-2 z-10 w-3 cursor-col-resize"
      >
        <div
          className={`mx-auto h-full w-0.75 rounded-full transition-colors ${
            hoverZone === "col" ? "bg-moss" : "bg-transparent"
          }`}
        />
      </div>
      {hoverZone === "col" && (
        <>
          <div className="pointer-events-none absolute -top-2 right-0 z-20 flex h-4 w-4 items-center justify-center rounded bg-moss text-[10px] font-medium text-white">
            +
          </div>
          <div className="pointer-events-none absolute right-6 top-0 z-20 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] leading-tight text-white shadow-lg">
            Click to add a new column
            <br />
            Drag to add or remove columns
          </div>
        </>
      )}
    </div>
  );
}

export default function Block({
  block,
  index,
  numberIndex,
  registerRef,
  onInput,
  onKeyDown,
  onToggleCheck,
  onImageUpload,
  onRemoveImage,
  onImageResize,
  onFocusBlock,
  onKanbanChange,
  onToggleChange,
  onTableChange,
  onOpenPage,
  onCodeLanguageChange,
}: BlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  if (block.type === "divider") {
    return <hr className="my-4 border-line" />;
  }

  if (block.type === "kanban") {
    return (
      <KanbanBoard
        data={block.kanban ?? { columns: [] }}
        onChange={(data) => onKanbanChange(block.id, data)}
      />
    );
  }

  if (block.type === "table") {
    return (
      <TableEditor
        table={
          block.table ?? {
            rows: [
              ["", "", ""],
              ["", "", ""],
              ["", "", ""],
            ],
          }
        }
        onChange={(table) => onTableChange(block.id, table)}
      />
    );
  }

  if (block.type === "page") {
    return (
      <button
        onClick={() => onOpenPage(block.id, block.pageId)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[15px] transition hover:bg-paper-soft"
      >
        <span className="text-base">{"\u{1F4C4}"}</span>
        <span className={block.content ? "text-ink" : "text-ink-soft"}>
          {block.content || "Untitled"}
        </span>
      </button>
    );
  }

  if (block.type === "code") {
    return (
      <CodeBlock
        block={block}
        index={index}
        registerRef={registerRef}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onFocusBlock={onFocusBlock}
        onLanguageChange={onCodeLanguageChange}
      />
    );
  }

  if (block.type === "toggle") {
    const children = block.toggleChildren ?? [];
    const collapsed = block.toggleCollapsed ?? false;

    const updateChild = (id: string, content: string) => {
      onToggleChange(block.id, {
        toggleChildren: children.map((c) =>
          c.id === id ? { ...c, content } : c,
        ),
      });
    };

    const addChildAfter = (id: string) => {
      const idx = children.findIndex((c) => c.id === id);
      const newChild: ToggleChild = {
        id: `${block.id}-${Date.now()}`,
        content: "",
      };
      const next = children.slice();
      next.splice(idx + 1, 0, newChild);
      onToggleChange(block.id, { toggleChildren: next });
    };

    const removeChild = (id: string) => {
      if (children.length <= 1) return;
      onToggleChange(block.id, {
        toggleChildren: children.filter((c) => c.id !== id),
      });
    };

    return (
      <div>
        <div className="flex items-start gap-2">
          <button
            onClick={() =>
              onToggleChange(block.id, { toggleCollapsed: !collapsed })
            }
            className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-ink-soft transition hover:bg-paper-soft"
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            <span
              className={`inline-block text-[10px] transition-transform ${
                collapsed ? "" : "rotate-90"
              }`}
            >
              {"\u25B6"}
            </span>
          </button>
          <Editable
            block={block}
            index={index}
            className={typeClass.toggle}
            registerRef={registerRef}
            onInput={onInput}
            onKeyDown={onKeyDown}
            onFocusBlock={onFocusBlock}
          />
        </div>
        {!collapsed && (
          <div className="ml-6 mt-1 space-y-1 border-l border-line pl-3">
            {children.map((child) => (
              <ToggleChildLine
                key={child.id}
                child={child}
                onChange={updateChild}
                onEnter={addChildAfter}
                onRemove={removeChild}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (block.type === "image") {
    if (!block.imageSrc) {
      return (
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-2 rounded-xl border border-dashed border-line bg-paper-soft px-4 py-3.5 text-sm text-ink-soft transition hover:border-moss hover:text-moss"
          >
            <ImagePlus size={17} />
            Add an image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onImageUpload(block.id, file);
              e.target.value = "";
            }}
          />
        </div>
      );
    }
    const widthPercent = block.imageWidth ?? 100;
    const MIN_WIDTH_PERCENT = 25;

    const startResize = (e: React.PointerEvent, edge: "left" | "right") => {
      e.preventDefault();
      e.stopPropagation();
      const container = imageContainerRef.current;
      // Resize relative to the block column's width, not the (already
      // shrunk) image itself, so percentages stay stable across drags.
      const parent = container?.parentElement;
      if (!parent) return;

      const parentWidth = parent.getBoundingClientRect().width;
      const startX = e.clientX;
      const startWidthPx = (widthPercent / 100) * parentWidth;

      const onPointerMove = (ev: PointerEvent) => {
        const delta =
          edge === "right" ? ev.clientX - startX : startX - ev.clientX;
        const rawWidthPx = startWidthPx + delta * 2; // drag from a side moves both edges, like Notion
        const clampedPx = Math.min(
          parentWidth,
          Math.max((MIN_WIDTH_PERCENT / 100) * parentWidth, rawWidthPx),
        );
        const nextPercent = Math.round((clampedPx / parentWidth) * 100);
        onImageResize(block.id, nextPercent);
      };

      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    };

    return (
      <div
        ref={imageContainerRef}
        className="group/image relative mx-auto"
        style={{ width: `${widthPercent}%` }}
      >
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={block.imageSrc}
            alt=""
            className="max-h-105 w-full rounded-xl object-cover"
            draggable={false}
          />
          <button
            onClick={() => onRemoveImage(block.id)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 backdrop-blur transition group-hover/image:opacity-100"
            aria-label="Remove image"
          >
            <X size={14} />
          </button>

          {/* Notion-style drag handles: thin pill on each edge, only
              visible while hovering the image. */}
          <div
            onPointerDown={(e) => startResize(e, "left")}
            className="absolute left-1.5 top-1/2 h-10 w-1.5 -translate-y-1/2 cursor-ew-resize rounded-full bg-white/0 opacity-0 transition group-hover/image:bg-white/70 group-hover/image:opacity-100"
          />
          <div
            onPointerDown={(e) => startResize(e, "right")}
            className="absolute right-1.5 top-1/2 h-10 w-1.5 -translate-y-1/2 cursor-ew-resize rounded-full bg-white/0 opacity-0 transition group-hover/image:bg-white/70 group-hover/image:opacity-100"
          />
        </div>
      </div>
    );
  }

  const cls = typeClass[block.type] ?? typeClass.paragraph;

  if (block.type === "callout") {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-amber-soft px-4 py-3.5">
        <span className="mt-0.5 select-none">💡</span>
        <Editable
          block={block}
          index={index}
          className={cls}
          registerRef={registerRef}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onFocusBlock={onFocusBlock}
        />
      </div>
    );
  }

  if (block.type === "todo") {
    return (
      <div className="flex items-start gap-2.5">
        <button
          onClick={() => onToggleCheck(block.id)}
          className={`mt-1.25 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition ${
            block.checked
              ? "border-moss bg-moss text-white"
              : "border-line hover:border-moss"
          }`}
          aria-label="Toggle done"
        >
          {block.checked && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path
                d="M2.5 6.5L4.7 8.7L9.5 3.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <Editable
          block={block}
          index={index}
          className={`${cls} ${block.checked ? "text-ink-soft line-through" : ""}`}
          registerRef={registerRef}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onFocusBlock={onFocusBlock}
        />
      </div>
    );
  }

  if (block.type === "bulleted" || block.type === "numbered") {
    return (
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 w-4 shrink-0 select-none text-ink-soft">
          {block.type === "bulleted" ? "•" : `${numberIndex}.`}
        </span>
        <Editable
          block={block}
          index={index}
          className={cls}
          registerRef={registerRef}
          onInput={onInput}
          onKeyDown={onKeyDown}
          onFocusBlock={onFocusBlock}
        />
      </div>
    );
  }

  return (
    <Editable
      block={block}
      index={index}
      className={cls}
      registerRef={registerRef}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onFocusBlock={onFocusBlock}
    />
  );
}
