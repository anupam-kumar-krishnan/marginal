import type { Metadata } from "next";
import "./globals.css";
import ThemeInit from "@/components/ThemeInit";

export const metadata: Metadata = {
  title: "Marginal — a quiet place to write",
  description:
    "A fast, local-first note-taking app with slash commands, templates, and no sign-in required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
