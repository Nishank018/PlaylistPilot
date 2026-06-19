import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Helper: Extract Playlist ID from URL or return raw ID
function extractPlaylistId(urlOrId) {
  const clean = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{18,34}$/.test(clean)) {
    return clean;
  }
  try {
    const urlObj = new URL(clean);
    const listId = urlObj.searchParams.get('list');
    if (listId) return listId;
  } catch (e) {
    // Treat as fallback
  }
  const match = clean.match(/[?&]list=([^#\&\?]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

// Helper: Parse ISO 8601 Duration to seconds
function parseISO8601Duration(duration) {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || 0, 10);
  const minutes = parseInt(matches[2] || 0, 10);
  const seconds = parseInt(matches[3] || 0, 10);
  return (hours * 3600) + (minutes * 60) + seconds;
}

// Vercel Serverless Endpoint Route: Fetch YouTube Playlist Details
app.get('/api/playlist', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Playlist URL or ID is required.' });
  }

  const playlistId = extractPlaylistId(url);
  if (!playlistId) {
    return res.status(400).json({ error: 'Invalid YouTube playlist URL or ID format.' });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('Missing YOUTUBE_API_KEY in environment variables.');
    return res.status(500).json({ 
      error: 'YouTube API key is not configured on the server. Please add it to your Vercel Environment Variables.' 
    });
  }

  try {
    // 1. Fetch Playlist metadata
    const playlistMetaUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`;
    const playlistMetaRes = await fetch(playlistMetaUrl);
    
    if (!playlistMetaRes.ok) {
      const errorText = await playlistMetaRes.text();
      console.error('YouTube API Playlist Meta Error:', errorText);
      return res.status(playlistMetaRes.status).json({ 
        error: 'Failed to retrieve playlist details. Check if the playlist exists and is public.' 
      });
    }

    const playlistMetaData = await playlistMetaRes.json();
    if (!playlistMetaData.items || playlistMetaData.items.length === 0) {
      return res.status(404).json({ error: 'Playlist not found or is private.' });
    }

    const playlistItem = playlistMetaData.items[0];
    const title = playlistItem.snippet.title;
    const creator = playlistItem.snippet.channelTitle;
    const thumbnails = playlistItem.snippet.thumbnails;
    const thumbnailUrl = thumbnails 
      ? (thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default)?.url || '' 
      : '';

    // 2. Fetch all playlist items (paginated, max 500 videos for performance/quota limits)
    let allVideos = [];
    let nextPageToken = '';
    let pageCount = 0;

    do {
      pageCount++;
      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}&pageToken=${nextPageToken}`;
      const itemsRes = await fetch(itemsUrl);
      
      if (!itemsRes.ok) {
        const errorText = await itemsRes.text();
        console.error(`YouTube API Playlist Items Error (Page ${pageCount}):`, errorText);
        return res.status(itemsRes.status).json({ error: 'Failed to retrieve playlist items.' });
      }

      const itemsData = await itemsRes.json();
      if (itemsData.items) {
        allVideos = allVideos.concat(itemsData.items.map(item => ({
          id: item.contentDetails.videoId,
          title: item.snippet.title
        })));
      }
      nextPageToken = itemsData.nextPageToken;

      if (pageCount >= 10) break;
    } while (nextPageToken);

    if (allVideos.length === 0) {
      return res.status(400).json({ error: 'This playlist is empty.' });
    }

    // 3. Batch query video durations in chunks of 50
    const videosWithDurations = [];
    const totalVideos = allVideos.length;

    for (let i = 0; i < totalVideos; i += 50) {
      const chunk = allVideos.slice(i, i + 50);
      const videoIds = chunk.map(v => v.id).join(',');

      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
      const videosRes = await fetch(videosUrl);

      if (!videosRes.ok) {
        const errorText = await videosRes.text();
        console.error('YouTube API Videos Chunk Error:', errorText);
        return res.status(videosRes.status).json({ error: 'Failed to retrieve details for some playlist videos.' });
      }

      const videosData = await videosRes.json();
      const durationMap = {};
      
      if (videosData.items) {
        videosData.items.forEach(item => {
          durationMap[item.id] = parseISO8601Duration(item.contentDetails.duration);
        });
      }

      chunk.forEach(vid => {
        const durationSeconds = durationMap[vid.id];
        if (durationSeconds !== undefined && durationSeconds > 0) {
          videosWithDurations.push({
            title: vid.title,
            durationSeconds: durationSeconds
          });
        }
      });
    }

    if (videosWithDurations.length === 0) {
      return res.status(400).json({ error: 'No public or playable videos found in this playlist.' });
    }

    const totalDurationSeconds = videosWithDurations.reduce((sum, v) => sum + v.durationSeconds, 0);
    const durationHours = Math.round(totalDurationSeconds / 3600);
    const estimatedDays = Math.ceil(durationHours / 2) || 1;

    res.json({
      id: playlistId,
      title: title,
      creator: creator,
      videoCount: videosWithDurations.length,
      durationHours: durationHours || 1,
      estimatedDays: estimatedDays,
      category: 'YouTube Playlist',
      thumbnailGradient: 'linear-gradient(135deg, #0A84FF 0%, #0056B3 100%)',
      thumbnailUrl: thumbnailUrl,
      videos: videosWithDurations
    });

  } catch (error) {
    console.error('Vercel Serverless Internal Error:', error);
    res.status(500).json({ error: 'Internal server error while analyzing the playlist.' });
  }
});

// Export Express app as Vercel serverless function
export default app;
