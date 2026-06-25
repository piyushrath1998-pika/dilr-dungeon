# DILR Dungeon — CAT LRDI Prep RPG

A gamified CAT LRDI prep tool. The player explores a first-person dungeon
room with arrow-key movement, walks to corners to trigger real CAT
Logical Reasoning / Data Interpretation puzzles, and earns XP/gold for
correct answers. Wrong answers shuffle the options and cost a life; two
wrong attempts on the same puzzle locks that corner for 60 seconds.

## Files in this folder

- **`index.html`** — the entire playable game in a single file. This is
  the one to share or host. It loads React, ReactDOM, and Babel from a
  public CDN (unpkg.com) and runs the game directly in the browser, with
  no build step, no server, and no install required.
- **`DILRDungeon.jsx`** — the same game as a plain React component
  source file, for anyone who wants to drop it into an existing React
  project (Next.js, Vite, Create React App, etc.) or keep editing it
  with proper tooling (a bundler, linting, hot reload) instead of the
  CDN/Babel-in-browser setup.

## How to share it as a URL

`index.html` is fully static — it needs no backend, database, or
server-side code. Any of these will get you a public link in a couple
of minutes:

**GitHub Pages (free)**
1. Create a new GitHub repo, upload `index.html` (rename to keep it as
   `index.html` so it's served at the root).
2. Repo Settings → Pages → set source to your default branch.
3. Your link will be `https://<your-username>.github.io/<repo-name>/`.

**Netlify (free, fastest)**
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag the `index.html` file (or a folder containing it) onto the page.
3. You get an instant public URL — no account strictly required for a
   one-off drop, though signing up lets you keep/manage it.

**Vercel**
1. `npx vercel` from a folder containing `index.html`, or drag-and-drop
   via the Vercel dashboard's "Add New → Project" flow.

You can also just open `index.html` by double-clicking it locally —
it'll run straight in your browser with no server at all, useful for
testing before you deploy anywhere.

## What's actually in the game right now (scope check)

This is an MVP slice, not the full question bank:

- **Level 1 — The Threshold:** 2 sets (Queen's Eye, Passkey Cipher)
- **Level 2 — The Archive:** 2 sets (Vials of Truth, Treasury of Notes)
- 4 real CAT questions per set, sourced from your uploaded papers
  (CAT 2017 S2, CAT 2021 S3, CAT 2018 S1)

The other ~117 sets identified and leveled in
`CAT_LRDI_question_bank_levels.xlsx` aren't wired into the game yet —
this proves the mechanic works end to end on real content before more
sets get added.

## Known rough edges worth knowing about

- A couple of the harder boss-question explanations (the passkey cipher
  and ATM notes sets especially) reflect the official CAT answer but
  haven't been double-checked word-for-word against your source PDF's
  worked solution — worth a verification pass before this goes further,
  same as everything else in this project.
- This is frontend only, as requested — no backend, no persistence.
  Progress (XP, gold, lives) resets if the page is refreshed or closed,
  since nothing is saved between sessions yet.
