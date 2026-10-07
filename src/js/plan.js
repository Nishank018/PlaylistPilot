// Plan Page JS - Interactive Dashboard matching heynishank.vercel.app style

const initPlanPage = () => {
  const planContent = document.getElementById('plan-content');
  const emptyState = document.getElementById('plan-empty-state');

  const planPlaylistTitle = document.getElementById('plan-playlist-title');
  const planPlaylistCreator = document.getElementById('plan-playlist-creator');
  const speedBadge = document.getElementById('speed-badge');
  const revisionBadge = document.getElementById('revision-badge');
  const progressBadge = document.getElementById('plan-progress-badge');

  const statTotalDays = document.getElementById('stat-total-days');
  const statHoursPerDay = document.getElementById('stat-hours-per-day');
  const statVideosPerDay = document.getElementById('stat-videos-per-day');
  const statEndDate = document.getElementById('stat-end-date');

  const progressPercentLabel = document.getElementById('progress-percent-label');
  const progressFill = document.getElementById('plan-progress-fill');

  const prefTargetTime = document.getElementById('pref-target-time');
  const prefSpeed = document.getElementById('pref-speed');
  const prefIntensity = document.getElementById('pref-intensity');
  const prefRevision = document.getElementById('pref-revision');
  const prefGoal = document.getElementById('pref-goal');
  const prefTotalRawDuration = document.getElementById('pref-total-raw-duration');
  const prefTotalAdjustedDuration = document.getElementById('pref-total-adjusted-duration');

  const timelineContainer = document.getElementById('timeline-container');
  const downloadPlanBtn = document.getElementById('download-plan-btn');
  const regeneratePlanBtn = document.getElementById('regenerate-plan-btn');
  const resetProgressBtn = document.getElementById('reset-progress-btn');

  initLiveClock();

  // Load localStorage preferences
  const selectedPlaylistId = localStorage.getItem('selectedPlaylistId');
  const hoursPerDay = parseFloat(localStorage.getItem('hoursPerDay') || '2');
  const playbackSpeed = parseFloat(localStorage.getItem('playbackSpeed') || '1');
  const intensity = localStorage.getItem('intensity') || 'consistent';
  const revisionDays = localStorage.getItem('revisionDays') === 'true';
  const completionGoal = localStorage.getItem('completionGoal') || 'balanced';

  if (!selectedPlaylistId) {
    if (planContent) planContent.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  // Load Playlist details
  let playlist = null;
  const activePlaylistDetails = localStorage.getItem('activePlaylistDetails');
  if (activePlaylistDetails) {
    try {
      const parsed = JSON.parse(activePlaylistDetails);
      if (parsed && parsed.id === selectedPlaylistId) playlist = parsed;
    } catch (_) {}
  }
  if (!playlist) {
    playlist = window.PlaylistPilotData.playlists.find(p => p.id === selectedPlaylistId);
  }

  if (!playlist) {
    if (planContent) planContent.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  // Calculate Schedule Algorithm
  const baseDailySeconds = hoursPerDay * 3600;
  let intensityMult = 1.0;
  if (intensity === 'casual') intensityMult = 0.8;
  if (intensity === 'intensive') intensityMult = 1.2;

  let goalMult = 1.0;
  if (completionGoal === 'fastest') goalMult = 1.1;
  if (completionGoal === 'comfortable') goalMult = 0.8;

  const dailyLimitSeconds = baseDailySeconds * intensityMult * goalMult;

  const totalRawSeconds = playlist.videos.reduce((sum, v) => sum + v.durationSeconds, 0);
  const totalAdjustedSeconds = playlist.videos.reduce((sum, v) => sum + (v.durationSeconds * (1 / playbackSpeed)), 0);

  const schedule = [];
  let currentDay = 1;
  let currentDayVideos = [];
  let currentDaySeconds = 0;

  const videos = playlist.videos;
  let videoIndex = 0;
  let currentVideoProgress = 0;

  while (videoIndex < videos.length) {
    if (revisionDays && currentDay % 7 === 0) {
      schedule.push({
        dayNumber: currentDay,
        isRevision: true,
        videos: [],
        totalAdjustedSeconds: 0
      });
      currentDay++;
      continue;
    }

    const video = videos[videoIndex];
    const V_dur = video.durationSeconds;
    const remainingDaySeconds = dailyLimitSeconds - currentDaySeconds;
    const rawSecondsCapacity = remainingDaySeconds * playbackSpeed;
    const rawSecondsRemainingInVideo = V_dur - currentVideoProgress;

    let overlapSeconds = 0;
    if (currentVideoProgress > 0) {
      overlapSeconds = Math.min(180, Math.floor(rawSecondsCapacity * 0.2));
      overlapSeconds = Math.min(overlapSeconds, currentVideoProgress);
    }

    const rawToWatch = rawSecondsRemainingInVideo + overlapSeconds;
    const adjustedToWatch = rawToWatch / playbackSpeed;

    if (adjustedToWatch <= remainingDaySeconds) {
      let startSecond = 0;
      let endSecond = V_dur;
      let isSegment = false;

      if (currentVideoProgress > 0) {
        startSecond = currentVideoProgress - overlapSeconds;
        endSecond = V_dur;
        isSegment = true;
      }

      currentDayVideos.push({
        id: `${selectedPlaylistId}_v${videoIndex}_d${currentDay}`,
        title: video.title,
        durationSeconds: rawToWatch,
        isSegment: isSegment,
        startSecond: startSecond,
        endSecond: endSecond,
        originalTitle: video.title
      });

      currentDaySeconds += adjustedToWatch;
      videoIndex++;
      currentVideoProgress = 0;
    } else {
      const startSecond = Math.max(0, currentVideoProgress - overlapSeconds);
      const endSecond = Math.min(V_dur, startSecond + rawSecondsCapacity);
      const actualRawWatched = endSecond - startSecond;
      const actualAdjustedWatched = actualRawWatched / playbackSpeed;

      currentDayVideos.push({
        id: `${selectedPlaylistId}_v${videoIndex}_d${currentDay}`,
        title: video.title,
        durationSeconds: actualRawWatched,
        isSegment: true,
        startSecond: startSecond,
        endSecond: endSecond,
        originalTitle: video.title
      });

      currentDaySeconds += actualAdjustedWatched;
      schedule.push({
        dayNumber: currentDay,
        isRevision: false,
        videos: currentDayVideos,
        totalAdjustedSeconds: currentDaySeconds
      });

      currentDay++;
      currentDayVideos = [];
      currentDaySeconds = 0;
      currentVideoProgress = endSecond;
    }
  }

  if (currentDayVideos.length > 0) {
    schedule.push({
      dayNumber: currentDay,
      isRevision: false,
      videos: currentDayVideos,
      totalAdjustedSeconds: currentDaySeconds
    });
  }

  // Load Completed state from localStorage
  const completedStorageKey = `completed_videos_${selectedPlaylistId}`;
  let completedVideoIds = new Set(JSON.parse(localStorage.getItem(completedStorageKey) || '[]'));

  // Header display
  const planPlaylistThumb = document.getElementById('planPlaylistThumb');
  const thumbUrl = playlist.thumbnailUrl || (playlist.id === 'uiux-course' ? 'https://i.ytimg.com/vi/c9Wg6Cb_YlU/hqdefault.jpg' : (playlist.id === 'python-algo' ? 'https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg' : 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg'));
  if (planPlaylistThumb) {
    planPlaylistThumb.src = thumbUrl;
    planPlaylistThumb.onerror = () => {
      planPlaylistThumb.src = 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg';
    };
  }

  planPlaylistTitle.textContent = playlist.title;
  planPlaylistCreator.textContent = playlist.creator;
  speedBadge.textContent = `${playbackSpeed}x Playback`;
  revisionBadge.textContent = `Revision Days: ${revisionDays ? 'On' : 'Off'}`;
  progressBadge.textContent = `${playlist.videoCount} Videos Total`;

  const countStudyDays = schedule.filter(d => !d.isRevision).length;
  const avgVideosPerDay = (playlist.videoCount / countStudyDays).toFixed(1);

  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + schedule.length - 1);
  statEndDate.textContent = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  statTotalDays.innerHTML = `${schedule.length} <span>days</span>`;
  statHoursPerDay.innerHTML = `${hoursPerDay.toFixed(1)} <span>hrs</span>`;
  statVideosPerDay.textContent = avgVideosPerDay;

  const intensityLabels = { casual: 'Casual (80%)', consistent: 'Consistent (100%)', intensive: 'Intensive (120%)' };
  const goalLabels = { balanced: 'Balanced Target', fastest: 'Fastest Sprint', comfortable: 'Comfortable Buffer' };

  prefTargetTime.textContent = `${hoursPerDay.toFixed(1)} hrs/day`;
  prefSpeed.textContent = `${playbackSpeed}x`;
  prefIntensity.textContent = intensityLabels[intensity] || intensity;
  prefRevision.textContent = revisionDays ? 'Enabled' : 'Disabled';
  prefGoal.textContent = goalLabels[completionGoal] || completionGoal;
  prefTotalRawDuration.textContent = formatHoursMinutes(totalRawSeconds);
  prefTotalAdjustedDuration.textContent = formatHoursMinutes(totalAdjustedSeconds);

  // Render & Update UI
  renderTimeline(schedule, 'all');
  updateProgressUI();

  // Filter Tabs Event Listeners
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTimeline(schedule, tab.getAttribute('data-filter'));
    });
  });

  // Action Buttons
  if (regeneratePlanBtn) {
    regeneratePlanBtn.addEventListener('click', () => {
      window.location.href = 'setup.html';
    });
  }

  if (resetProgressBtn) {
    resetProgressBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset your course progress?')) {
        completedVideoIds.clear();
        localStorage.removeItem(completedStorageKey);
        renderTimeline(schedule, 'all');
        updateProgressUI();
      }
    });
  }

  if (downloadPlanBtn) {
    downloadPlanBtn.addEventListener('click', () => {
      triggerDownload(playlist, schedule, endDate.toLocaleDateString());
    });
  }

  function updateProgressUI() {
    let totalItems = 0;
    schedule.forEach(d => { totalItems += d.videos.length; });
    const completedCount = completedVideoIds.size;
    const percent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    if (progressPercentLabel) progressPercentLabel.textContent = `${percent}% Completed (${completedCount}/${totalItems} items)`;
    if (progressFill) progressFill.style.width = `${percent}%`;
  }

  function renderTimeline(daysSchedule, filterMode) {
    timelineContainer.innerHTML = '';

    daysSchedule.forEach(day => {
      // Check filtering
      const isDayComplete = !day.isRevision && day.videos.length > 0 && day.videos.every(v => completedVideoIds.has(v.id));

      if (filterMode === 'incomplete' && (isDayComplete || day.isRevision)) return;
      if (filterMode === 'completed' && !isDayComplete) return;
      if (filterMode === 'revision' && !day.isRevision) return;

      const card = document.createElement('div');
      card.className = `timeline-day-card ${day.isRevision ? 'revision-day' : ''} ${isDayComplete ? 'day-completed' : ''}`;

      if (day.isRevision) {
        card.innerHTML = `
          <div class="day-header">
            <span class="day-title">Day ${day.dayNumber} — Revision & Rest</span>
            <span class="day-watchtime">Rest Day</span>
          </div>
          <p class="revision-desc">
            No new videos scheduled today. Review your notes, consolidate key concepts, or build a small practice project.
          </p>
        `;
      } else {
        const videosHTML = day.videos.map(vid => {
          const isChecked = completedVideoIds.has(vid.id);
          const adjSec = vid.durationSeconds * (1 / playbackSpeed);
          const formattedDuration = formatWatchTime(adjSec);

          return `
            <div class="day-video-item ${isChecked ? 'video-done' : ''}" data-video-id="${vid.id}">
              <input type="checkbox" class="video-check" ${isChecked ? 'checked' : ''} />
              <span class="video-name">${vid.title}</span>
              <span class="video-duration">${formattedDuration}</span>
            </div>
          `;
        }).join('');

        card.innerHTML = `
          <div class="day-header">
            <div class="day-title-group">
              <input type="checkbox" class="day-checkbox" ${isDayComplete ? 'checked' : ''} title="Toggle entire day" />
              <span class="day-title">Day ${day.dayNumber}</span>
            </div>
            <span class="day-watchtime">Target: ${formatWatchTime(day.totalAdjustedSeconds)}</span>
          </div>
          <div class="day-videos-list">
            ${videosHTML}
          </div>
        `;

        // Checkbox listeners for individual videos
        card.querySelectorAll('.video-check').forEach(chk => {
          chk.addEventListener('change', (e) => {
            const item = e.target.closest('.day-video-item');
            const vId = item.getAttribute('data-video-id');
            if (e.target.checked) {
              completedVideoIds.add(vId);
              item.classList.add('video-done');
            } else {
              completedVideoIds.delete(vId);
              item.classList.remove('video-done');
            }
            localStorage.setItem(completedStorageKey, JSON.stringify(Array.from(completedVideoIds)));
            updateProgressUI();
          });
        });

        // Day master checkbox listener
        const dayCheck = card.querySelector('.day-checkbox');
        if (dayCheck) {
          dayCheck.addEventListener('change', (e) => {
            const checked = e.target.checked;
            day.videos.forEach(v => {
              if (checked) completedVideoIds.add(v.id);
              else completedVideoIds.delete(v.id);
            });
            localStorage.setItem(completedStorageKey, JSON.stringify(Array.from(completedVideoIds)));
            renderTimeline(daysSchedule, filterMode);
            updateProgressUI();
          });
        }
      }

      timelineContainer.appendChild(card);
    });
  }

  function formatHoursMinutes(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  function formatWatchTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
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

  function triggerDownload(pl, daysSchedule, estDate) {
    if (typeof window.jspdf === 'undefined') {
      alert('PDF generation library loading. Please try again.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(pl.title, 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Course by: ${pl.creator} | Target Date: ${estDate}`, 20, 33);

    let y = 45;
    daysSchedule.forEach(day => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      if (day.isRevision) {
        doc.text(`Day ${day.dayNumber}: Revision & Rest`, 20, y);
        y += 8;
      } else {
        doc.text(`Day ${day.dayNumber} (Target: ${formatWatchTime(day.totalAdjustedSeconds)})`, 20, y);
        y += 6;
        day.videos.forEach(v => {
          doc.text(`  • ${v.title}`, 25, y);
          y += 5;
        });
        y += 3;
      }
    });

    doc.save(`${pl.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-plan.pdf`);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlanPage);
} else {
  initPlanPage();
}
