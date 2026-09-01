import { motion } from "motion/react";
import {
  FileText,
  Calendar,
  ClipboardList,
  BookOpen,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

interface Template {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

const templates: Template[] = [
  {
    icon: FileText,
    title: "Blank page",
    description: "Start with a clean, empty page.",
    accent: "bg-wine-100 text-wine-700 dark:bg-wine-900/40 dark:text-wine-300",
  },
  {
    icon: Calendar,
    title: "Daily journal",
    description: "A page a day — prompts, mood, and a place to think.",
    accent: "bg-cream-300 text-ink-700 dark:bg-ink-700 dark:text-cream-200",
  },
  {
    icon: ClipboardList,
    title: "Meeting notes",
    description: "Attendees, agenda, decisions, and action items.",
    accent: "bg-wine-100 text-wine-700 dark:bg-wine-900/40 dark:text-wine-300",
  },
  {
    icon: ListChecks,
    title: "Project plan",
    description: "Goals, milestones, and tasks in one structured view.",
    accent: "bg-cream-300 text-ink-700 dark:bg-ink-700 dark:text-cream-200",
  },
  {
    icon: BookOpen,
    title: "Reading list",
    description: "Track what you have read, are reading, and want to read.",
    accent: "bg-wine-100 text-wine-700 dark:bg-wine-900/40 dark:text-wine-300",
  },
];

export function Templates() {
  return (
    <section id="templates" className="relative py-24 md:py-32">
      {/* Subtle divider gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-wine-300/40 to-transparent dark:via-wine-800/40" />

      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-wine-600 dark:text-wine-400">
            Templates
          </span>
          <h2 className="mt-3 font-heading text-4xl font-semibold leading-tight tracking-tight text-ink-900 dark:text-cream-50 md:text-5xl">
            Five templates, one blank page.
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, i) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-cream-300/60 bg-cream-50/50 p-6 transition-all hover:-translate-y-1 hover:border-wine-300/80 hover:shadow-xl hover:shadow-wine-900/5 dark:border-ink-700/60 dark:bg-ink-800/40 dark:hover:border-wine-700/50"
              >
                {/* Top accent bar */}
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-wine-400/0 via-wine-400/0 to-wine-400/0 transition-all duration-500 group-hover:from-wine-400/40 group-hover:via-wine-500 group-hover:to-wine-400/40" />

                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${template.accent} transition-transform group-hover:scale-110`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mb-1.5 font-heading text-xl font-semibold text-ink-900 dark:text-cream-50">
                  {template.title}
                </h3>
                <p className="text-sm leading-relaxed text-ink-500 dark:text-cream-300">
                  {template.description}
                </p>

                {/* Arrow indicator */}
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-wine-600 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-wine-400">
                  Use template
                  <span className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Summary card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-dashed border-wine-300/50 bg-wine-50/30 p-6 dark:border-wine-700/40 dark:bg-wine-950/20"
          >
            <p className="font-heading text-lg italic text-wine-700 dark:text-wine-300">
              More shapes coming soon — built from the same quiet blocks.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
