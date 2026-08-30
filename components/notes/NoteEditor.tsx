"use client";

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { nanoid } from "nanoid";
import { useNotesStore } from "@/store/useNotesStore";
import type { Block as BlockT, BlockType, Page } from "@/lib/types";
import Block from "./Block";
import SlashMenu, { getFilteredCommands } from "./SlashMenu";

interface SlashState {
  blockId: string;
  query: string;
  selectedIndex: number;
}

export interface NoteEditorHandle {
  /** Focus the first block, creating an empty paragraph if there are none. */
  focusFirst: () => void;
}

const NoteEditor = forwardRef<NoteEditorHandle, { page: Page }>(
  function NoteEditor({ page }, ref) {
    const setBlocks = useNotesStore((s) => s.setBlocks);
    const [slash, setSlash] = useState<SlashState | null>(null);
    const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const blocks = page.blocks;

    const registerRef = useCallback((id: string, el: HTMLDivElement | null) => {
      if (el) blockRefs.current.set(id, el);
      else blockRefs.current.delete(id);
    }, []);

    const focusBlock = useCallback((id: string, placement: "start" | "end") => {
      setTimeout(() => {
        const el = blockRefs.current.get(id);
        if (!el) return;
        el.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(placement === "start");
        sel?.removeAllRanges();
        sel?.addRange(range);
      }, 0);
    }, []);

    const commit = useCallback(
      (next: BlockT[]) => setBlocks(page.id, next),
      [page.id, setBlocks],
    );

    useImperativeHandle(
      ref,
      () => ({
        focusFirst: () => {
          const first = blocks[0];
          if (first) {
            focusBlock(first.id, "start");
            return;
          }
          // No blocks yet — create one so there's somewhere for the
          // cursor to land.
          const newBlock: BlockT = {
            id: nanoid(8),
            type: "paragraph",
            content: "",
          };
          commit([newBlock]);
          focusBlock(newBlock.id, "start");
        },
      }),
      [blocks, commit, focusBlock],
    );

    const handleInput = (id: string, text: string) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const next = blocks.slice();
      next[idx] = { ...next[idx], content: text };
      commit(next);

      if (text.startsWith("/")) {
        setSlash((prev) =>
          prev && prev.blockId === id
            ? { ...prev, query: text.slice(1), selectedIndex: 0 }
            : { blockId: id, query: text.slice(1), selectedIndex: 0 },
        );
      } else {
        setSlash((prev) => (prev && prev.blockId === id ? null : prev));
      }
    };

    const selectCommand = useCallback(
      (id: string, type: BlockType) => {
        const idx = blocks.findIndex((b) => b.id === id);
        if (idx === -1) return;
        const next = blocks.slice();
        next[idx] = {
          ...next[idx],
          type,
          content: "",
          checked: type === "todo" ? false : undefined,
          imageSrc: type === "image" ? undefined : next[idx].imageSrc,
        };
        commit(next);
        setSlash(null);
        // The block's contentEditable div stays focused throughout the
        // whole "/heading1" -> select flow, so Editable's state->DOM
        // sync effect (which only runs while NOT focused, to avoid
        // clobbering the caret mid-typing) never fires here. Without
        // this, the literal "/query" text is left behind in the DOM
        // even though block.content is now "".
        const el = blockRefs.current.get(id);
        if (el) el.innerText = "";
        focusBlock(id, "start");
      },
      [blocks, commit, focusBlock],
    );

    const handleEnter = (id: string) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const block = blocks[idx];
      const isListType =
        block.type === "bulleted" ||
        block.type === "numbered" ||
        block.type === "todo";

      if (isListType && block.content.trim() === "") {
        const next = blocks.slice();
        next[idx] = { ...next[idx], type: "paragraph", checked: undefined };
        commit(next);
        focusBlock(id, "start");
        return;
      }

      const newBlock: BlockT = {
        id: nanoid(8),
        type: isListType ? block.type : "paragraph",
        content: "",
        checked: isListType && block.type === "todo" ? false : undefined,
      };
      const next = blocks.slice();
      next.splice(idx + 1, 0, newBlock);
      commit(next);
      focusBlock(newBlock.id, "start");
    };

    const handleBackspace = (id: string, e: React.KeyboardEvent) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const block = blocks[idx];
      const sel = window.getSelection();
      const atStart = !sel || sel.anchorOffset === 0;

      if (block.content === "" && idx > 0) {
        e.preventDefault();
        const prev = blocks[idx - 1];
        const next = blocks.filter((b) => b.id !== id);
        commit(next);
        focusBlock(prev.id, "end");
        return;
      }

      if (
        atStart &&
        block.content !== "" &&
        block.type !== "paragraph" &&
        block.type !== "image"
      ) {
        e.preventDefault();
        const next = blocks.slice();
        next[idx] = { ...next[idx], type: "paragraph", checked: undefined };
        commit(next);
        focusBlock(id, "start");
      }
    };

    const handleKeyDown = (
      id: string,
      e: React.KeyboardEvent<HTMLDivElement>,
    ) => {
      if (slash && slash.blockId === id) {
        const filtered = getFilteredCommands(slash.query);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSlash((s) =>
            s
              ? {
                  ...s,
                  selectedIndex:
                    (s.selectedIndex + 1) % Math.max(filtered.length, 1),
                }
              : s,
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSlash((s) =>
            s
              ? {
                  ...s,
                  selectedIndex:
                    (s.selectedIndex - 1 + Math.max(filtered.length, 1)) %
                    Math.max(filtered.length, 1),
                }
              : s,
          );
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          const cmd = filtered[slash.selectedIndex];
          if (cmd) selectCommand(id, cmd.type);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setSlash(null);
          return;
        }
        if (
          e.key === "Backspace" &&
          (e.currentTarget.innerText === "/" ||
            e.currentTarget.innerText === "")
        ) {
          setSlash(null);
        }
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleEnter(id);
        return;
      }

      if (e.key === "Backspace") {
        handleBackspace(id, e);
        return;
      }

      if (e.key === "ArrowUp") {
        const idx = blocks.findIndex((b) => b.id === id);
        const sel = window.getSelection();
        if (idx > 0 && (!sel || sel.anchorOffset === 0)) {
          e.preventDefault();
          focusBlock(blocks[idx - 1].id, "end");
        }
      }
      if (e.key === "ArrowDown") {
        const idx = blocks.findIndex((b) => b.id === id);
        const el = blockRefs.current.get(id);
        const sel = window.getSelection();
        const atEnd = !sel || sel.anchorOffset === (el?.innerText.length ?? 0);
        if (idx < blocks.length - 1 && atEnd) {
          e.preventDefault();
          focusBlock(blocks[idx + 1].id, "start");
        }
      }
    };

    const handleToggleCheck = (id: string) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const next = blocks.slice();
      next[idx] = { ...next[idx], checked: !next[idx].checked };
      commit(next);
    };

    const handleImageUpload = (id: string, file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const idx = blocks.findIndex((b) => b.id === id);
        if (idx === -1) return;
        const next = blocks.slice();
        next[idx] = { ...next[idx], imageSrc: reader.result as string };
        commit(next);
      };
      reader.readAsDataURL(file);
    };

    const handleRemoveImage = (id: string) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const next = blocks.slice();
      next[idx] = { ...next[idx], imageSrc: undefined };
      commit(next);
    };

    const handleKanbanChange = (id: string, kanban: BlockT["kanban"]) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const next = blocks.slice();
      next[idx] = { ...next[idx], kanban };
      commit(next);
    };

    const appendTrailingBlock = () => {
      const last = blocks[blocks.length - 1];
      if (last && last.type === "paragraph" && last.content === "") {
        focusBlock(last.id, "end");
        return;
      }
      const newBlock: BlockT = {
        id: nanoid(8),
        type: "paragraph",
        content: "",
      };
      commit([...blocks, newBlock]);
      focusBlock(newBlock.id, "start");
    };

    const numberMap = useMemo(() => {
      const map: Record<string, number> = {};
      let counter = 0;
      for (const b of blocks) {
        if (b.type === "numbered") {
          counter += 1;
          map[b.id] = counter;
        } else {
          counter = 0;
        }
      }
      return map;
    }, [blocks]);

    return (
      <div className="relative">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`group relative py-0.75 ${
              // NOTE: horizontal padding (px-6 md:px-10) is applied once,
              // by the wrapping <div> in page.tsx around <NoteEditor>.
              // Don't repeat it here — doing so double-pads blocks and
              // pushes them out of alignment with CoverHeader's title,
              // which gets its px-6 md:px-10 exactly once.
              //
              // Width is controlled via inline style below (not a
              // Tailwind class) because max-w-3xl/max-w-full swapped
              // via a ternary wasn't reliably applying in this project's
              // build — see debugging history. Kanban blocks always
              // span full width regardless of the page setting.
              block.type === "kanban" ? "w-full" : ""
            }`}
            style={
              block.type === "kanban"
                ? undefined
                : {
                    maxWidth: page.fullWidth ? "100%" : "48rem",
                    marginLeft: page.fullWidth ? undefined : "auto",
                    marginRight: page.fullWidth ? undefined : "auto",
                  }
            }
          >
            <Block
              block={block}
              index={index}
              numberIndex={numberMap[block.id]}
              registerRef={registerRef}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onToggleCheck={handleToggleCheck}
              onImageUpload={handleImageUpload}
              onRemoveImage={handleRemoveImage}
              onFocusBlock={() => {}}
              onKanbanChange={handleKanbanChange}
            />
            {slash && slash.blockId === block.id && (
              <SlashMenu
                query={slash.query}
                selectedIndex={slash.selectedIndex}
                onSelect={(type) => selectCommand(block.id, type)}
                onHover={(i) =>
                  setSlash((s) => (s ? { ...s, selectedIndex: i } : s))
                }
              />
            )}
          </div>
        ))}
        <div className="h-24 cursor-text" onClick={appendTrailingBlock} />
      </div>
    );
  },
);

export default NoteEditor;
