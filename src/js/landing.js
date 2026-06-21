// PlaylistPilot - Landing Page JS
// Handles URL analysis, GSAP animations, skeleton loading states, and backend integration.

const init = () => {
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

  // --- GSAP Onload Animations ---
  if (typeof gsap !== 'undefined') {
    // Initial hero fade-ins
    gsap.from('#hero-tag', { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out', clearProps: 'all' });
    gsap.from('#hero-title', { opacity: 0, y: 30, duration: 0.8, delay: 0.1, ease: 'power4.out', clearProps: 'all' });
    gsap.from('#hero-sub', { opacity: 0, y: 20, duration: 0.8, delay: 0.25, ease: 'power3.out', clearProps: 'all' });
    gsap.from('#hero-form', { opacity: 0, y: 15, duration: 0.6, delay: 0.45, ease: 'power3.out', clearProps: 'all' });
    
    // Feature cards stagger animation
    gsap.from('.feature-card', {
      opacity: 0,
      y: 40,
      duration: 0.8,
      stagger: 0.15,
      delay: 0.6,
      ease: 'power3.out',
      clearProps: 'all'
    });
  }

  // --- Mouse Move Ambient Parallax (Award Winning Depth) ---
  if (typeof gsap !== 'undefined') {
    document.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 35;
      const yPos = (clientY / window.innerHeight - 0.5) * 35;
      
      gsap.to('.hero-glow', {
        x: xPos,
        y: yPos,
        duration: 1.2,
        ease: 'power2.out'
      });
      
      gsap.to('.bg-glow', {
        x: -xPos * 0.4,
        y: -yPos * 0.4,
        duration: 1.6,
        ease: 'power2.out'
      });
    });
  }

  // --- Mobile Menu Toggle ---
  if (mobileMenuBtn && mobileNavPanel) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNavPanel.classList.toggle('open');
      const isOpen = mobileNavPanel.classList.contains('open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
      
      mobileMenuBtn.style.transform = isOpen ? 'rotate(90deg)' : 'none';
      mobileMenuBtn.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
    });

    const mobileLinks = mobileNavPanel.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavPanel.classList.remove('open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.style.transform = 'none';
      });
    });

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

    playlistUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePlaylistAnalysis();
      }
    });
  }

  function updateLoadingStatus(msg) {
    const statusText = document.getElementById('loading-status-text');
    if (statusText) {
      statusText.textContent = msg;
    }
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

    // Animate Card Entry using GSAP
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#playlist-preview', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
    
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

    // Disable button & reveal skeleton
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    skeletonLoader.style.display = 'block';

    // Animate Skeleton Entry
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#skeleton-loader', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }

    // 1. Try backend API Call
    try {
      updateLoadingStatus('Connecting to PlaylistPilot API...');
      const response = await fetch(`/api/playlist?url=${encodeURIComponent(urlValue)}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to retrieve playlist details from YouTube.');
      }
      
      const playlist = await response.json();
      displayPlaylistPreview(playlist);
    } catch (err) {
      console.warn('Backend API request failed, falling back to mock checks.', err.message);
      
      // 2. Mock Database Fallback (if they enter demo keywords or backend fails)
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
        updateLoadingStatus('Simulating analysis (Offline Mode)...');
        setTimeout(() => {
          displayPlaylistPreview(mockPlaylist);
        }, 800);
      } else {
        skeletonLoader.style.display = 'none';
        showError(err.message || 'Please enter a valid YouTube playlist URL or ID.');
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
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('#url-error', 
        { x: -10 },
        { x: 0, duration: 0.4, ease: 'rough', clearProps: 'x' }
      );
    }
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

  // --- Visitor Counter Logic ---
  const initVisitorCounter = async () => {
    const counterEl = document.getElementById('visitor-counter');
    const countValEl = document.getElementById('visitor-count');
    if (!counterEl || !countValEl) return;

    try {
      // Fetch and increment page views using a unique namespace
      const response = await fetch('https://api.counterapi.dev/v1/playlistpilot_nishank/visits/up');
      if (!response.ok) throw new Error('CounterAPI request failed');
      
      const data = await response.json();
      if (data && typeof data.count === 'number') {
        // Format number with commas (e.g. 1,234)
        countValEl.textContent = data.count.toLocaleString();
        // Show counter badge smoothly
        counterEl.classList.remove('hidden');
      }
    } catch (err) {
      console.warn('Visitor counter could not load:', err.message);
      // Fails silently; the visitor counter remains hidden.
    }
  };

  initVisitorCounter();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

