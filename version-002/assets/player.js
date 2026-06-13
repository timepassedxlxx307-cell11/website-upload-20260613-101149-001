(function () {
  const video = document.getElementById('movieVideo');
  const button = document.getElementById('playButton');

  if (!video || !button) {
    return;
  }

  const sourceElement = video.querySelector('source');
  const source = sourceElement ? sourceElement.getAttribute('src') : '';
  let ready = false;

  function prepareVideo() {
    if (ready || !source) {
      return;
    }
    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function beginPlayback() {
    prepareVideo();
    button.classList.add('is-hidden');
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', beginPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      beginPlayback();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      button.classList.remove('is-hidden');
    }
  });
  video.addEventListener('ended', function () {
    button.classList.remove('is-hidden');
  });

  prepareVideo();
})();
