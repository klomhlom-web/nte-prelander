/* =========================================================
   MAIN.JS
   Neverness to Everness — Prelander 1
   ========================================================= */


/* =========================================================
   VIDEO COVER
   ========================================================= */

(function setupVideoCover() {
  var cover = document.getElementById('videoCover');
  if (!cover) return;

  setTimeout(function () {
    cover.classList.add('fade-out');
    setTimeout(function () {
      cover.style.display = 'none';
    }, 1200);
  }, 2200);
})();


/* =========================================================
   BACKGROUND VIDEO
   ========================================================= */

(function setupBackgroundVideo() {
  var video = document.getElementById('bgVideo');
  if (!video) return;

  var SKIP_TO_SEC = 2.2;
  var playStarted = false;

  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'auto';

  function skipOpening() {
    if (!isFinite(video.duration)) return;
    if (video.currentTime < SKIP_TO_SEC) {
      try {
        video.currentTime = SKIP_TO_SEC;
      } catch (e) {}
    }
  }

  function attemptPlay() {
    if (playStarted) return;
    skipOpening();
    if (!video.paused) {
      playStarted = true;
      return;
    }
    var promise;
    try {
      promise = video.play();
    } catch (e) {
      return;
    }
    if (promise && typeof promise.then === 'function') {
      promise
        .then(function () {
          playStarted = true;
        })
        .catch(function () {});
    } else {
      playStarted = true;
    }
  }

  video.addEventListener('loadedmetadata', function () {
    skipOpening();
    attemptPlay();
  });

  video.addEventListener('loadeddata', function () {
    attemptPlay();
  });

  video.addEventListener('canplay', function () {
    attemptPlay();
  });

  if (video.readyState >= 1) {
    attemptPlay();
  }

  function interactionPlay() {
    attemptPlay();
    if (playStarted) {
      document.removeEventListener('click', interactionPlay);
      document.removeEventListener('touchstart', interactionPlay);
      document.removeEventListener('keydown', interactionPlay);
    }
  }

  document.addEventListener('click', interactionPlay, { passive: true });
  document.addEventListener('touchstart', interactionPlay, { passive: true });
  document.addEventListener('keydown', interactionPlay);

  var sourceEl = video.querySelector('source');

  if (sourceEl) {
    sourceEl.addEventListener('error', function () {
      if (sourceEl.dataset.fallbackUsed === 'true') return;
      sourceEl.dataset.fallbackUsed = 'true';
      sourceEl.src = 'NTE-10.mp4';
      playStarted = false;
      video.load();
      try {
        video.play().catch(function () {});
      } catch (e) {}
    });
  }

})();


/* =========================================================
   LIVE PLAYER COUNTER
   ========================================================= */

var playerCount = 2341892 + Math.floor(Math.random() * 6000);

function formatNumber(number) {
  return number.toLocaleString();
}

function updatePlayerCount() {
  playerCount += Math.floor(Math.random() * 6) + 1;
  var counterIds = ['playerCount', 'tickerCount', 'tickerCount2'];
  counterIds.forEach(function (id) {
    var element = document.getElementById(id);
    if (element) {
      element.textContent = formatNumber(playerCount);
    }
  });
}

updatePlayerCount();
setInterval(updatePlayerCount, 3400);


/* =========================================================
   GEO LOCATION
   ========================================================= */

(function setupGeoLocation() {
  try {
    fetch('https://ipapi.co/json/')
      .then(function (response) {
        if (!response.ok) throw new Error('Geo request failed');
        return response.json();
      })
      .then(function (data) {
        var location = data.city || data.region || data.country_name || '';
        if (!location) return;
        var statusPill = document.getElementById('statusPill');
        if (statusPill) {
          statusPill.textContent = 'PC LAUNCH LIVE IN ' + location.toUpperCase() + ' - FREE';
        }
      })
      .catch(function () {});
  } catch (e) {}
})();


/* =========================================================
   TRACKING
   ========================================================= */

var go2offerFired = false;

function go2offer() {
  if (go2offerFired) return;
  go2offerFired = true;
  try {
    if (typeof gtag === 'function') {
      gtag('event', 'go2offer', {
        event_category: 'prelander',
        event_label: 'NTE Prelander 1'
      });
    }
  } catch (e) {}
  try {
    if (typeof ttq !== 'undefined' && typeof ttq.track === 'function') {
      ttq.track('ClickButton', { description: 'go2offer_pl1' });
    }
  } catch (e) {}
}

function trackOffer(eventName) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', 'cta_click', {
        event_category: 'prelander',
        event_label: eventName
      });
    }
  } catch (e) {}
  try {
    if (typeof ttq !== 'undefined' && typeof ttq.track === 'function') {
      ttq.track('ClickButton', { description: eventName });
    }
  } catch (e) {}
}


/* =========================================================
   ESP OVERLAY
   ========================================================= */

function openEsp(event) {
  if (event) event.preventDefault();
  var backdrop = document.getElementById('espBackdrop');
  if (!backdrop) return;
  backdrop.classList.add('open');
  trackOffer('esp_open');
  resetSwipe();
}

function closeEsp() {
  var backdrop = document.getElementById('espBackdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
}

(function setupBackdropClick() {
  var backdrop = document.getElementById('espBackdrop');
  if (!backdrop) return;
  backdrop.addEventListener('click', function (event) {
    if (event.target === backdrop) closeEsp();
  });
})();


/* =========================================================
   SWIPE ELEMENTS
   ========================================================= */

var trackEl = document.getElementById('swipeTrack');
var handleEl = document.getElementById('swipeHandle');
var fillEl = document.getElementById('swipeFill');
var textEl = document.getElementById('swipeText');
var successEl = document.getElementById('swipeSuccess');


/* =========================================================
   SWIPE STATE
   ========================================================= */

var isDragging = false;
var startX = 0;
var currentLeft = 4;
var PADDING = 4;
var HANDLE_W = 48;
var SUCCESS_THRESHOLD = 0.92;
var hasCompleted = false;


/* =========================================================
   SWIPE DIMENSIONS
   ========================================================= */

function getTrackWidth() {
  return trackEl ? trackEl.offsetWidth : 0;
}

function getMaxLeft() {
  if (!trackEl) return 0;
  return Math.max(0, getTrackWidth() - HANDLE_W - PADDING);
}


/* =========================================================
   UPDATE SWIPE POSITION
   ========================================================= */

function updateHandlePosition(clientX) {
  if (!trackEl || !handleEl || !fillEl || !textEl) return;

  var rect = trackEl.getBoundingClientRect();
  var maxLeft = getMaxLeft();
  if (maxLeft <= 0) return;

  var relativeX = clientX - rect.left - startX;
  currentLeft = Math.max(PADDING, Math.min(maxLeft + PADDING, relativeX + PADDING));
  var progress = (currentLeft - PADDING) / maxLeft;
  progress = Math.max(0, Math.min(1, progress));

  handleEl.style.left = currentLeft + 'px';
  fillEl.style.width = (progress * 100) + '%';
  textEl.style.opacity = Math.max(0, 1 - progress * 2);

  if (progress >= SUCCESS_THRESHOLD && !hasCompleted) {
    hasCompleted = true;
    onSwipeComplete();
  }
}


/* =========================================================
   SUCCESSFUL SWIPE
   ========================================================= */

function onSwipeComplete() {
  if (!handleEl || !fillEl || !textEl || !successEl) return;

  var maxLeft = getMaxLeft();
  currentLeft = maxLeft + PADDING;
  handleEl.style.left = currentLeft + 'px';
  fillEl.style.width = '100%';
  textEl.style.opacity = '0';
  successEl.classList.add('visible');

  go2offer();

  var offerUrl = 'https://nte.perfectworld.com/net/260429twitch/en/index.html';
  try {
    window.open(offerUrl, '_blank');
  } catch (e) {}

  window.location.href = 'prelander2.html';
}


/* =========================================================
   RESET SWIPE
   ========================================================= */

function resetSwipe() {
  if (!handleEl || !fillEl || !textEl || !successEl) return;

  isDragging = false;
  hasCompleted = false;
  go2offerFired = false;
  currentLeft = PADDING;

  handleEl.style.transition = 'left 0.35s cubic-bezier(.2,.8,.2,1)';
  fillEl.style.transition = 'width 0.35s cubic-bezier(.2,.8,.2,1)';

  handleEl.style.left = PADDING + 'px';
  fillEl.style.width = '0%';
  textEl.style.opacity = '1';
  successEl.classList.remove('visible');

  setTimeout(function () {
    if (!handleEl || !fillEl) return;
    handleEl.style.transition = '';
    fillEl.style.transition = 'width 0.05s linear';
  }, 350);
}


/* =========================================================
   MOUSE SWIPE
   ========================================================= */

if (handleEl && trackEl) {
  handleEl.addEventListener('mousedown', function (event) {
    if (hasCompleted) return;
    isDragging = true;
    var rect = trackEl.getBoundingClientRect();
    startX = event.clientX - rect.left - (currentLeft - PADDING);
    handleEl.style.transition = 'none';
    fillEl.style.transition = 'width 0.05s linear';
    event.preventDefault();
  });
}

document.addEventListener('mousemove', function (event) {
  if (!isDragging || hasCompleted) return;
  updateHandlePosition(event.clientX);
});

document.addEventListener('mouseup', function () {
  if (!isDragging) return;
  isDragging = false;
  if (!hasCompleted) resetSwipe();
});


/* =========================================================
   TOUCH SWIPE
   ========================================================= */

if (handleEl && trackEl) {
  handleEl.addEventListener('touchstart', function (event) {
    if (hasCompleted) return;
    var touch = event.touches[0];
    if (!touch) return;
    isDragging = true;
    var rect = trackEl.getBoundingClientRect();
    startX = touch.clientX - rect.left - (currentLeft - PADDING);
    handleEl.style.transition = 'none';
    fillEl.style.transition = 'width 0.05s linear';
    event.preventDefault();
  }, { passive: false });
}

document.addEventListener('touchmove', function (event) {
  if (!isDragging || hasCompleted) return;
  var touch = event.touches[0];
  if (!touch) return;
  updateHandlePosition(touch.clientX);
}, { passive: true });

document.addEventListener('touchend', function () {
  if (!isDragging) return;
  isDragging = false;
  if (!hasCompleted) resetSwipe();
});


/* =========================================================
   PREVENT TEXT SELECTION WHILE SWIPING
   ========================================================= */

document.addEventListener('selectstart', function (event) {
  if (isDragging) event.preventDefault();
});


/* =========================================================
   ESC — CLOSE ESP
   ========================================================= */

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') closeEsp();
});
