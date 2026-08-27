"use client";

import { useEffect } from "react";
import { useNotesStore } from "@/store/useNotesStore";

export default function ThemeInit() {
  const theme = useNotesStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}
