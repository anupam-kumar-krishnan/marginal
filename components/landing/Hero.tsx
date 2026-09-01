import { motion } from "motion/react";
import { FaArrowRight } from "react-icons/fa";
import { LuSlash } from "react-icons/lu";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Background ambient gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-wine-200/40 blur-[120px] dark:bg-wine-900/30" />
        <div className="absolute right-0 top-1/3 h-[300px] w-[400px] rounded-full bg-cream-300/50 blur-[100px] dark:bg-wine-800/20" />
      </div>

      <div className="mx-auto max-w-5xl px-6">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-wine-300/40 bg-cream-50/60 px-4 py-1.5 text-xs font-medium tracking-wide text-wine-700 backdrop-blur-sm dark:border-wine-700/40 dark:bg-ink-800/60 dark:text-wine-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-wine-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-wine-600 dark:bg-wine-400" />
            </span>
            Private to your browser — nothing leaves your device
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-ink-900 dark:text-cream-50 md:text-7xl"
        >
          Write it down
          <br />
          before it{" "}
          <span className="text-gradient inline-block pr-1 italic">slips</span>.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="mx-auto mt-7 max-w-xl text-center text-lg leading-relaxed text-ink-500 dark:text-cream-300 md:text-xl"
        >
          Marginal is a quiet, block-based notebook. Type a slash for instant
          commands, start from a template, and keep every page private to your
          own browser.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="/notes"
            className="group inline-flex items-center gap-2 rounded-full bg-wine-700 px-6 py-3 text-sm font-semibold text-cream-50 shadow-lg shadow-wine-900/15 transition-all hover:bg-wine-800 hover:shadow-xl active:scale-95 dark:bg-wine-600 dark:hover:bg-wine-500"
          >
            Start writing
            <FaArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-cream-50/50 px-6 py-3 text-sm font-semibold text-ink-700 backdrop-blur-sm transition-all hover:border-wine-300 hover:text-wine-700 active:scale-95 dark:border-ink-700 dark:bg-ink-800/50 dark:text-cream-200 dark:hover:border-wine-700 dark:hover:text-wine-300"
          >
            See features
          </a>
        </motion.div>

        {/* Notebook mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
          className="relative mx-auto mt-16 max-w-2xl"
        >
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-b from-wine-200/30 to-transparent blur-2xl dark:from-wine-900/20" />
          <div className="glass overflow-hidden rounded-2xl shadow-2xl shadow-wine-900/10">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-cream-300/50 px-4 py-3 dark:border-ink-700/50">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-wine-400/80" />
                <div className="h-3 w-3 rounded-full bg-cream-400/80" />
                <div className="h-3 w-3 rounded-full bg-wine-700/60" />
              </div>
              <div className="ml-2 flex items-center gap-1.5 text-xs text-ink-400 dark:text-cream-400">
                <span className="font-heading italic">Untitled</span>
                <span className="text-ink-300 dark:text-ink-500">
                  — Marginal
                </span>
              </div>
            </div>

            {/* Page content */}
            <div className="space-y-3 p-6 md:p-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                className="text-sm text-ink-600 dark:text-cream-300"
              >
                Kickoff call moved to Tuesday.
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.4 }}
                className="flex items-center gap-1.5"
              >
                <LuSlash className="h-4 w-4 text-wine-500" />
                <span className="inline-block h-5 w-0.5 animate-blink bg-wine-600 dark:bg-wine-400" />
                <span className="ml-1 text-sm text-ink-400 dark:text-cream-400">
                  heading, list, to-do, quote, code…
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
