// PlaylistPilot - Generated Plan JS
// Implements the timeline generation algorithm, displays study metrics, and generates download text.

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const planContent = document.getElementById('plan-content');
  const emptyState = document.getElementById('plan-empty-state');
  
  // Header Info
  const planPlaylistTitle = document.getElementById('plan-playlist-title');
  const planPlaylistCreator = document.getElementById('plan-playlist-creator');
  const speedBadge = document.getElementById('speed-badge');
  const revisionBadge = document.getElementById('revision-badge');
  
  // Stats Grid
  const statTotalDays = document.getElementById('stat-total-days');
  const statHoursPerDay = document.getElementById('stat-hours-per-day');
  const statVideosPerDay = document.getElementById('stat-videos-per-day');
  const statEndDate = document.getElementById('stat-end-date');
  const progressBadge = document.getElementById('plan-progress-badge');

  // Preferences Sidebar
  const prefTargetTime = document.getElementById('pref-target-time');
  const prefSpeed = document.getElementById('pref-speed');
  const prefIntensity = document.getElementById('pref-intensity');
  const prefRevision = document.getElementById('pref-revision');
  const prefGoal = document.getElementById('pref-goal');
  const prefTotalRawDuration = document.getElementById('pref-total-raw-duration');
  const prefTotalAdjustedDuration = document.getElementById('pref-total-adjusted-duration');

  // Timeline & Actions
  const timelineContainer = document.getElementById('timeline-container');
  const downloadPlanBtn = document.getElementById('download-plan-btn');
  const regeneratePlanBtn = document.getElementById('regenerate-plan-btn');

  // --- Load localStorage Data & Check States ---
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

  // Find Playlist from mock data or local storage
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

  if (!playlist) {
    if (planContent) planContent.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  // --- Core Algorithm: Timeline Generation ---
  
  // Calculate daily time budget in seconds
  const baseDailySeconds = hoursPerDay * 3600;
  
  // Intensity multiplier
  let intensityMult = 1.0;
  if (intensity === 'casual') intensityMult = 0.8;
  if (intensity === 'intensive') intensityMult = 1.2;

  // Completion goal multiplier
  let goalMult = 1.0;
  if (completionGoal === 'fastest') goalMult = 1.1;
  if (completionGoal === 'comfortable') goalMult = 0.8;

  const dailyLimitSeconds = baseDailySeconds * intensityMult * goalMult;

  // Distribute videos into days
  const schedule = [];
  let currentDay = 1;
  let currentDayVideos = [];
  let currentDaySeconds = 0;
  let totalRawSeconds = 0;
  let totalAdjustedSeconds = 0;

  const videos = playlist.videos;

  for (let i = 0; i < videos.length; i++) {
    // 1. Revision Day Check (Insert review day every 7th day)
    if (revisionDays && currentDay % 7 === 0) {
      schedule.push({
        dayNumber: currentDay,
        isRevision: true,
        videos: [],
        totalAdjustedSeconds: 0
      });
      currentDay++;
      i--; // Reprocess current video on the next day
      continue;
    }

    const video = videos[i];
    const videoSeconds = video.durationSeconds;
    const adjustedVideoSeconds = videoSeconds * (1 / playbackSpeed);

    totalRawSeconds += videoSeconds;
    totalAdjustedSeconds += adjustedVideoSeconds;

    // 2. Greedy Packing Algorithm
    if (currentDayVideos.length === 0) {
      // If the day is completely empty, add the video regardless of length (prevents infinite loops on huge videos)
      currentDayVideos.push(video);
      currentDaySeconds += adjustedVideoSeconds;
    } else if (currentDaySeconds + adjustedVideoSeconds <= dailyLimitSeconds) {
      // Add to current day if within budget
      currentDayVideos.push(video);
      currentDaySeconds += adjustedVideoSeconds;
    } else {
      // Save current day schedule
      schedule.push({
        dayNumber: currentDay,
        isRevision: false,
        videos: currentDayVideos,
        totalAdjustedSeconds: currentDaySeconds
      });
      // Start a new day
      currentDay++;
      currentDayVideos = [];
      currentDaySeconds = 0;
      i--; // Reprocess this video on the next iteration
    }
  }

  // Push remaining videos
  if (currentDayVideos.length > 0) {
    schedule.push({
      dayNumber: currentDay,
      isRevision: false,
      videos: currentDayVideos,
      totalAdjustedSeconds: currentDaySeconds
    });
  }

  // --- Display calculations ---
  
  // Header Meta
  planPlaylistTitle.textContent = playlist.title;
  planPlaylistCreator.textContent = playlist.creator;
  speedBadge.textContent = `${playbackSpeed}x Playback`;
  revisionBadge.textContent = `Revision Days: ${revisionDays ? 'On' : 'Off'}`;
  progressBadge.textContent = `${playlist.videoCount} Videos Total`;

  // Stats Grid
  const countStudyDays = schedule.filter(d => !d.isRevision).length;
  const avgVideosPerDay = (playlist.videoCount / countStudyDays).toFixed(1);
  
  statTotalDays.innerHTML = `${schedule.length} <span>days</span>`;
  statHoursPerDay.innerHTML = `${hoursPerDay.toFixed(1)} <span>hrs</span>`;
  statVideosPerDay.innerHTML = avgVideosPerDay;

  // Completion Date Calculation
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + schedule.length - 1);
  const formattedEndDate = endDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  statEndDate.textContent = formattedEndDate;

  // Sidebar Summary Info
  prefTargetTime.textContent = `${hoursPerDay.toFixed(1)} hrs/day`;
  prefSpeed.textContent = `${playbackSpeed}x`;
  prefIntensity.textContent = intensity;
  prefRevision.textContent = revisionDays ? 'Enabled' : 'Disabled';
  prefGoal.textContent = completionGoal;
  prefTotalRawDuration.textContent = formatHoursMinutes(totalRawSeconds);
  prefTotalAdjustedDuration.textContent = formatHoursMinutes(totalAdjustedSeconds);

  // --- Render Timeline DOM ---
  renderTimeline(schedule);

  // --- Action Listeners ---
  if (regeneratePlanBtn) {
    regeneratePlanBtn.addEventListener('click', () => {
      window.location.href = 'setup.html';
    });
  }

  if (downloadPlanBtn) {
    downloadPlanBtn.addEventListener('click', () => {
      triggerDownload(playlist, schedule, formattedEndDate);
    });
  }

  // --- Helper Functions ---
  
  function formatHoursMinutes(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }

  function formatWatchTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  }

  function renderTimeline(daysSchedule) {
    timelineContainer.innerHTML = '';
    
    daysSchedule.forEach(day => {
      const card = document.createElement('div');
      card.className = `timeline-day-card ${day.isRevision ? 'revision-day' : ''}`;
      // Highlight the first day as active
      if (day.dayNumber === 1) {
        card.classList.add('active');
      }

      if (day.isRevision) {
        card.innerHTML = `
          <div class="day-header">
            <span class="day-title">Day ${day.dayNumber} — Revision & Rest</span>
            <span class="day-watchtime" style="color: var(--color-success); border-color: var(--color-success);">0m</span>
          </div>
          <p class="revision-desc">
            No new videos scheduled for today. Review your notes, consolidate key takeaways, and work on small practice challenges. Build something with the concepts from the past week.
          </p>
        `;
      } else {
        const videosHTML = day.videos.map(vid => {
          const adjSec = vid.durationSeconds * (1 / playbackSpeed);
          const formattedDuration = formatWatchTime(adjSec);
          return `
            <div class="day-video-item">
              <span class="video-name">${vid.title}</span>
              <span class="video-duration">${formattedDuration}</span>
            </div>
          `;
        }).join('');

        card.innerHTML = `
          <div class="day-header">
            <span class="day-title">Day ${day.dayNumber}</span>
            <span class="day-watchtime">Watch Time: ${formatWatchTime(day.totalAdjustedSeconds)}</span>
          </div>
          <div class="day-videos-list">
            ${videosHTML}
          </div>
        `;
      }
      
      timelineContainer.appendChild(card);
    });
  }

  // Client-side markdown file generation and download
  function triggerDownload(pl, daysSchedule, estDate) {
    let md = `# PlaylistPilot Study Plan: ${pl.title}\n`;
    md += `Created by: ${pl.creator}\n`;
    md += `Generated on: ${new Date().toLocaleDateString('en-US')}\n\n`;
    
    md += `## Course Settings & Schedule Summary\n`;
    md += `- **Total Duration (Raw)**: ${formatHoursMinutes(totalRawSeconds)}\n`;
    md += `- **Adjusted Study Length**: ${formatHoursMinutes(totalAdjustedSeconds)} (@ ${playbackSpeed}x speed)\n`;
    md += `- **Study Time Target**: ${hoursPerDay} hrs/day\n`;
    md += `- **Weekly Revision**: ${revisionDays ? 'Enabled' : 'Disabled'}\n`;
    md += `- **Completion Schedule**: ${daysSchedule.length} days\n`;
    md += `- **Estimated Completion Date**: ${estDate}\n\n`;
    
    md += `## Day-by-Day Syllabus\n\n`;

    daysSchedule.forEach(day => {
      if (day.isRevision) {
        md += `### Day ${day.dayNumber}: Revision & Rest\n`;
        md += `> No new videos today. Take this time to review concepts and build practice applications.\n\n`;
      } else {
        md += `### Day ${day.dayNumber} (Watch Time: ${formatWatchTime(day.totalAdjustedSeconds)})\n`;
        day.videos.forEach(vid => {
          const adjSec = vid.durationSeconds * (1 / playbackSpeed);
          md += `- [ ] ${vid.title} (${formatWatchTime(adjSec)})\n`;
        });
        md += `\n`;
      }
    });

    // Create file blob and click hidden anchor to download
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Format name to slug
    const filename = pl.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-learning-plan.md';
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});
