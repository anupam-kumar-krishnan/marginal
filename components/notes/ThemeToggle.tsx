"use client";

import { Moon, Sun } from "lucide-react";
import { motion } from "motion/react";
import { useNotesStore } from "@/store/useNotesStore";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const theme = useNotesStore((s) => s.theme);
  const toggleTheme = useNotesStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`relative flex items-center rounded-full border border-line bg-paper-soft transition ${
        compact ? "h-8 w-8 justify-center" : "h-8 w-14 px-1"
      }`}
    >
      {compact ? (
        isDark ? <Moon size={14} /> : <Sun size={14} />
      ) : (
        <motion.div
          animate={{ x: isDark ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-surface shadow"
        >
          {isDark ? <Moon size={13} /> : <Sun size={13} />}
        </motion.div>
      )}
    </button>
  );
}
