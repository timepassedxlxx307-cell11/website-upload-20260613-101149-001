(function () {
    var header = document.querySelector('[data-header]');
    var toggle = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }

        if (window.scrollY > 30) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    if (toggle && mobileNav && header) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
            header.classList.toggle('is-open');
        });
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    document.querySelectorAll('img[data-cover]').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.opacity = '0';
        });
    });

    document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        var container = panel.parentElement;
        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
        var search = panel.querySelector('[data-filter-search]');
        var type = panel.querySelector('[data-filter-type]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        var count = panel.querySelector('[data-filter-count]');

        function includesText(value, keyword) {
            return String(value || '').toLowerCase().indexOf(keyword) !== -1;
        }

        function filter() {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var typeValue = type ? type.value : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.dataset.title,
                    card.dataset.year,
                    card.dataset.type,
                    card.dataset.region,
                    card.dataset.genre,
                    card.dataset.tags
                ].join(' ').toLowerCase();
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }

                if (typeValue && !includesText(card.dataset.type, typeValue)) {
                    matched = false;
                }

                if (yearValue && card.dataset.year !== yearValue) {
                    matched = false;
                }

                if (regionValue && !includesText(card.dataset.region, regionValue)) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = '当前显示 ' + visible + ' 部影片';
            }
        }

        [search, type, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener('input', filter);
                control.addEventListener('change', filter);
            }
        });

        filter();
    });

    var globalInput = document.querySelector('[data-global-search]');
    var globalButton = document.querySelector('[data-global-search-button]');
    var globalResults = document.querySelector('[data-global-search-results]');
    var globalStatus = document.querySelector('[data-global-search-status]');

    function cardHtml(movie) {
        var tags = Array.isArray(movie.tags) ? movie.tags.slice(0, 2) : [];
        return [
            '<article class="movie-card compact">',
            '<a class="card-link" href="' + escapeHtml(movie.href) + '">',
            '<div class="poster-wrap" style="--cover-image: url(' + escapeHtml(movie.cover) + ');">',
            '<img class="poster-img" src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" data-cover loading="lazy">',
            '<span class="card-play">▶</span>',
            '</div>',
            '<div class="card-body">',
            '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
            '<h3>' + escapeHtml(movie.title) + '</h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-tags">' + tags.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function runGlobalSearch() {
        if (!globalInput || !globalResults || !window.MOVIE_SEARCH_INDEX) {
            return;
        }

        var keyword = globalInput.value.trim().toLowerCase();
        var source = window.MOVIE_SEARCH_INDEX.slice();
        var matched = source.filter(function (movie) {
            if (!keyword) {
                return true;
            }

            var text = [
                movie.title,
                movie.year,
                movie.region,
                movie.type,
                movie.genre,
                Array.isArray(movie.tags) ? movie.tags.join(' ') : '',
                movie.oneLine
            ].join(' ').toLowerCase();
            return text.indexOf(keyword) !== -1;
        }).sort(function (a, b) {
            return b.heat - a.heat;
        }).slice(0, 80);

        globalResults.innerHTML = matched.map(cardHtml).join('');
        globalResults.querySelectorAll('img[data-cover]').forEach(function (image) {
            image.addEventListener('error', function () {
                image.style.opacity = '0';
            });
        });

        if (globalStatus) {
            globalStatus.textContent = keyword ? '找到 ' + matched.length + ' 条相关结果' : '显示热门影片 ' + matched.length + ' 条';
        }
    }

    if (globalButton) {
        globalButton.addEventListener('click', runGlobalSearch);
    }

    if (globalInput) {
        globalInput.addEventListener('input', runGlobalSearch);
        runGlobalSearch();
    }
}());
