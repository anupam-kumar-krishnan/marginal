"use client";

import * as LucideIcons from "lucide-react";

export function PageIcon({
  icon,
  color,
  size = 32,
  className = "",
}: {
  icon?: string;
  color?: string;
  size?: number;
  className?: string;
}) {
  if (icon && icon.startsWith("data:")) {
    return (
      <img
        src={icon}
        alt=""
        style={{ width: size, height: size }}
        className={`${className} rounded-md object-cover`}
      />
    );
  }

  if (icon && icon.startsWith("lucide:")) {
    const name = icon.slice("lucide:".length) as keyof typeof LucideIcons;
    const Cmp = LucideIcons[name] as
      | React.ComponentType<{ size?: number; className?: string }>
      | undefined;
    if (Cmp) {
      return (
        <span
          style={{
            width: size,
            height: size,
            background: color || "#E5E5E5",
          }}
          className="inline-flex shrink-0 items-center justify-center rounded-full"
        >
          <Cmp size={Math.round(size * 0.55)} className="text-ink" />
        </span>
      );
    }
  }

  return <span className={className}>{icon || "📄"}</span>;
}
