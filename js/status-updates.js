const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekends = ['Saturday', 'Sunday'];
const allDays = [...weekdays, ...weekends];

const API_BASE = 'https://indigo-worker.soft-resonance-63c0.workers.dev';

const WEATHER_ICONS = {
    0:  'fa-sun', 1:  'fa-sun', 2:  'fa-cloud-sun', 3:  'fa-cloud',
    45: 'fa-smog', 48: 'fa-smog', 51: 'fa-cloud-rain', 53: 'fa-cloud-rain',
    55: 'fa-cloud-rain', 56: 'fa-cloud-meatball', 57: 'fa-cloud-meatball',
    61: 'fa-cloud-rain', 63: 'fa-cloud-rain', 65: 'fa-cloud-showers-heavy',
    66: 'fa-cloud-meatball', 67: 'fa-cloud-showers-heavy', 71: 'fa-snowflake',
    73: 'fa-snowflake', 75: 'fa-snowflake', 77: 'fa-snowflake',
    80: 'fa-cloud-rain', 81: 'fa-cloud-rain', 82: 'fa-cloud-showers-heavy',
    85: 'fa-snowflake', 86: 'fa-snowflake', 95: 'fa-bolt', 96: 'fa-bolt', 99: 'fa-bolt'
};

const WEATHER_LABELS = {
    0:  'clear', 1:  'sunny', 2:  'clouds', 3:  'cloudy',
    45: 'fog', 48: 'fog', 51: 'rain', 53: 'rain',
    55: 'rain', 56: 'ice', 57: 'ice', 61: 'rain',
    63: 'rain', 65: 'storm', 66: 'ice', 67: 'storm',
    71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow',
    80: 'rain', 81: 'rain', 82: 'storm', 85: 'snow',
    86: 'snow', 95: 'storm', 96: 'storm', 99: 'storm'
};

const schedule = [
    { pose: 'typing',   screen: 'building robots',     days: ['Thursday'], start: 18, end: 23 },
    { pose: 'absent',   screen: 'parkrun!',            days: ['Saturday'], start: 9,  end: 10 },
    { pose: 'absent',   screen: 'at the gym',          days: ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'], start: 19, end: 22 },
    { pose: 'typing',   screen: 'planning',            days: ['Sunday'],   start: 21, end: 24 },
    { pose: 'relaxing', screen: 'eating dinner',       days: allDays,      start: 18, end: 20 },
    { pose: 'relaxing', screen: 'breakfast',           days: allDays,      start: 7,  end: 9 },
    { pose: 'absent',   screen: 'at uni',              days: weekdays,     start: 9,  end: 17 },
    { pose: 'sleeping', screen: 'zzz...',              days: allDays,      start: 23, end: 7 },
    { pose: 'relaxing', screen: 'weekend :)',          days: weekends,     start: 0,  end: 24 },
    { pose: 'relaxing', screen: 'unwinding',           days: weekdays,     start: 0,  end: 24 }
];

class StatusUpdates {
    constructor() {
        this.roomScreen     = document.getElementById('room-screen');
        this.roomWeather    = document.getElementById('room-weather-icon');
        this.roomWeatherLbl = document.getElementById('room-weather-label');
        this.roomStreak     = document.getElementById('room-streak-num');
        this.roomTotal      = document.getElementById('room-total');
        this.roomLastCommit = document.getElementById('room-last-commit');
        this.roomSpeaker    = document.getElementById('room-speaker');
        this.roomSpeakerLbl = document.getElementById('room-speaker-label');
        this.roomCharacter  = document.getElementById('room-character');

        this.init();
    }

    init() {
        if (!this.roomScreen) return;

        this.loadGitHubActivity();
        this.applyCurrentlyDoing();
        this.applyWeatherStatus();
        this.applySpotifyStatus();
        this.initKudos();

        setInterval(() => this.applyCurrentlyDoing(), 60000);
        setInterval(() => this.applySpotifyStatus(), 30000);
    }

    /* ── GitHub activity ─────────────────────────── */
    async getCodingStreak() {
        const cached = localStorage.getItem('codingStreak');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < 60 * 60 * 1000) return parsed.data;
        }
        try {
            const res = await fetch(`${API_BASE}/github`);
            const data = await res.json();
            localStorage.setItem('codingStreak', JSON.stringify({ data, timestamp: Date.now() }));
            return data;
        } catch (e) { return { streak: 0 }; }
    }

    async getRecentGitHubActivity() {
        try {
            const res = await fetch('https://api.github.com/users/Lem0naise/events/public');
            const events = await res.json();
            const pushEvent = events.find(e => e.type === 'PushEvent');
            if (pushEvent) {
                return { repo: pushEvent.repo.name, date: new Date(pushEvent.created_at) };
            }
        } catch (e) {}
        return null;
    }

    async loadGitHubActivity() {
        try {
            const [activity, githubData] = await Promise.all([this.getRecentGitHubActivity(), this.getCodingStreak()]);
            const streak = githubData.streak || 0;
            const total = githubData.totalContributions || 0;

            this.roomStreak.textContent = streak > 0 ? streak : '0';
            this.roomTotal.textContent = total > 0 ? `${total.toLocaleString()} total` : '0 total';

            if (activity && activity.repo) {
                const diff = new Date() - new Date(activity.date);
                const hoursAgo = Math.floor(diff / (1000 * 60 * 60));
                const timeText = hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;
                const repoName = activity.repo.split('/')[1] || activity.repo;
                
                this.roomLastCommit.innerHTML = `<a href="https://github.com/${activity.repo}" target="_blank">${repoName}</a> ${timeText}`;
            }
        } catch (e) {
            this.roomScreen.textContent = 'building things…';
        }
    }

    /* ── Spotify ──────────────────────────────────── */
    async getSpotifyStatus() {
        try {
            const res = await fetch(`${API_BASE}/spotify`);
            return await res.json();
        } catch (e) { return null; }
    }

    async applySpotifyStatus() {
        const song = await this.getSpotifyStatus();

        if (song && song.isPlaying) {
            this.roomSpeaker.classList.add('active');
            this.roomSpeakerLbl.textContent = `${song.title} — ${song.artist}`;
            this.roomSpeakerLbl.classList.add('visible');
        } else if (song && song.lastPlayed) {
            this.roomSpeaker.classList.remove('active');
            this.roomSpeakerLbl.textContent = `${song.lastPlayed.title} — ${song.lastPlayed.artist}`;
            this.roomSpeakerLbl.classList.add('visible');
        } else {
            this.roomSpeaker.classList.remove('active');
            this.roomSpeakerLbl.classList.remove('visible');
        }
    }

    /* ── Kudos ────────────────────────────────────── */
    initKudos() {
        const el = document.getElementById('room-kudos');
        if (!el || typeof window.mountKudos !== 'function') return;
        window.mountKudos(el, { layout: 'inline', ctaText: '' });
    }

    /* ── Activity / character pose ────────────────── */
    generateCurrentlyDoing() {
        const now = new Date();
        const opts = { timeZone: 'Europe/London', weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: false };
        const fmt = new Intl.DateTimeFormat('en-GB', opts);
        const parts = fmt.formatToParts(now);
        const day = parts.find(p => p.type === 'weekday').value;
        const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
        const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);

        for (const ev of schedule) {
            if (ev.days.includes(day)) {
                if (ev.start > ev.end) {
                    if (hour >= ev.start || hour < ev.end) return { msg: ev, hour, minute };
                } else {
                    if (hour >= ev.start && hour < ev.end) return { msg: ev, hour, minute };
                }
            }
        }
        return { msg: schedule[schedule.length - 1], hour, minute };
    }

    pad2(n) { return (n < 10 ? '0' : '') + n; }

    applyCurrentlyDoing() {
        const doing = this.generateCurrentlyDoing();
        const timeStr = `${this.pad2(doing.hour)}:${this.pad2(doing.minute)}`;
        
        this.roomScreen.textContent = `> ${timeStr} ${doing.msg.screen}`;
        
        if (this.roomCharacter) {
            this.roomCharacter.setAttribute('data-pose', doing.msg.pose);
            if (doing.msg.pose === 'sleeping') {
                this.roomCharacter.className = 'room-character fa-solid fa-moon';
            } else if (doing.msg.pose === 'relaxing') {
                this.roomCharacter.className = 'room-character fa-solid fa-mug-hot';
            } else {
                this.roomCharacter.className = 'room-character fa-solid fa-user';
            }
        }
    }

    /* ── Weather ──────────────────────────────────── */
    async getWeatherStatus() {
        const cached = localStorage.getItem('weather');
        if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < 10 * 60 * 1000) return parsed.data;
        }
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=50.9065&longitude=-1.4063&hourly=weather_code&forecast_days=1');
            const data = await res.json();
            localStorage.setItem('weather', JSON.stringify({ data, timestamp: Date.now() }));
            return data;
        } catch (e) { return null; }
    }

    async applyWeatherStatus() {
        const data = await this.getWeatherStatus();
        if (!data) return;

        const hour = `${new Date().toISOString().substring(0, 13)}:00`;
        const idx = data.hourly.time.findIndex(t => t.startsWith(hour));
        const code = idx !== -1 ? data.hourly.weather_code[idx] : 3;
        const faClass = WEATHER_ICONS[code] || 'fa-cloud';
        const label = WEATHER_LABELS[code] || '?';

        this.roomWeather.className = `fa-solid ${faClass}`;
        this.roomWeatherLbl.textContent = label;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StatusUpdates();
});