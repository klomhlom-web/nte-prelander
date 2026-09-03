/* =========================================================
   MAIN.JS
   Neverness to Everness — Prelander COMPLETE
   ========================================================= */


/* =========================================================
   VIDEO COVER
   ========================================================= */

(function setupVideoCover() {
  var cover = document.getElementById('videoCover');

  if (!cover) return;

  /* Keep the cover visible for 2.2s,
     then fade it out for 1.2s. */
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

  /* Force the attributes needed for mobile autoplay. */
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'auto';

  /* Move past the unwanted opening scene. */
  function skipOpening() {
    if (!isFinite(video.duration)) return;

    if (video.currentTime < SKIP_TO_SEC) {
      try {
        video.currentTime = SKIP_TO_SEC;
      } catch (e) {}
    }
  }

  /* Start playback. */
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
        .catch(function () {
          /* Browser blocked autoplay. Retry on fallback. */
        });
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
    fetch('https://ipapi.co')
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

  /* Google Analytics */
  try {
    if (typeof gtag === 'function') {
      gtag('event', 'go2offer', {
        event_category: 'prelander',
        event_label: 'NTE Prelander Complete'
      });
    }
  } catch (e) {}

  /* TikTok Pixel */
  try {
    if (typeof ttq !== 'undefined' && typeof ttq.track === 'function') {
      ttq.track('ClickButton', { description: 'go2offer_completed' });
    }
  } catch (e) {}
}

function trackOffer(eventName) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', 'cta_click', { event_category: 'prelander', event_label: eventName });
    }
  } catch (e) {}

  try {
    if (typeof ttq !== 'undefined' && typeof ttq.track === 'function') {
      ttq.track('ClickButton', { description: eventName });
    }
  } catch (e) {}
}


/* =========================================================
   ESP OVERLAY & SWIPE LOGIC (SCHÉMA ÉTAPE PAR ÉTAPE)
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
    if (event.target === backdrop) {
      closeEsp();
    }
  });
})();


/* INTERACTION DU SWIPER */
var handle = document.getElementById('swipeHandle');
var track = document.getElementById('swipeTrack');
var fill = document.getElementById('swipeFill');
var successText = document.getElementById('swipeSuccess');
var textLabel = document.getElementById('swipeText');

var isDragging = false;
var startX = 0;
var maxDelta = 0;

if (handle && track) {
  maxDelta = track.clientWidth - handle.clientWidth;

  handle.addEventListener('mousedown', startDrag);
  handle.addEventListener('touchstart', startDrag, { passive: true });

  window.addEventListener('mousemove', doDrag);
  window.addEventListener('touchmove', doDrag, { passive: false });

  window.addEventListener('mouseup', endDrag);
  window.addEventListener('touchend', endDrag);
}

function startDrag(e) {
  if (go2offerFired) return;
  isDragging = true;
  startX = e.touches ? e.touches.clientX : e.clientX;
  handle.style.transition = 'none';
  if (fill) fill.style.transition = 'none';
}

function doDrag(e) {
  if (!isDragging) return;
  if (e.cancelable) e.preventDefault();

  var currentX = e.touches ? e.touches.clientX : e.clientX;
  var delta = currentX - startX;

  if (delta < 0) delta = 0;
  if (delta > maxDelta) delta = maxDelta;

  handle.style.transform = 'translateX(' + delta + 'px)';
  if (fill) fill.style.width = (delta + handle.clientWidth) + 'px';

  /* Si le swipe atteint la fin (Succès Étape 2 -> Étape 3) */
  if (delta >= maxDelta - 5) {
    isDragging = false;
    triggerSwipeSuccess();
  }
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  resetSwipe();
}

function resetSwipe() {
  if (go2offerFired) return;
  if (handle) handle.style.transform = 'translateX(0px)';
  if (fill) fill.style.width = '0px';
  if (handle) handle.style.transition = 'transform 0.3s ease';
  if (fill) fill.style.transition = 'width 0.3s ease';
}

/* ACTION LORSQUE LE SWIPE REUSSIT (Étape 3 : Changement dynamique du Prelander) */
function triggerSwipeSuccess() {
  go2offer(); // Déclenche le tracking

  if (successText) successText.style.opacity = '1';
  if (textLabel) textLabel.style.opacity = '0';
  if (handle) handle.style.display = 'none';

  setTimeout(function() {
    closeEsp(); // Ferme la pop-up

    /* --- TRANSITION VERS LA DEUXIÈME PRELANDER (STAR) --- */
    
    // 1. Changement de la vidéo de fond vers NTE-10.mp4
    var video = document.getElementById('bgVideo');
    var videoSource = document.getElementById('videoSource');
    if (video && videoSource) {
      videoSource.src = 'videos/NTE-10.mp4';
      video.load();
      video.play().catch(function(){});
    }

    // 2. Changement de l'image de personnage vers star.webp
    var heroImg = document.getElementById('mainHeroImg');
    if (heroImg) {
      heroImg.src = 'images/star.webp';
      heroImg.alt = 'NTE Star Character';
    }

    // 3. Modification du texte d'en-tête principal
    var headline = document.getElementById('mainHeadline');
    var supporting = document.getElementById('mainSupporting');
    if (headline) {
      headline.innerHTML = 'LINK<br><span class="headline-accent">ESTABLISHED</span>';
    }
    if (supporting) {
      supporting.textContent = 'Your supernatural journey begins here.';
    }

    // 4. Transformation du bouton principal en bouton final de conversion
    var mainCta = document.getElementById('mainCta');
    if (mainCta) {
      mainCta.removeAttribute('onclick');
      mainCta.id = 'finalCta';
      mainCta.href = 'https://perfectworld.com'; 
      mainCta.innerHTML = 'DOWNLOAD NOW <span class="cta-arrow">→</span>';
    }

    // 5. Modification du badge de statut supérieur
    var statusPill = document.getElementById('statusPill');
    if (statusPill) {
      statusPill.textContent = 'ACCESS GRANTED — VERIFIED';
      statusPill.style.background = 'rgba(233, 92, 255, 0.2)';
      statusPill.style.borderColor = '#E95CFF';
statusPill.style.color = '#E95CFF';}}, 1000);