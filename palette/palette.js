class ColorPaletteGenerator {
	constructor() {
		this.palette = document.getElementById("palette");
		this.colorInfo = document.getElementById("color-info");
		this.NUM_COLS = 5;
		this.currentMode = 'random';
		this.lockedColors = new Set();
		this.currentColors = [];
		this.baseHue = Math.random() * 360;
		
		// Cache for color names to avoid repeated calculations
		this.colorNameCache = new Map();
		this.colorsData = null; // Will hold the loaded colors
		
		// Golden ratio for aesthetically pleasing spacing
		this.GOLDEN_RATIO = 1.618033988749;
		this.PHI = (1 + Math.sqrt(5)) / 2;
		
		this.init();
	}

	async init() {
		await this.loadColors();
		this.setupEventListeners();
		this.setupPalette();
		this.generate();
	}

	async loadColors() {
		try {
			const response = await fetch('./colours.json');
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			this.colorsData = await response.json();
		} catch (error) {
			console.error('Failed to load colors data:', error);
			// Fallback to basic colors if loading fails
			this.colorsData = [
				{ name: 'Red', hex: '#FF0000' },
				{ name: 'Green', hex: '#00FF00' },
				{ name: 'Blue', hex: '#0000FF' },
				{ name: 'Black', hex: '#000000' },
				{ name: 'White', hex: '#FFFFFF' }
			];
		}
	}

	setupEventListeners() {
		// Harmony mode buttons
		document.querySelectorAll('.harmony-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				const activeBtn = document.querySelector('.harmony-btn.active');
				if (activeBtn) activeBtn.classList.remove('active');
				btn.classList.add('active');
				this.currentMode = btn.dataset.mode;
				this.generate();
			});
		});

		// Control buttons - check if elements exist first
		const generateBtn = document.getElementById('generate-btn');
		const exportBtn = document.getElementById('export-btn');
		const lockToggle = document.getElementById('lock-toggle');

		if (generateBtn) generateBtn.addEventListener('click', () => this.generate());
		if (exportBtn) exportBtn.addEventListener('click', () => this.exportPalette());
		if (lockToggle) lockToggle.addEventListener('click', () => this.toggleAllLocks());

		// Keyboard shortcuts
		document.addEventListener('keydown', (e) => {
			if (e.code === 'Space' || e.code === 'Enter') {
				e.preventDefault();
				this.generate();
			}
			if (e.code === 'KeyR') {
				this.setMode('random');
			}
			if (e.code === 'KeyE') {
				this.exportPalette();
			}
		});
	}

	setupPalette() {
		this.palette.innerHTML = '';
		this.palette.className = 'palette-grid';

		for (let i = 0; i < this.NUM_COLS; i++) {
			const column = this.createColorColumn(i);
			this.palette.appendChild(column);
		}
	}

	createColorColumn(index) {
		const column = document.createElement("div");
		column.className = "color-column";
		column.id = `col-${index}`;

		column.innerHTML = `
			<div class="color-controls">
				<button class="color-control-btn lock-btn" title="Lock color">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
						<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
					</svg>
				</button>
				<button class="color-control-btn regenerate-btn" title="Regenerate this color">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
						<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
					</svg>
				</button>
			</div>
			<div class="color-info">
				<div class="color-hex"></div>
				<div class="color-name"></div>
			</div>
			<div class="copy-feedback">Copied!</div>
		`;

		// Click to copy
		column.addEventListener('click', (e) => {
			if (e.target.closest('.color-control-btn')) return;
			this.copyColor(index);
		});

		// Lock button
		column.querySelector('.lock-btn').addEventListener('click', (e) => {
			e.stopPropagation();
			this.toggleLock(index);
		});

		// Regenerate button
		column.querySelector('.regenerate-btn').addEventListener('click', (e) => {
			e.stopPropagation();
			this.regenerateColor(index);
		});

		return column;
	}

	// Debounce generation to prevent rapid-fire calls
	generate() {
		// Clear any pending generation
		if (this.generateTimeout) {
			clearTimeout(this.generateTimeout);
		}
		
		this.generateTimeout = setTimeout(() => {
			this.generateImmediate();
		}, 50); // Small delay to batch rapid calls
	}
	
	generateImmediate() {
		this.baseHue = Math.random() * 360;
		const colors = this.generateColors();
		
		// Use requestAnimationFrame for smooth updates
		requestAnimationFrame(() => {
			colors.forEach((color, index) => {
				if (!this.lockedColors.has(index)) {
					this.setColumnColor(index, color);
				}
			});
			this.updateColorInfo();
		});
	}

	generateColors() {
		switch (this.currentMode) {
			case 'monochromatic':
				return this.generateMonochromatic();
			case 'analogous':
				return this.generateAnalogous();
			case 'complementary':
				return this.generateComplementary();
			case 'triadic':
				return this.generateTriadic();
			default:
				return this.generateRandom();
		}
	}

	generateMonochromatic() {
		const colors = [];
		const baseSat = 65 + Math.random() * 25; // Higher base saturation
		const hueShift = (Math.random() - 0.5) * 20; // Subtle hue shifts for more natural look
		
		// Use golden ratio for lightness distribution
		const lightnessValues = this.getGoldenRatioLightness();
		
		for (let i = 0; i < this.NUM_COLS; i++) {
			// Subtle hue variation for more natural monochromatic scheme
			const hue = (this.baseHue + hueShift * (i / this.NUM_COLS)) % 360;
			// Saturation curve - higher in middle values, lower at extremes
			const saturationCurve = 1 - Math.pow((i / (this.NUM_COLS - 1)) * 2 - 1, 2);
			const saturation = Math.max(15, baseSat * saturationCurve);
			const lightness = lightnessValues[i];
			
			colors.push(this.hslToRgb(hue, saturation, lightness));
		}
		
		return colors;
	}

	generateAnalogous() {
		const colors = [];
		const spread = 45 + Math.random() * 30; // 45-75 degree spread for better harmony
		const baseSat = 60 + Math.random() * 30;
		const baseLightness = 45 + Math.random() * 20;
		
		// Use fibonacci sequence for spacing
		const fibSequence = this.getFibonacciSpacing(this.NUM_COLS);
		
		for (let i = 0; i < this.NUM_COLS; i++) {
			// Distribute hues using fibonacci ratios for more natural spacing
			const hueOffset = (fibSequence[i] * spread) - (spread / 2);
			const hue = (this.baseHue + hueOffset) % 360;
			
			// Vary saturation with sine wave for smooth transitions
			const satVariation = Math.sin((i / (this.NUM_COLS - 1)) * Math.PI) * 20;
			const saturation = Math.max(30, baseSat + satVariation);
			
			// Lightness follows a gentle curve
			const lightVariation = Math.sin((i / (this.NUM_COLS - 1)) * Math.PI * 2) * 15;
			const lightness = Math.max(25, Math.min(85, baseLightness + lightVariation));
			
			colors.push(this.hslToRgb(hue, saturation, lightness));
		}
		
		return colors;
	}

	generateComplementary() {
		const colors = [];
		const complementHue = (this.baseHue + 180) % 360;
		const baseSat = 65 + Math.random() * 25;
		const baseLightness = 50 + Math.random() * 20;
		
		// Create split-complementary for more sophisticated palette
		const splitAngle = 30; // degrees
		const hues = [
			this.baseHue,
			(complementHue - splitAngle + 360) % 360,
			complementHue,
			(complementHue + splitAngle) % 360,
			this.baseHue
		];
		
		for (let i = 0; i < this.NUM_COLS; i++) {
			const hue = hues[i];
			
			// Weight towards base color family for cohesion
			const isBaseFamily = i === 0 || i === 4;
			const saturation = isBaseFamily ? 
				baseSat + Math.random() * 15 : 
				baseSat * 0.8 + Math.random() * 20;
			
			// Alternate lightness for contrast while maintaining harmony
			const lightnessOffset = (i % 2 === 0) ? 10 : -10;
			const lightness = Math.max(20, Math.min(80, baseLightness + lightnessOffset + (Math.random() - 0.5) * 20));
			
			colors.push(this.hslToRgb(hue, saturation, lightness));
		}
		
		return colors;
	}

	generateTriadic() {
		const colors = [];
		const hues = [
			this.baseHue, 
			(this.baseHue + 120) % 360, 
			(this.baseHue + 240) % 360
		];
		
		const baseSat = 60 + Math.random() * 25;
		const baseLightness = 50 + Math.random() * 15;
		
		// Create more sophisticated triadic with supporting colors
		const extendedHues = [
			hues[0],
			(hues[0] + 30) % 360, // Analogous support
			hues[1],
			(hues[1] + 30) % 360, // Analogous support
			hues[2]
		];
		
		for (let i = 0; i < this.NUM_COLS; i++) {
			const hue = extendedHues[i];
			const isPrimary = i % 2 === 0; // Primary triadic colors
			
			// Primary colors get higher saturation
			const saturation = isPrimary ? 
				baseSat + Math.random() * 20 : 
				baseSat * 0.7 + Math.random() * 15;
			
			// Create visual hierarchy with lightness
			const lightnessVariation = isPrimary ? 
				(Math.random() - 0.5) * 30 : 
				(Math.random() - 0.5) * 20;
			const lightness = Math.max(25, Math.min(75, baseLightness + lightnessVariation));
			
			colors.push(this.hslToRgb(hue, saturation, lightness));
		}
		
		return colors;
	}

	generateRandom() {
		const colors = [];
		
		// Use perceptually uniform color distribution
		const baseHue = Math.random() * 360;
		const harmony = Math.random();
		
		if (harmony < 0.3) {
			// Warm harmony
			return this.generateWarmHarmony();
		} else if (harmony < 0.6) {
			// Cool harmony  
			return this.generateCoolHarmony();
		} else {
			// Balanced random with good color relationships
			return this.generateBalancedRandom();
		}
	}
	
	generateWarmHarmony() {
		const colors = [];
		const warmHues = [0, 30, 60, 45, 15]; // Reds, oranges, yellows
		const baseSat = 70 + Math.random() * 20;
		const baseLightness = 55 + Math.random() * 15;
		
		for (let i = 0; i < this.NUM_COLS; i++) {
			const hue = (warmHues[i] + Math.random() * 20 - 10) % 360;
			const saturation = baseSat + (Math.random() - 0.5) * 25;
			const lightness = baseLightness + (Math.random() - 0.5) * 30;
			
			colors.push(this.hslToRgb(hue, Math.max(40, saturation), Math.max(25, Math.min(80, lightness))));
		}
		
		return colors;
	}
	
	generateCoolHarmony() {
		const colors = [];
		const coolHues = [180, 210, 240, 200, 160]; // Blues, cyans, blue-greens
		const baseSat = 65 + Math.random() * 25;
		const baseLightness = 50 + Math.random() * 20;
		
		for (let i = 0; i < this.NUM_COLS; i++) {
			const hue = (coolHues[i] + Math.random() * 20 - 10) % 360;
			const saturation = baseSat + (Math.random() - 0.5) * 20;
			const lightness = baseLightness + (Math.random() - 0.5) * 35;
			
			colors.push(this.hslToRgb(hue, Math.max(35, saturation), Math.max(20, Math.min(85, lightness))));
		}
		
		return colors;
	}
	
	generateBalancedRandom() {
		const colors = [];
		const baseHue = Math.random() * 360;
		
		// Use golden angle for optimal distribution
		const goldenAngle = 137.508; // degrees
		
		for (let i = 0; i < this.NUM_COLS; i++) {
			const hue = (baseHue + i * goldenAngle) % 360;
			
			// Use beta distribution for more natural saturation
			const saturation = this.betaDistribution(2, 5) * 60 + 30; // Tends towards medium-high
			
			// Use normal distribution for lightness
			const lightness = this.normalDistribution(50, 15);
			
			colors.push(this.hslToRgb(hue, saturation, Math.max(15, Math.min(85, lightness))));
		}
		
		return colors;
	}
	
	// Helper functions for better color distribution
	getGoldenRatioLightness() {
		const values = [];
		const phi = this.GOLDEN_RATIO;
		
		for (let i = 0; i < this.NUM_COLS; i++) {
			// Use golden ratio to create pleasing lightness progression
			const ratio = i / (this.NUM_COLS - 1);
			const adjusted = Math.pow(ratio, 1/phi); // Golden ratio curve
			const lightness = 20 + adjusted * 60; // 20% to 80% range
			values.push(lightness);
		}
		
		return values;
	}
	
	getFibonacciSpacing(count) {
		const fib = [0, 1];
		for (let i = 2; i < count; i++) {
			fib[i] = fib[i-1] + fib[i-2];
		}
		
		// Normalize to 0-1 range
		const max = Math.max(...fib);
		return fib.map(f => f / max);
	}
	
	// Statistical distributions for more natural randomness
	betaDistribution(alpha, beta) {
		// Simplified beta distribution using rejection sampling
		let u1, u2;
		do {
			u1 = Math.random();
			u2 = Math.random();
		} while (u1 === 0);
		
		const x = Math.pow(u1, 1/alpha);
		const y = Math.pow(u2, 1/beta);
		return x / (x + y);
	}
	
	normalDistribution(mean, stdDev) {
		// Box-Muller transform for normal distribution
		const u1 = Math.random();
		const u2 = Math.random();
		const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
		return mean + z0 * stdDev;
	}

	findClosestColorName(rgb) {
		// Return early if colors not loaded yet
		if (!this.colorsData) {
			return 'Unknown';
		}

		// Create a cache key from RGB values
		const cacheKey = `${Math.round(rgb[0])},${Math.round(rgb[1])},${Math.round(rgb[2])}`;
		
		// Check cache first
		if (this.colorNameCache.has(cacheKey)) {
			return this.colorNameCache.get(cacheKey);
		}

		let closestColor = this.colorsData[0];
		let minDistance = Infinity;

		// Use a more efficient approach - only check every 10th color for initial screening
		const step = Math.max(1, Math.floor(this.colorsData.length / 100));
		
		for (let i = 0; i < this.colorsData.length; i += step) {
			const color = this.colorsData[i];
			const colorRgb = this.hexToRgb(color.hex);
			const distance = this.calculateColorDistanceFast(rgb, colorRgb);
			
			if (distance < minDistance) {
				minDistance = distance;
				closestColor = color;
			}
		}
		
		// Fine-tune by checking colors around the best match
		const bestIndex = this.colorsData.indexOf(closestColor);
		const checkRange = 20;
		const startIndex = Math.max(0, bestIndex - checkRange);
		const endIndex = Math.min(this.colorsData.length - 1, bestIndex + checkRange);
		
		for (let i = startIndex; i <= endIndex; i++) {
			const color = this.colorsData[i];
			const colorRgb = this.hexToRgb(color.hex);
			const distance = this.calculateColorDistanceFast(rgb, colorRgb);
			
			if (distance < minDistance) {
				minDistance = distance;
				closestColor = color;
			}
		}

		// Cache the result
		this.colorNameCache.set(cacheKey, closestColor.name);
		return closestColor.name;
	}

	calculateColorDistanceFast(rgb1, rgb2) {
		// Simplified distance calculation for better performance
		const deltaR = rgb1[0] - rgb2[0];
		const deltaG = rgb1[1] - rgb2[1];
		const deltaB = rgb1[2] - rgb2[2];
		
		// Simple Euclidean distance (faster than weighted)
		return deltaR * deltaR + deltaG * deltaG + deltaB * deltaB;
	}

	// Keep the original for fine-tuning when needed
	calculateColorDistance(rgb1, rgb2) {
		// Improved color distance using weighted Euclidean distance
		const rMean = (rgb1[0] + rgb2[0]) / 2;
		const deltaR = rgb1[0] - rgb2[0];
		const deltaG = rgb1[1] - rgb2[1];
		const deltaB = rgb1[2] - rgb2[2];
		
		const weightR = 2 + rMean / 256;
		const weightG = 4;
		const weightB = 2 + (255 - rMean) / 256;
		
		return Math.sqrt(weightR * deltaR * deltaR + weightG * deltaG * deltaG + weightB * deltaB * deltaB);
	}

	copyColor(index) {
		const color = this.currentColors[index];
		if (!color) return;

		navigator.clipboard.writeText(color.hex).then(() => {
			const column = document.getElementById(`col-${index}`);
			const feedback = column.querySelector('.copy-feedback');
			feedback.classList.add('show');
			setTimeout(() => feedback.classList.remove('show'), 1000);
		});
	}

	toggleLock(index) {
		const column = document.getElementById(`col-${index}`);
		const lockBtn = column.querySelector('.lock-btn');
		const lockSvg = lockBtn.querySelector('svg path');
		const colorInfo = column.querySelector('.color-info');
		
		if (this.lockedColors.has(index)) {
			this.lockedColors.delete(index);
			// Unlocked state - open lock icon
			lockSvg.setAttribute('d', 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z');
			lockBtn.classList.remove('locked');
			column.classList.remove('column-locked');
		} else {
			this.lockedColors.add(index);
			// Locked state - closed lock icon
			lockSvg.setAttribute('d', 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z');
			lockBtn.classList.add('locked');
			column.classList.add('column-locked');
		}
	}

	toggleAllLocks() {
		if (this.lockedColors.size === this.NUM_COLS) {
			// Unlock all
			this.lockedColors.clear();
			document.querySelectorAll('.lock-btn').forEach(btn => {
				const lockSvg = btn.querySelector('svg path');
				const column = btn.closest('.color-column');
				lockSvg.setAttribute('d', 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z');
				btn.classList.remove('locked');
				column.classList.remove('column-locked');
			});
		} else {
			// Lock all
			for (let i = 0; i < this.NUM_COLS; i++) {
				this.lockedColors.add(i);
			}
			document.querySelectorAll('.lock-btn').forEach(btn => {
				const lockSvg = btn.querySelector('svg path');
				const column = btn.closest('.color-column');
				lockSvg.setAttribute('d', 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z');
				btn.classList.add('locked');
				column.classList.add('column-locked');
			});
		}
	}

	regenerateColor(index) {
		if (this.lockedColors.has(index)) return;
		
		const newColors = this.generateColors();
		this.setColumnColor(index, newColors[index]);
		this.updateColorInfo();
	}

	exportPalette() {
		const colors = this.currentColors.filter(Boolean);
		const exportData = {
			colors: colors,
			mode: this.currentMode,
			timestamp: new Date().toISOString()
		};

		// Create download link
		const dataStr = JSON.stringify(exportData, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		
		const link = document.createElement('a');
		link.href = url;
		link.download = `color-palette-${Date.now()}.json`;
		link.click();
		
		URL.revokeObjectURL(url);
	}

	setMode(mode) {
		const activeBtn = document.querySelector('.harmony-btn.active');
		const targetBtn = document.querySelector(`[data-mode="${mode}"]`);
		
		if (activeBtn) activeBtn.classList.remove('active');
		if (targetBtn) targetBtn.classList.add('active');
		
		this.currentMode = mode;
		this.generate();
	}

	setColumnColor(index, rgb) {
		const hex = this.rgbToHex(rgb);
		const name = this.findClosestColorName(rgb);
		const contrastColor = this.getContrastColor(rgb);
		
		const column = document.getElementById(`col-${index}`);
		if (!column) return;
		
		// Store color data
		this.currentColors[index] = { rgb, hex, name };
		
		// Apply styles
		column.style.backgroundColor = hex;
		column.style.color = contrastColor;
		
		// Update info displays
		const hexElement = column.querySelector('.color-hex');
		const nameElement = column.querySelector('.color-name');
		
		if (hexElement) hexElement.textContent = hex;
		if (nameElement) nameElement.textContent = name;
	}

	updateColorInfo() {
		const colors = this.currentColors.filter(Boolean);
		if (colors.length === 0) return;

		const info = `
			<strong>Current Palette (${this.currentMode})</strong><br>
			${colors.map(c => `${c.hex} - ${c.name}`).join('<br>')}
		`;
		
		if (this.colorInfo) {
			this.colorInfo.innerHTML = info;
		}
	}

	// Utility functions
	hslToRgb(h, s, l) {
		h /= 360;
		s /= 100;
		l /= 100;
		
		const c = (1 - Math.abs(2 * l - 1)) * s;
		const x = c * (1 - Math.abs((h * 6) % 2 - 1));
		const m = l - c / 2;
		
		let r, g, b;
		
		if (0 <= h && h < 1/6) { r = c; g = x; b = 0; }
		else if (1/6 <= h && h < 1/3) { r = x; g = c; b = 0; }
		else if (1/3 <= h && h < 1/2) { r = 0; g = c; b = x; }
		else if (1/2 <= h && h < 2/3) { r = 0; g = x; b = c; }
		else if (2/3 <= h && h < 5/6) { r = x; g = 0; b = c; }
		else { r = c; g = 0; b = x; }
		
		return [
			Math.round((r + m) * 255),
			Math.round((g + m) * 255),
			Math.round((b + m) * 255)
		];
	}

	rgbToHex(rgb) {
		return '#' + rgb.map(c => 
			('00' + Math.round(c).toString(16).toUpperCase()).slice(-2)
		).join('');
	}

	hexToRgb(hex) {
		// Simple cache for common hex values
		if (!this.hexRgbCache) {
			this.hexRgbCache = new Map();
		}
		
		if (this.hexRgbCache.has(hex)) {
			return this.hexRgbCache.get(hex);
		}
		
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		const rgb = result ? [
			parseInt(result[1], 16),
			parseInt(result[2], 16),
			parseInt(result[3], 16)
		] : [0, 0, 0];
		
		this.hexRgbCache.set(hex, rgb);
		return rgb;
	}

	getContrastColor(rgb) {
		const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
		return brightness > 128 ? '#2d2d2d' : '#ffffff';
	}
}

// Initialize only when DOM is ready and avoid duplicate instances
let paletteGenerator = null;
document.addEventListener('DOMContentLoaded', async () => {
	if (!paletteGenerator) {
		paletteGenerator = new ColorPaletteGenerator();
	}
});


