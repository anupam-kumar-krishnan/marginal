"use client";

import { useEffect, useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import type { Block as BlockT } from "@/lib/types";

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
      ref.current.innerText = block.content;
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
      data-placeholder={placeholderFor(block.type, index)}
      className={`${className} w-full outline-none`}
      onInput={(e) => onInput(block.id, e.currentTarget.innerText)}
      onKeyDown={(e) => onKeyDown(block.id, e)}
      onFocus={() => onFocusBlock(block.id)}
    />
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
}: BlockProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (block.type === "divider") {
    return <hr className="my-4 border-line" />;
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
