const STORAGE_KEY = 'pomoData';

const TOPIC_COLORS = [
	'#8b5a83', '#7c9885', '#d4a574', '#c85a5a', '#6b8e9e',
	'#9d7ca8', '#8a9a5b', '#c67c89', '#7a8c9e', '#b8a878'
];

class PomoData {
	constructor() {
		this.load();
	}

	load() {
		const data = localStorage.getItem(STORAGE_KEY);
		if (data) {
			const parsed = JSON.parse(data);
			this.sessions = parsed.sessions || [];
			this.settings = parsed.settings || { work: 25, shortBreak: 5, longBreak: 15 };
		} else {
			this.sessions = [];
			this.settings = { work: 25, shortBreak: 5, longBreak: 15 };
		}
	}

	save() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			sessions: this.sessions,
			settings: this.settings
		}));
	}

	addSession(date, time, minutes, topic) {
		this.sessions.push({ date, time, minutes: parseInt(minutes), topic });
		this.save();
	}

	updateSettings(work, shortBreak, longBreak) {
		this.settings = { work, shortBreak, longBreak };
		this.save();
	}

	getTotalsByDate() {
		const totals = {};
		for (const session of this.sessions) {
			if (!totals[session.date]) {
				totals[session.date] = {};
			}
			const topic = session.topic || 'Untitled';
			totals[session.date][topic] = (totals[session.date][topic] || 0) + session.minutes;
		}

		const dates = Object.keys(totals).sort();
		if (dates.length === 0) return [];

		const result = [];
		const start = new Date(dates[0]);
		const end = new Date(dates[dates.length - 1]);
		
		for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
			const dateStr = d.toISOString().split('T')[0];
			result.push({
				date: dateStr,
				topics: totals[dateStr] || {}
			});
		}
		
		return result;
	}

	export() {
		return JSON.stringify({
			sessions: this.sessions,
			settings: this.settings,
			exportDate: new Date().toISOString()
		}, null, 2);
	}

	import(jsonText) {
		try {
			const data = JSON.parse(jsonText);
			if (data.sessions && Array.isArray(data.sessions)) {
				this.sessions = data.sessions;
				if (data.settings) {
					this.settings = data.settings;
				}
				this.save();
				return true;
			}
		} catch (e) {
			return false;
		}
		return false;
	}

	clear() {
		this.sessions = [];
		this.save();
	}
}

class PomoTimer {
	constructor() {
		this.reset();
	}

	reset() {
		this.startTime = null;
		this.endTime = null;
		this.duration = 0;
		this.phase = null;
		this.topic = '';
		this.interval = null;
		this.isRunning = false;
		this.isPaused = false;
		this.pausedTime = 0;
		this.cyclePhases = [];
		this.currentPhaseIndex = 0;
	}

	initCycle(work, shortBreak, longBreak, topic) {
		this.reset();
		this.topic = topic;
		this.cyclePhases = [
			{ type: 'work', duration: work, label: 'Work Session 1' },
			{ type: 'break', duration: shortBreak, label: 'Short Break' },
			{ type: 'work', duration: work, label: 'Work Session 2' },
			{ type: 'break', duration: longBreak, label: 'Long Break' }
		];
		this.startNextPhase();
	}

	startNextPhase() {
		if (this.currentPhaseIndex >= this.cyclePhases.length) {
			return false;
		}

		const phase = this.cyclePhases[this.currentPhaseIndex];
		this.phase = phase;
		this.duration = phase.duration;
		this.startTime = new Date();
		this.endTime = new Date(this.startTime.getTime() + this.duration * 60 * 1000);
		this.isRunning = true;
		this.isPaused = false;
		this.pausedTime = 0;
		return true;
	}

	pause() {
		if (!this.isRunning || this.isPaused) return;
		this.isPaused = true;
		this.pausedTime = new Date();
	}

	resume() {
		if (!this.isPaused) return;
		const pauseDuration = new Date() - this.pausedTime;
		this.endTime = new Date(this.endTime.getTime() + pauseDuration);
		this.isPaused = false;
	}

	stop() {
		this.isRunning = false;
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
		
		const elapsed = (new Date() - this.startTime) / 1000 / 60;
		return Math.round(elapsed);
	}

	getTimeLeft() {
		if (!this.isRunning || this.isPaused) return this.isPaused ? Math.floor((this.endTime - this.pausedTime) / 1000) : 0;
		const now = new Date();
		const left = Math.max(0, this.endTime - now);
		return Math.floor(left / 1000);
	}

	getProgress() {
		if (!this.isRunning) return 0;
		const total = this.duration * 60;
		const left = this.getTimeLeft();
		const done = total - left;
		return Math.min(100, Math.round((done / total) * 100 * 10) / 10);
	}

	isComplete() {
		return this.isRunning && !this.isPaused && this.getTimeLeft() === 0;
	}

	nextPhase() {
		this.currentPhaseIndex++;
		return this.startNextPhase();
	}

	isCycleComplete() {
		return this.currentPhaseIndex >= this.cyclePhases.length;
	}

	getCompletedWorkMinutes() {
		let total = 0;
		for (let i = 0; i < this.currentPhaseIndex; i++) {
			if (this.cyclePhases[i].type === 'work') {
				total += this.cyclePhases[i].duration;
			}
		}
		if (this.phase && this.phase.type === 'work' && this.isComplete()) {
			total += this.duration;
		}
		return total;
	}
}

class PomoUI {
	constructor() {
		this.data = new PomoData();
		this.timer = new PomoTimer();
		this.currentView = 'menu-view';
		this.topicColorMap = new Map();
		this.initializeUI();
	}

	initializeUI() {
		document.getElementById('begin-btn').addEventListener('click', () => this.showBegin());
		document.getElementById('log-btn').addEventListener('click', () => this.showView('log-view'));
		document.getElementById('view-btn').addEventListener('click', () => this.showSummary());
		document.getElementById('data-btn').addEventListener('click', () => this.showView('data-view'));

		document.getElementById('start-cycle-btn').addEventListener('click', () => this.startCycle());
		document.getElementById('cancel-begin-btn').addEventListener('click', () => this.showView('menu-view'));

		document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
		document.getElementById('end-cycle-btn').addEventListener('click', () => this.endCycle());

		document.getElementById('start-another-btn').addEventListener('click', () => this.showBegin());
		document.getElementById('back-to-menu-btn').addEventListener('click', () => this.showView('menu-view'));

		document.getElementById('save-log-btn').addEventListener('click', () => this.saveLog());
		document.getElementById('cancel-log-btn').addEventListener('click', () => this.showView('menu-view'));
		
		document.getElementById('log-date-input').value = new Date().toISOString().split('T')[0];

		document.getElementById('back-from-summary-btn').addEventListener('click', () => this.showView('menu-view'));

		document.getElementById('export-data-btn').addEventListener('click', () => this.exportData());
		document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));
		document.getElementById('clear-data-btn').addEventListener('click', () => this.clearData());
		document.getElementById('back-from-data-btn').addEventListener('click', () => this.showView('menu-view'));

		['work-input', 'short-break-input', 'long-break-input', 'topic-input'].forEach(id => {
			document.getElementById(id).addEventListener('keypress', (e) => {
				if (e.key === 'Enter') this.startCycle();
			});
		});

		['log-minutes-input', 'log-topic-input'].forEach(id => {
			document.getElementById(id).addEventListener('keypress', (e) => {
				if (e.key === 'Enter') this.saveLog();
			});
		});
	}

	showView(viewId) {
		document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
		document.getElementById(viewId).classList.add('active');
		this.currentView = viewId;
	}

	showBegin() {
		document.getElementById('work-input').value = this.data.settings.work;
		document.getElementById('short-break-input').value = this.data.settings.shortBreak;
		document.getElementById('long-break-input').value = this.data.settings.longBreak;
		this.showView('begin-view');
	}

	startCycle() {
		const work = parseFloat(document.getElementById('work-input').value);
		const shortBreak = parseFloat(document.getElementById('short-break-input').value);
		const longBreak = parseFloat(document.getElementById('long-break-input').value);
		const topic = document.getElementById('topic-input').value.trim();
		
		if (!work || work <= 0 || !shortBreak || shortBreak <= 0 || !longBreak || longBreak <= 0) {
			this.showToast('Please enter valid durations', 'error');
			return;
		}

		this.data.updateSettings(work, shortBreak, longBreak);
		this.timer.initCycle(work, shortBreak, longBreak, topic);
		
		document.getElementById('topic-input').value = '';
		
		this.showView('timer-view');
		this.updateTimerDisplay();
	}

	updateTimerDisplay() {
		const phaseEl = document.getElementById('timer-phase');
		const topicEl = document.getElementById('timer-topic');
		const displayEl = document.getElementById('timer-display');
		const timerContainer = document.querySelector('.timer-container');
		const pauseBtn = document.getElementById('pause-btn');
		const progressCircle = document.querySelector('.progress-ring-circle');
		const circumference = 2 * Math.PI * 90;

		phaseEl.textContent = this.timer.phase.label;
		
		if (this.timer.topic && this.timer.phase.type === 'work') {
			topicEl.textContent = this.timer.topic;
		} else {
			topicEl.textContent = this.timer.phase.type === 'break' ? 'Take a break!' : '';
		}

		if (this.timer.phase.type === 'break') {
			timerContainer.classList.add('break');
		} else {
			timerContainer.classList.remove('break');
		}

		this.timer.interval = setInterval(() => {
			if (this.timer.isPaused) {
				pauseBtn.textContent = 'Resume';
				timerContainer.classList.add('paused');
				return;
			}

			pauseBtn.textContent = 'Pause';
			timerContainer.classList.remove('paused');

			if (this.timer.isComplete()) {
				if (this.timer.phase.type === 'work') {
					const date = this.timer.startTime.toISOString().split('T')[0];
					const time = this.timer.startTime.toTimeString().split(' ')[0];
					this.data.addSession(date, time, this.timer.duration, this.timer.topic);
				}

				this.timer.nextPhase();
				
				if (this.timer.isCycleComplete()) {
					this.completeCycle();
				} else {
					this.updateTimerDisplay();
					this.showToast(`${this.timer.phase.label} started!`, 'success');
				}
				return;
			}

			const secondsLeft = this.timer.getTimeLeft();
			const minutes = Math.floor(secondsLeft / 60);
			const seconds = secondsLeft % 60;
			
			if (this.timer.duration >= 60) {
				const hours = Math.floor(minutes / 60);
				const mins = minutes % 60;
				displayEl.textContent = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
			} else {
				displayEl.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
			}

			const progress = this.timer.getProgress();
			
			const offset = circumference - (progress / 100) * circumference;
			progressCircle.style.strokeDashoffset = offset;
		}, 100);
	}

	togglePause() {
		if (this.timer.isPaused) {
			this.timer.resume();
		} else {
			this.timer.pause();
		}
	}

	endCycle() {
		this.timer.stop();
		this.showView('menu-view');
		this.showToast('Cycle ended', 'success');
	}

	completeCycle() {
		this.timer.stop();
		const totalMinutes = this.timer.getCompletedWorkMinutes();
		const messageEl = document.getElementById('cycle-message');
		const topicText = this.timer.topic ? ` on ${this.timer.topic}` : '';
		messageEl.textContent = `You completed a full Pomodoro cycle with ${totalMinutes} minutes of work${topicText}!`;
		this.showView('cycle-complete-view');
	}

	saveLog() {
		const date = document.getElementById('log-date-input').value;
		const minutes = parseFloat(document.getElementById('log-minutes-input').value);
		const topic = document.getElementById('log-topic-input').value.trim();

		if (!date) {
			this.showToast('Please enter a date', 'error');
			return;
		}

		if (!minutes || minutes <= 0) {
			this.showToast('Please enter valid minutes', 'error');
			return;
		}

		this.data.addSession(date, '00:00:00', minutes, topic);
		
		document.getElementById('log-minutes-input').value = '';
		document.getElementById('log-topic-input').value = '';
		
		this.showView('menu-view');
		this.showToast('Session logged successfully!', 'success');
	}

	showSummary() {
		const contentEl = document.getElementById('summary-content');
		const totals = this.data.getTotalsByDate();

		if (totals.length === 0) {
			contentEl.innerHTML = '<div class="summary-empty">No sessions recorded yet. Start your first cycle!</div>';
		} else {
			const allTopics = new Set();
			totals.forEach(day => {
				Object.keys(day.topics).forEach(topic => allTopics.add(topic));
			});

			let colorIndex = 0;
			allTopics.forEach(topic => {
				if (!this.topicColorMap.has(topic)) {
					this.topicColorMap.set(topic, TOPIC_COLORS[colorIndex % TOPIC_COLORS.length]);
					colorIndex++;
				}
			});

			let legendHtml = '<div class="topic-legend">';
			allTopics.forEach(topic => {
				legendHtml += `
					<div class="legend-item">
						<div class="legend-color" style="background-color: ${this.topicColorMap.get(topic)}"></div>
						<span>${topic}</span>
					</div>
				`;
			});
			legendHtml += '</div>';

			const maxMinutes = Math.max(...totals.map(d => Object.values(d.topics).reduce((a, b) => a + b, 0)));
			
			let rowsHtml = '';
			for (const day of totals) {
				const dayTotal = Object.values(day.topics).reduce((a, b) => a + b, 0);
				const hours = Math.floor(dayTotal / 60);
				const mins = dayTotal % 60;
				const timeStr = `${hours}h${String(mins).padStart(2, '0')}m`;
				
				let barHtml = '<div class="summary-bar">';
				Object.entries(day.topics).forEach(([topic, minutes]) => {
					const width = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
					const color = this.topicColorMap.get(topic);
					barHtml += `<div class="summary-bar-segment" style="width: ${width}%; background-color: ${color}"></div>`;
				});
				barHtml += '</div>';
				
				rowsHtml += `
					<div class="summary-row">
						<div class="summary-date">${day.date}</div>
						<div class="summary-time">${timeStr}</div>
						${barHtml}
					</div>
				`;
			}
			
			contentEl.innerHTML = legendHtml + rowsHtml;
		}

		this.showView('summary-view');
	}

	exportData() {
		const json = this.data.export();
		const blob = new Blob([json], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'pomo-data.json';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		this.showToast('Data exported successfully!', 'success');
	}

	importData(event) {
		const file = event.target.files[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			if (this.data.import(e.target.result)) {
				this.showToast('Data imported successfully!', 'success');
				document.getElementById('import-filename').textContent = file.name;
			} else {
				this.showToast('Failed to import data. Check file format.', 'error');
			}
		};
		reader.readAsText(file);
		event.target.value = '';
	}

	clearData() {
		if (confirm('Delete all Pomodoro data? This cannot be undone.')) {
			if (confirm('Really sure? All progress will be lost!')) {
				this.data.clear();
				this.showToast('All data cleared', 'success');
				this.showView('menu-view');
			}
		}
	}

	showToast(message, type = 'success') {
		const container = document.getElementById('toast-container');
		const toast = document.createElement('div');
		toast.className = `toast ${type}`;
		
		const icon = type === 'success' ? '✓' : '✕';
		toast.innerHTML = `
			<div class="toast-icon">${icon}</div>
			<div class="toast-message">${message}</div>
		`;
		
		container.appendChild(toast);
		
		setTimeout(() => {
			toast.remove();
		}, 3000);
	}
}

let app;
window.addEventListener('DOMContentLoaded', () => {
	app = new PomoUI();
});
