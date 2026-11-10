# LEVEL UP! A Prompting Adventure | The Journey of Jakov

An interactive pixel-RPG portfolio for **PDC10: Conversational AI and Prompt Engineering**
by Jakov Benedict B. Santos (BSIT-3-A, Angeles University Foundation).

Built with Vite, React, TypeScript, Tailwind CSS, and Framer Motion.

## Editing content

All text lives in **`src/data/portfolio.ts`**: profile, certifications, the seven quests,
prompt comparisons, reflections, framework prompts, dungeon levels, vault locks,
the Skill rulebook, and the final summary. Edit that file only; no component changes needed.

Search the file for `[ADD:` to find placeholders that still need your input.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com, choose **Add New > Project** and import the repository.
3. Vercel detects Vite automatically (build command `npm run build`, output folder `dist`). Click **Deploy**.

The site uses hash-based routes (`#/quest/3`), so no rewrite rules are needed.

Or with the CLI: `npx vercel` from this folder.

## Features

- Title screen, Character Sheet, World Map with a walking avatar, seven Quest Logs, and a Level Up Summary
- Avatar sprites in `public/sprites` (cleaned and feet-aligned from the original art): idle, happy, curious, thinking, explorer, walking (side and back), and victory poses
- Procedural pixel-art scenery drawn on low-res canvases (sky, mountains, forest, meadow, cave, painted world map)
- Prompt Battle: before vs. after view with technique highlighting
- Quest-specific interactives: framework selector, dungeon map, six padlocks, ORGANIZE INBOX demo, and a collapsible Rulebook
- Scroll-based XP bar, "Quest Complete!" and "Achievement Unlocked!" popups
- Optional 8-bit sounds (off by default), keyboard navigation, visible focus, and `prefers-reduced-motion` support
- Progress is saved in the browser (localStorage) and works fine without it
