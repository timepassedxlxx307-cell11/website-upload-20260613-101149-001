(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function text(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function bootHeader() {
        var header = qs('[data-header]');
        var toggle = qs('[data-menu-toggle]');
        var nav = qs('[data-nav]');
        var navSearch = qs('.nav-search');

        function setHeaderState() {
            if (!header) {
                return;
            }
            header.classList.toggle('is-scrolled', window.scrollY > 8);
        }

        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
                if (navSearch) {
                    navSearch.classList.toggle('is-open');
                }
            });
        }

        setHeaderState();
        window.addEventListener('scroll', setHeaderState, { passive: true });
    }

    function bootHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function activate(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        activate(0);
        start();
    }

    function bootFilters() {
        qsa('[data-filter-panel]').forEach(function (panel) {
            var search = qs('[data-filter-search]', panel);
            var typeSelect = qs('[data-filter-select="type"]', panel);
            var yearSelect = qs('[data-filter-select="year"]', panel);
            var container = panel.parentElement;
            var cards = qsa('.filter-card', container);
            var empty = qs('[data-empty-state]', container);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q') || '';

            if (search && query) {
                search.value = query;
            }

            function matches(card) {
                var haystack = text([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre')
                ].join(' '));
                var keyword = search ? text(search.value) : '';
                var typeValue = typeSelect ? text(typeSelect.value) : '';
                var yearValue = yearSelect ? text(yearSelect.value) : '';

                if (keyword && haystack.indexOf(keyword) === -1) {
                    return false;
                }
                if (typeValue && text(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
                    return false;
                }
                if (yearValue && text(card.getAttribute('data-year')) !== yearValue) {
                    return false;
                }
                return true;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function (card) {
                    var ok = matches(card);
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            [search, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    function bindHls(video, url) {
        if (!video || !url) {
            return;
        }
        if (video.__hlsReady) {
            return;
        }
        video.__hlsReady = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            video.__hlsInstance = hls;
            return;
        }

        video.src = url;
    }

    function setupPlayer(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var button = document.getElementById(options.buttonId);
        var url = options.url;

        if (!video || !url) {
            return;
        }

        function start() {
            bindHls(video, url);
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    if (overlay) {
                        overlay.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                start();
            });
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });
    }

    function bootSite() {
        bootHeader();
        bootHero();
        bootFilters();
    }

    window.Site = {
        boot: bootSite,
        setupPlayer: setupPlayer
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootSite);
    } else {
        bootSite();
    }
})();
