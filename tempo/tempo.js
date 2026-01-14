// Tap Tempo BPM Calculator
let tapTimes = [];
let bpm = 0;
let resetTimeout = null;
const RESET_DELAY = 2000; // Reset after 2 seconds of no tapping
const MAX_TAPS = 10; // Keep only last 10 taps for average

const screen = document.getElementById('screen');
const bpmDisplay = document.getElementById('bpm-display');
const instruction = document.getElementById('instruction');
const tapCount = document.getElementById('tap-count');

function calculateBPM() {
	if (tapTimes.length < 2) {
		return 0;
	}
	
	// Calculate intervals between taps
	const intervals = [];
	for (let i = 1; i < tapTimes.length; i++) {
		intervals.push(tapTimes[i] - tapTimes[i-1]);
	}
	
	// Calculate average interval
	const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
	
	// Convert to BPM (60000 ms per minute / average interval in ms)
	const calculatedBPM = Math.round(60000 / avgInterval);
	
	return calculatedBPM;
}

function updateDisplay() {
	if (tapTimes.length === 0) {
		bpmDisplay.textContent = '--';
		instruction.textContent = 'tap to begin';
		tapCount.textContent = '';
	} else if (tapTimes.length === 1) {
		bpmDisplay.textContent = '--';
		instruction.textContent = 'keep tapping...';
		tapCount.textContent = `${tapTimes.length} tap`;
	} else {
		bpm = calculateBPM();
		bpmDisplay.textContent = bpm;
		instruction.textContent = 'bpm';
		tapCount.textContent = `${tapTimes.length} taps`;
	}
}

function handleTap() {
	const now = Date.now();
	
	// Add visual feedback
	screen.classList.add('tapped');
	setTimeout(() => {
		screen.classList.remove('tapped');
	}, 150);
	
	// Add tap time
	tapTimes.push(now);
	
	// Keep only last MAX_TAPS
	if (tapTimes.length > MAX_TAPS) {
		tapTimes.shift();
	}
	
	// Update display
	updateDisplay();
	
	// Clear existing timeout and set new one
	if (resetTimeout) {
		clearTimeout(resetTimeout);
	}
	
	resetTimeout = setTimeout(() => {
		reset();
	}, RESET_DELAY);
}

function reset() {
	tapTimes = [];
	bpm = 0;
	updateDisplay();
}

// Event listeners
screen.addEventListener('click', handleTap);

// Keyboard support
document.addEventListener('keydown', (e) => {
	// Prevent default for spacebar to avoid page scroll
	if (e.code === 'Space') {
		e.preventDefault();
	}
	
	// Any key triggers a tap
	handleTap();
});

// Prevent right-click menu
screen.addEventListener('contextmenu', (e) => {
	e.preventDefault();
	handleTap();
});

// Touch support for mobile
screen.addEventListener('touchstart', (e) => {
	e.preventDefault();
	handleTap();
});

// Initialize display
updateDisplay();
