import { BookOpen } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t border-cream-300/50 py-12 dark:border-ink-700/50">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-wine-700">
              <BookOpen className="h-4 w-4 text-cream-50" strokeWidth={2.5} />
            </div>
            <span className="font-heading text-lg font-semibold tracking-tight text-ink-800 dark:text-cream-50">
              Marginal
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-ink-500 dark:text-cream-300">
            <a
              href="#features"
              className="transition-colors hover:text-wine-600 dark:hover:text-wine-300"
            >
              Features
            </a>
            <a
              href="#templates"
              className="transition-colors hover:text-wine-600 dark:hover:text-wine-300"
            >
              Templates
            </a>
            <a
              href="#start"
              className="transition-colors hover:text-wine-600 dark:hover:text-wine-300"
            >
              Get started
            </a>
            <a
              href="#"
              aria-label="GitHub"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-cream-200 hover:text-wine-600 dark:hover:bg-ink-700 dark:hover:text-wine-300"
            >
              <FaGithub className="h-4 w-4" />
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-cream-300/40 pt-6 text-center dark:border-ink-700/40">
          <p className="text-xs text-ink-400 dark:text-cream-400">
            A quiet place to write. Your pages never leave your browser.
          </p>
        </div>
      </div>
    </footer>
  );
}
