# PlaylistPilot 🧭

PlaylistPilot is a high-fidelity, client-side web application prototype that transforms long YouTube playlists into structured, day-by-day learning schedules adjusted for your speed and daily availability.

Built as a modern, production-grade frontend portfolio project using **Vanilla HTML5, CSS3, and JavaScript** without any external frameworks (React, Vue, Tailwind, etc.).

---

## 🎨 Design Philosophy
Inspired by **Linear, Notion, and Stripe**:
- **Spacious & Minimal**: Clean layouts with ample padding and sharp typography.
- **Strict Color Scheme**: Pure white backgrounds (`#FFFFFF`), dark slate text (`#111827`), vibrant blue accent cues (`#2563EB`), and light gray borders (`#E5E7EB`).
- **High Performance & Responsive**: Fast client-side rendering with no external script bloat and absolute mobile responsiveness.

---

## ⚙️ Key Technical Features

### 1. Daily Study Timeline Scheduler (Bin-Packing Algorithm)
PlaylistPilot utilizes a greedy bin-packing algorithm inside `js/plan.js` to distribute video lessons into consecutive daily intervals based on:
- **Adjusted Durations**: Videos are scaled to match the selected playback speed ($1x$, $1.25x$, $1.5x$, $1.75x$, $2x$).
- **Daily Time Budget**: The user's target study hours (e.g. 2 hours/day).
- **Intensity Pacing**: Modifies the daily duration budget (Casual $80\%$, Consistent $100\%$, Intensive $120\%$).
- **Objective Goals**: Packs schedule blocks tighter or adds buffer room based on target milestones (Fastest, Balanced, Comfortable).
- **Revision Intervals**: If active, the scheduler pauses course videos every 7th day to schedule a dedicated rest/review day.

### 2. Client-Side Download Engine
Compiles the generated daily schedule into a structured Markdown syllabus (`.md` text file) and downloads it directly to the user's browser using client-side Blob objects.

### 3. LocalStorage Persistence
Maintains user states across multi-page steps. Navigating out-of-order triggers beautiful "Empty States" preventing application breakdown and guiding users back to the homepage flow.

---

## 📁 File Structure

```
/Users/nishankgupta/Developer/PlaylistPilot/
├── index.html           # Landing Page (URL Analyzer & Preview Card)
├── setup.html           # Plan Setup (Pacing & Preferences Form)
├── plan.html            # Generated Plan Dashboard (Timeline & Sidebar)
├── package.json         # Scripts to run local dev server
├── css/
│   └── style.css        # Central stylesheet with custom styled elements
└── js/
    ├── mockData.js      # Mock playlist databases & category matching
    ├── landing.js       # URL validation, skeleton loader timing
    ├── setup.js         # Hours validation & localStorage configuration
    └── plan.js          # Packing algorithm & dashboard rendering
```

---

## 🚀 How to Run

### Option A: Open directly (Double-click)
No server configuration required! Since we built this codebase to bypass CORS restrictions associated with ESM, you can simply double-click [index.html](file:///Users/nishankgupta/Developer/PlaylistPilot/index.html) to run the application directly inside any browser.

### Option B: Local Development Server
Launch a local development server using Vite (requires Node.js):

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the browser at `http://localhost:3000` (it will auto-open by default).
# PlaylistPilot
