const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekends = ['Saturday', 'Sunday'];
const allDays = [...weekdays, ...weekends];

// Your Worker URL
const API_BASE = 'https://indigo-worker.soft-resonance-63c0.workers.dev';

const SVGS = {
    cloudy: '<svg style="width: 1.2em; height: 1.2em; vertical-align: -0.2em; margin-right: 4px; fill: currentColor;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>weather-cloudy</title><path d="M6,19A5,5 0 0,1 1,14A5,5 0 0,1 6,9C7,6.65 9.3,5 12,5C15.43,5 18.24,7.66 18.5,11.03L19,11A4,4 0 0,1 23,15A4,4 0 0,1 19,19H6M19,13H17V12A5,5 0 0,0 12,7C9.5,7 7.45,8.82 7.06,11.19C6.73,11.07 6.37,11 6,11A3,3 0 0,0 3,14A3,3 0 0,0 6,17H19A2,2 0 0,0 21,15A2,2 0 0,0 19,13Z" /></svg>',
    hail: '<svg style="width: 1.2em; height: 1.2em; vertical-align: -0.2em; margin-right: 4px; fill: currentColor;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>weather-hail</title><path d="M6,14A1,1 0 0,1 7,15A1,1 0 0,1 6,16A5,5 0 0,1 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12A4,4 0 0,1 19,16H18A1,1 0 0,1 17,15A1,1 0 0,1 18,14H19A2,2 0 0,0 21,12A2,2 0 0,0 19,10H17V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11A3,3 0 0,0 6,14M10,18A2,2 0 0,1 12,20A2,2 0 0,1 10,22A2,2 0 0,1 8,20A2,2 0 0,1 10,18M14.5,16A1.5,1.5 0 0,1 16,17.5A1.5,1.5 0 0,1 14.5,19A1.5,1.5 0 0,1 13,17.5A1.5,1.5 0 0,1 14.5,16M10.5,12A1.5,1.5 0 0,1 12,13.5A1.5,1.5 0 0,1 10.5,15A1.5,1.5 0 0,1 9,13.5A1.5,1.5 0 0,1 10.5,12Z" /></svg>',
    fog: '<svg style="width: 1.2em; height: 1.2em; vertical-align: -0.2em; margin-right: 4px; fill: currentColor;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>weather-fog</title><path d="M3,15H13A1,1 0 0,1 14,16A1,1 0 0,1 13,17H3A1,1 0 0,1 2,16A1,1 0 0,1 3,15M16,15H21A1,1 0 0,1 22,16A1,1 0 0,1 21,17H16A1,1 0 0,1 15,16A1,1 0 0,1 16,15M1,12A5,5 0 0,1 6,7C7,4.65 9.3,3 12,3C15.43,3 18.24,5.66 18.5,9.03L19,9C21.19,9 22.97,10.76 23,13H21A2,2 0 0,0 19,11H17V10A5,5 0 0,0 12,5C9.5,5 7.45,6.82 7.06,9.19C6.73,9.07 6.37,9 6,9A3,3 0 0,0 3,12C3,12.35 3.06,12.69 3.17,13H1.1L1,12M3,19H5A1,1 0 0,1 6,20A1,1 0 0,1 5,21H3A1,1 0 0,1 2,20A1,1 0 0,1 3,19M8,19H21A1,1 0 0,1 22,20A1,1 0 0,1 21,21H8A1,1 0 0,1 7,20A1,1 0 0,1 8,19Z" /></svg>',
    storm: '<svg style="width: 1.2em; height: 1.2em; vertical-align: -0.2em; margin-right: 4px; fill: currentColor;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>weather-lightning-rainy</title><path d="M4.5,13.59C5,13.87 5.14,14.5 4.87,14.96C4.59,15.44 4,15.6 3.5,15.33V15.33C2,14.47 1,12.85 1,11A5,5 0 0,1 6,6C7,3.65 9.3,2 12,2C15.43,2 18.24,4.66 18.5,8.03L19,8A4,4 0 0,1 23,12A4,4 0 0,1 19,16A1,1 0 0,1 18,15A1,1 0 0,1 19,14A2,2 0 0,0 21,12A2,2 0 0,0 19,10H17V9A5,5 0 0,0 12,4C9.5,4 7.45,5.82 7.06,8.19C6.73,8.07 6.37,8 6,8A3,3 0 0,0 3,11C3,12.11 3.6,13.08 4.5,13.6V13.59M9.5,11H12.5L10.5,15H12.5L8.75,22L9.5,17H7L9.5,11M17.5,18.67C17.5,19.96 16.5,21 15.25,21C14,21 13,19.96 13,18.67C13,17.12 15.25,14.5 15.25,14.5C15.25,14.5 17.5,17.12 17.5,18.67Z" /></svg>',
    partlyRainy: '<svg style="width: 1.2em; height: 1.2em; vertical-align: -0.2em; margin-right: 4px; fill: currentColor;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>weather-partly-rainy</title><path d="M12.75,4.47C15.1,5.5 16.35,8.03 15.92,10.46C17.19,11.56 18,13.19 18,15V15.17C18.31,15.06 18.65,15 19,15A3,3 0 0,1 22,18A3,3 0 0,1 19,21H17C17,21 16,21 16,20C16,19 17,19 17,19H19A1,1 0 0,0 20,18A1,1 0 0,0 19,17H16V15A4,4 0 0,0 12,11A4,4 0 0,0 8,15H6A2,2 0 0,0 4,17A2,2 0 0,0 6,19H7C7,19 8,19 8,20C8,21 7,21 7,21H6A4,4 0 0,1 2,17A4,4 0 0,1 6,13H6.27C5,11.45 4.6,9.24 5.5,7.25C6.72,4.5 9.97,3.24 12.75,4.47M11.93,6.3C10.16,5.5 8.09,6.31 7.31,8.07C6.85,9.09 6.93,10.22 7.41,11.13C8.5,9.83 10.16,9 12,9C12.7,9 13.38,9.12 14,9.34C13.94,8.06 13.18,6.86 11.93,6.3M13.55,2.63C13,2.4 12.45,2.23 11.88,2.12L14.37,0.82L15.27,3.71C14.76,3.29 14.19,2.93 13.55,2.63M6.09,3.44C5.6,3.79 5.17,4.19 4.8,4.63L4.91,1.82L7.87,2.5C7.25,2.71 6.65,3.03 6.09,3.44M18,8.71C17.91,8.12 17.78,7.55 17.59,7L19.97,8.5L17.92,10.73C18.03,10.08 18.05,9.4 18,8.71M3.04,10.3C3.11,10.9 3.25,11.47 3.43,12L1.06,10.5L3.1,8.28C3,8.93 2.97,9.61 3.04,10.3M12,18.91C12.59,19.82 13,20.63 13,21A1,1 0 0,1 12,22A1,1 0 0,1 11,21C11,20.63 11.41,19.82 12,18.91M12,15.62C12,15.62 9,19 9,21A3,3 0 0,0 12,24A3,3 0 0,0 15,21C15,19 12,15.62 12,15.62Z" /></svg>',
    sunny: '<svg style="width: 1.2em; height: 1.2em; vertical-align: -0.2em; margin-right: 4px; fill: currentColor;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>weather-sunny</title><path d="M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.23C5.26,14 5.53,14.78 5.95,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.04,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17M12,22L9.59,18.56C10.33,18.83 11.14,19 12,19C12.82,19 13.63,18.83 14.37,18.56L12,22Z" /></svg>'
};

const WEATHER_CODES = {
    0: { desc: 'Clear sky', message: 'a perfectly clear sky!', icon: SVGS.sunny },
    1: { desc: 'Mainly clear', message: 'mainly clear with a few clouds.', icon: SVGS.sunny },
    2: { desc: 'Partly cloudy', message: 'a mix of sun and clouds.', icon: SVGS.cloudy },
    3: { desc: 'Overcast', message: 'cloudy, as usual.', icon: SVGS.cloudy },
    45: { desc: 'Fog', message: 'quite foggy out there.', icon: SVGS.fog },
    48: { desc: 'Depositing rime fog', message: 'chilling, freezing fog.', icon: SVGS.fog },
    51: { desc: 'Light drizzle', message: 'rain, rain, rain.', icon: SVGS.partlyRainy },
    53: { desc: 'Moderate drizzle', message: 'quite a lot of rain.', icon: SVGS.partlyRainy },
    55: { desc: 'Dense drizzle', message: 'soaking rain.', icon: SVGS.hail },
    56: { desc: 'Light freezing drizzle', message: 'light, icy drizzle.', icon: SVGS.hail },
    57: { desc: 'Dense freezing drizzle', message: 'dense, freezing drizzle.', icon: SVGS.hail },
    61: { desc: 'Slight rain', message: 'rain, rain, rain.', icon: SVGS.partlyRainy },
    63: { desc: 'Moderate rain', message: 'constant rain.', icon: SVGS.hail },
    65: { desc: 'Heavy rain', message: 'heavy rain coming down hard.', icon: SVGS.storm },
    66: { desc: 'Light freezing rain', message: 'light freezing rain.', icon: SVGS.hail },
    67: { desc: 'Heavy freezing rain', message: 'heavy freezing rain.', icon: SVGS.storm },
    71: { desc: 'Slight snow', message: 'a light dusting of snow.', icon: SVGS.hail },
    73: { desc: 'Moderate snow', message: 'steady snow.', icon: SVGS.hail },
    75: { desc: 'Heavy snow', message: 'heavy snow.', icon: SVGS.hail },
    77: { desc: 'Snow grains', message: 'fine grains of snow in the air.', icon: SVGS.hail },
    80: { desc: 'Slight rain showers', message: 'rain, rain, rain.', icon: SVGS.partlyRainy },
    81: { desc: 'Moderate rain showers', message: 'very rainy.', icon: SVGS.hail },
    82: { desc: 'Violent rain showers', message: 'absolutely pouring rain.', icon: SVGS.storm },
    85: { desc: 'Slight snow showers', message: 'brief, light snow showers.', icon: SVGS.hail },
    86: { desc: 'Heavy snow showers', message: 'bursts of heavy snow.', icon: SVGS.hail },
    95: { desc: 'Thunderstorm', message: 'a thunderstorm brewing.', icon: SVGS.storm },
    96: { desc: 'Thunderstorm with light hail', message: 'a thunderstorm with light hail.', icon: SVGS.storm },
    99: { desc: 'Thunderstorm with heavy hail', message: 'a thunderstorm with heavy hail!', icon: SVGS.storm }
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

            const combinedData = { ...activity, streak: streakData.streak, total: streakData.totalContributions, createdAt: streakData.createdAt };
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
            if (data.total > 0) {
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

    // --- CLAP COUNTER LOGIC --- (delegated to shared kudos.js)

    initClapCounter() {
        const clapItem = document.getElementById('clap-item');
        if (!clapItem) return;
        // Use the shared kudos module (inline layout, homepage-style)
        window.mountKudos(clapItem, { ctaText: 'click to give one!', layout: 'inline' });
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
        if (!data) return;

        const currentHour = new Date().toISOString().substring(0, 13) + ':00';
        const index = data.hourly.time.findIndex(t => t.startsWith(currentHour));
        const code = index !== -1 ? data.hourly.weather_code[index] : 3;
        const weatherInfo = WEATHER_CODES[code] || { message: "experiencing weather.", icon: "" };

        this.weatherStatus.innerHTML = `<span class='status-text'>${weatherInfo.icon}</span> My weather is <span class='status-text'>${weatherInfo.message}</span>`;
    }
}

document.addEventListener('DOMContentLoaded', () => new StatusUpdates());