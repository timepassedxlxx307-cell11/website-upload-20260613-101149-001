(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('is-open');
      menuButton.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function(hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var show = function(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
        dot.setAttribute('aria-pressed', dotIndex === current ? 'true' : 'false');
      });
    };
    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        show(index);
      });
    });
    show(0);
    window.setInterval(function() {
      show(current + 1);
    }, 5200);
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
    var input = scope.querySelector('[data-filter-input]');
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var normalize = function(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    };
    var applyFilter = function() {
      var keyword = normalize(input.value);
      cards.forEach(function(card) {
        var haystack = normalize(card.getAttribute('data-search'));
        card.hidden = keyword.length > 0 && haystack.indexOf(keyword) === -1;
      });
    };
    input.addEventListener('input', applyFilter);
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery && !input.value) {
      input.value = initialQuery;
      applyFilter();
    }
  });

  document.querySelectorAll('[data-player-shell]').forEach(function(shell) {
    var video = shell.querySelector('[data-player]');
    var button = shell.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    var stream = video.getAttribute('data-stream');
    var loaded = false;
    var hls = null;
    var loadStream = function() {
      if (!stream || loaded) {
        return;
      }
      loaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };
    var play = function() {
      loadStream();
      video.play().then(function() {
        shell.classList.add('is-playing');
      }).catch(function() {
        shell.classList.remove('is-playing');
      });
    };
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', function() {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function() {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function() {
      shell.classList.remove('is-playing');
    });
    window.addEventListener('beforeunload', function() {
      if (hls && hls.destroy) {
        hls.destroy();
      }
    });
  });
})();
