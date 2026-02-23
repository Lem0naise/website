const tracks = [
    {
        id: "main-song",
        title: "<a href='https://damaskus.indigo.spot'>Damaskus</a> Main Theme",
        audioSrc: "mainSong.wav",
        subtitles: [
            { time: 0, text: "The intro builds" },
            { time: 6, text: "Catchy hook comes in" },
            { time: 21, text: "Get ready for the buildup..." },
            { time: 37, text: "Beat drop!!" },
            { time: 40, text: "Back to the hook..." },
            { time: 52, text: "A fade back into the loop..." }
        ]
    }
];

// SVG icons for play/pause
const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('music-list');

    tracks.forEach((track, index) => {
        // Create audio element
        const audio = new Audio(track.audioSrc);
        audio.preload = 'metadata';

        // Build HTML structure
        const trackHtml = `
            <div class="track-container" data-track-id="${track.id}">
                <div class="track-header">
                    <h3 class="track-title">${track.title}</h3>
                </div>
                
                <div class="player-controls">
                    <button class="play-pause-btn" id="play-btn-${track.id}" aria-label="Play">
                        ${playIcon}
                    </button>
                    
                    <div class="progress-container">
                        <div class="progress-bar-bg" id="progress-bg-${track.id}">
                            <div class="progress-bar-fill" id="progress-fill-${track.id}"></div>
                        </div>
                        <div class="time-display">
                            <span id="time-current-${track.id}">0:00</span>
                            <span id="time-duration-${track.id}">0:00</span>
                        </div>
                    </div>
                </div>

                <div class="subtitles-container" id="subtitles-${track.id}">
                    ${track.subtitles.map((sub, i) => `
                        <div class="subtitle-line" data-index="${i}" data-time="${sub.time}">
                            ${sub.text}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        listContainer.insertAdjacentHTML('beforeend', trackHtml);

        // Get elements
        const playBtn = document.getElementById(`play-btn-${track.id}`);
        const progressBg = document.getElementById(`progress-bg-${track.id}`);
        const progressFill = document.getElementById(`progress-fill-${track.id}`);
        const timeCurrent = document.getElementById(`time-current-${track.id}`);
        const timeDuration = document.getElementById(`time-duration-${track.id}`);
        const subtitlesContainer = document.getElementById(`subtitles-${track.id}`);
        const subtitleLines = subtitlesContainer.querySelectorAll('.subtitle-line');

        // Setup audio events
        audio.addEventListener('loadedmetadata', () => {
            timeDuration.textContent = formatTime(audio.duration);
        });

        // Toggle play/pause
        playBtn.addEventListener('click', () => {
            // Pause all other tracks
            document.querySelectorAll('audio').forEach(a => {
                if (a !== audio && !a.paused) {
                    a.pause();
                }
            });
            // Update other play buttons
            document.querySelectorAll('.play-pause-btn').forEach(btn => {
                if (btn !== playBtn) btn.innerHTML = playIcon;
            });

            if (audio.paused) {
                audio.play();
                playBtn.innerHTML = pauseIcon;
            } else {
                audio.pause();
                playBtn.innerHTML = playIcon;
            }
        });

        audio.addEventListener('ended', () => {
            playBtn.innerHTML = playIcon;
        });

        // Time update -> progress bar and subtitles sync
        audio.addEventListener('timeupdate', () => {
            const currentTime = audio.currentTime;
            const duration = audio.duration || 1;

            // Update progress
            progressFill.style.width = `${(currentTime / duration) * 100}%`;
            timeCurrent.textContent = formatTime(currentTime);

            // Find current subtitle
            let activeIndex = -1;
            for (let i = 0; i < track.subtitles.length; i++) {
                if (currentTime >= track.subtitles[i].time) {
                    activeIndex = i;
                } else {
                    break;
                }
            }

            // Highlight and scroll
            if (activeIndex !== -1) {
                let currentActive = subtitlesContainer.querySelector('.subtitle-line.active');
                let newActive = subtitleLines[activeIndex];

                if (currentActive !== newActive) {
                    if (currentActive) currentActive.classList.remove('active');
                    newActive.classList.add('active');

                    // Center scroll
                    const containerHeight = subtitlesContainer.clientHeight;
                    const lineOffset = newActive.offsetTop;
                    const lineHeight = newActive.clientHeight;
                    const scrollTarget = lineOffset - (containerHeight / 2) + (lineHeight / 2);

                    subtitlesContainer.scrollTo({
                        top: scrollTarget,
                        behavior: 'smooth'
                    });
                }
            }
        });

        // Seek functionality
        progressBg.addEventListener('click', (e) => {
            const rect = progressBg.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            audio.currentTime = pos * audio.duration;
        });

        // Click subtitle to jump
        subtitleLines.forEach((line) => {
            line.addEventListener('click', () => {
                const time = parseFloat(line.getAttribute('data-time'));
                audio.currentTime = time;
                if (audio.paused) {
                    audio.play();
                    playBtn.innerHTML = pauseIcon;
                }
            });
        });
    });
});
