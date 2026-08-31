import { nanoid } from "nanoid";
import type { Block, KanbanColumn } from "./types";

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  title: string;
  blocks: () => Block[];
}

const b = (
  type: Block["type"],
  content = "",
  extra: Partial<Block> = {},
): Block => ({
  id: nanoid(8),
  type,
  content,
  ...extra,
});

const kanbanColumn = (
  title: string,
  color: string,
  cards: string[] = [],
): KanbanColumn => ({
  id: nanoid(8),
  title,
  color,
  cards: cards.map((content) => ({ id: nanoid(8), content })),
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
      b("heading3", "Attendees"),
      b("bulleted", ""),
      b("heading3", "Agenda"),
      b("numbered", ""),
      b("heading3", "Notes"),
      b("paragraph", ""),
      b("heading3", "Action items"),
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
      b("heading3", "Grateful for"),
      b("bulleted", ""),
      b("heading3", "Today's focus"),
      b("todo", ""),
      b("heading3", "Notes"),
      b("paragraph", ""),
    ],
  },
  {
    id: "kanban",
    name: "Kanban board",
    description: "Track work across to-do, in progress, and done.",
    icon: "\u{1F4CB}",
    accent: "#8A5A9E",
    title: "Kanban board",
    blocks: () => [
      b("kanban", "", {
        kanban: {
          columns: [
            kanbanColumn("To-do", "#A78BFA", [
              "Review performance metrics",
              "Respond to beta test questions",
            ]),
            kanbanColumn("In progress", "#F0B84E", [
              "Sales demo sync",
              "Launch demo video",
            ]),
            kanbanColumn("In review", "#4C9AE8", [
              "Weekly sales status report",
              "Marketing campaign designs",
            ]),
            kanbanColumn("Complete", "#4CAF7D", [
              "Project onboarding",
              "Finalize launch timeline",
            ]),
          ],
        },
      }),
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
      b("heading3", "Up next"),
      b("todo", ""),
      b("heading3", "In progress"),
      b("todo", ""),
      b("heading3", "Finished"),
      b("todo", ""),
    ],
  },
];

export const getTemplate = (id: string) =>
  templates.find((t) => t.id === id) ?? templates[0];
