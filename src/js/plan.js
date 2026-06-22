// PlaylistPilot - Generated Plan JS
// Implements the timeline generation algorithm, displays study metrics, and generates PDF downloads.

const init = () => {
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
  const baseDailySeconds = hoursPerDay * 3600;
  
  let intensityMult = 1.0;
  if (intensity === 'casual') intensityMult = 0.8;
  if (intensity === 'intensive') intensityMult = 1.2;

  let goalMult = 1.0;
  if (completionGoal === 'fastest') goalMult = 1.1;
  if (completionGoal === 'comfortable') goalMult = 0.8;

  const dailyLimitSeconds = baseDailySeconds * intensityMult * goalMult;

  // Calculate totals from original playlist to avoid segment double-counting
  const totalRawSeconds = playlist.videos.reduce((sum, v) => sum + v.durationSeconds, 0);
  const totalAdjustedSeconds = playlist.videos.reduce((sum, v) => sum + (v.durationSeconds * (1 / playbackSpeed)), 0);

  const schedule = [];
  let currentDay = 1;
  let currentDayVideos = [];
  let currentDaySeconds = 0; // adjusted

  const videos = playlist.videos;
  let videoIndex = 0;
  let currentVideoProgress = 0; // raw seconds of current video processed

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

    // Capacity on the current day (adjusted seconds)
    const remainingDaySeconds = dailyLimitSeconds - currentDaySeconds;

    // How many raw seconds of capacity do we have?
    const rawSecondsCapacity = remainingDaySeconds * playbackSpeed;

    // Let's decide if we need to split
    const rawSecondsRemainingInVideo = V_dur - currentVideoProgress;

    // Determine overlap if this is a continuation segment
    let overlapSeconds = 0;
    if (currentVideoProgress > 0) {
      // Safe overlap (up to 3 minutes, but at most 20% of the day's remaining capacity)
      overlapSeconds = Math.min(180, Math.floor(rawSecondsCapacity * 0.2));
      overlapSeconds = Math.min(overlapSeconds, currentVideoProgress);
    }

    // Adjusted seconds needed to watch the remainder of the video including overlap
    const rawToWatch = rawSecondsRemainingInVideo + overlapSeconds;
    const adjustedToWatch = rawToWatch / playbackSpeed;

    if (adjustedToWatch <= remainingDaySeconds) {
      // Fits completely!
      let title = video.title;
      let startSecond = 0;
      let endSecond = V_dur;
      let isSegment = false;

      if (currentVideoProgress > 0) {
        startSecond = currentVideoProgress - overlapSeconds;
        endSecond = V_dur;
        isSegment = true;
      }

      currentDayVideos.push({
        title: title,
        durationSeconds: rawToWatch, // raw seconds including overlap
        isSegment: isSegment,
        startSecond: startSecond,
        endSecond: endSecond,
        originalTitle: video.title,
        originalDuration: V_dur
      });

      currentDaySeconds += adjustedToWatch;
      
      // Move to next video
      videoIndex++;
      currentVideoProgress = 0;
    } else {
      // Does not fit! We must split.
      const startSecond = Math.max(0, currentVideoProgress - overlapSeconds);
      const endSecond = Math.min(V_dur, startSecond + rawSecondsCapacity);
      const actualRawWatched = endSecond - startSecond;
      const actualAdjustedWatched = actualRawWatched / playbackSpeed;

      currentDayVideos.push({
        title: video.title,
        durationSeconds: actualRawWatched,
        isSegment: true,
        startSecond: startSecond,
        endSecond: endSecond,
        originalTitle: video.title,
        originalDuration: V_dur
      });

      currentDaySeconds += actualAdjustedWatched;

      // Close the current day
      schedule.push({
        dayNumber: currentDay,
        isRevision: false,
        videos: currentDayVideos,
        totalAdjustedSeconds: currentDaySeconds
      });

      // Move to next day
      currentDay++;
      currentDayVideos = [];
      currentDaySeconds = 0;

      // Update progress in the current video (where we left off)
      currentVideoProgress = endSecond;
    }
  }

  // Push any remaining videos for the last day
  if (currentDayVideos.length > 0) {
    schedule.push({
      dayNumber: currentDay,
      isRevision: false,
      videos: currentDayVideos,
      totalAdjustedSeconds: currentDaySeconds
    });
  }

  // Post-processing to assign part numbers and format titles for split videos
  const videoSegmentCounts = {};
  schedule.forEach(day => {
    if (!day.isRevision) {
      day.videos.forEach(vid => {
        if (vid.isSegment) {
          videoSegmentCounts[vid.originalTitle] = (videoSegmentCounts[vid.originalTitle] || 0) + 1;
        }
      });
    }
  });

  const currentSegmentIndices = {};
  schedule.forEach(day => {
    if (!day.isRevision) {
      day.videos.forEach(vid => {
        if (vid.isSegment) {
          const origTitle = vid.originalTitle;
          const totalParts = videoSegmentCounts[origTitle];
          
          if (totalParts === 1) {
            vid.isSegment = false;
          } else {
            currentSegmentIndices[origTitle] = (currentSegmentIndices[origTitle] || 0) + 1;
            const partIndex = currentSegmentIndices[origTitle];
            const startFormatted = formatTimestamp(vid.startSecond);
            const endFormatted = formatTimestamp(vid.endSecond);
            vid.title = `[Part ${partIndex}/${totalParts}] ${vid.originalTitle} [${startFormatted} - ${endFormatted}]`;
          }
        }
      });
    }
  });

  // --- Display calculations ---
  planPlaylistTitle.textContent = playlist.title;
  planPlaylistCreator.textContent = playlist.creator;
  speedBadge.textContent = `${playbackSpeed}x Playback`;
  revisionBadge.textContent = `Revision Days: ${revisionDays ? 'On' : 'Off'}`;
  progressBadge.textContent = `${playlist.videoCount} Videos Total`;

  const countStudyDays = schedule.filter(d => !d.isRevision).length;
  const avgVideosPerDay = (playlist.videoCount / countStudyDays).toFixed(1);

  // End Date calculation
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + schedule.length - 1);
  const formattedEndDate = endDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  statEndDate.textContent = formattedEndDate;

  // Sidebar recap details
  prefTargetTime.textContent = `${hoursPerDay.toFixed(1)} hrs/day`;
  prefSpeed.textContent = `${playbackSpeed}x`;
  prefIntensity.textContent = intensity;
  prefRevision.textContent = revisionDays ? 'Enabled' : 'Disabled';
  prefGoal.textContent = completionGoal;
  prefTotalRawDuration.textContent = formatHoursMinutes(totalRawSeconds);
  prefTotalAdjustedDuration.textContent = formatHoursMinutes(totalAdjustedSeconds);

  // --- Render Timeline DOM ---
  renderTimeline(schedule);

  // --- GSAP Dashboard Animations ---
  if (typeof gsap !== 'undefined') {
    // 1. Slide header and sidebar in
    gsap.from('#plan-header-nav-anim', { opacity: 0, y: -20, duration: 0.6, ease: 'power3.out' });
    gsap.from('#plan-summary-anim', { opacity: 0, scale: 0.98, duration: 0.7, ease: 'power3.out' });
    gsap.from('#sidebar-section-anim', { opacity: 0, x: 20, duration: 0.7, delay: 0.2, ease: 'power3.out' });
    
    // 2. Animate stats numbers counting up
    const totalDaysAnim = { val: 0 };
    gsap.to(totalDaysAnim, {
      val: schedule.length,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        statTotalDays.innerHTML = `${Math.ceil(totalDaysAnim.val)} <span>days</span>`;
      }
    });

    const hoursAnim = { val: 0 };
    gsap.to(hoursAnim, {
      val: hoursPerDay,
      duration: 1.0,
      ease: 'power2.out',
      onUpdate: () => {
        statHoursPerDay.innerHTML = `${hoursAnim.val.toFixed(1)} <span>hrs</span>`;
      }
    });

    const videosPerDayAnim = { val: 0 };
    gsap.to(videosPerDayAnim, {
      val: parseFloat(avgVideosPerDay),
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        statVideosPerDay.innerHTML = videosPerDayAnim.val.toFixed(1);
      }
    });

    // 3. Stagger-animate timeline cards in
    gsap.from('.timeline-day-card', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.12,
      delay: 0.3,
      ease: 'power3.out'
    });
  }

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

  function formatTimestamp(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    const pad = (num) => String(num).padStart(2, '0');
    if (h > 0) {
      return `${h}:${pad(m)}:${pad(s)}`;
    }
    return `${m}:${pad(s)}`;
  }

  function renderTimeline(daysSchedule) {
    timelineContainer.innerHTML = '';
    
    daysSchedule.forEach(day => {
      const card = document.createElement('div');
      card.className = `timeline-day-card ${day.isRevision ? 'revision-day' : ''}`;
      if (day.dayNumber === 1) {
        card.classList.add('active');
      }

      if (day.isRevision) {
        card.innerHTML = `
          <div class="day-header">
            <span class="day-title">Day ${day.dayNumber} — Revision & Rest</span>
            <span class="day-watchtime" style="color: var(--color-success); border-color: rgba(48, 209, 88, 0.3);">0m</span>
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

  // Generate and Download PDF using jsPDF
  function triggerDownload(pl, daysSchedule, estDate) {
    if (typeof window.jspdf === 'undefined') {
      alert('PDF generation library is still loading. Please try again in a moment.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxContentWidth = pageWidth - (margin * 2);
    
    let y = margin;

    // Helper: Draw running page header and footer
    function drawPageDecoration(pageNum) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 145);
      doc.text('PlaylistPilot — Personalized Learning Plan', margin, 12);
      doc.text(`Page ${pageNum}`, pageWidth - margin - 10, 12);
      
      // Thin line separator
      doc.setDrawColor(225, 225, 230);
      doc.setLineWidth(0.2);
      doc.line(margin, 14, pageWidth - margin, 14);

      // Running Footer
      doc.text('Generated via PlaylistPilot. Build habits, finish playlists.', margin, pageHeight - 10);
    }

    let pageNum = 1;
    drawPageDecoration(pageNum);
    y = 25; // Content start coordinates

    // 1. Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(10, 132, 255); // Premium Apple Blue
    const titleLines = doc.splitTextToSize(pl.title, maxContentWidth);
    titleLines.forEach(line => {
      doc.text(line, margin, y);
      y += 8;
    });

    y += 1;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(90, 90, 95);
    doc.text(`Playlist course created by: ${pl.creator}`, margin, y);
    y += 9;

    // 2. Settings Summary Block (Sleek filled container)
    doc.setFillColor(245, 245, 247);
    doc.roundedRect(margin, y, maxContentWidth, 38, 3, 3, 'F');
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(110, 110, 115);
    doc.text('SYLLABUS & TIME PREFERENCES', margin + 6, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(45, 45, 50);
    
    // Left side info column
    doc.text(`• Total Video Length: ${formatHoursMinutes(totalRawSeconds)}`, margin + 6, y + 14);
    doc.text(`• Adjusted Study Duration: ${formatHoursMinutes(totalAdjustedSeconds)} (at ${playbackSpeed}x)`, margin + 6, y + 21);
    doc.text(`• Target Commitment: ${hoursPerDay} hrs/day`, margin + 6, y + 28);
    
    // Right side info column
    doc.text(`• Pacing Strategy: ${intensity.charAt(0).toUpperCase() + intensity.slice(1)}`, margin + 95, y + 14);
    doc.text(`• Course Timeline: ${daysSchedule.length} days`, margin + 95, y + 21);
    doc.text(`• Completion Forecast: ${estDate}`, margin + 95, y + 28);
    
    y += 48; // Spacing below details block

    // 3. Syllabus Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Daily Study Curriculum', margin, y);
    y += 8;

    // 4. Day-by-Day Syllabus rendering loop
    daysSchedule.forEach(day => {
      // Safe boundary calculation before drawing next day card (estimation height)
      const estimatedHeight = day.isRevision ? 18 : (8 + (day.videos.length * 6.5));
      if (y + estimatedHeight > pageHeight - margin - 5) {
        doc.addPage();
        pageNum++;
        drawPageDecoration(pageNum);
        y = 23;
      }

      if (day.isRevision) {
        // Draw rest day banner
        doc.setFillColor(242, 250, 243);
        doc.setDrawColor(48, 209, 88); // Revision Green
        doc.setLineWidth(0.3);
        doc.roundedRect(margin, y, maxContentWidth, 14, 1.5, 1.5, 'FD');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 110, 50);
        doc.text(`Day ${day.dayNumber}: Revision & Rest`, margin + 5, y + 6);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(85, 95, 85);
        doc.text('No new videos today. Consolidated notes, work on practice tasks, or review code topics.', margin + 5, y + 10.5);
        
        y += 18;
      } else {
        // Draw standard study day details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(0, 0, 0);
        doc.text(`Day ${day.dayNumber} — Estimated Watch Time: ${formatWatchTime(day.totalAdjustedSeconds)}`, margin, y);
        y += 6;

        // Draw videos for the day
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(55, 55, 60);

        day.videos.forEach(vid => {
          const adjSec = vid.durationSeconds * (1 / playbackSpeed);
          const durationStr = `(${formatWatchTime(adjSec)})`;

          // Small Checkbox shape [ ]
          doc.setDrawColor(180, 180, 185);
          doc.setLineWidth(0.25);
          doc.rect(margin + 1, y - 2.8, 3, 3);
          
          // Constrain text within boundaries
          const maxTextWidth = maxContentWidth - 32; 
          const titleLines = doc.splitTextToSize(vid.title, maxTextWidth);
          
          titleLines.forEach((line, index) => {
            doc.text(line, margin + 7, y);
            
            // Align duration details to the right on the final line
            if (index === titleLines.length - 1) {
              doc.setTextColor(130, 130, 135);
              doc.text(durationStr, pageWidth - margin - doc.getTextWidth(durationStr), y);
              doc.setTextColor(55, 55, 60);
            }
            y += 5.8;

            // Inside list page check
            if (y > pageHeight - margin - 5) {
              doc.addPage();
              pageNum++;
              drawPageDecoration(pageNum);
              y = 23;
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(9);
            }
          });
        });
        
        y += 3.5;
      }
    });

    // Save final document
    const cleanFilename = pl.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-study-plan.pdf';
    doc.save(cleanFilename);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

