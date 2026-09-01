import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section id="start" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-wine-700 via-wine-800 to-wine-950 px-8 py-16 text-center md:px-16 md:py-20"
        >
          {/* Ambient glow */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-cream-100/10 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-48 w-64 rounded-full bg-wine-500/20 blur-3xl" />
          </div>

          {/* Decorative quote marks */}
          <div className="pointer-events-none absolute left-8 top-6 font-heading text-7xl text-cream-50/10 md:left-12 md:text-8xl">
            "
          </div>
          <div className="pointer-events-none absolute bottom-0 right-8 font-heading text-7xl text-cream-50/10 md:right-12 md:text-8xl">
            "
          </div>

          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-heading text-4xl font-semibold leading-tight tracking-tight text-cream-50 md:text-5xl">
              Your notebook is one click away.
            </h2>
            <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-cream-200/80">
              No forms, no passwords, no waiting on a server. Open it and start
              typing.
            </p>

            <a
              href="/notes"
              className="group mt-9 inline-flex items-center gap-2 rounded-full bg-cream-50 px-7 py-3.5 text-sm font-semibold text-wine-800 shadow-xl shadow-wine-950/30 transition-all hover:bg-cream-100 hover:shadow-2xl active:scale-95"
            >
              Open the notebook
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>

            <p className="mt-5 text-xs font-medium tracking-wide text-cream-300/60">
              Works in your browser. Nothing to install.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
