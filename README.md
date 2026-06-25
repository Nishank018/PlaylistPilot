# PlaylistPilot 🧭

Turn any YouTube playlist into a day-by-day learning schedule. Paste a playlist, set your daily study time and playback speed — PlaylistPilot does the rest.

**Live:** [playlist-pilot-chi.vercel.app](https://playlist-pilot-chi.vercel.app)

---

## The Problem

Long tutorial playlists sit in "Watch Later" forever. There's no structure, no deadline, no plan. PlaylistPilot fixes that.

---

## Features

- Day-by-day schedule generated from any YouTube playlist
- Adjustable playback speed (1x–2x)
- Custom daily study duration
- Optional revision/rest days
- Export schedule as Markdown
- Preferences saved via LocalStorage

---

## Tech Stack

- Vanilla HTML / CSS / JS
- YouTube Data API v3
- LocalStorage
- Vite (dev server)

---

## Project Structure

```
PlaylistPilot/
├── index.html
├── setup.html
├── plan.html
├── src/
│   ├── css/style.css
│   └── js/
│       ├── mockData.js
│       ├── landing.js
│       ├── setup.js
│       └── plan.js
├── package.json
└── README.md
```

---

## Running Locally

```bash
# Option 1 — just open index.html in any browser

# Option 2 (recommended)
npm install
npm run dev
```

---

## What I Built / Learned

- How to integrate and work with a real API inside a frontend app
- Passing state between pages without a framework
- Client-side scheduling logic using a greedy bin-packing approach
- Reading and adapting AI-generated code as part of the build process

---

## Note on AI

Used AI tools for UI implementation, project structure, and scaffolding the scheduling logic. Studied and adapted the output to understand how everything fits together.

---

## Feedback

Open an issue or start a discussion if you have ideas.
