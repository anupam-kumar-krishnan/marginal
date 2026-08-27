"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Slash,
  LayoutTemplate,
  ImageIcon,
  MoonStar,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import type { Variants } from "motion/react";
import EditorShowcase from "@/components/landing/EditorShowcase";
import ThemeToggle from "@/components/notes/ThemeToggle";
import { templates } from "@/lib/templates";

const features = [
  {
    icon: Slash,
    title: "Slash commands",
    body: "Press '/' anywhere to drop in headings, lists, to-dos, quotes, code, images and more - no menus to hunt through.",
  },
  {
    icon: LayoutTemplate,
    title: "Ready-made templates",
    body: "Meeting notes, daily journals, project plans and reading lists - start from a shape instead of a blank page.",
  },
  {
    icon: ImageIcon,
    title: "Header images",
    body: "Give every page a face. Drop a cover image at the top and it travels with the note.",
  },
  {
    icon: MoonStar,
    title: "Light & dark",
    body: "Switch instantly. Marginal remembers which one you like.",
  },
  {
    icon: ShieldCheck,
    title: "No sign-in, ever",
    body: "There's no account, no server, no tracking. Every page lives in your browser's storage, on your device only.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

export default function Home() {
  const [activeTemplate, setActiveTemplate] = useState(0);
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink font-display text-sm font-medium text-paper">
            M
          </span>
          <span className="font-display text-lg font-medium">Marginal</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle compact />
          <Link
            href="/notes"
            className="rounded-full bg-[#7BAB8E] px-4 py-2 text-sm font-medium text-white transition hover:opacity-85"
          >
            Open Marginal
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-10 md:grid-cols-2 md:pt-16">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" />
            No sign-in · Saved on your device
          </span>
          <h1 className="mt-6 font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
            <span className="text-[#7BAB8E]">Write it down</span>
            <br />
            before it slips.
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-soft">
            Marginal is a quiet, block-based notebook. Type a slash for instant
            commands, start from a template, and keep every page private to your
            own browser - nothing leaves your device.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/notes"
              className="group flex items-center gap-2 rounded-full bg-moss px-6 py-3.5 text-[15px] font-medium text-white shadow-lg shadow-moss/20 transition hover:shadow-xl hover:shadow-moss/25"
            >
              Open Marginal
              <ArrowRight
                size={17}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
            <span className="text-sm text-ink-soft">
              Free. No account. One click.
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="flex justify-center md:justify-end"
        >
          <EditorShowcase />
        </motion.div>
      </section>

      <section className="border-y border-line bg-surface/60 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={fadeUp}
          >
            <span className="text-xs font-medium uppercase tracking-wide text-moss">
              How it feels
            </span>
            <h2 className="mt-2 max-w-lg font-display text-3xl font-medium leading-tight md:text-4xl">
              Everything a Notion page can do, none of the setup.
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="mt-12 grid gap-4 lg:grid-cols-[1.1fr_2fr]"
          >
            <div
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const rect = el.getBoundingClientRect();
                el.style.setProperty("--x", `${e.clientX - rect.left}px`);
                el.style.setProperty("--y", `${e.clientY - rect.top}px`);
              }}
              className="group relative flex flex-col justify-center overflow-hidden rounded-2xl border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-moss/50"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(320px circle at var(--x) var(--y), rgba(124,154,124,0.16), transparent 70%)",
                }}
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 shadow-[0_0_0_1px_rgba(124,154,124,0.25),0_8px_30px_-8px_rgba(124,154,124,0.35)] transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-moss/10 transition-all duration-300 group-hover:bg-moss/20">
                {(() => {
                  const Icon = features[0].icon;
                  return (
                    <Icon
                      size={22}
                      className="text-moss transition-transform duration-300 group-hover:scale-110"
                    />
                  );
                })()}
              </div>

              <div className="relative mt-5">
                <h3 className="font-display text-xl font-medium leading-snug md:text-2xl">
                  {features[0].title}
                </h3>
                <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-ink-soft">
                  {features[0].body}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.slice(1).map((f, i) => (
                <motion.div
                  key={f.title}
                  custom={i + 1}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  variants={fadeUp}
                  onMouseMove={(e) => {
                    const el = e.currentTarget;
                    const rect = el.getBoundingClientRect();
                    el.style.setProperty("--x", `${e.clientX - rect.left}px`);
                    el.style.setProperty("--y", `${e.clientY - rect.top}px`);
                  }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-moss/40"
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(280px circle at var(--x) var(--y), rgba(124,154,124,0.14), transparent 70%)",
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 shadow-[0_0_0_1px_rgba(124,154,124,0.2),0_8px_24px_-8px_rgba(124,154,124,0.3)] transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-moss/10 transition-all duration-300 group-hover:bg-moss/20">
                    <f.icon
                      size={18}
                      className="text-moss transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <div className="relative mt-4">
                    <h3 className="font-display text-lg font-medium leading-snug">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                      {f.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end"
        >
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-moss">
              Starting points
            </span>
            <h2 className="mt-2 font-display text-3xl font-medium leading-tight md:text-4xl">
              Five templates, one blank page.
            </h2>
          </div>
          <Link
            href="/notes"
            className="group flex items-center gap-1.5 text-sm font-medium text-moss"
          >
            Try them now{" "}
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeUp}
          className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,320px)_1fr]"
        >
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {templates.map((t, i) => {
              const isActive = i === activeTemplate;
              return (
                <button
                  key={t.id}
                  onMouseEnter={() => setActiveTemplate(i)}
                  onFocus={() => setActiveTemplate(i)}
                  onClick={() => setActiveTemplate(i)}
                  className={`group relative flex shrink-0 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 lg:w-full lg:shrink ${
                    isActive
                      ? "border-line bg-surface"
                      : "border-transparent hover:bg-surface/60"
                  }`}
                >
                  <span
                    className="absolute inset-y-2 left-0 w-0.75 rounded-full transition-opacity duration-300"
                    style={{
                      background: t.accent,
                      opacity: isActive ? 1 : 0,
                    }}
                  />
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg transition-transform duration-300"
                    style={{
                      background: `${t.accent}22`,
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                    }}
                  >
                    {t.icon}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={`block whitespace-nowrap text-[14px] font-medium transition-colors duration-300 lg:whitespace-normal ${
                        isActive ? "text-ink" : "text-ink-soft"
                      }`}
                    >
                      {t.name}
                    </span>
                    <span className="hidden text-[12.5px] text-ink-soft/70 lg:block">
                      {t.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative min-h-90 overflow-hidden rounded-2xl border border-line bg-surface">
            <div
              className="pointer-events-none absolute inset-0 opacity-40 transition-colors duration-500"
              style={{
                background: `linear-gradient(160deg, ${templates[activeTemplate].accent}18, transparent 55%)`,
              }}
            />

            <div className="relative flex items-center gap-1.5 border-b border-line px-5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
              <span className="ml-3 text-[12px] text-ink-soft/60">
                {templates[activeTemplate].name
                  .toLowerCase()
                  .replace(/\s+/g, "-")}
                .md
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={templates[activeTemplate].id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative p-8"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                  style={{
                    background: `${templates[activeTemplate].accent}22`,
                  }}
                >
                  {templates[activeTemplate].icon}
                </span>
                <h3 className="mt-5 font-display text-2xl font-medium">
                  {templates[activeTemplate].name}
                </h3>
                <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-ink-soft">
                  {templates[activeTemplate].description}
                </p>

                <div className="mt-8 space-y-3">
                  <div className="h-2.5 w-full max-w-[85%] rounded-full bg-ink-soft/10" />
                  <div className="h-2.5 w-full max-w-[65%] rounded-full bg-ink-soft/10" />
                  <div className="h-2.5 w-full max-w-[75%] rounded-full bg-ink-soft/10" />
                  <div
                    className="mt-4 h-2.5 w-24 rounded-full"
                    style={{
                      background: `${templates[activeTemplate].accent}55`,
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
          className="flex flex-col items-center gap-6 rounded-3xl  px-8 py-16 text-center text-paper bg-[#7BAB8E]"
        >
          <h2 className="max-w-xl font-display text-3xl font-medium leading-tight md:text-4xl">
            Your notebook is one click away.
          </h2>
          <p className="max-w-lg text-[15px] leading-relaxed text-paper/70">
            No forms, no passwords, no waiting on a server. Open it and start
            typing.
          </p>
          <Link
            href="/notes"
            className="group mt-2 flex items-center gap-2 rounded-full bg-paper px-7 py-3.5 text-[15px] font-medium text-ink transition hover:opacity-90"
          >
            Open Marginal
            <ArrowRight
              size={17}
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
        </motion.div>
      </section>

      <footer className="mx-auto flex max-w-6xl items-center justify-between border-t border-line px-6 py-8 text-xs text-ink-soft">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-ink font-display text-sm font-medium text-paper">
            M
          </span>
          <span>Marginal - A quiet place to write.</span>
        </div>
        <span className="flex items-center gap-1.5">
          Built with ♥ by{" "}
          <a href="https://anupam-k-krishnan.vercel.app/">
            <span className="text-[#7BAB8E]">Anupam Kumar Krishnan</span>
          </a>
        </span>
      </footer>
    </div>
  );
}
