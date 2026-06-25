// PlaylistPilot – Setup Page JavaScript
// --------------------------------------------------------------
// This file wires up the "Customize Learning Plan" page. It handles
// reading the selected playlist from localStorage, validating user
// input, persisting preferences, and finally navigating to the plan
// view. The code is deliberately written in a straightforward style
// with descriptive names and helpful comments – just like a developer
// would write when polishing a personal project.

/**
 * Initialise the page once the DOM is ready.
 */
function initSetupPage() {
  // ---------- DOM ELEMENTS ----------
  const form = document.getElementById('learning-preferences-form');
  const hoursInput = document.getElementById('hours-per-day');
  const hoursError = document.getElementById('hours-error');
  const generateBtn = document.getElementById('generate-plan-btn');
  const emptyState = document.getElementById('setup-empty-state');
  const contentSection = document.getElementById('setup-content');
  const playlistBadge = document.getElementById('playlist-tag');

  // ---------- ANIMATIONS (GSAP) ----------
  if (typeof gsap !== 'undefined' && contentSection && contentSection.style.display !== 'none') {
    gsap.from('#setup-header-anim', { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
    gsap.from('#setup-card-anim', { opacity: 0, y: 30, duration: 0.8, delay: 0.1, ease: 'power4.out' });
  }

  // ---------- PLAYLIST LOOKUP ----------
  const selectedId = localStorage.getItem('selectedPlaylistId');
  if (!selectedId) {
    // No playlist selected – show a friendly empty state.
    if (contentSection) contentSection.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return; // Nothing else to do.
  }

  // Try to retrieve the full playlist object.
  const playlist = loadPlaylistDetails(selectedId);
  if (playlistBadge) {
    playlistBadge.textContent = `Course: ${playlist.title}`;
    playlistBadge.className = 'badge badge-primary';
  }

  // ---------- VALIDATION ----------
  if (hoursInput) {
    hoursInput.addEventListener('input', () => validateHours(hoursInput, hoursError, generateBtn));
  }

  // ---------- FORM SUBMISSION ----------
  if (form) {
    form.addEventListener('submit', (e) => handleFormSubmit(e, {
      hoursInput,
      hoursError,
      generateBtn,
      form
    }));
  }
}

/**
 * Load playlist details either from the cached "activePlaylistDetails"
 * or from the bundled mock data.
 */
function loadPlaylistDetails(id) {
  const cached = localStorage.getItem('activePlaylistDetails');
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.id === id) return parsed;
    } catch (_) {
      // Silently ignore malformed JSON – fall back to mock data.
    }
  }
  // Fallback: look into the static mock data shipped with the app.
  return window.PlaylistPilotData.playlists.find(p => p.id === id) || {};
}

/**
 * Validate the "hours per day" field.
 * Returns true if the value is within the acceptable range.
 */
function validateHours(input, errorBox, submitBtn) {
  const val = parseFloat(input.value);
  const isValid = !isNaN(val) && val >= 0.5 && val <= 8;
  if (!isValid) {
    input.style.borderColor = 'var(--color-error)';
    errorBox.style.display = 'flex';
    submitBtn.classList.add('btn-disabled');
    submitBtn.disabled = true;
  } else {
    input.style.borderColor = '';
    errorBox.style.display = 'none';
    submitBtn.classList.remove('btn-disabled');
    submitBtn.disabled = false;
  }
  return isValid;
}

/**
 * Gather all form values, persist them, and navigate to the plan page.
 */
function handleFormSubmit(event, { hoursInput, hoursError, generateBtn, form }) {
  event.preventDefault();

  // Abort if the hours field is still invalid.
  if (!validateHours(hoursInput, hoursError, generateBtn)) return;

  // ----- Extract user selections -----
  const hoursPerDay = parseFloat(hoursInput.value);
  const speedRadio = form.querySelector('input[name="playbackSpeed"]:checked');
  const playbackSpeed = speedRadio ? parseFloat(speedRadio.value) : 1.0;
  const intensityRadio = form.querySelector('input[name="intensity"]:checked');
  const intensity = intensityRadio ? intensityRadio.value : 'consistent';
  const revisionDays = document.getElementById('revision-days').checked;
  const completionGoal = document.getElementById('completion-goal').value;

  // ----- Persist selections for the plan page -----
  localStorage.setItem('hoursPerDay', hoursPerDay.toString());
  localStorage.setItem('playbackSpeed', playbackSpeed.toString());
  localStorage.setItem('intensity', intensity);
  localStorage.setItem('revisionDays', revisionDays.toString());
  localStorage.setItem('completionGoal', completionGoal);

  // ----- Navigate to the generated plan -----
  window.location.href = 'plan.html';
}

// Kick off the initialisation once the DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSetupPage);
} else {
  initSetupPage();
}
