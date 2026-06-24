const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekends = ['Saturday', 'Sunday'];
const allDays = [...weekdays, ...weekends];

const API_BASE = 'https://indigo-worker.soft-resonance-63c0.workers.dev';
const GIST_URL = 'https://gist.githubusercontent.com/Lem0naise/5a9a13fb6f77909b8d2833f9e69565cb/raw/schedule.json';

const WEATHER_ICONS = {
    0: 'fa-sun', 1: 'fa-sun', 2: 'fa-cloud-sun', 3: 'fa-cloud',
    45: 'fa-smog', 48: 'fa-smog', 51: 'fa-cloud-rain', 53: 'fa-cloud-rain',
    55: 'fa-cloud-rain', 56: 'fa-cloud-meatball', 57: 'fa-cloud-meatball', 61: 'fa-cloud-rain',
    63: 'fa-cloud-rain', 65: 'fa-cloud-showers-heavy', 66: 'fa-cloud-meatball', 67: 'fa-cloud-showers-heavy',
    71: 'fa-snowflake', 73: 'fa-snowflake', 75: 'fa-snowflake', 77: 'fa-snowflake',
    80: 'fa-cloud-rain', 81: 'fa-cloud-rain', 82: 'fa-cloud-showers-heavy', 85: 'fa-snowflake',
    86: 'fa-snowflake', 95: 'fa-bolt', 96: 'fa-bolt', 99: 'fa-bolt'
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
    { screen: '....zzzzzz....', days: allDays, start: 23, end: 7 },
    { screen: 'weekend :)', days: weekends, start: 0, end: 24 },
    { screen: 'unwinding', days: weekdays, start: 0, end: 24 }
];

class StatusUpdates {
    constructor() {
        // Collect NodeLists for both layouts
        this.ascTimes   = document.querySelectorAll('.asc-time-display');
        this.ascDays    = document.querySelectorAll('.asc-day');
        this.ascActs    = document.querySelectorAll('.asc-act');
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
        
        this.initKudos();
    }

    initKudos() {
        var self = this;
        if (window.fetchTotalCount) {
            window.fetchTotalCount().then(function (total) {
                self.updateAsciiFields(self.ascKudos, total.toLocaleString(), 10);
            }).catch(function () {});
        }
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
        var cached = localStorage.getItem('githubActivity');
        if (cached) {
            var parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < 60 * 60 * 1000) return parsed.data;
        }
        try {
            const res = await fetch('https://api.github.com/users/Lem0naise/events/public');
            if (!res.ok) throw new Error('API limit');
            const events = await res.json();
            const pushEvent = events.find(e => e.type === 'PushEvent');
            if (pushEvent) {
                var data = { repo: pushEvent.repo.name, date: pushEvent.created_at };
                localStorage.setItem('githubActivity', JSON.stringify({ data: data, timestamp: Date.now() }));
                return data;
            }
        } catch (e) {}
        return null;
    }

    async loadGitHubActivity() {
        try {
            const [activity, githubData] = await Promise.all([this.getRecentGitHubActivity(), this.getCodingStreak()]);
            const total = githubData.totalContributions || 0;

            if (githubData.createdAt) {
                const created = new Date(githubData.createdAt);
                const now = new Date();
                var years = now.getFullYear() - created.getFullYear();
                var months = now.getMonth() - created.getMonth();
                var days = now.getDate() - created.getDate();
                if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
                if (months < 0) { years--; months += 12; }
                var activeStr = years + 'yr ' + months + 'mo ' + days + 'd';
                this.updateAsciiFields(this.ascStreaks, activeStr, 13);
            } else {
                this.updateAsciiFields(this.ascStreaks, '--', 10);
            }

            this.updateAsciiFields(this.ascTotals, total.toLocaleString(), 10);

            if (activity && activity.repo) {
                const diff = Date.now() - new Date(activity.date).getTime();
                var repoName = activity.repo.split('/')[1] || activity.repo;
                var maxRepo = 10 - 1;
                if (repoName.length > maxRepo) repoName = repoName.substring(0, maxRepo - 1) + '\u2026';
                var link = '<a href="https://github.com/' + activity.repo + '" target="_blank">' + repoName + '</a> ';
                this.setAsciiLink(this.ascLasts, link, 12);
            } else {
                this.setAsciiLink(this.ascLasts, 'caching...', 12);
            }
        } catch (e) {
             this.setAsciiLink(this.ascLasts, 'error', 12);
        }
    }

    setAsciiLink(elements, html, maxLength) {
        if (!elements || elements.length === 0) return;
        var div = document.createElement('div');
        div.innerHTML = html;
        var visible = div.textContent || '';
        var pad = maxLength - visible.length;
        if (pad < 0) pad = 0;
        var padded = html;
        for (var i = 0; i < pad; i++) padded += '&nbsp;';
        elements.forEach(function (el) {
            el.innerHTML = padded;
        });
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
            this.stopMarquee('_song');
            this.updateAsciiFields(this.ascSBubs, '', 20, 'right');
            return;
        }

        this.startMarquee('_song', this.ascSBubs, displayStr, 20, 'right');
    }

    startMarquee(key, elements, text, width, align) {
        this.stopMarquee(key);

        if (text.length <= width) {
            this.updateAsciiFields(elements, text, width, align);
            return;
        }

        const sep = key === '_song' ? '  ♪  ' : '  ';
        const target = text + sep;
        let pos = 0;

        const tick = () => {
            let segment = '';
            for (let i = 0; i < width; i++) {
                segment += target[(pos + i) % target.length];
            }
            this.updateAsciiFields(elements, segment, width, align);
            pos = (pos + 1) % target.length;
        };

        tick();
        this[key + 'Timer'] = setInterval(tick, 350);
    }

    stopMarquee(key) {
        if (this[key + 'Timer']) {
            clearInterval(this[key + 'Timer']);
            this[key + 'Timer'] = null;
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
                    if (hour >= ev.start || hour < ev.end) return { msg: ev, hour, minute, day };
                } else {
                    if (hour >= ev.start && hour < ev.end) return { msg: ev, hour, minute, day };
                }
            }
        }
        return { msg: schedule[schedule.length - 1], hour, minute, day };
    }

    applyCurrentlyDoing() {
        const doing = this.generateCurrentlyDoing();
        this.startMarquee('_act', this.ascActs, doing.msg.screen, 24, 'left');
        this.updateAsciiFields(this.ascDays, doing.day.toUpperCase(), 9);
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
        const label = WEATHER_LABELS[code] || 'UNKNOWN';

        this.ascWIcos.forEach(function (el) {
            el.className = 'asc-accent asc-w-icon fa-solid ' + faClass;
        });
        this.updateAsciiFields(this.ascWLbls, label, 7);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StatusUpdates();
});