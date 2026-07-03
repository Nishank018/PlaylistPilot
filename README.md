# PlaylistPilot 🧭

Transform YouTube playlists into structured learning plans.

PlaylistPilot helps learners break long tutorial playlists into manageable daily study schedules based on available study time, playback speed, and learning preferences.

🌐 Live Demo:
https://playlist-pilot-chi.vercel.app

---

## Why PlaylistPilot?

Educational playlists often remain unfinished because they lack structure and measurable progress.

PlaylistPilot solves this by automatically converting any YouTube playlist into a personalized learning schedule that is realistic and easy to follow.

---

## Features

- Generate personalized study schedules from YouTube playlists
- Adjustable playback speed (1x–2x)
- Custom daily study duration
- Optional revision and rest days
- Export schedules as Markdown
- Persist user preferences using LocalStorage

---

## Tech Stack

Frontend
- HTML5
- CSS3
- JavaScript (ES6)

APIs
- YouTube Data API v3

Development Tools
- Vite
- LocalStorage

---

## Engineering Highlights

- Integrated the YouTube Data API v3 to retrieve playlist metadata.
- Designed client-side scheduling logic to distribute videos across study days.
- Managed application state across multiple pages without using a frontend framework.
- Implemented persistent user preferences using LocalStorage.
- Structured the project into modular JavaScript files for maintainability.

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

npm install

npm run dev

---

## What I Learned

- Working with external REST APIs
- Client-side state management
- Building modular frontend applications
- Designing scheduling logic for real-world use cases
- Debugging and improving AI-assisted code generation

---

## AI-Assisted Development

AI tools were used to accelerate UI development, scaffolding, and initial implementation ideas.

All generated code was reviewed, adapted, and integrated manually to ensure correctness and deepen understanding of the implementation.

---

## Future Improvements

- User authentication
- Cloud synchronization
- Calendar integration
- Progress tracking
- AI-powered adaptive scheduling
