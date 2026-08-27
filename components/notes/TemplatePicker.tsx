"use client";

import { motion, AnimatePresence } from "motion/react";
import { templates } from "@/lib/templates";

export default function TemplatePicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (templateId: string) => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          >
            <div className="border-b border-line px-6 py-5">
              <h2 className="font-display text-xl font-medium">
                Start a new page
              </h2>
              <p className="mt-0.5 text-sm text-ink-soft">
                Pick a template, or start from scratch.
              </p>
            </div>
            <div className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto p-3 sm:grid-cols-2">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onPick(t.id)}
                  className="flex items-start gap-3 rounded-xl border border-line p-3.5 text-left transition hover:border-moss hover:bg-paper-soft"
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                    style={{ background: `${t.accent}22` }}
                  >
                    {t.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-medium">{t.name}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-ink-soft">
                      {t.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
