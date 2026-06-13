(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      var open = mobileMenu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function(slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot, dotIndex) {
      dot.addEventListener('click', function() {
        show(dotIndex);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        startTimer();
      });
    }

    show(0);
    startTimer();
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function(panel) {
    var section = panel.parentElement;
    var input = panel.querySelector('[data-search-input]');
    var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
    var empty = section.querySelector('[data-empty-state]');

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var values = {};
      selects.forEach(function(select) {
        values[select.getAttribute('data-filter-select')] = select.value;
      });
      var visible = 0;
      cards.forEach(function(card) {
        var matchesQuery = !query || (card.getAttribute('data-search') || '').indexOf(query) !== -1;
        var matchesRegion = !values.region || card.getAttribute('data-region') === values.region;
        var matchesType = !values.type || card.getAttribute('data-type') === values.type;
        var matchesYear = !values.year || card.getAttribute('data-year') === values.year;
        var show = matchesQuery && matchesRegion && matchesType && matchesYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    selects.forEach(function(select) {
      select.addEventListener('change', applyFilters);
    });
  });

  document.querySelectorAll('[data-player]').forEach(function(stage) {
    var video = stage.querySelector('video');
    var button = stage.querySelector('[data-play-button]');
    var loaded = false;
    var hlsInstance = null;

    function loadAndPlay() {
      if (!video) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      stage.classList.add('playing');
      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
        loaded = true;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {
          stage.classList.remove('playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', loadAndPlay);
    }
    if (video) {
      video.addEventListener('click', function() {
        if (!loaded || video.paused) {
          loadAndPlay();
        }
      });
      video.addEventListener('play', function() {
        stage.classList.add('playing');
      });
      video.addEventListener('pause', function() {
        if (video.currentTime === 0) {
          stage.classList.remove('playing');
        }
      });
      video.addEventListener('ended', function() {
        stage.classList.remove('playing');
      });
    }

    window.addEventListener('beforeunload', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });

  var backTop = document.querySelector('[data-back-top]');
  if (backTop) {
    window.addEventListener('scroll', function() {
      backTop.classList.toggle('show', window.scrollY > 360);
    });
    backTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
