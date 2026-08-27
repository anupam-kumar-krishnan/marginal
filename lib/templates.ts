import { nanoid } from "nanoid";
import type { Block } from "./types";

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  title: string;
  blocks: () => Block[];
}

const b = (type: Block["type"], content = "", extra: Partial<Block> = {}): Block => ({
  id: nanoid(8),
  type,
  content,
  ...extra,
});

export const templates: Template[] = [
  {
    id: "blank",
    name: "Blank page",
    description: "Start with a clean, empty page.",
    icon: "\u{1F4C4}",
    accent: "#6B675F",
    title: "Untitled",
    blocks: () => [b("paragraph", "")],
  },
  {
    id: "meeting-notes",
    name: "Meeting notes",
    description: "Agenda, attendees, and action items.",
    icon: "\u{1F5C2}\uFE0F",
    accent: "#3F6B52",
    title: "Meeting notes",
    blocks: () => [
      b("heading2", "Attendees"),
      b("bulleted", ""),
      b("heading2", "Agenda"),
      b("numbered", ""),
      b("heading2", "Notes"),
      b("paragraph", ""),
      b("heading2", "Action items"),
      b("todo", ""),
    ],
  },
  {
    id: "daily-journal",
    name: "Daily journal",
    description: "Reflect on the day, gratitude, and goals.",
    icon: "\u{2600}\uFE0F",
    accent: "#D9A441",
    title: "Daily journal",
    blocks: () => [
      b("callout", "How am I feeling today?"),
      b("paragraph", ""),
      b("heading2", "Grateful for"),
      b("bulleted", ""),
      b("heading2", "Today's focus"),
      b("todo", ""),
      b("heading2", "Notes"),
      b("paragraph", ""),
    ],
  },
  {
    id: "project-plan",
    name: "Project plan",
    description: "Scope, milestones, and open questions.",
    icon: "\u{1F9ED}",
    accent: "#4C7A9E",
    title: "Project plan",
    blocks: () => [
      b("heading1", "Overview"),
      b("paragraph", ""),
      b("heading2", "Goals"),
      b("bulleted", ""),
      b("heading2", "Milestones"),
      b("numbered", ""),
      b("heading2", "Open questions"),
      b("todo", ""),
      b("divider", ""),
      b("quote", "Ship the smallest useful version first."),
    ],
  },
  {
    id: "reading-list",
    name: "Reading list",
    description: "Track books and articles to get through.",
    icon: "\u{1F4DA}",
    accent: "#8A5A9E",
    title: "Reading list",
    blocks: () => [
      b("heading2", "Up next"),
      b("todo", ""),
      b("heading2", "In progress"),
      b("todo", ""),
      b("heading2", "Finished"),
      b("todo", ""),
    ],
  },
];

export const getTemplate = (id: string) =>
  templates.find((t) => t.id === id) ?? templates[0];
