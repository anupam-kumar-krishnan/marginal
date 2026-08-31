"use client";

import { useEffect, useState } from "react";

type FontId = "default" | "serif" | "mono";

const FONTS: { id: FontId; label: string; stack: string; size: string }[] = [
  {
    id: "default",
    label: "Default",
    stack:
      'ui-sans-serif, system-ui, -apple-system, "Inter", Roboto, sans-serif',
    size: "1rem",
  },
  {
    id: "mono",
    label: "Mono",
    stack:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    size: "1.2rem",
  },
];

const STORAGE_KEY = "marginal-font";

export default function FontToggle() {
  const [active, setActive] = useState<FontId>("default");

  useEffect(() => {
    const saved =
      (localStorage.getItem(STORAGE_KEY) as FontId | null) ?? "default";
    setActive(saved);
    applyFont(saved);
  }, []);

  const applyFont = (id: FontId) => {
    const font = FONTS.find((f) => f.id === id) ?? FONTS[0];
    document.body.style.fontFamily = font.stack;
    document.body.style.fontSize = font.size;
  };

  const handlePick = (id: FontId) => {
    setActive(id);
    applyFont(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-line bg-paper p-0.5">
      {FONTS.map((font) => (
        <button
          key={font.id}
          onClick={() => handlePick(font.id)}
          title={font.label}
          aria-label={`Use ${font.label} font`}
          className={`flex h-6 w-7 items-center justify-center rounded-md text-[12px] font-medium transition ${
            active === font.id
              ? "bg-surface text-ink shadow-sm"
              : "text-ink-soft hover:text-ink"
          }`}
          style={{ fontFamily: font.stack }}
        >
          Ag
        </button>
      ))}
    </div>
  );
}
