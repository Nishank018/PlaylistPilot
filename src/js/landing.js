// Landing Page JS - Redesigned matching heynishank.vercel.app style
let activePlaylistId = null;
let mobileMenuBtn, mobileNavPanel, analyzeBtn, playlistUrlInput;
let urlErrorBox, urlErrorText;
let skeletonLoader, playlistPreview, createPlanBtn;
let cardTitle, cardCreator, cardVideoCount, cardVideoCountBadge;
let cardDuration, cardEstDays, cardCategory, playlistThumb;

function initLandingPage() {
  // DOM Elements
  mobileMenuBtn = document.getElementById('mobile-menu-btn');
  mobileNavPanel = document.getElementById('mobile-nav-panel');
  analyzeBtn = document.getElementById('analyze-btn');
  playlistUrlInput = document.getElementById('playlist-url');
  urlErrorBox = document.getElementById('url-error');
  urlErrorText = document.getElementById('error-text');

  skeletonLoader = document.getElementById('skeleton-loader');
  playlistPreview = document.getElementById('playlist-preview');
  createPlanBtn = document.getElementById('create-plan-btn');

  cardTitle = document.getElementById('card-title');
  cardCreator = document.getElementById('card-creator');
  cardVideoCount = document.getElementById('card-video-count');
  cardVideoCountBadge = document.getElementById('card-video-count-badge');
  cardDuration = document.getElementById('card-duration');
  cardEstDays = document.getElementById('card-est-days');
  cardCategory = document.getElementById('card-category');
  playlistThumb = document.getElementById('playlist-thumb');

  // Start Live IST Clock
  initLiveClock();

  // Run Real Visitor Tracker
  initRealVisitorTracker();

  // Run GSAP Hero Entrance Sequence
  initHeroMotionSequence();

  // Run Scroll Reveal Observer
  initScrollReveals();

  // Run Smooth Typewriter Effect
  initTypewriterEffect();

  // Run Magnetic Ambient Cursor Spotlight
  initCustomCursorSpotlight();

  // Mobile Menu Toggle
  if (mobileMenuBtn && mobileNavPanel) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNavPanel.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!mobileNavPanel.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileNavPanel.classList.remove('open');
      }
    });
  }

  // Header Search Pill shortcut focus
  const searchPill = document.getElementById('header-search-pill');
  if (searchPill && playlistUrlInput) {
    searchPill.addEventListener('click', () => {
      playlistUrlInput.focus();
      playlistUrlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  // Ctrl+K key listener for quick input focus
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (playlistUrlInput) {
        playlistUrlInput.focus();
        playlistUrlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  // Demo Preset Chips listener
  document.querySelectorAll('.preset-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const demoKey = chip.getAttribute('data-demo');
      let demoUrl = 'https://www.youtube.com/playlist?list=mock-js';
      if (demoKey === 'uiux') demoUrl = 'https://www.youtube.com/playlist?list=mock-uiux';
      if (demoKey === 'python') demoUrl = 'https://www.youtube.com/playlist?list=mock-python';

      playlistUrlInput.value = demoUrl;
      handlePlaylistAnalysis();
    });
  });

  // Playlist Analysis Submit
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

  // Create Plan Action
  if (createPlanBtn) {
    createPlanBtn.addEventListener('click', () => {
      if (!activePlaylistId) {
        showError('Analysis failed. Please try analyzing the playlist again.');
        return;
      }
      localStorage.setItem('selectedPlaylistId', activePlaylistId);
      window.location.href = 'setup.html';
    });
  }
}

/** Live IST Clock Timer */
function initLiveClock() {
  const clockEl = document.getElementById('live-ist-clock');
  if (!clockEl) return;

  function updateTime() {
    const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const istTime = new Date().toLocaleTimeString('en-US', options);
    clockEl.textContent = istTime;
  }
  updateTime();
  setInterval(updateTime, 1000);
}

function updateLoadingStatus(msg) {
  const statusText = document.getElementById('loading-status-text');
  if (statusText) statusText.textContent = msg;
}

function displayPlaylistPreview(playlist) {
  activePlaylistId = playlist.id;
  cardTitle.textContent = playlist.title;
  cardCreator.textContent = `by ${playlist.creator}`;
  cardVideoCount.textContent = playlist.videoCount;
  cardVideoCountBadge.textContent = playlist.videoCount;
  cardDuration.textContent = playlist.durationHours >= 1 ? `${playlist.durationHours} Hours` : 'Less than 1 Hour';
  cardEstDays.textContent = `${playlist.estimatedDays} Days`;
  cardCategory.textContent = playlist.category || 'Course';

  if (playlist.thumbnailUrl) {
    playlistThumb.style.background = `url('${playlist.thumbnailUrl}') center/cover no-repeat`;
    playlistThumb.textContent = '';
  } else {
    playlistThumb.style.background = playlist.thumbnailGradient || 'var(--color-accent)';
    playlistThumb.textContent = playlist.title.split(' ').slice(0, 2).map(w => w[0]).join('');
  }

  localStorage.setItem('activePlaylistDetails', JSON.stringify(playlist));

  skeletonLoader.style.display = 'none';
  playlistPreview.style.display = 'block';

  if (typeof gsap !== 'undefined') {
    gsap.fromTo('#playlist-preview', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }
  playlistPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  if (analyzeBtn) {
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<span>Analyze</span><kbd>↵</kbd>';
  }
}

async function handlePlaylistAnalysis() {
  const url = playlistUrlInput.value.trim();
  hideError();
  playlistPreview.style.display = 'none';
  skeletonLoader.style.display = 'none';
  activePlaylistId = null;

  if (!url) {
    showError('Please paste a YouTube playlist URL to analyze.');
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = 'Analyzing...';
  skeletonLoader.style.display = 'block';

  try {
    updateLoadingStatus('Connecting to YouTube API...');
    const response = await fetch(`/api/playlist?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('API offline');
    const playlist = await response.json();
    displayPlaylistPreview(playlist);
  } catch (err) {
    // Fallback to rich mock data based on URL keyword
    const clean = url.toLowerCase();
    let mock = null;
    if (clean.includes('uiux') || clean.includes('design')) {
      mock = window.PlaylistPilotData.playlists.find(p => p.id === 'uiux-course');
    } else if (clean.includes('python') || clean.includes('algo')) {
      mock = window.PlaylistPilotData.playlists.find(p => p.id === 'python-algo');
    } else {
      mock = window.PlaylistPilotData.playlists.find(p => p.id === 'js-course');
    }

    if (mock) {
      updateLoadingStatus('Simulating analysis (offline mode)…');
      setTimeout(() => displayPlaylistPreview(mock), 600);
    } else {
      skeletonLoader.style.display = 'none';
      showError('Please enter a valid YouTube playlist URL.');
      analyzeBtn.disabled = false;
      analyzeBtn.innerHTML = '<span>Analyze</span><kbd>↵</kbd>';
    }
  }
}

function showError(msg) {
  if (!urlErrorBox) return;
  urlErrorBox.style.display = 'flex';
  urlErrorText.textContent = msg;
}

function hideError() {
  if (!urlErrorBox) return;
  urlErrorBox.style.display = 'none';
}

function initHeroMotionSequence() {
  if (typeof gsap === 'undefined') return;

  gsap.from('.site-header', {
    y: -25,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
    clearProps: 'transform,opacity'
  });

  gsap.from('.eyebrow', {
    y: 15,
    opacity: 0,
    duration: 0.5,
    delay: 0.1,
    ease: 'power2.out',
    clearProps: 'transform,opacity'
  });

  gsap.from('.hero-title', {
    y: 20,
    opacity: 0,
    duration: 0.7,
    delay: 0.18,
    ease: 'power3.out',
    clearProps: 'transform,opacity'
  });

  gsap.from('.hero-subtitle', {
    y: 15,
    opacity: 0,
    duration: 0.6,
    delay: 0.25,
    ease: 'power2.out',
    clearProps: 'transform,opacity'
  });

  gsap.from('.ask-form', {
    scale: 0.96,
    y: 15,
    opacity: 0,
    duration: 0.6,
    delay: 0.32,
    ease: 'power2.out',
    clearProps: 'all'
  });

  gsap.from('.preset-chips .chip', {
    y: 10,
    opacity: 0,
    duration: 0.4,
    stagger: 0.06,
    delay: 0.4,
    ease: 'power2.out',
    clearProps: 'transform,opacity'
  });
}

function initScrollReveals() {
  const cards = document.querySelectorAll('.project-card, .section-header');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    cards.forEach(card => {
      card.classList.add('reveal-on-scroll');
      observer.observe(card);
    });
  } else {
    cards.forEach(card => card.classList.add('reveal-active'));
  }
}

function initTypewriterEffect() {
  const typewriterElem = document.getElementById('typewriter-text');
  if (!typewriterElem) return;

  const phrases = [
    "10-day roadmaps.",
    "structured syllabi.",
    "actionable study plans.",
    "calibrated schedules."
  ];

  let phraseIndex = 0;
  let charIndex = phrases[0].length;
  let isDeleting = false;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      charIndex--;
    } else {
      charIndex++;
    }

    typewriterElem.textContent = currentPhrase.substring(0, charIndex);

    let typeSpeed = isDeleting ? 35 : 75;

    if (!isDeleting && charIndex === currentPhrase.length) {
      typeSpeed = 2200; // Pause at end of phrase
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 350; // Pause before typing next phrase
    }

    setTimeout(type, typeSpeed);
  }

  setTimeout(type, 1200);
}

function initCustomCursorSpotlight() {
  // Only create cursor follower on devices with fine pointer (mouse/trackpad)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const cursorDot = document.createElement('div');
  cursorDot.className = 'custom-cursor-dot';

  const cursorRing = document.createElement('div');
  cursorRing.className = 'custom-cursor-ring';

  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let isVisible = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    }
    cursorDot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
  });

  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });

  function renderRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0)`;
    requestAnimationFrame(renderRing);
  }

  requestAnimationFrame(renderRing);

  // Hover magnetic expand on interactive elements
  const interactiveElems = document.querySelectorAll('a, button, .project-card, input, .chip, details');
  interactiveElems.forEach(el => {
    el.addEventListener('mouseenter', () => cursorRing.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('cursor-hover'));
  });
}

async function initRealVisitorTracker() {
  const countEl = document.getElementById('hero-visitor-count');
  if (!countEl) return;

  // Track unique real visits persistently in localStorage & sessionStorage
  let realVisits = parseInt(localStorage.getItem('playlistpilot_real_visits') || '1', 10);

  if (!sessionStorage.getItem('playlistpilot_session_counted')) {
    realVisits += 1;
    localStorage.setItem('playlistpilot_real_visits', realVisits.toString());
    sessionStorage.setItem('playlistpilot_session_counted', 'true');
  }

  countEl.textContent = realVisits.toLocaleString();

  // Optionally fetch real-time public hit counter API for global counts with graceful fallback
  try {
    const res = await fetch('https://api.counterapi.dev/v1/playlistpilot_app_v2/visits/up');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.count === 'number') {
        countEl.textContent = data.count.toLocaleString();
      }
    }
  } catch (_) {
    // Graceful fallback to real local counter
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLandingPage);
} else {
  initLandingPage();
}
