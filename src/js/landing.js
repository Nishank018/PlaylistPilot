// Landing Page JavaScript – Fixed variable scope and button functionality
// --------------------------------------------------------------
// This script powers the landing page, handling URL analysis, preview display,
// navigation to the setup page, and UI interactions. Variables that need to be
// accessed across multiple functions are declared in the module scope to avoid
// ReferenceErrors.

// ---------- Module‑level variables (shared across functions) ----------
let activePlaylistId = null;
let mobileMenuBtn, mobileNavPanel, analyzeBtn, playlistUrlInput;
let urlErrorBox, urlErrorText;
let skeletonLoader, playlistPreview, createPlanBtn;
let cardTitle, cardCreator, cardVideoCount, cardVideoCountBadge;
let cardDuration, cardEstDays, cardCategory, playlistThumb;

/** Initialise the page once the DOM is ready. */
function initLandingPage() {
  // ---------- DOM ELEMENTS ----------
  mobileMenuBtn = document.getElementById('mobile-menu-btn');
  mobileNavPanel = document.getElementById('mobile-nav-panel');
  analyzeBtn = document.getElementById('analyze-btn');
  playlistUrlInput = document.getElementById('playlist-url');
  urlErrorBox = document.getElementById('url-error');
  urlErrorText = document.getElementById('error-text');

  skeletonLoader = document.getElementById('skeleton-loader');
  playlistPreview = document.getElementById('playlist-preview');
  createPlanBtn = document.getElementById('create-plan-btn');

  // ---------- PREVIEW CARD ELEMENTS ----------
  cardTitle = document.getElementById('card-title');
  cardCreator = document.getElementById('card-creator');
  cardVideoCount = document.getElementById('card-video-count');
  cardVideoCountBadge = document.getElementById('card-video-count-badge');
  cardDuration = document.getElementById('card-duration');
  cardEstDays = document.getElementById('card-est-days');
  cardCategory = document.getElementById('card-category');
  playlistThumb = document.getElementById('playlist-thumb');

  // ---------- ANIMATIONS (GSAP) ----------
  if (typeof gsap !== 'undefined') {
    // Hero section fade‑in
    gsap.from('#hero-tag', { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
    gsap.from('#hero-title', { opacity: 0, y: 30, duration: 0.8, delay: 0.1, ease: 'power4.out' });
    gsap.from('#hero-sub', { opacity: 0, y: 20, duration: 0.8, delay: 0.25, ease: 'power3.out' });
    gsap.from('#hero-form', { opacity: 0, y: 15, duration: 0.6, delay: 0.45, ease: 'power3.out' });
    // Feature cards staggered entry
    gsap.from('.feature-card', { opacity: 0, y: 40, duration: 0.8, stagger: 0.15, delay: 0.6, ease: 'power3.out' });
  }

  // ---------- MOUSE MOVE PARALLAX (ambient glow) ----------
  if (typeof gsap !== 'undefined') {
    document.addEventListener('mousemove', (e) => {
      const xPos = (e.clientX / window.innerWidth - 0.5) * 35;
      const yPos = (e.clientY / window.innerHeight - 0.5) * 35;
      gsap.to('.hero-glow', { x: xPos, y: yPos, duration: 1.2, ease: 'power2.out' });
      gsap.to('.bg-glow', { x: -xPos * 0.4, y: -yPos * 0.4, duration: 1.6, ease: 'power2.out' });
    });
  }

  // ---------- MOBILE MENU TOGGLE ----------
  if (mobileMenuBtn && mobileNavPanel) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNavPanel.classList.toggle('open');
      const isOpen = mobileNavPanel.classList.contains('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
      mobileMenuBtn.style.transform = isOpen ? 'rotate(90deg)' : 'none';
    });

    // Close menu when a link is clicked
    mobileNavPanel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNavPanel.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.style.transform = 'none';
      });
    });

    // Click outside to close
    document.addEventListener('click', (event) => {
      if (!mobileNavPanel.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
        mobileNavPanel.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.style.transform = 'none';
      }
    });
  }

  // ---------- SMOOTH SCROLL FOR INTERNAL LINKS ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---------- PLAYLIST ANALYSIS ----------
  if (analyzeBtn && playlistUrlInput) {
    analyzeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handlePlaylistAnalysis();
    });
    // Allow Enter key inside the input
    playlistUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePlaylistAnalysis();
      }
    });
  }

  // ---------- FORM SUBMISSION (go to setup) ----------
  if (createPlanBtn) {
    createPlanBtn.addEventListener('click', () => {
      if (!activePlaylistId) {
        showError('Analysis failed. Please try analyzing the playlist again.');
        return;
      }
      // Persist the selected playlist ID for the next page
      localStorage.setItem('selectedPlaylistId', activePlaylistId);
      window.location.href = 'setup.html';
    });
  }

  // ---------- VISITOR COUNTER (optional) ----------
  initVisitorCounter();
}

/** Helper to update the loading status text. */
function updateLoadingStatus(msg) {
  const statusText = document.getElementById('loading-status-text');
  if (statusText) statusText.textContent = msg;
}

/** Show the preview card with playlist details. */
function displayPlaylistPreview(playlist) {
  activePlaylistId = playlist.id;
  cardTitle.textContent = playlist.title;
  cardCreator.textContent = `by ${playlist.creator}`;
  cardVideoCount.textContent = playlist.videoCount;
  cardVideoCountBadge.textContent = playlist.videoCount;
  cardDuration.textContent = playlist.durationHours >= 1 ? `${playlist.durationHours} Hours` : 'Less than 1 Hour';
  cardEstDays.textContent = `${playlist.estimatedDays} Days`;
  cardCategory.textContent = playlist.category || '';

  // Thumbnail – image or fallback gradient
  if (playlist.thumbnailUrl) {
    playlistThumb.style.background = `url('${playlist.thumbnailUrl}') center/cover no-repeat`;
    playlistThumb.textContent = '';
  } else {
    playlistThumb.style.background = playlist.thumbnailGradient || 'var(--color-accent)';
    playlistThumb.textContent = playlist.title.split(' ').slice(0, 2).map(w => w[0]).join('');
  }

  // Cache for later pages
  localStorage.setItem('activePlaylistDetails', JSON.stringify(playlist));

  // Show the preview (hide skeleton first)
  skeletonLoader.style.display = 'none';
  playlistPreview.style.display = 'block';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#playlist-preview', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
  }
  playlistPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Reset analyze button state
  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = 'Analyze Playlist';
  }
}

/** Core logic for analysing a YouTube playlist URL. */
async function handlePlaylistAnalysis() {
  const url = playlistUrlInput.value.trim();
  hideError();
  playlistPreview.style.display = 'none';
  skeletonLoader.style.display = 'none';
  activePlaylistId = null;

  if (!url) {
    showError('Please paste a YouTube playlist URL to analyse.');
    return;
  }

  // Disable UI while processing
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';
  skeletonLoader.style.display = 'block';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#skeleton-loader', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
  }

  try {
    updateLoadingStatus('Connecting to PlaylistPilot API...');
    const response = await fetch(`/api/playlist?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Backend request failed');
    const playlist = await response.json();
    displayPlaylistPreview(playlist);
  } catch (err) {
    // Fallback to mock data based on keywords
    const clean = url.toLowerCase();
    let mock = null;
    if (clean.includes('design') || clean.includes('ui') || clean.includes('ux') || clean === 'mock-uiux') {
      mock = window.PlaylistPilotData.playlists.find(p => p.id === 'uiux-course');
    } else if (clean.includes('python') || clean.includes('algo') || clean.includes('py') || clean === 'mock-python') {
      mock = window.PlaylistPilotData.playlists.find(p => p.id === 'python-algo');
    } else if (clean.includes('javascript') || clean.includes('js') || clean === 'mock-js') {
      mock = window.PlaylistPilotData.playlists.find(p => p.id === 'js-course');
    }

    if (mock) {
      updateLoadingStatus('Simulating analysis (offline mode)…');
      setTimeout(() => displayPlaylistPreview(mock), 800);
    } else {
      skeletonLoader.style.display = 'none';
      showError(err.message || 'Please enter a valid YouTube playlist URL or ID.');
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = 'Analyze Playlist';
    }
  }
}

/** Show an error message for invalid URLs. */
function showError(msg) {
  if (!urlErrorBox) return;
  urlErrorBox.style.display = 'flex';
  urlErrorText.textContent = msg;
  playlistUrlInput.style.borderColor = 'var(--color-error)';
  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#url-error', { x: -10 }, { x: 0, duration: 0.4, ease: 'rough', clearProps: 'x' });
  }
}

/** Hide the URL error UI. */
function hideError() {
  if (!urlErrorBox) return;
  urlErrorBox.style.display = 'none';
  playlistUrlInput.style.borderColor = '';
}

/** Initialise the optional visitor counter. */
async function initVisitorCounter() {
  const counterEl = document.getElementById('visitor-counter');
  const countValEl = document.getElementById('visitor-count');
  if (!counterEl || !countValEl) return;
  try {
    const resp = await fetch('https://api.counterapi.dev/v1/playlistpilot_nishank/visits/up');
    if (!resp.ok) throw new Error('Counter API failed');
    const data = await resp.json();
    if (data && typeof data.count === 'number') {
      countValEl.textContent = data.count.toLocaleString();
      counterEl.classList.remove('hidden');
    }
  } catch (_) {
    // Silently ignore failures.
  }
}

// Initialise when the DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLandingPage);
} else {
  initLandingPage();
}
