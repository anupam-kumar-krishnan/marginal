"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const menuItems = [
  { icon: "H1", label: "Heading 1" },
  { icon: "\u2022", label: "Bulleted list" },
  { icon: "\u2611", label: "To-do list" },
  { icon: "\u{1F5BC}\uFE0F", label: "Image" },
];

type Frame =
  | { kind: "type-slash" }
  | { kind: "menu"; highlight: number }
  | { kind: "todo" }
  | { kind: "menu2"; highlight: number }
  | { kind: "image" };

const frames: Frame[] = [
  { kind: "type-slash" },
  { kind: "menu", highlight: 2 },
  { kind: "todo" },
  { kind: "menu2", highlight: 3 },
  { kind: "image" },
];

export default function EditorShowcase() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % frames.length), 2000);
    return () => clearInterval(t);
  }, []);

  const frame = frames[i];

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl shadow-black/5">
      <div className="mb-4 flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
      </div>

      <div className="mb-1 flex items-center gap-2 text-2xl">
        <span>🗓️</span>
      </div>
      <div className="mb-4 font-display text-2xl font-medium">
        Weekly planning
      </div>

      <div className="space-y-2.5 text-[14px]">
        <p className="text-ink-soft">Kickoff call moved to Tuesday.</p>

        <div className="relative">
          <AnimatePresence mode="wait">
            {frame.kind === "type-slash" && (
              <motion.p
                key="type-slash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-mono text-ink"
              >
                /<span className="editor-caret-blink">|</span>
              </motion.p>
            )}

            {(frame.kind === "menu" || frame.kind === "menu2") && (
              <motion.div
                key={frame.kind}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
                className="w-56 overflow-hidden rounded-lg border border-line bg-paper shadow-lg"
              >
                {menuItems.map((item, idx) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] ${
                      idx === frame.highlight ? "bg-moss-soft" : ""
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded border border-line bg-surface font-mono text-[10px] text-ink-soft">
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                ))}
              </motion.div>
            )}

            {frame.kind === "todo" && (
              <motion.div
                key="todo"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <span className="flex h-4 w-4 items-center justify-center rounded border border-moss bg-moss">
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.5L4.7 8.7L9.5 3.5"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="text-ink-soft line-through">
                  Confirm launch checklist
                </span>
              </motion.div>
            )}

            {frame.kind === "image" && (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-16 items-center justify-center rounded-lg bg-linear-to-br from-green-200 to-green-300 text-xs text-black"
              >
                launch-timeline.png
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
