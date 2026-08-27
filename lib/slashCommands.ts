import type { BlockType } from "./types";

export interface SlashCommand {
  type: BlockType;
  label: string;
  description: string;
  keywords: string[];
  icon: string;
}

export const slashCommands: SlashCommand[] = [
  {
    type: "paragraph",
    label: "Text",
    description: "Just start writing with plain text.",
    keywords: ["text", "paragraph", "p"],
    icon: "\u{1F5CE}\uFE0F",
  },
  {
    type: "heading1",
    label: "Heading 1",
    description: "Big section heading.",
    keywords: ["h1", "heading", "title", "big"],
    icon: "H1",
  },
  {
    type: "heading2",
    label: "Heading 2",
    description: "Medium section heading.",
    keywords: ["h2", "heading", "subtitle"],
    icon: "H2",
  },
  {
    type: "heading3",
    label: "Heading 3",
    description: "Small section heading.",
    keywords: ["h3", "heading"],
    icon: "H3",
  },
  {
    type: "bulleted",
    label: "Bulleted list",
    description: "A simple unordered list.",
    keywords: ["bullet", "list", "ul"],
    icon: "\u{2022}",
  },
  {
    type: "numbered",
    label: "Numbered list",
    description: "A list with numbering.",
    keywords: ["numbered", "list", "ol", "1"],
    icon: "1.",
  },
  {
    type: "todo",
    label: "To-do list",
    description: "Track tasks with checkboxes.",
    keywords: ["todo", "task", "checkbox", "check"],
    icon: "\u2611",
  },
  {
    type: "quote",
    label: "Quote",
    description: "Capture a quote or callback.",
    keywords: ["quote", "blockquote"],
    icon: "\u275D",
  },
  {
    type: "callout",
    label: "Callout",
    description: "Make text stand out.",
    keywords: ["callout", "highlight", "note", "banner"],
    icon: "\u{1F4A1}",
  },
  {
    type: "code",
    label: "Code",
    description: "Monospaced code block.",
    keywords: ["code", "snippet", "pre"],
    icon: "\u2328",
  },
  {
    type: "image",
    label: "Image",
    description: "Upload an image into the page.",
    keywords: ["image", "picture", "photo", "upload"],
    icon: "\u{1F5BC}\uFE0F",
  },
  {
    type: "divider",
    label: "Divider",
    description: "A visual break between content.",
    keywords: ["divider", "line", "separator", "hr"],
    icon: "\u2015",
  },
];
