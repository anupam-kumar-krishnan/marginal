import { motion } from "motion/react";
import {
  Slash,
  LayoutTemplate,
  Image,
  Moon,
  ShieldOff,
  type LucideIcon,
} from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Slash,
    title: "Slash commands",
    description:
      "Press '/' anywhere to drop in headings, lists, to-dos, quotes, code, images and more — no menus to hunt through.",
  },
  {
    icon: LayoutTemplate,
    title: "Ready-made templates",
    description:
      "Meeting notes, daily journals, project plans and reading lists — start from a shape instead of a blank page.",
  },
  {
    icon: Image,
    title: "Header images",
    description:
      "Give every page a face. Drop a cover image at the top and it travels with the note.",
  },
  {
    icon: Moon,
    title: "Light & dark",
    description: "Switch instantly. Marginal remembers which one you like.",
  },
  {
    icon: ShieldOff,
    title: "No sign-in, ever",
    description:
      "There's no account, no server, no tracking. Every page lives in your browser's storage, on your device only.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-2xl"
        >
          <span className="text-sm font-semibold uppercase tracking-widest text-wine-600 dark:text-wine-400">
            Features
          </span>
          <h2 className="mt-3 font-heading text-4xl font-semibold leading-tight tracking-tight text-ink-900 dark:text-cream-50 md:text-5xl">
            Everything a Notion page
            <br />
            can do, none of the setup.
          </h2>
        </motion.div>

        {/* Feature grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const isWide = i === 0; // First card spans wider on large screens
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group relative overflow-hidden rounded-2xl border border-cream-300/60 bg-cream-50/50 p-6 transition-all hover:border-wine-300/80 hover:shadow-lg hover:shadow-wine-900/5 dark:border-ink-700/60 dark:bg-ink-800/40 dark:hover:border-wine-700/50 ${
                  isWide ? "lg:col-span-2" : ""
                }`}
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-wine-200/0 blur-2xl transition-all duration-500 group-hover:bg-wine-200/40 dark:group-hover:bg-wine-800/30" />

                <div className="relative">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-wine-100 text-wine-700 transition-colors group-hover:bg-wine-200 dark:bg-wine-900/40 dark:text-wine-300 dark:group-hover:bg-wine-800/60">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mb-2 font-heading text-xl font-semibold text-ink-900 dark:text-cream-50">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink-500 dark:text-cream-300">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Filler card — visual balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-wine-700 to-wine-900 p-6 text-center"
          >
            <div className="pointer-events-none absolute inset-0 opacity-20">
              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream-100/20 blur-3xl" />
            </div>
            <div className="relative">
              <p className="font-heading text-2xl font-medium italic text-cream-50">
                "Quiet by design."
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
