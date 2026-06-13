const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekends = ['Saturday', 'Sunday'];
const allDays = [...weekdays, ...weekends];

const API_BASE = 'https://indigo-worker.soft-resonance-63c0.workers.dev';
const GIST_URL = 'https://gist.githubusercontent.com/Lem0naise/5a9a13fb6f77909b8d2833f9e69565cb/raw/schedule.json';

const WEATHER_ICONS = {
    0: '[*]', 1: '[*]', 2: '[~]', 3: '[~]',
    45: '[=]', 48: '[=]', 51: '[/]', 53: '[/]',
    55: '[/]', 56: '[!]', 57: '[!]', 61: '[/]',
    63: '[/]', 65: '[///]', 66: '[!]', 67: '[///]',
    71: '[*]', 73: '[*]', 75: '[*]', 77: '[*]',
    80: '[/]', 81: '[/]', 82: '[///]', 85: '[*]',
    86: '[*]', 95: '[Z]', 96: '[Z]', 99: '[Z]'
};

const WEATHER_LABELS = {
    0: 'CLEAR', 1: 'SUNNY', 2: 'CLOUDS', 3: 'CLOUDY',
    45: 'FOG', 48: 'FOG', 51: 'RAIN', 53: 'RAIN',
    55: 'RAIN', 56: 'ICE', 57: 'ICE', 61: 'RAIN',
    63: 'RAIN', 65: 'STORM', 66: 'ICE', 67: 'STORM',
    71: 'SNOW', 73: 'SNOW', 75: 'SNOW', 77: 'SNOW',
    80: 'RAIN', 81: 'RAIN', 82: 'STORM', 85: 'SNOW',
    86: 'SNOW', 95: 'STORM', 96: 'STORM', 99: 'STORM'
};

const schedule = [
    { pose: 'typing', screen: 'building bots', days: ['Thursday'], start: 18, end: 23, label: 'CODING' },
    { pose: 'absent', screen: 'parkrun!', days: ['Saturday'], start: 9, end: 10, label: 'RUNNING' },
    { pose: 'absent', screen: 'at the gym', days: ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'], start: 19, end: 22, label: 'LIFTING' },
    { pose: 'typing', screen: 'planning', days: ['Sunday'], start: 21, end: 24, label: 'PLANNING' },
    { pose: 'relaxing', screen: 'eating dinner', days: allDays, start: 18, end: 20, label: 'EATING' },
    { pose: 'relaxing', screen: 'breakfast', days: allDays, start: 7, end: 9, label: 'EATING' },
    { pose: 'absent', screen: 'at uni', days: weekdays, start: 9, end: 17, label: 'STUDYING' },
    { pose: 'sleeping', screen: 'zzz...', days: allDays, start: 23, end: 7, label: 'SLEEPING' },
    { pose: 'relaxing', screen: 'weekend :)', days: weekends, start: 0, end: 24, label: 'CHILLING' },
    { pose: 'relaxing', screen: 'unwinding', days: weekdays, start: 0, end: 24, label: 'CHILLING' }
];

class StatusUpdates {
    constructor() {
        // Collect NodeLists for both layouts
        this.ascTimes   = document.querySelectorAll('.asc-time-display');
        this.ascActs    = document.querySelectorAll('.asc-act');
        this.ascCBubs   = document.querySelectorAll('.asc-c-bub');
        this.ascSBubs   = document.querySelectorAll('.asc-s-bub');
        this.ascWIcos   = document.querySelectorAll('.asc-w-icon');
        this.ascWLbls   = document.querySelectorAll('.asc-w-lbl');
        this.ascKudos   = document.querySelectorAll('.asc-kudos');
        this.ascStreaks = document.querySelectorAll('.asc-streak');
        this.ascTotals  = document.querySelectorAll('.asc-total');
        this.ascLasts   = document.querySelectorAll('.asc-last');

        this.init();
    }

    async init() {
        const overrides = await this.getGistOverrides();
        if (overrides.length > 0) {
            schedule.unshift(...overrides);
        }

        this.startClock();
        this.loadGitHubActivity();
        this.applyCurrentlyDoing();
        this.applyWeatherStatus();
        this.applySpotifyStatus();

        setInterval(() => this.applyCurrentlyDoing(), 60000);
        setInterval(() => this.applySpotifyStatus(), 30000);
        
        // Mock Kudos display
        this.updateAsciiFields(this.ascKudos, "1,112", 10);
    }

    async getGistOverrides() {
        try {
            const res = await fetch(GIST_URL);
            if (!res.ok) return [];
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (e) {
            return [];
        }
    }

    // Loops over the target array elements to prevent duplicating logic
    updateAsciiFields(elements, text, maxLength, align = 'left') {
        if (!elements || elements.length === 0) return;
        
        let safeText = text.length > maxLength ? text.substring(0, maxLength - 2) + '..' : text;
        let paddedText = align === 'right' ? safeText.padStart(maxLength, ' ') : safeText.padEnd(maxLength, ' ');
        let formattedHTML = paddedText.replace(/ /g, '&nbsp;');

        elements.forEach(el => {
            el.innerHTML = formattedHTML;
        });
    }
    
    startClock() {
        const updateClock = () => {
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            this.updateAsciiFields(this.ascTimes, `${hours}:${minutes} ${ampm}`, 8);
        };
        updateClock();
        setInterval(updateClock, 1000);
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

            this.updateAsciiFields(this.ascStreaks, `${streak}d`, 10);
            this.updateAsciiFields(this.ascTotals, `${total.toLocaleString()}`, 10);

            if (activity && activity.repo) {
                const diff = new Date() - new Date(activity.date);
                const hoursAgo = Math.floor(diff / (1000 * 60 * 60));
                const timeText = hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;
                this.updateAsciiFields(this.ascLast, timeText, 10);
            }
        } catch (e) {
             this.updateAsciiFields(this.ascLast, "error", 10);
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
        let displayStr = '';

        if (song && song.isPlaying) {
            displayStr = song.title + ' — ' + song.artist;
        } else if (song && song.lastPlayed) {
            displayStr = song.lastPlayed.title + ' — ' + song.lastPlayed.artist;
        }

        if (!displayStr) {
            this.stopMarquee();
            this.updateAsciiFields(this.ascSBubs, '', 16, 'right');
            return;
        }

        this.startMarquee(displayStr);
    }

    startMarquee(text) {
        this.stopMarquee();
        const target = text + '  ♪  ';
        let pos = 0;
        const width = 16;

        const tick = () => {
            let segment = '';
            for (let i = 0; i < width; i++) {
                segment += target[(pos + i) % target.length];
            }
            this.updateAsciiFields(this.ascSBubs, segment, width, 'right');
            pos = (pos + 1) % target.length;
        };

        tick();
        this._marqueeTimer = setInterval(tick, 350);
    }

    stopMarquee() {
        if (this._marqueeTimer) {
            clearInterval(this._marqueeTimer);
            this._marqueeTimer = null;
        }
    }

    /* ── Activity ── */
    generateCurrentlyDoing() {
        const now = new Date();
        const opts = { timeZone: 'Europe/London', weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: false };
        const fmt = new Intl.DateTimeFormat('en-GB', opts);
        const parts = fmt.formatToParts(now);
        const day = parts.find(p => p.type === 'weekday').value;
        const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
        const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);
        const dateStr = now.toISOString().substring(0, 10);

        for (const ev of schedule) {
            if (ev.date && ev.date !== dateStr) continue;
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

    applyCurrentlyDoing() {
        const doing = this.generateCurrentlyDoing();
        this.updateAsciiFields(this.ascActs, doing.msg.screen, 14);
        
        if (doing.msg.pose === 'absent') {
            this.updateAsciiFields(this.ascCBubs, " ", 8);
        } else {
            this.updateAsciiFields(this.ascCBubs, doing.msg.label, 8);
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
        
        const icon = WEATHER_ICONS[code] || '[?]';
        const label = WEATHER_LABELS[code] || 'UNKNOWN';

        this.updateAsciiFields(this.ascWIcos, icon, 7); // Keep both desktop/mobile rooms in sync
        this.updateAsciiFields(this.ascWLbls, label, 7);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StatusUpdates();
});