(function () {
  "use strict";

  const root = document.body ? document.body.getAttribute("data-root") || "" : "";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    const menuButton = document.querySelector("[data-menu-button]");
    const mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    const hero = document.querySelector("[data-hero]");

    if (hero) {
      const slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      const dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      let active = 0;

      function setHero(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("is-active", i === active);
        });
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          setHero(i);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          setHero(active + 1);
        }, 6200);
      }
    }

    const globalSearch = document.getElementById("globalSearch");
    const searchPanel = document.getElementById("searchPanel");

    if (globalSearch && searchPanel && Array.isArray(window.SearchItems)) {
      globalSearch.addEventListener("input", function () {
        const q = globalSearch.value.trim().toLowerCase();

        if (!q) {
          searchPanel.classList.remove("is-open");
          searchPanel.innerHTML = "";
          return;
        }

        const results = window.SearchItems.filter(function (item) {
          return [item.title, item.region, item.type, item.year, item.genre, item.category].join(" ").toLowerCase().indexOf(q) !== -1;
        }).slice(0, 12);

        searchPanel.innerHTML = results.map(function (item) {
          return "<a href=\"" + root + item.url + "\"><strong>" + escapeHtml(item.title) + "</strong><span>" + escapeHtml(item.year + " · " + item.region + " · " + item.type + " · " + item.category) + "</span></a>";
        }).join("");
        searchPanel.classList.toggle("is-open", results.length > 0);
      });

      document.addEventListener("click", function (event) {
        if (!searchPanel.contains(event.target) && event.target !== globalSearch) {
          searchPanel.classList.remove("is-open");
        }
      });
    }

    const localSearch = document.querySelector("[data-local-search]");

    if (localSearch) {
      const cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      localSearch.addEventListener("input", function () {
        const q = localSearch.value.trim().toLowerCase();
        cards.forEach(function (card) {
          const value = [card.getAttribute("data-title"), card.getAttribute("data-year"), card.getAttribute("data-region"), card.getAttribute("data-genre")].join(" ").toLowerCase();
          card.classList.toggle("is-hidden", q && value.indexOf(q) === -1);
        });
      });
    }

    const filterBar = document.querySelector("[data-filter-bar]");

    if (filterBar) {
      const cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
      const buttons = Array.prototype.slice.call(filterBar.querySelectorAll("button"));

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          const year = button.getAttribute("data-filter-year");
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          cards.forEach(function (card) {
            card.classList.toggle("is-hidden", year !== "all" && card.getAttribute("data-year") !== year);
          });
        });
      });
    }

    const playerBox = document.querySelector("[data-player]");

    if (playerBox) {
      const video = playerBox.querySelector("video");
      const button = playerBox.querySelector("[data-play-button]");
      let started = false;
      let hlsInstance = null;

      function startVideo() {
        if (!video || started) {
          return;
        }

        started = true;
        const src = video.getAttribute("data-stream");

        if (button) {
          button.classList.add("is-hidden");
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(src);
          hlsInstance.attachMedia(video);
        } else {
          video.src = src;
        }

        const playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }

      if (button) {
        button.addEventListener("click", startVideo);
      }

      video.addEventListener("click", function () {
        if (!started) {
          startVideo();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
