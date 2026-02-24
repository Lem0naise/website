const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekends = ['Saturday', 'Sunday'];
const allDays = [...weekdays, ...weekends];

// Your Worker URL
const API_BASE = 'https://indigo-worker.soft-resonance-63c0.workers.dev';

const WEATHER_CODES = {
    0: { desc: 'Clear sky', message: 'a perfectly clear sky!' },
    1: { desc: 'Mainly clear', message: 'mainly clear with a few clouds.' },
    2: { desc: 'Partly cloudy', message: 'a mix of sun and clouds.' },
    3: { desc: 'Overcast', message: 'cloudy, as usual.' },
    45: { desc: 'Fog', message: 'quite foggy out there.' },
    48: { desc: 'Depositing rime fog', message: 'chilling, freezing fog.' },
    51: { desc: 'Light drizzle', message: 'rain, rain, rain.' },
    53: { desc: 'Moderate drizzle', message: 'quite a lot of rain.' },
    55: { desc: 'Dense drizzle', message: 'soaking rain.' },
    56: { desc: 'Light freezing drizzle', message: 'light, icy drizzle.' },
    57: { desc: 'Dense freezing drizzle', message: 'dense, freezing drizzle.' },
    61: { desc: 'Slight rain', message: 'rain, rain, rain.' },
    63: { desc: 'Moderate rain', message: 'constant rain.' },
    65: { desc: 'Heavy rain', message: 'heavy rain coming down hard.' },
    66: { desc: 'Light freezing rain', message: 'light freezing rain.' },
    67: { desc: 'Heavy freezing rain', message: 'heavy freezing rain.' },
    71: { desc: 'Slight snow', message: 'a light dusting of snow.' },
    73: { desc: 'Moderate snow', message: 'steady snow.' },
    75: { desc: 'Heavy snow', message: 'heavy snow.' },
    77: { desc: 'Snow grains', message: 'fine grains of snow in the air.' },
    80: { desc: 'Slight rain showers', message: 'rain, rain, rain.' },
    81: { desc: 'Moderate rain showers', message: 'very rainy.' },
    82: { desc: 'Violent rain showers', message: 'absolutely pouring rain.' },
    85: { desc: 'Slight snow showers', message: 'brief, light snow showers.' },
    86: { desc: 'Heavy snow showers', message: 'bursts of heavy snow.' },
    95: { desc: 'Thunderstorm', message: 'a thunderstorm brewing.' },
    96: { desc: 'Thunderstorm with light hail', message: 'a thunderstorm with light hail.' },
    99: { desc: 'Thunderstorm with heavy hail', message: 'a thunderstorm with heavy hail!' }
};

const schedule = [
    { activity: 'building robots.', days: ['Thursday'], start: 18, end: 23 },
    { activity: 'attempting a new PB at Parkrun.', days: ['Saturday'], start: 9, end: 10 },
    { activity: 'at the gym or climbing.', days: ['Monday', 'Wednesday', 'Friday', 'Saturday', 'Sunday'], start: 19, end: 22 },
    { activity: 'preparing for the week ahead.', days: ["Sunday"], start: 21, end: 24 },
    { activity: 'eating dinner.', days: allDays, start: 18, end: 20 },
    { activity: 'having breakfast.', days: allDays, start: 7, end: 9 },
    { activity: 'at lectures, unfortunately.', days: weekdays, start: 9, end: 17 },
    { activity: 'sleeping.', days: allDays, start: 23, end: 7 },
    { activity: "relaxing, it's the weekend!", days: weekends, start: 0, end: 24 },
    { activity: "unwinding.", days: weekdays, start: 0, end: 24 },
];

class StatusUpdates {
    constructor() {
        this.githubActivity = document.getElementById('github-activity');
        this.currentlyDoing = document.getElementById('custom-status');
        this.weatherStatus = document.getElementById('weather-status');
        this.spotifyStatus = document.getElementById('spotify-status');
        this.visitorCounter = document.getElementById('visitor-count');

        this.init();
    }

    init() {
        this.loadGitHubActivity();
        this.applyCurrentlyDoing();
        this.applyWeatherStatus();
        this.applySpotifyStatus();
        this.initClapCounter(); // <-- changed

        setInterval(() => this.applyCurrentlyDoing(), 60000);
        setInterval(() => this.applySpotifyStatus(), 30000);
    }

    // --- GITHUB LOGIC ---

    async getCodingStreak() {
        const cached = localStorage.getItem('codingStreak');
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < 60 * 60 * 1000) return data; // 1 hour cache
        }

        try {
            const response = await fetch(`${API_BASE}/github`);
            const data = await response.json();
            
            localStorage.setItem('codingStreak', JSON.stringify({
                data,
                timestamp: Date.now()
            }));
            return data;
        } catch (error) {
            console.error('Error fetching coding streak:', error);
            return { streak: 0 };
        }
    }

    async getRecentGitHubActivity() {
        try {
            const response = await fetch(`https://api.github.com/users/Lem0naise/events/public`);
            const events = await response.json();
            const pushEvent = events.find(event => event.type === 'PushEvent');
            if (pushEvent) {
                return {
                    repo: pushEvent.repo.name,
                    date: new Date(pushEvent.created_at)
                };
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async loadGitHubActivity() {
        try {
            const [activity, streakData] = await Promise.all([
                this.getRecentGitHubActivity(),
                this.getCodingStreak()
            ]);

            const combinedData = { ...activity, streak: streakData.streak, total:streakData.totalContributions, createdAt: streakData.createdAt };
            this.displayGithubActivity(combinedData);

        } catch (error) {
            this.githubActivity.textContent = 'GitHub: Doing something...';
        }
    }

    displayGithubActivity(data) {
        if (data && data.repo) {
            const timeDiff = new Date() - new Date(data.date);
            const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
            const timeText = hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;

            let html = `Last commit to <a class='status-text' target="_blank" href="https://github.com/${data.repo}">${data.repo.split('/')[1]}</a> ${timeText}.`;


            
            if (data.streak > 0) {
                 html += ` On a <span class='status-text'>${data.streak}-day streak</span>.`;
            }
            if (data.total > 0){
                  html += ` <span class='status-text'>${data.total.toLocaleString()}</span> total contributions`;
                  if (data.createdAt) { 
                    const createdYear = new Date(data.createdAt).getFullYear();
                    const currentYear = new Date().getFullYear();
                    const yearsActive = currentYear - createdYear;

                    // Handle the "0 years" case for brand new accounts
                    const yearText = yearsActive <= 1 ? "year" : `${yearsActive} years`;

                    html += ` over the last <span class='status-text'>${yearText}</span>.`;
                  }
                  else {
                  }
            }
             else {
            }

            this.githubActivity.innerHTML = html;
        } else {
            this.githubActivity.innerHTML = 'Building <a target="_blank" href="https://github.com/Lem0naise/cashcat">CashCat</a>...';
        }
    }

    // --- SPOTIFY LOGIC ---

    async getSpotifyStatus() {
        try {
            const response = await fetch(`${API_BASE}/spotify`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching Spotify status:', error);
            return null;
        }
    }

    async applySpotifyStatus() {
        const songData = await this.getSpotifyStatus();

        if (songData && songData.isPlaying) {
            this.spotifyStatus.innerHTML = `Listening to <a href="${songData.url}" target="_blank" class='status-text'>${songData.title}</a> by ${songData.artist}.`;
            this.spotifyStatus.style.display = 'list-item';
        } else {
            this.spotifyStatus.style.display = 'none';
        }
    }

    // --- CLAP COUNTER LOGIC ---

    getClapClicksThisMinute() {
        const raw = localStorage.getItem('clapClicks');
        if (!raw) return { count: 0, windowStart: Date.now() };
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.windowStart > 60 * 1000) {
            return { count: 0, windowStart: Date.now() };
        }
        return parsed;
    }

    recordClapClick() {
        const current = this.getClapClicksThisMinute();
        const updated = { count: current.count + 1, windowStart: current.windowStart };
        localStorage.setItem('clapClicks', JSON.stringify(updated));
        return updated.count;
    }

    formatClapDisplay(count, state = 'default') {
        const formatted = count.toLocaleString();
        const suffix = state === 'thanks' ? '— thanks!' : "— <span class='kudos-count'>click</span> to give kudos";
        return `<span class='kudos-count'>${formatted}</span> kudos ${suffix}`;
    }

    async initClapCounter() {
        const clapItem = document.getElementById('clap-item');
        const clapDisplay = document.getElementById('clap-display');
        if (!clapItem || !clapDisplay) return;

        let currentCount = 0;

        // Load initial count
        try {
            const response = await fetch(`${API_BASE}/visit`);
            const data = await response.json();
            currentCount = data.count;
            clapDisplay.innerHTML = this.formatClapDisplay(currentCount);
        } catch (e) {
            clapDisplay.innerHTML = `<span class='kudos-count'>?</span> kudos — <span class='kudos-count'>click</span> to give one!`;
        }

        // Click handler
        clapItem.addEventListener('click', async () => {
            const clicksThisMinute = this.getClapClicksThisMinute().count;
            if (clicksThisMinute >= 10) {
                clapDisplay.innerHTML = `<span class='kudos-count'>${currentCount.toLocaleString()}</span> kudos — thanks, but slow down! `;
                return;
            }

            this.recordClapClick();

            try {
                const response = await fetch(`${API_BASE}/visit`, { method: 'POST' });
                const data = await response.json();
                currentCount = data.count;
                clapDisplay.innerHTML = this.formatClapDisplay(currentCount, 'thanks');
                setTimeout(() => {
                    clapDisplay.innerHTML = this.formatClapDisplay(currentCount, 'default');
                }, 3000);
            } catch (e) {
                clapDisplay.innerHTML = `<span class='kudos-count'>${currentCount.toLocaleString()}</span> kudos — registered (probably)`;
            }
        });
    }

    // --- SCHEDULE & WEATHER (Unchanged) ---

    generateCurrentlyDoing() {
        const now = new Date();
        const options = { timeZone: 'Europe/London', weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: false };
        const formatter = new Intl.DateTimeFormat('en-GB', options);
        const parts = formatter.formatToParts(now);
        const dayOfWeek = parts.find(p => p.type === 'weekday').value;
        const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
        const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);
        const currentTime = hour + (minute / 60);

        for (const event of schedule) {
            if (event.days.includes(dayOfWeek)) {
                if (event.start > event.end) {
                    if (currentTime >= event.start || currentTime < event.end) return this.formatStatus(hour, minute, event.activity);
                } else {
                    if (currentTime >= event.start && currentTime < event.end) return this.formatStatus(hour, minute, event.activity);
                }
            }
        }
        return "unwinding.";
    }
    
    formatStatus(h, m, activity) {
        return `It's <span class='status-text'>${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}</span>: I'm probably <span class='status-text'>${activity}</span>`;
    }

    applyCurrentlyDoing() {
        this.currentlyDoing.innerHTML = this.generateCurrentlyDoing();
    }

    async getWeatherStatus() {
        const cached = localStorage.getItem('weather');
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < 10 * 60 * 1000) return data;
        }
        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=50.9065&longitude=-1.4063&hourly=weather_code&forecast_days=1`);
            const data = await response.json();
            localStorage.setItem('weather', JSON.stringify({ data, timestamp: Date.now() }));
            return data;
        } catch (e) { return null; }
    }

    async applyWeatherStatus() {
        const data = await this.getWeatherStatus();
        if(!data) return;
        
        const currentHour = new Date().toISOString().substring(0, 13) + ':00';
        const index = data.hourly.time.findIndex(t => t.startsWith(currentHour));
        const code = index !== -1 ? data.hourly.weather_code[index] : 3;
        const msg = WEATHER_CODES[code]?.message || "experiencing weather.";
        
        this.weatherStatus.innerHTML = `My weather is <span class='status-text'>${msg}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', () => new StatusUpdates());