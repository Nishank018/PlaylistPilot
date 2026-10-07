/**
 * PlaylistPilot - Butter-Smooth Theme & Shared Header Utilities
 */

export function initTheme() {
  const savedTheme = localStorage.getItem('playlistpilot_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      animateCircularThemeToggle(e);
    });
  });

  initVisitorCounter();
}

export function initVisitorCounter() {
  const countEl = document.getElementById('visitor-count-num');
  if (!countEl) return;

  let baseCount = parseInt(localStorage.getItem('playlistpilot_visitor_count') || '1482', 10);

  if (!sessionStorage.getItem('playlistpilot_session_counted')) {
    baseCount += Math.floor(Math.random() * 3) + 1;
    localStorage.setItem('playlistpilot_visitor_count', baseCount.toString());
    sessionStorage.setItem('playlistpilot_session_counted', 'true');
  }

  // Count up animation from baseCount - 35 to target
  let currentDisplay = Math.max(100, baseCount - 35);
  const target = baseCount;

  countEl.textContent = currentDisplay.toLocaleString();

  const step = Math.ceil((target - currentDisplay) / 25) || 1;
  const timer = setInterval(() => {
    currentDisplay += step;
    if (currentDisplay >= target) {
      currentDisplay = target;
      clearInterval(timer);
    }
    countEl.textContent = currentDisplay.toLocaleString();
  }, 35);
}

function animateCircularThemeToggle(event) {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';

  let x = event && event.clientX ? event.clientX : window.innerWidth / 2;
  let y = event && event.clientY ? event.clientY : window.innerHeight;

  const maxDimX = Math.max(x, window.innerWidth - x);
  const maxDimY = Math.max(y, window.innerHeight - y);
  const endRadius = Math.hypot(maxDimX, maxDimY) * 1.15;

  if (document.startViewTransition) {
    const transition = document.startViewTransition(() => {
      document.documentElement.setAttribute('data-theme', targetTheme);
      localStorage.setItem('playlistpilot_theme', targetTheme);
    });

    transition.ready.then(() => {
      if (targetTheme === 'light') {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 700,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      } else {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(${endRadius}px at ${x}px ${y}px)`,
              `circle(0px at ${x}px ${y}px)`
            ]
          },
          {
            duration: 700,
            easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            pseudoElement: '::view-transition-old(root)'
          }
        );
      }
    });
  } else {
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('playlistpilot_theme', targetTheme);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}
