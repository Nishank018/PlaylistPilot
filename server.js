import app from './api/index.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5001;

// Trim YouTube API Key defensively in the env
if (process.env.YOUTUBE_API_KEY) {
  process.env.YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY.trim();
}

// Serve Vite Static Assets in Production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
  const distPath = path.join(__dirname, 'dist');
  app.use(express.static(distPath));

  // Multi-page routing fallbacks
  app.get('/setup', (req, res) => {
    res.sendFile(path.join(distPath, 'setup.html'));
  });
  app.get('/plan', (req, res) => {
    res.sendFile(path.join(distPath, 'plan.html'));
  });
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`PlaylistPilot secure backend running on port ${PORT}`);
});
