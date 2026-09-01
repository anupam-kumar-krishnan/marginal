import { motion } from "motion/react";
import { Moon, Sun, BookOpen } from "lucide-react";

interface NavbarProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ isDark, onToggleTheme }: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="glass mx-auto mt-4 flex max-w-5xl items-center justify-between rounded-full px-5 py-2.5 shadow-lg shadow-wine-900/5">
        <a href="#" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wine-700">
            <BookOpen className="h-4 w-4 text-cream-50" strokeWidth={2.5} />
          </div>
          <span className="font-heading text-lg font-semibold tracking-tight text-ink-800 dark:text-cream-50">
            Marginal
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-ink-500 transition-colors hover:text-wine-600 dark:text-cream-300 dark:hover:text-wine-300"
          >
            Features
          </a>
          <a
            href="#templates"
            className="text-sm font-medium text-ink-500 transition-colors hover:text-wine-600 dark:text-cream-300 dark:hover:text-wine-300"
          >
            Templates
          </a>
          <a
            href="/notes"
            className="text-sm font-medium text-ink-500 transition-colors hover:text-wine-600 dark:text-cream-300 dark:hover:text-wine-300"
          >
            Get started
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-200 hover:text-wine-600 dark:text-cream-300 dark:hover:bg-ink-700 dark:hover:text-wine-300"
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5" />
            ) : (
              <Moon className="h-4.5 w-4.5" />
            )}
          </button>
          <a
            href="/notes"
            className="rounded-full bg-wine-700 px-4 py-2 text-sm font-medium text-cream-50 shadow-sm transition-all hover:bg-wine-800 hover:shadow-md active:scale-95 dark:bg-wine-600 dark:hover:bg-wine-500"
          >
            Open notebook
          </a>
        </div>
      </div>
    </motion.header>
  );
}
