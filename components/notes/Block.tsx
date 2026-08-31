"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
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
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  onInput: (id: string, text: string) => void;
  onKeyDown: (id: string, e: React.KeyboardEvent<HTMLDivElement>) => void;
  onToggleCheck: (id: string) => void;
  onImageUpload: (id: string, file: File) => void;
  onRemoveImage: (id: string) => void;
  onFocusBlock: (id: string) => void;
  onKanbanChange: (id: string, data: KanbanData) => void;
  onToggleChange: (
    id: string,
    patch: { toggleCollapsed?: boolean; toggleChildren?: ToggleChild[] },
  ) => void;
  onTableChange: (id: string, table: TableData) => void;
  onOpenPage: (id: string, pageId?: string) => void;
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
  onFocusBlock,
  onKanbanChange,
  onToggleChange,
  onTableChange,
  onOpenPage,
}: BlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    return (
      <div className="group relative overflow-hidden rounded-xl">
        <img
          src={block.imageSrc}
          alt=""
          className="max-h-105 w-full rounded-xl object-cover"
        />
        <button
          onClick={() => onRemoveImage(block.id)}
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 backdrop-blur transition group-hover:opacity-100"
          aria-label="Remove image"
        >
          <X size={14} />
        </button>
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
