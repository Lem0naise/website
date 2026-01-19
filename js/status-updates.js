const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const weekends = ['Saturday', 'Sunday'];
const allDays = [...weekdays, ...weekends];

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
    {
        activity: 'building robots.',
        days: ['Thursday'],
        start: 18,
        end: 23,
    },
    {
        activity: 'attempting a new PB at Parkrun.',
        days: ['Saturday'],
        start: 9,
        end: 10, 
    },
    {
        activity: 'at the gym or climbing.',
        days: ['Monday', 'Wednesday', 'Friday', 'Saturday','Sunday'],
        start: 19,
        end: 22, 
    },
        {
    activity: 'preparing for the week ahead.',
        days: ["Sunday"],
        start: 21,
        end: 24
    },
    {
        activity: 'eating dinner.',
        days: allDays,
        start: 18, 
        end: 20, 
    },
    {
        activity: 'having breakfast.',
        days: allDays,
        start: 7, 
        end: 9, 
    },
    {
        activity: 'at lectures, unfortunately.',
        days: weekdays,
        start: 9,
        end: 17,
    },
    {
        activity: 'sleeping.',
        days: allDays,
        start: 23,
        end: 7, 
    },
    {
        activity: "relaxing, it's the weekend!",
        days: weekends,
        start: 0,
        end: 24,
    },
    {
        activity: "unwinding.",
        days: weekdays,
        start: 0,
        end: 24,
    },
];



class StatusUpdates {
    constructor() {
        this.statusDiv = document.getElementById('status-updates');
        this.statusButton = document.getElementById('status-button');
        this.statusContent = document.getElementById('status-content');
        this.githubActivity = document.getElementById('github-activity');
        this.currentlyDoing = document.getElementById('custom-status');
        
        // add new here
        this.weatherStatus = document.getElementById('weather-status');
        this.spotifyStatus = document.getElementById('spotify-status');

        this.isExpanded = false;
        
        this.init();
    }
    
    init() {
        this.statusButton.addEventListener('click', () => this.toggle());

        document.addEventListener('click', (e) => {
            if (this.isExpanded && !this.statusDiv.contains(e.target)){ 
                this.toggle();
            }
        });
    

        this.loadGitHubActivity();
        this.applyCurrentlyDoing();
        this.applyWeatherStatus();
        this.applySpotifyStatus();


        setInterval(() => this.applyCurrentlyDoing(), 60000)
        setInterval(() => this.applySpotifyStatus(), 30000)
        // add new here
        
    }
    
    toggle () {
        if (this.isExpanded) {

            this.isExpanded = false;
            this.statusDiv.classList.remove('expanded');
            this.statusButton.textContent='What am I up to?'
        }
        else {

            this.isExpanded = true;
            this.statusDiv.classList.add('expanded');
            this.statusButton.textContent= 'Hide my status'
        }
    }

    async getRecentGitHubActivity() {
        const username = 'Lem0naise';
        const url = `https://api.github.com/users/${username}/events/public`;
        
        try {
            const response = await fetch(url);
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
        const cached = localStorage.getItem('githubActivity');
        if (cached) {
            const {data, timestamp} = JSON.parse(cached);
            if (Date.now() - timestamp < 30 * 60 * 1000) {
                this.displayGithubActivity(data);
                return;
            }
        }

        try {
            const activity = await this.getRecentGitHubActivity();
            localStorage.setItem('githubActivity', JSON.stringify({
                data: activity,
                timestamp: Date.now()
            }))
            this.displayGithubActivity(activity);
            
        } catch (error) {
            this.githubActivity.textContent = 'GitHub: Doing something...';
        }
    }

    displayGithubActivity(activity) {
        if (activity) {
                const timeDiff = new Date() - new Date(activity.date);
                const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
                console.log(activity.date);
                const timeText = hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`;
                this.githubActivity.innerHTML = `My last Git commit was to <span class='status-text'><a class='status-text' target="_blank" href="https://github.com/${activity.repo}">${activity.repo.split('/')[1]}</span>, ${timeText}</a>.`;
        } else {
            this.githubActivity.innerHTML= 'Building <a target="_blank" href="https://github.com/Lem0naise/cashcat">CashCat</a>...';
        }
    }

    generateCurrentlyDoing() {
        const now = new Date();
        const options = {
            timeZone: 'Europe/London',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false,
        };
        const formatter = new Intl.DateTimeFormat('en-GB', options);
        const parts = formatter.formatToParts(now);

        const dayOfWeek = parts.find(p => p.type === 'weekday').value;
        const hour = parseInt(parts.find(p => p.type === 'hour').value, 10);
        const minute = parseInt(parts.find(p => p.type === 'minute').value, 10);
        
        const currentTime = hour + (minute / 60);

        for (const event of schedule) {
            if (event.days.includes(dayOfWeek)) {
                const isOvernightEvent = event.start > event.end;
                if (isOvernightEvent) {
                    if (currentTime >= event.start || currentTime < event.end) {
                         return `It's ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}, I'm probably <span class='status-text'>${event.activity}</span>`;
                    }
                } else {
                    if (currentTime >= event.start && currentTime < event.end) {
                        return `It's ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}, I'm probably <span class='status-text'>${event.activity}<span>`;
                    }
                }
            }
        }

        return "unwinding.";
    }
    
    applyCurrentlyDoing() {
        this.currentlyDoing.innerHTML = this.generateCurrentlyDoing();

    }

    async getFunWeatherMessage(weatherData) {
        const now = new Date();
        const almostISO = now.toLocaleString('sv-SE', {
            timeZone: 'Europe/London',
            hour12: false, 
        });
        const currentHourISO = almostISO.substring(0, 13).replace(' ', 'T') + ':00';
        const currentIndex = weatherData.hourly.time.findIndex(time => time === currentHourISO);
        if (currentIndex === -1) {
            return "Probably cloudy.";
        }

        const currentWeatherCode = weatherData.hourly.weather_code[currentIndex];
        const weather = WEATHER_CODES[currentWeatherCode] || { 
            desc: 'Unknown weather', 
            message: 'Experiencing mysterious weather.' 
        };

        return `${weather.message}`;
        }

    async getWeatherStatus() {
        

        const cached = localStorage.getItem('weather');
        if (cached) {
            const {data, timestamp} = JSON.parse(cached);
            if (Date.now() - timestamp < 10 * 60 * 1000) { //10 min cache
                return data;
            }
        }
        const lat = 50.9065389; 
        const lon = -1.4063186;
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=weather_code&forecast_days=2`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok){
                throw new Error("Network not okay.");
            }
            const data = await response.json();
            console.log("Data:", data);

            localStorage.setItem('weather', JSON.stringify({
                data,
                timestamp: Date.now()
            }))
            return data;
        }
        catch(error) {
            console.error('There has been a problem with your fetch operation:', error);
            throw error;
        };

    }

    async applyWeatherStatus() {
        try {
            const weatherData = await this.getWeatherStatus();
            const weather = await this.getFunWeatherMessage(weatherData)
            this.weatherStatus.innerHTML = `My weather is <span class='status-text'>${weather}</span>`  
        }
        catch (error) {console.log(error)}
    }

    async getSpotifyStatus() {
        const cached = localStorage.getItem('spotifyStatus');
        if (cached) {
            const {data, timestamp} = JSON.parse(cached);
            if (Date.now() - timestamp < 30 * 1000) { // 30 second cache
                return data;
            }
        }

        try {
            const response = await fetch("https://api.lanyard.rest/v1/users/425364681625042960");
            if (!response.ok) {
                throw new Error("Network response not okay.");
            }
            const data = await response.json();
            
            localStorage.setItem('spotifyStatus', JSON.stringify({
                data,
                timestamp: Date.now()
            }));
            
            return data;
        } catch (error) {
            console.error('Error fetching Spotify status:', error);
            return null;
        }
    }

    async applySpotifyStatus() {
        try {
            const lanyardData = await this.getSpotifyStatus();
            
            if (lanyardData && lanyardData.success && lanyardData.data.listening_to_spotify && lanyardData.data.spotify) {
                const spotify = lanyardData.data.spotify;
                this.spotifyStatus.innerHTML = `Currently listening to <span class='status-text'>${spotify.song}, ${spotify.artist}</span>.`;
                this.spotifyStatus.style.display = 'list-item';
            } else {
                this.spotifyStatus.style.display = 'none';
            }
        } catch (error) {
            console.log(error);
            this.spotifyStatus.style.display = 'none';
        }
    }

    
}

document.addEventListener('DOMContentLoaded', () => {
    new StatusUpdates();
});
