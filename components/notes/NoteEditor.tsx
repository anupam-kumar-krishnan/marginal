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
import SelectionToolbar from "./SelectionToolbar";
import SlashMenu, { getFilteredCommands } from "./SlashMenu";

interface SlashState {
  blockId: string;
  query: string;
  selectedIndex: number;
}

function isEmptyHtml(html: string) {
  return (
    !html ||
    html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim() === ""
  );
}

export interface NoteEditorHandle {
  focusFirst: () => void;
}

const NoteEditor = forwardRef<NoteEditorHandle, { page: Page }>(
  function NoteEditor({ page }, ref) {
    const setBlocks = useNotesStore((s) => s.setBlocks);
    const createPage = useNotesStore((s) => s.createPage);
    const setActivePage = useNotesStore((s) => s.setActivePage);
    const [slash, setSlash] = useState<SlashState | null>(null);
    const blockRefs = useRef<Map<string, HTMLDivElement | HTMLTextAreaElement>>(
      new Map(),
    );
    const blocks = page.blocks;

    const registerRef = useCallback(
      (id: string, el: HTMLDivElement | HTMLTextAreaElement | null) => {
        if (el) blockRefs.current.set(id, el);
        else blockRefs.current.delete(id);
      },
      [],
    );

    const focusBlock = useCallback((id: string, placement: "start" | "end") => {
      setTimeout(() => {
        const el = blockRefs.current.get(id);
        if (!el) return;
        el.focus();

        if (el instanceof HTMLTextAreaElement) {
          const pos = placement === "start" ? 0 : el.value.length;
          el.setSelectionRange(pos, pos);
          return;
        }

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

        let extra: Partial<BlockT> = {};

        if (type === "todo") {
          extra.checked = false;
        }

        if (type === "toggle") {
          extra.toggleCollapsed = false;
          extra.toggleChildren = [{ id: nanoid(6), content: "" }];
        }

        if (type === "table") {
          extra.table = {
            rows: [
              ["", "", ""],
              ["", "", ""],
              ["", "", ""],
            ],
          };
        }

        if (type === "code") {
          extra.codeLanguage = "auto";
        }

        let pageContent = "";
        if (type === "page") {
          const before = new Set(
            useNotesStore.getState().pages.map((p) => p.id),
          );
          createPage("blank");
          const created = useNotesStore
            .getState()
            .pages.find((p) => !before.has(p.id));
          extra.pageId = created?.id;
          pageContent = created?.title ?? "Untitled";
        }

        next[idx] = {
          ...next[idx],
          type,
          content: type === "page" ? pageContent : "",
          checked: type === "todo" ? false : undefined,
          imageSrc: type === "image" ? undefined : next[idx].imageSrc,
          ...extra,
        };
        commit(next);
        setSlash(null);

        const el = blockRefs.current.get(id);
        if (el instanceof HTMLTextAreaElement) {
          el.value = type === "page" ? pageContent : "";
        } else if (el) {
          el.innerText = type === "page" ? pageContent : "";
        }
        if (type !== "page") {
          focusBlock(id, "start");
        }
      },
      [blocks, commit, focusBlock, createPage],
    );

    const handleEnter = (id: string) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const block = blocks[idx];
      const isListType =
        block.type === "bulleted" ||
        block.type === "numbered" ||
        block.type === "todo";

      if (isListType && isEmptyHtml(block.content)) {
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

    const handleBackspace = (
      id: string,
      e: React.KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>,
    ) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const block = blocks[idx];

      let atStart: boolean;
      if (e.currentTarget instanceof HTMLTextAreaElement) {
        atStart =
          e.currentTarget.selectionStart === 0 &&
          e.currentTarget.selectionEnd === 0;
      } else {
        const sel = window.getSelection();
        atStart = !sel || sel.anchorOffset === 0;
      }

      if (isEmptyHtml(block.content) && idx > 0) {
        e.preventDefault();
        const prev = blocks[idx - 1];
        const next = blocks.filter((b) => b.id !== id);
        commit(next);
        focusBlock(prev.id, "end");
        return;
      }

      if (
        atStart &&
        !isEmptyHtml(block.content) &&
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
      e: React.KeyboardEvent<HTMLDivElement | HTMLTextAreaElement>,
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
          (e.currentTarget as HTMLElement).innerText !== undefined &&
          ((e.currentTarget as HTMLDivElement).innerText === "/" ||
            (e.currentTarget as HTMLDivElement).innerText === "")
        ) {
          setSlash(null);
        }
      }

      const currentBlock = blocks.find((b) => b.id === id);

      if (currentBlock?.type === "code") {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          handleEnter(id);
          return;
        }
        if (e.key === "Enter") {
          return;
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
        let atStart: boolean;
        if (e.currentTarget instanceof HTMLTextAreaElement) {
          atStart =
            e.currentTarget.selectionStart === 0 &&
            e.currentTarget.selectionEnd === 0;
        } else {
          const sel = window.getSelection();
          atStart = !sel || sel.anchorOffset === 0;
        }
        if (idx > 0 && atStart) {
          e.preventDefault();
          focusBlock(blocks[idx - 1].id, "end");
        }
      }
      if (e.key === "ArrowDown") {
        const idx = blocks.findIndex((b) => b.id === id);
        let atEnd: boolean;
        if (e.currentTarget instanceof HTMLTextAreaElement) {
          const len = e.currentTarget.value.length;
          atEnd =
            e.currentTarget.selectionStart === len &&
            e.currentTarget.selectionEnd === len;
        } else {
          const el = blockRefs.current.get(id);
          const sel = window.getSelection();
          const textLen =
            el && "innerText" in el
              ? (el as HTMLDivElement).innerText.length
              : 0;
          atEnd = !sel || sel.anchorOffset === textLen;
        }
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

    const handleToggleChange = (
      id: string,
      patch: Pick<Partial<BlockT>, "toggleCollapsed" | "toggleChildren">,
    ) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const next = blocks.slice();
      next[idx] = { ...next[idx], ...patch };
      commit(next);
    };

    const handleTableChange = (id: string, table: BlockT["table"]) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const next = blocks.slice();
      next[idx] = { ...next[idx], table };
      commit(next);
    };

    const handleCodeLanguageChange = (id: string, codeLanguage: string) => {
      const idx = blocks.findIndex((b) => b.id === id);
      if (idx === -1) return;
      const next = blocks.slice();
      next[idx] = { ...next[idx], codeLanguage };
      commit(next);
    };

    const handleOpenPage = (_id: string, pageId?: string) => {
      if (pageId) setActivePage(pageId);
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
        <SelectionToolbar />
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={`group relative py-0.75 ${
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
              onToggleChange={handleToggleChange}
              onTableChange={handleTableChange}
              onOpenPage={handleOpenPage}
              onCodeLanguageChange={handleCodeLanguageChange}
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
