(function () {
    function initPlayer(shell) {
        var video = shell.querySelector('video[data-src]');
        var button = shell.querySelector('[data-play-button]');
        var message = shell.querySelector('[data-player-message]');
        var started = false;
        var hls = null;

        if (!video || !button) {
            return;
        }

        function showMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    showMessage('点击视频画面即可继续播放');
                });
            }
        }

        function start() {
            var source = video.getAttribute('data-src');

            if (!source) {
                showMessage('播放源暂不可用');
                return;
            }

            shell.classList.add('is-playing');

            if (started) {
                playVideo();
                return;
            }

            started = true;
            showMessage('正在加载播放源...');

            if (window.Hls && window.Hls.isSupported() && source.indexOf('.m3u8') !== -1) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });

                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    showMessage('');
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showMessage('播放连接异常，请刷新页面后重试');
                    }
                });
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL') || source.indexOf('.m3u8') === -1) {
                video.src = source;
                video.addEventListener('loadedmetadata', function () {
                    showMessage('');
                    playVideo();
                }, { once: true });
                video.load();
                return;
            }

            showMessage('当前浏览器不支持该播放格式');
        }

        button.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (!started) {
                start();
            }
        });
        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
            if (!video.ended && started) {
                shell.classList.add('is-playing');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(initPlayer);
}());
