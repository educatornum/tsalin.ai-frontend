# Simple React Job Feed (Vite)

Minimal React app with a few reusable components to resemble the provided screenshot.

## Run locally

```bash
pnpm i # or npm i / yarn
pnpm dev
```

Open `http://localhost:5173`.

## Project structure

```
src/
  App.jsx               # Composes the page
  main.jsx              # Entry
  styles.css            # Lightweight CSS
  components/
    Header.jsx
    StatCard.jsx
    JobCard.jsx
    Fab.jsx
  data/
    jobs.js             # Demo data
```

You can replace the data in `src/data/jobs.js` with your API later.

## Tailwind CSS

Tailwind is configured via `tailwind.config.js` and `postcss.config.js`. Global styles are in `src/styles.css` using Tailwind directives.

If classes don’t apply after installing dependencies, restart the dev server.
