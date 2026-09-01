"use client";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Templates } from "@/components/landing/Templates";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { useDarkMode } from "@/app/hooks/useDarkMode";

function App() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-cream-100 text-ink-800 dark:bg-ink-900 dark:text-cream-100">
      <div className="font-heading">
        <Navbar isDark={isDark} onToggleTheme={toggle} />
        <main>
          <Hero />
          <Features />
          <Templates />
          <CTA />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
