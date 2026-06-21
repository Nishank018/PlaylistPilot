// PlaylistPilot - Plan Setup JS
// Manages form inputs, custom card selections, input validation, and preference persistence.

const init = () => {
  // --- DOM Elements ---
  const setupContent = document.getElementById('setup-content');
  const emptyState = document.getElementById('setup-empty-state');
  const playlistTag = document.getElementById('playlist-tag');
  
  const setupForm = document.getElementById('learning-preferences-form');
  const hoursInput = document.getElementById('hours-per-day');
  const hoursError = document.getElementById('hours-error');
  const generateBtn = document.getElementById('generate-plan-btn');

  // --- GSAP Animations ---
  if (typeof gsap !== 'undefined' && setupContent && setupContent.style.display !== 'none') {
    gsap.from('#setup-header-anim', { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
    gsap.from('#setup-card-anim', { opacity: 0, y: 30, duration: 0.8, delay: 0.1, ease: 'power4.out' });
  }

  // Check localStorage for a selected playlist
  const selectedPlaylistId = localStorage.getItem('selectedPlaylistId');
  
  if (!selectedPlaylistId) {
    if (setupContent) setupContent.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  // Load Playlist details for header badge
  let playlist = null;
  const activePlaylistDetails = localStorage.getItem('activePlaylistDetails');
  if (activePlaylistDetails) {
    try {
      const parsed = JSON.parse(activePlaylistDetails);
      if (parsed && parsed.id === selectedPlaylistId) {
        playlist = parsed;
      }
    } catch (err) {
      console.error('Error parsing activePlaylistDetails', err);
    }
  }

  if (!playlist) {
    playlist = window.PlaylistPilotData.playlists.find(p => p.id === selectedPlaylistId);
  }

  if (playlist && playlistTag) {
    playlistTag.textContent = `Course: ${playlist.title}`;
    playlistTag.className = 'badge badge-primary';
  } else if (playlistTag) {
    playlistTag.textContent = 'Custom Learning Plan';
  }

  // --- Real-time Validation for Hours Available ---
  if (hoursInput) {
    hoursInput.addEventListener('input', () => {
      validateHours();
    });
  }

  function validateHours() {
    const val = parseFloat(hoursInput.value);
    let isValid = true;

    if (isNaN(val) || val < 0.5 || val > 8) {
      isValid = false;
      hoursInput.style.borderColor = 'var(--color-error)';
      hoursError.style.display = 'flex';
      generateBtn.classList.add('btn-disabled');
      generateBtn.disabled = true;
    } else {
      hoursInput.style.borderColor = '';
      hoursError.style.display = 'none';
      generateBtn.classList.remove('btn-disabled');
      generateBtn.disabled = false;
    }

    return isValid;
  }

  // --- Form Submission Handling ---
  if (setupForm) {
    setupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateHours()) {
        return;
      }

      // Collect Form Data
      const hoursPerDay = parseFloat(hoursInput.value);
      
      const selectedSpeedRadio = setupForm.querySelector('input[name="playbackSpeed"]:checked');
      const playbackSpeed = selectedSpeedRadio ? parseFloat(selectedSpeedRadio.value) : 1.0;
      
      const selectedIntensityRadio = setupForm.querySelector('input[name="intensity"]:checked');
      const intensity = selectedIntensityRadio ? selectedIntensityRadio.value : 'consistent';
      
      const revisionDaysChecked = document.getElementById('revision-days').checked;
      
      const completionGoal = document.getElementById('completion-goal').value;

      // Save to localStorage
      localStorage.setItem('hoursPerDay', hoursPerDay.toString());
      localStorage.setItem('playbackSpeed', playbackSpeed.toString());
      localStorage.setItem('intensity', intensity);
      localStorage.setItem('revisionDays', revisionDaysChecked.toString());
      localStorage.setItem('completionGoal', completionGoal);

      // Redirect to generated plan dashboard
      window.location.href = 'plan.html';
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

