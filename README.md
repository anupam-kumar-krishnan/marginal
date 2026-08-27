# Marginal

![Banner](/public/banner.png)

A fast, local-first, Notion-style note-taking app built with Next.js, Tailwind CSS, Motion, and Zustand. No sign-in, no server — every page is saved to your browser's `localStorage`.

## Features

- **Landing page** with an animated live demo and a one-click "Open Marginal" button
- **Slash commands** — type `/` at the start of a line to insert headings, lists, to-dos, quotes, callouts, code blocks, images, and dividers
- **5 built-in templates** — Blank, Meeting Notes, Daily Journal, Project Plan, Reading List
- **Cover images** — upload a header image per page, plus an emoji icon picker
- **Dark / light theme toggle**, remembered across sessions
- **Everything stored in `localStorage`** via a persisted Zustand store — nothing leaves your device

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The landing page lives at `/`, and the notes app lives at `/notes`.

To build for production:

```bash
npm run build
npm run start
```

## Project structure

```
app/
  page.tsx              landing page
  notes/page.tsx         notes app shell (sidebar + editor)
  globals.css            design tokens (ink & moss theme, light/dark)
components/
  landing/EditorShowcase.tsx   animated hero demo
  notes/Sidebar.tsx            page list, create/duplicate/delete
  notes/CoverHeader.tsx        cover image, icon picker, title
  notes/NoteEditor.tsx         block list, keyboard handling
  notes/Block.tsx              renders each block type
  notes/SlashMenu.tsx          the "/" command dropdown
  notes/TemplatePicker.tsx     template picker modal
  notes/ThemeToggle.tsx        dark/light switch
lib/
  types.ts               Page / Block types
  templates.ts            built-in templates
  slashCommands.ts        slash menu command list
store/
  useNotesStore.ts        Zustand store, persisted to localStorage
```

## Notes on the editor

Each block is a `contentEditable` element. Content is read out on every
keystroke and written to the Zustand store (and localStorage); the DOM
itself is only resynced when a block's `id` or `type` changes, so typing
never fights the cursor position.

Keyboard behavior:

- `Enter` creates a new block below (continuing lists/to-dos)
- `Enter` on an empty list item turns it back into plain text
- `Backspace` on an empty block merges into the previous one
- `Backspace` at the start of a non-empty, non-paragraph block turns it back into plain text
- Arrow Up / Down move between blocks
- Typing `/` opens the command menu; arrow keys + Enter to pick, Escape to close

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Motion](https://motion.dev) (`motion/react`) for animation
- [Zustand](https://zustand-demo.pmnd.rs) with the `persist` middleware for localStorage
- [lucide-react](https://lucide.dev) for icons
