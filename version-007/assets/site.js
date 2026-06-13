(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mainMenu = document.querySelector('[data-main-menu]');

    if (menuButton && mainMenu) {
        menuButton.addEventListener('click', function () {
            mainMenu.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero-carousel]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        showSlide(0);

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function applyFilters() {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var category = categoryFilter ? categoryFilter.value : 'all';
        var year = yearFilter ? yearFilter.value : 'all';

        cards.forEach(function (card) {
            var text = (card.getAttribute('data-search') || '').toLowerCase();
            var cardCategory = card.getAttribute('data-category') || '';
            var cardYear = card.getAttribute('data-year') || '';
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }

            if (category !== 'all' && cardCategory !== category) {
                matched = false;
            }

            if (year !== 'all' && cardYear !== year) {
                matched = false;
            }

            card.classList.toggle('is-filtered-out', !matched);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFilters);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }

    if (yearFilter) {
        yearFilter.addEventListener('change', applyFilters);
    }
})();

function initMoviePlayer(videoId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.querySelector('[data-player-button="' + videoId + '"]');
    var hlsInstance = null;
    var ready = false;

    function bindStream() {
        if (ready || !video) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function start() {
        bindStream();

        if (button) {
            button.classList.add('is-hidden');
        }

        var playResult = video.play();

        if (playResult && typeof playResult.catch === 'function') {
            playResult.catch(function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', start);
    }

    if (video) {
        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
        });
        video.addEventListener('click', function () {
            if (!ready) {
                start();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
