# PlaylistPilot 🧭

I built **PlaylistPilot** because I was constantly adding YouTube playlists to my "watch later" list, only to forget about them weeks later. It felt like a graveyard of unfinished tutorials. One night I asked myself, *"How can I actually finish what I start?"* and the idea for PlaylistPilot was born.

PlaylistPilot is a lightweight, client‑side web app that takes any YouTube playlist and turns it into a day‑by‑day learning plan. It respects your preferred playback speed and daily study window, so you get a realistic schedule that you can actually follow.

## 🎨 Design Philosophy
Inspired by clean, modern tools like **Linear**, **Notion**, and **Stripe**, the UI embraces:
- **Spacious and minimal layouts** with generous padding.
- **Subtle dark‑mode palette** – no harsh colors, just elegant contrast.
- **Micro‑animations** that feel responsive without being distracting.

## ⚙️ Core Features
- **Smart daily scheduling** – a greedy bin‑packing algorithm distributes videos into manageable daily buckets.
- **Adjustable playback speed** – the schedule automatically accounts for 1x‑2x speeds.
- **Revision days** – optional pause days for review and note‑taking.
- **Client‑side download** – export your plan as a nicely formatted Markdown file.
- **LocalStorage persistence** – your preferences survive page reloads.

---

## 📁 Project Structure
```
PlaylistPilot/
├── index.html          # Landing page (URL entry & preview)
├── setup.html          # Settings and schedule generation
├── plan.html           # Final plan view
├── src/
│   ├── css/style.css   # Core stylesheet
│   └── js/
│       ├── mockData.js # Sample playlists for offline demo
│       ├── landing.js  # URL handling & UI glue
│       ├── setup.js    # Form validation & schedule creation
│       └── plan.js     # Packing algorithm & plan rendering
├── package.json        # Dev scripts (Vite server)
└── README.md           # This file
```
---

## 🚀 Running the Project
**Option 1 – Open directly**
Just double‑click `index.html` and the app runs in any modern browser. No server needed.

**Option 2 – Local dev server** (requires Node.js)
```bash
npm install       # install Vite (dev server) if you want hot‑reloading
npm run dev       # start http://localhost:3000
```
Enjoy turning playlists into actionable learning plans!
---

## 🙋‍♂️ About Me
I'm **Nishank Gupta**, a developer who loves turning ideas into polished tools. When I'm not tinkering with side projects, you can find me exploring new JavaScript patterns or hiking in the hills.

Feel free to star the repo, open issues, or drop a comment on the GitHub project page.
---
