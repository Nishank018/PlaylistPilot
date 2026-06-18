// PlaylistPilot - Landing Page JS
// Handles URL analysis, skeleton loading states, mock data integration, and local storage setup.

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNavPanel = document.getElementById('mobile-nav-panel');
  const analyzeBtn = document.getElementById('analyze-btn');
  const playlistUrlInput = document.getElementById('playlist-url');
  const urlError = document.getElementById('url-error');
  const errorText = document.getElementById('error-text');
  
  const skeletonLoader = document.getElementById('skeleton-loader');
  const playlistPreview = document.getElementById('playlist-preview');
  const createPlanBtn = document.getElementById('create-plan-btn');

  // Preview Card Elements
  const cardTitle = document.getElementById('card-title');
  const cardCreator = document.getElementById('card-creator');
  const cardVideoCount = document.getElementById('card-video-count');
  const cardVideoCountBadge = document.getElementById('card-video-count-badge');
  const cardDuration = document.getElementById('card-duration');
  const cardEstDays = document.getElementById('card-est-days');
  const cardCategory = document.getElementById('card-category');
  const playlistThumb = document.getElementById('playlist-thumb');

  let activePlaylistId = null;

  // --- Mobile Menu Toggle ---
  if (mobileMenuBtn && mobileNavPanel) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNavPanel.classList.toggle('open');
      const isOpen = mobileNavPanel.classList.contains('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
      
      // Update hamburger icon visual state if needed
      mobileMenuBtn.style.transform = isOpen ? 'rotate(90deg)' : 'none';
      mobileMenuBtn.style.transition = 'transform 0.2s ease-in-out';
    });

    // Close mobile nav when clicking on nav links
    const mobileLinks = mobileNavPanel.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavPanel.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.style.transform = 'none';
      });
    });

    // Close panel when clicking elsewhere on the screen
    document.addEventListener('click', (event) => {
      if (!mobileNavPanel.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
        mobileNavPanel.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.style.transform = 'none';
      }
    });
  }

  // --- Smooth Scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // --- Playlist URL Analysis ---
  if (analyzeBtn && playlistUrlInput) {
    analyzeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handlePlaylistAnalysis();
    });

    // Trigger analysis on Enter key press in the input field
    playlistUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePlaylistAnalysis();
      }
    });
  }

  // --- YouTube API Integration Utilities ---

  function extractPlaylistId(url) {
    url = url.trim();
    // Check if it's a raw YouTube Playlist ID (typically starts with PL, UU, etc. and is 18-34 chars)
    if (/^[a-zA-Z0-9_-]{18,34}$/.test(url)) {
      return url;
    }
    try {
      const urlObj = new URL(url);
      const listId = urlObj.searchParams.get('list');
      if (listId) return listId;
    } catch (e) {
      // Not a valid URL
    }
    // Fallback regex in case of missing protocol
    const match = url.match(/[?&]list=([^#\&\?]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return null;
  }

  function parseISO8601Duration(duration) {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = duration.match(regex);
    if (!matches) return 0;
    const hours = parseInt(matches[1] || 0, 10);
    const minutes = parseInt(matches[2] || 0, 10);
    const seconds = parseInt(matches[3] || 0, 10);
    return (hours * 3600) + (minutes * 60) + seconds;
  }

  function updateLoadingStatus(msg) {
    const statusText = document.getElementById('loading-status-text');
    if (statusText) {
      statusText.textContent = msg;
    }
  }

  async function fetchYouTubePlaylist(playlistId, apiKey) {
    
    
    // Step 1: Fetch playlist details
    updateLoadingStatus('Connecting to YouTube API...');
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${apiKey}`;
    const playlistRes = await fetch(playlistUrl);
    if (!playlistRes.ok) {
      throw new Error('Failed to fetch playlist metadata. Check your connection or playlist ID.');
    }
    
    const playlistData = await playlistRes.json();
    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error('Playlist not found. Make sure the playlist is public.');
    }
    
    const playlistItem = playlistData.items[0];
    const title = playlistItem.snippet.title;
    const creator = playlistItem.snippet.channelTitle;
    
    const thumbnails = playlistItem.snippet.thumbnails;
    const thumbnailUrl = thumbnails ? (thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default).url : '';

    // Step 2: Fetch playlist items (paginated)
    let allVideos = [];
    let nextPageToken = '';
    let pageCount = 0;
    
    do {
      pageCount++;
      updateLoadingStatus(`Fetching playlist items (Page ${pageCount})...`);
      
      const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${apiKey}&pageToken=${nextPageToken}`;
      const itemsRes = await fetch(itemsUrl);
      if (!itemsRes.ok) {
        throw new Error(`Failed to retrieve playlist items (Page ${pageCount}).`);
      }
      
      const itemsData = await itemsRes.json();
      if (itemsData.items) {
        allVideos = allVideos.concat(itemsData.items.map(item => ({
          id: item.contentDetails.videoId,
          title: item.snippet.title
        })));
      }
      nextPageToken = itemsData.nextPageToken;
      
      // Prevent unbounded requests in very large playlists (> 500 items)
      if (pageCount >= 10) break;
    } while (nextPageToken);

    if (allVideos.length === 0) {
      throw new Error('This playlist is empty.');
    }

    // Step 3: Fetch video durations in batches of 50
    const videosWithDurations = [];
    const totalVideos = allVideos.length;
    
    for (let i = 0; i < totalVideos; i += 50) {
      const chunk = allVideos.slice(i, i + 50);
      const videoIds = chunk.map(v => v.id).join(',');
      
      updateLoadingStatus(`Fetching durations (${Math.round((i / totalVideos) * 100)}% completed)...`);
      
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
      const videosRes = await fetch(videosUrl);
      if (!videosRes.ok) {
        throw new Error('Failed to retrieve video details.');
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
        // Skip deleted/private/unreachable videos
        if (durationSeconds !== undefined && durationSeconds > 0) {
          videosWithDurations.push({
            title: vid.title,
            durationSeconds: durationSeconds
          });
        }
      });
    }

    if (videosWithDurations.length === 0) {
      throw new Error('No public/playable videos found in this playlist.');
    }

    const totalDurationSeconds = videosWithDurations.reduce((sum, v) => sum + v.durationSeconds, 0);
    const durationHours = Math.round(totalDurationSeconds / 3600);
    const estimatedDays = Math.ceil(durationHours / 2) || 1;

    return {
      id: playlistId,
      title: title,
      creator: creator,
      videoCount: videosWithDurations.length,
      durationHours: durationHours || 1,
      estimatedDays: estimatedDays,
      category: 'YouTube Playlist',
      thumbnailGradient: 'linear-gradient(135deg, #FF0000 0%, #B91C1C 100%)',
      thumbnailUrl: thumbnailUrl,
      videos: videosWithDurations
    };
  }

  function displayPlaylistPreview(playlist) {
    activePlaylistId = playlist.id;
    cardTitle.textContent = playlist.title;
    cardCreator.textContent = `by ${playlist.creator}`;
    cardVideoCount.textContent = playlist.videoCount;
    cardVideoCountBadge.textContent = playlist.videoCount;
    cardDuration.textContent = playlist.durationHours >= 1 ? `${playlist.durationHours} Hours` : 'Less than 1 Hour';
    cardEstDays.textContent = `${playlist.estimatedDays} Days`;
    cardCategory.textContent = playlist.category;
    
    // Load Thumbnail URL or Fallback to Gradient
    if (playlist.thumbnailUrl) {
      playlistThumb.style.background = `url('${playlist.thumbnailUrl}') center/cover no-repeat`;
      playlistThumb.textContent = '';
    } else {
      playlistThumb.style.background = playlist.thumbnailGradient || 'var(--color-accent)';
      playlistThumb.textContent = playlist.title.split(' ').slice(0, 2).map(w => w[0]).join('');
    }

    // Save to local storage for multi-page retrieval
    localStorage.setItem('activePlaylistDetails', JSON.stringify(playlist));

    // Hide skeleton and reveal card preview
    skeletonLoader.style.display = 'none';
    playlistPreview.style.display = 'block';
    
    // Smooth scroll to card
    playlistPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    // Reset analyze button state
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze Playlist';
  }

  async function handlePlaylistAnalysis() {
    const urlValue = playlistUrlInput.value.trim();

    // Reset UI states
    hideError();
    playlistPreview.style.display = 'none';
    skeletonLoader.style.display = 'none';
    activePlaylistId = null;

    if (!urlValue) {
      showError('Please paste a YouTube playlist URL to analyze.');
      return;
    }

    // 1. Analyze and extract YouTube Playlist ID
    const playlistId = extractPlaylistId(urlValue);

    // Disable button & reveal skeleton
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    skeletonLoader.style.display = 'block';

    if (playlistId) {
      const apiKey = getApiKey();
      if (!apiKey) {
        skeletonLoader.style.display = 'none';
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Playlist';
        showError('A YouTube API Key is required to analyze custom playlists. Please configure one in API Settings.');
        openApiSettingsModal();
        return;
      }
      try {
        const playlist = await fetchYouTubePlaylist(playlistId, apiKey);
        displayPlaylistPreview(playlist);
      } catch (err) {
        skeletonLoader.style.display = 'none';
        showError(err.message || 'An error occurred while fetching the YouTube playlist.');
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Playlist';
      }
    } else {
      // 2. Mock Database Fallback (if they enter demo keys / mock keywords)
      const cleanUrl = urlValue.toLowerCase();
      let mockPlaylist = null;
      
      if (cleanUrl.includes('design') || cleanUrl.includes('ui') || cleanUrl.includes('ux') || cleanUrl === 'mock-uiux') {
        mockPlaylist = window.PlaylistPilotData.playlists.find(p => p.id === 'uiux-course');
      } else if (cleanUrl.includes('python') || cleanUrl.includes('algo') || cleanUrl.includes('py') || cleanUrl === 'mock-python') {
        mockPlaylist = window.PlaylistPilotData.playlists.find(p => p.id === 'python-algo');
      } else if (cleanUrl.includes('javascript') || cleanUrl.includes('js') || cleanUrl === 'mock-js') {
        mockPlaylist = window.PlaylistPilotData.playlists.find(p => p.id === 'js-course');
      }

      if (mockPlaylist) {
        updateLoadingStatus('Simulating analysis for mock database...');
        setTimeout(() => {
          displayPlaylistPreview(mockPlaylist);
        }, 1000);
      } else {
        skeletonLoader.style.display = 'none';
        showError('Please enter a valid YouTube playlist URL or ID.');
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze Playlist';
      }
    }
  }

  // --- Error Messaging Helpers ---
  function showError(msg) {
    urlError.style.display = 'flex';
    errorText.textContent = msg;
    playlistUrlInput.style.borderColor = 'var(--color-error)';
  }

  function hideError() {
    urlError.style.display = 'none';
    playlistUrlInput.style.borderColor = '';
  }

  // --- Navigate to setup page and store playlist info ---
  if (createPlanBtn) {
    createPlanBtn.addEventListener('click', () => {
      if (!activePlaylistId) {
        showError('Analysis failed. Please try analyzing the playlist again.');
        return;
      }
      
      // Save active playlist ID to localStorage
      localStorage.setItem('selectedPlaylistId', activePlaylistId);
      
      // Navigate to setup.html
      window.location.href = 'setup.html';
    });
  }

  // --- API Key & Settings Modal Management ---
  const navApiSettingsBtn = document.getElementById('nav-api-settings-btn');
  const mobileApiSettingsBtn = document.getElementById('mobile-api-settings-btn');
  const apiModalOverlay = document.getElementById('api-modal-overlay');
  const apiModalCloseBtn = document.getElementById('api-modal-close-btn');
  const apiModalCancelBtn = document.getElementById('api-modal-cancel-btn');
  const apiModalSaveBtn = document.getElementById('api-modal-save-btn');
  const apiKeyInput = document.getElementById('api-key-input');
  const toggleApiKeyVisibility = document.getElementById('toggle-api-key-visibility');
  const eyeIconShow = document.getElementById('eye-icon-show');
  const eyeIconHide = document.getElementById('eye-icon-hide');
  const apiStatusDot = document.getElementById('api-status-dot');
  const apiStatusText = document.getElementById('api-status-text');

  function getApiKey() {
    const localKey = localStorage.getItem('youtube_api_key');
    if (localKey && localKey.trim()) {
      return localKey.trim();
    }
    if (window.PlaylistPilotConfig && window.PlaylistPilotConfig.apiKey && window.PlaylistPilotConfig.apiKey.trim()) {
      return window.PlaylistPilotConfig.apiKey.trim();
    }
    return null;
  }

  function updateApiStatusIndicator() {
    const localKey = localStorage.getItem('youtube_api_key');
    const configKey = window.PlaylistPilotConfig?.apiKey;
    
    if (localKey && localKey.trim()) {
      if (apiStatusDot) apiStatusDot.style.backgroundColor = 'var(--color-success)';
      if (apiStatusText) apiStatusText.textContent = 'Active key configured via Local Storage.';
      if (apiKeyInput) apiKeyInput.value = localKey;
    } else if (configKey && configKey.trim()) {
      if (apiStatusDot) apiStatusDot.style.backgroundColor = 'var(--color-success)';
      if (apiStatusText) apiStatusText.textContent = 'Active key configured via config.js.';
      if (apiKeyInput) apiKeyInput.value = configKey;
    } else {
      if (apiStatusDot) apiStatusDot.style.backgroundColor = 'var(--color-text-secondary)';
      if (apiStatusText) apiStatusText.textContent = 'No API Key configured. Real playlists will not work.';
      if (apiKeyInput) apiKeyInput.value = '';
    }
  }

  function openApiSettingsModal() {
    updateApiStatusIndicator();
    if (apiModalOverlay) {
      apiModalOverlay.classList.add('open');
    }
  }

  function closeApiSettingsModal() {
    if (apiModalOverlay) {
      apiModalOverlay.classList.remove('open');
    }
  }

  if (navApiSettingsBtn) {
    navApiSettingsBtn.addEventListener('click', () => openApiSettingsModal());
  }

  if (mobileApiSettingsBtn) {
    mobileApiSettingsBtn.addEventListener('click', () => {
      openApiSettingsModal();
      if (mobileNavPanel) {
        mobileNavPanel.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.style.transform = 'none';
      }
    });
  }

  if (apiModalCloseBtn) {
    apiModalCloseBtn.addEventListener('click', closeApiSettingsModal);
  }

  if (apiModalCancelBtn) {
    apiModalCancelBtn.addEventListener('click', closeApiSettingsModal);
  }

  if (apiModalOverlay) {
    apiModalOverlay.addEventListener('click', (e) => {
      if (e.target === apiModalOverlay) {
        closeApiSettingsModal();
      }
    });
  }

  if (apiModalSaveBtn) {
    apiModalSaveBtn.addEventListener('click', () => {
      const keyVal = apiKeyInput ? apiKeyInput.value.trim() : '';
      if (keyVal === '') {
        localStorage.removeItem('youtube_api_key');
      } else {
        localStorage.setItem('youtube_api_key', keyVal);
      }
      updateApiStatusIndicator();
      closeApiSettingsModal();
    });
  }

  if (toggleApiKeyVisibility && apiKeyInput) {
    toggleApiKeyVisibility.addEventListener('click', () => {
      const isPassword = apiKeyInput.type === 'password';
      apiKeyInput.type = isPassword ? 'text' : 'password';
      if (isPassword) {
        if (eyeIconShow) eyeIconShow.style.display = 'none';
        if (eyeIconHide) eyeIconHide.style.display = 'block';
      } else {
        if (eyeIconShow) eyeIconShow.style.display = 'block';
        if (eyeIconHide) eyeIconHide.style.display = 'none';
      }
    });
  }

  // Run status check on page load
  updateApiStatusIndicator();
});
