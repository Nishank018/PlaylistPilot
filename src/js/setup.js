// Setup Page JS - Ultra-Sleek 2026 Liquid Glass System
let activePlaylistId = null;
let form, hoursInput, hoursError, generateBtn;
let emptyState, contentSection, playlistBadge;
let minusBtn, plusBtn;

function initSetupPage() {
  form = document.getElementById('learningPreferencesForm');
  hoursInput = document.getElementById('hoursPerDay');
  hoursError = document.getElementById('hoursError');
  generateBtn = document.getElementById('generatePlanBtn');

  emptyState = document.getElementById('setupEmptyState');
  contentSection = document.getElementById('setupContent');
  playlistBadge = document.getElementById('playlistTag');

  minusBtn = document.getElementById('hours-minus');
  plusBtn = document.getElementById('hours-plus');

  initLiveClock();
  initCustomCursorSpotlight();
  initSetupGSAPMotion();

  // Plus / Minus hours buttons with smooth micro-scale feedback
  if (minusBtn && hoursInput) {
    minusBtn.addEventListener('click', () => {
      let val = parseFloat(hoursInput.value) || 2.0;
      if (val > 0.5) {
        hoursInput.value = (val - 0.5).toFixed(1);
        triggerInputPulse();
        validateHours();
      }
    });
  }

  if (plusBtn && hoursInput) {
    plusBtn.addEventListener('click', () => {
      let val = parseFloat(hoursInput.value) || 2.0;
      if (val < 8.0) {
        hoursInput.value = (val + 0.5).toFixed(1);
        triggerInputPulse();
        validateHours();
      }
    });
  }

  // Playlist Lookup
  const selectedId = localStorage.getItem('selectedPlaylistId');
  if (!selectedId) {
    if (contentSection) contentSection.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  const playlist = loadPlaylistDetails(selectedId);
  const setupPlaylistThumb = document.getElementById('setupPlaylistThumb');
  const setupCourseTitle = document.getElementById('setupCourseTitle');
  const setupCourseMeta = document.getElementById('setupCourseMeta');

  const thumbUrl = playlist.thumbnailUrl || (playlist.id === 'uiux-course' ? 'https://i.ytimg.com/vi/c9Wg6Cb_YlU/hqdefault.jpg' : (playlist.id === 'python-algo' ? 'https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg' : 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg'));

  if (setupPlaylistThumb) {
    setupPlaylistThumb.src = thumbUrl;
    setupPlaylistThumb.onerror = () => {
      setupPlaylistThumb.src = 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg';
    };
  }
  if (setupCourseTitle && playlist.title) {
    setupCourseTitle.textContent = playlist.title;
  }
  if (setupCourseMeta) {
    setupCourseMeta.textContent = `by ${playlist.creator || 'Code Academy'} · ${playlist.videoCount || 0} Videos · ${playlist.durationHours || 24}h Total`;
  }
  if (playlistBadge && playlist.title) {
    playlistBadge.textContent = `Course: ${playlist.title}`;
  }

  // Restore previously calibrated preferences if available
  const savedHours = localStorage.getItem('hoursPerDay');
  if (savedHours && hoursInput) {
    hoursInput.value = parseFloat(savedHours).toFixed(1);
  }

  const savedSpeed = localStorage.getItem('playbackSpeed');
  if (savedSpeed && form) {
    const radio = form.querySelector(`input[name="playbackSpeed"][value="${savedSpeed}"]`);
    if (radio) radio.checked = true;
  }

  const savedIntensity = localStorage.getItem('intensity');
  if (savedIntensity && form) {
    const radio = form.querySelector(`input[name="intensity"][value="${savedIntensity}"]`);
    if (radio) radio.checked = true;
  }

  const savedRevision = localStorage.getItem('revisionDays');
  if (savedRevision !== null) {
    const revCheck = document.getElementById('revisionDays');
    if (revCheck) revCheck.checked = (savedRevision === 'true');
  }

  const savedGoal = localStorage.getItem('completionGoal');
  if (savedGoal) {
    const goalSelect = document.getElementById('completionGoal');
    if (goalSelect) goalSelect.value = savedGoal;
  }

  if (hoursInput) {
    hoursInput.addEventListener('input', validateHours);
  }

  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
}

function triggerInputPulse() {
  if (!hoursInput || typeof gsap === 'undefined') return;
  gsap.fromTo(hoursInput, 
    { scale: 1.2, color: 'var(--color-red-dot)' }, 
    { scale: 1, color: '', duration: 0.35, ease: 'back.out(2)' }
  );
}

function initSetupGSAPMotion() {
  if (typeof gsap === 'undefined') return;
  
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.fromTo('.section-header', 
    { opacity: 0, y: 30 }, 
    { opacity: 1, y: 0, duration: 0.7 }
  )
  .fromTo('#setupCardAnim', 
    { opacity: 0, y: 40, scale: 0.98 }, 
    { opacity: 1, y: 0, scale: 1, duration: 0.8, clearProps: 'all' }, 
    '-=0.4'
  )
  .fromTo('.form-section', 
    { opacity: 0, y: 20 }, 
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, clearProps: 'all' }, 
    '-=0.4'
  );
}

function initCustomCursorSpotlight() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let dot = document.querySelector('.custom-cursor-dot');
  let ring = document.querySelector('.custom-cursor-ring');

  if (!dot) {
    dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    document.body.appendChild(dot);
  }
  if (!ring) {
    ring = document.createElement('div');
    ring.className = 'custom-cursor-ring';
    document.body.appendChild(ring);
  }

  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.opacity = '1';
    ring.style.opacity = '1';
    dot.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
  });

  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate3d(${ringX - 18}px, ${ringY - 18}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  document.querySelectorAll('a, button, input, select, label, .chip').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
  });
}

function initLiveClock() {
  const clockEl = document.getElementById('live-ist-clock');
  if (!clockEl) return;

  function updateTime() {
    const options = { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' };
    clockEl.textContent = new Date().toLocaleTimeString('en-US', options);
  }
  updateTime();
  setInterval(updateTime, 1000);
}

function loadPlaylistDetails(id) {
  const cached = localStorage.getItem('activePlaylistDetails');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.id === id) return parsed;
    } catch (_) {}
  }
  return (window.PlaylistPilotData && window.PlaylistPilotData.playlists) 
    ? window.PlaylistPilotData.playlists.find(p => p.id === id) || {}
    : {};
}

function validateHours() {
  if (!hoursInput) return true;
  const val = parseFloat(hoursInput.value);
  const isValid = !isNaN(val) && val >= 0.5 && val <= 8;
  if (!isValid) {
    hoursInput.style.borderColor = 'var(--color-error)';
    if (hoursError) hoursError.style.display = 'flex';
    if (generateBtn) generateBtn.disabled = true;
  } else {
    hoursInput.style.borderColor = '';
    if (hoursError) hoursError.style.display = 'none';
    if (generateBtn) generateBtn.disabled = false;
  }
  return isValid;
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (!validateHours()) return;

  const hoursPerDay = parseFloat(hoursInput.value);
  const speedRadio = form.querySelector('input[name="playbackSpeed"]:checked');
  const playbackSpeed = speedRadio ? parseFloat(speedRadio.value) : 1.0;
  const intensityRadio = form.querySelector('input[name="intensity"]:checked');
  const intensity = intensityRadio ? intensityRadio.value : 'consistent';
  const revisionDays = document.getElementById('revisionDays').checked;
  const completionGoal = document.getElementById('completionGoal').value;

  localStorage.setItem('hoursPerDay', hoursPerDay.toString());
  localStorage.setItem('playbackSpeed', playbackSpeed.toString());
  localStorage.setItem('intensity', intensity);
  localStorage.setItem('revisionDays', revisionDays.toString());
  localStorage.setItem('completionGoal', completionGoal);

  window.location.href = 'plan.html';
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSetupPage);
} else {
  initSetupPage();
}
