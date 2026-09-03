/* ── VIDEO COVER TIMER (3 sec) ── */
var cover = document.getElementById('videoCover');
if (cover) {
  setTimeout(function() {
    cover.classList.add('fade-out');
    setTimeout(function() { cover.style.display = 'none'; }, 2000);
  }, 3000);
}

/* ── VIDEO AUTOPLAY FIX - aggressive instant start ── */
(function fixVideo() {
  var video = document.getElementById('bgVideo');
  if (!video) return;

  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.preload = 'auto';

  function forcePlay() {
    if (video.paused) {
      var p = video.play();
      if (p !== undefined) {
        p.then(function() {
          video.classList.add('playing');
        }).catch(function() {});
      } else {
        video.classList.add('playing');
      }
    } else {
      video.classList.add('playing');
    }
  }

  // Immediate attempt
  if (video.readyState >= 2) {
    forcePlay();
  }

  // Event-driven attempts
  video.addEventListener('loadedmetadata', forcePlay, { once: true });
  video.addEventListener('canplay', forcePlay, { once: true });
  video.addEventListener('loadeddata', forcePlay, { once: true });
  video.addEventListener('canplaythrough', forcePlay, { once: true });

  // When video actually starts playing
  video.addEventListener('playing', function() {
    video.classList.add('playing');
  }, { once: true });

  // Fallback on any user interaction
  function interactionPlay() {
    forcePlay();
    document.removeEventListener('click', interactionPlay);
    document.removeEventListener('touchstart', interactionPlay);
    document.removeEventListener('mousemove', interactionPlay);
    document.removeEventListener('scroll', interactionPlay);
  }
  document.addEventListener('click', interactionPlay, { once: true });
  document.addEventListener('touchstart', interactionPlay, { once: true });
  document.addEventListener('mousemove', interactionPlay, { once: true });
  document.addEventListener('scroll', interactionPlay, { once: true });

  // Timed fallbacks
  setTimeout(forcePlay, 50);
  setTimeout(forcePlay, 200);
  setTimeout(forcePlay, 500);
  setTimeout(forcePlay, 1000);
})();

/* ── FLOATING PARTICLES ── */
(function spawnParticles() {
  var container = document.getElementById('particles');
  if (!container) return;
  var count = 30;
  for (var i = 0; i < count; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (6 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 8) + 's';
    p.style.width = (1 + Math.random() * 2) + 'px';
    p.style.height = p.style.width;
    var colors = ['var(--cyan)', 'var(--magenta)', 'var(--purple)'];
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.boxShadow = '0 0 ' + (4 + Math.random() * 6) + 'px ' + p.style.background;
    container.appendChild(p);
  }
})();

/* ── TYPEWRITER EFFECT ── */
(function typewriter() {
  var el = document.getElementById('typewriter');
  if (!el) return;
  var text = el.textContent;
  el.textContent = '';
  el.style.opacity = '1';
  var i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, 45 + Math.random() * 40);
    }
  }
  setTimeout(type, 1200);
})();

/* ── LIVE COUNTER ── */
var count = 2341892 + Math.floor(Math.random() * 6000);
function fmtNum(n) { return n.toLocaleString(); }
function updateCount() {
  count += Math.floor(Math.random() * 6) + 1;
  ['playerCount','tickerCount','tickerCount2'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = fmtNum(count);
  });
}
updateCount();
setInterval(updateCount, 3400);

/* ── GEO ── */
(function geo() {
  try {
    fetch('https://ipapi.co/json/')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var loc = d.city || d.region || d.country_name || '';
        if (loc) {
          var pill = document.getElementById('statusPill');
          if (pill) pill.textContent = 'PC LAUNCH LIVE IN ' + loc.toUpperCase() + ' - FREE';
        }
      })
      .catch(function() {});
  } catch(e) {}
})();

/* ── go2offer - fires ONCE per successful swipe completion only ── */
var go2offerFired = false;

function go2offer() {
  if (go2offerFired) return;
  go2offerFired = true;

  // Meta Pixel - new ID 1304740631418778
  try {
    if (typeof fbq !== 'undefined') {
      fbq('trackCustom', 'go2offer', {
        content_name: 'NTE Prelander 1'
      });
    }
  } catch(e) {}

  // Google Analytics
  try {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'go2offer', {
        event_category: 'prelander',
        event_label: 'NTE Prelander 1'
      });
    }
  } catch(e) {}

  // TikTok Pixel
  try {
    if (typeof ttq !== 'undefined') {
      ttq.track('ClickButton', { description: 'go2offer_pl1' });
    }
  } catch(e) {}
}

function trackOffer(event) {
  try { if (typeof fbq !== 'undefined') fbq('track', 'Lead', { offer:'nte', event: event }); } catch(e){}
  try { if (typeof gtag !== 'undefined') gtag('event', 'cta_click', { event_category:'prelander', event_label:event }); } catch(e){}
  try { if (typeof ttq !== 'undefined') ttq.track('ClickButton', { description:event }); } catch(e){}
}

/* ── ESP OVERLAY ── */
function openEsp(e) {
  if (e) e.preventDefault();
  var backdrop = document.getElementById('espBackdrop');
  if (backdrop) backdrop.classList.add('open');
  trackOffer('esp_open');
  resetSwipe();
}

function closeEsp() {
  var backdrop = document.getElementById('espBackdrop');
  if (backdrop) backdrop.classList.remove('open');
}

(function setupBackdropClick() {
  var backdrop = document.getElementById('espBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', function(e) {
      if (e.target === this) closeEsp();
    });
  }
})();

/* ── SWIPE MECHANIC ── */
var trackEl  = document.getElementById('swipeTrack');
var handleEl = document.getElementById('swipeHandle');
var fillEl   = document.getElementById('swipeFill');
var stxtEl   = document.getElementById('swipeText');
var ssucEl   = document.getElementById('swipeSuccess');

var isDragging = false;
var startX = 0;
var currentLeft = 4;
var PADDING = 4;
var HANDLE_W = 48;
var SUCCESS_THRESHOLD = 0.92;
var hasCompleted = false;

function getTrackWidth() { return trackEl ? trackEl.offsetWidth : 0; }
function getMaxLeft() { return getTrackWidth() - HANDLE_W - PADDING; }

function updateHandlePosition(clientX) {
  if (!trackEl || !handleEl || !fillEl || !stxtEl) return;
  var rect = trackEl.getBoundingClientRect();
  var relativeX = clientX - rect.left - startX;
  var maxLeft = getMaxLeft();
  currentLeft = Math.max(PADDING, Math.min(maxLeft + PADDING, relativeX + PADDING));
  var progress = (currentLeft - PADDING) / maxLeft;
  progress = Math.max(0, Math.min(1, progress));
  handleEl.style.left = currentLeft + 'px';
  fillEl.style.width = (progress * 100) + '%';
  stxtEl.style.opacity = Math.max(0, 1 - progress * 2);
  if (progress >= SUCCESS_THRESHOLD && !hasCompleted) {
    hasCompleted = true;
    onSwipeComplete();
  }
}

/* ── SUCCESSFUL SWIPE COMPLETION CALLBACK ──
   This is the ONLY place where go2offer fires.
   It fires exactly once, immediately when the user successfully
   completes the swipe past the 92% threshold.
   Sequence:
     1. go2offer()  -> tracking (once)
     2. window.open -> offer in NEW TAB
     3. window.location.href -> original tab to Prelander 2
   ── */
function onSwipeComplete() {
  if (!handleEl || !fillEl || !stxtEl || !ssucEl) return;

  var maxLeft = getMaxLeft();
  currentLeft = maxLeft + PADDING;
  handleEl.style.left = currentLeft + 'px';
  fillEl.style.width = '100%';
  stxtEl.style.opacity = '0';
  ssucEl.classList.add('visible');

  // 1. Fire go2offer - EXACTLY ONCE, only on successful swipe completion
  go2offer();

  // 2. Open the real offer in a NEW TAB (user interaction = popup-safe)
  window.open('https://nte.perfectworld.com/net/260429twitch/en/index.html', '_blank');

  // 3. Navigate the ORIGINAL TAB to Prelander 2
  window.location.href = 'https://at.wgopro.com';
}

function resetSwipe() {
  if (!handleEl || !fillEl || !stxtEl || !ssucEl) return;
  hasCompleted = false;
  go2offerFired = false;
  currentLeft = PADDING;
  handleEl.style.transition = 'left 0.35s cubic-bezier(.2,.8,.2,1)';
  fillEl.style.transition = 'width 0.35s cubic-bezier(.2,.8,.2,1)';
  handleEl.style.left = PADDING + 'px';
  fillEl.style.width = '0%';
  stxtEl.style.opacity = '1';
  ssucEl.classList.remove('visible');
  setTimeout(function() {
    handleEl.style.transition = '';
    fillEl.style.transition = 'width 0.05s linear';
  }, 350);
}

// Mouse events
if (handleEl) {
  handleEl.addEventListener('mousedown', function(e) {
    if (hasCompleted) return;
    isDragging = true;
    var rect = trackEl.getBoundingClientRect();
    startX = e.clientX - rect.left - (currentLeft - PADDING);
    handleEl.style.transition = 'none';
    fillEl.style.transition = 'width 0.05s linear';
    e.preventDefault();
  });
}

document.addEventListener('mousemove', function(e) {
  if (!isDragging || hasCompleted) return;
  updateHandlePosition(e.clientX);
});

document.addEventListener('mouseup', function() {
  if (!isDragging) return;
  isDragging = false;
  if (!hasCompleted) resetSwipe();
});

// Touch events
if (handleEl) {
  handleEl.addEventListener('touchstart', function(e) {
    if (hasCompleted) return;
    isDragging = true;
    var rect = trackEl.getBoundingClientRect();
    var touch = e.touches[0];
    startX = touch.clientX - rect.left - (currentLeft - PADDING);
    handleEl.style.transition = 'none';
    fillEl.style.transition = 'width 0.05s linear';
    e.preventDefault();
  }, {passive:false});
}

document.addEventListener('touchmove', function(e) {
  if (!isDragging || hasCompleted) return;
  updateHandlePosition(e.touches[0].clientX);
}, {passive:true});

document.addEventListener('touchend', function() {
  if (!isDragging) return;
  isDragging = false;
  if (!hasCompleted) resetSwipe();
});

document.addEventListener('selectstart', function(e) {
  if (isDragging) e.preventDefault();
});

/* ── ESC to close ── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeEsp();
});