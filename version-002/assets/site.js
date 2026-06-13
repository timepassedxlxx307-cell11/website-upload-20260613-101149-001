(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('form.global-search').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      if (!input) {
        return;
      }
      const query = input.value.trim();
      if (!query) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const thumbs = Array.from(hero.querySelectorAll('[data-hero-thumb]'));
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    }

    function startTimer() {
      if (timer || slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        const index = Number(thumb.getAttribute('data-hero-thumb')) || 0;
        showSlide(index);
        stopTimer();
        startTimer();
      });
    });

    hero.addEventListener('mouseenter', stopTimer);
    hero.addEventListener('mouseleave', startTimer);
    showSlide(0);
    startTimer();
  }

  const panel = document.querySelector('[data-filter-panel]');
  if (panel) {
    const search = panel.querySelector('[data-page-search]');
    const typeFilter = panel.querySelector('[data-type-filter]');
    const cards = Array.from(document.querySelectorAll('[data-card]'));
    const empty = document.querySelector('[data-filter-empty]');
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    if (search && initialQuery) {
      search.value = initialQuery;
    }

    function matchCard(card, query, typeValue) {
      const text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
      const cardType = (card.getAttribute('data-type') || '').toLowerCase();
      const queryOk = !query || text.indexOf(query) !== -1;
      const typeOk = !typeValue || cardType.indexOf(typeValue) !== -1 || text.indexOf(typeValue) !== -1;
      return queryOk && typeOk;
    }

    function applyFilter() {
      const query = search ? search.value.trim().toLowerCase() : '';
      const typeValue = typeFilter ? typeFilter.value.trim().toLowerCase() : '';
      let visible = 0;
      cards.forEach(function (card) {
        const matched = matchCard(card, query, typeValue);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    if (search) {
      search.addEventListener('input', applyFilter);
    }
    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilter);
    }
    applyFilter();
  }
})();
