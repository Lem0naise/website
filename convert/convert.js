// Category switching
const categoryBtns = document.querySelectorAll('.category-btn');
const sections = {
	image: document.getElementById('image-section'),
	video: document.getElementById('video-section'),
	audio: document.getElementById('audio-section')
};

let currentCategory = 'image';

categoryBtns.forEach(btn => {
	btn.addEventListener('click', () => {
		const category = btn.dataset.category;
		
		// Update active button
		categoryBtns.forEach(b => b.classList.remove('active'));
		btn.classList.add('active');
		
		// Update active section
		Object.keys(sections).forEach(key => {
			sections[key].classList.remove('active');
		});
		sections[category].classList.add('active');
		
		currentCategory = category;
		generateCommand();
	});
});

// Get all select elements
const imageFrom = document.getElementById('image-from');
const imageTo = document.getElementById('image-to');
const imageResize = document.getElementById('image-resize');
const imageQuality = document.getElementById('image-quality');

const videoFrom = document.getElementById('video-from');
const videoTo = document.getElementById('video-to');
const videoCodec = document.getElementById('video-codec');
const videoResolution = document.getElementById('video-resolution');
const videoFps = document.getElementById('video-fps');
const videoBitrate = document.getElementById('video-bitrate');

const audioFrom = document.getElementById('audio-from');
const audioTo = document.getElementById('audio-to');
const audioBitrate = document.getElementById('audio-bitrate');
const audioSampleRate = document.getElementById('audio-sample-rate');
const audioChannels = document.getElementById('audio-channels');

const commandText = document.getElementById('command-text');
const copyBtn = document.getElementById('copy-btn');
const inputFilename = document.getElementById('input-filename');
const outputFilename = document.getElementById('output-filename');

// Add event listeners to all selects
[imageFrom, imageTo, imageResize, imageQuality,
 videoFrom, videoTo, videoCodec, videoResolution, videoFps, videoBitrate,
 audioFrom, audioTo, audioBitrate, audioSampleRate, audioChannels].forEach(select => {
	select.addEventListener('change', generateCommand);
});

// Add event listeners to filename inputs
[inputFilename, outputFilename].forEach(input => {
	input.addEventListener('input', generateCommand);
});

// Generate command based on current selections
function generateCommand() {
	let command = '';
	
	if (currentCategory === 'image') {
		command = generateImageCommand();
	} else if (currentCategory === 'video') {
		command = generateVideoCommand();
	} else if (currentCategory === 'audio') {
		command = generateAudioCommand();
	}
	
	commandText.textContent = command;
}

function generateImageCommand() {
	const from = imageFrom.value;
	const to = imageTo.value;
	const resize = imageResize.value;
	const quality = imageQuality.value;
	const inputName = inputFilename.value.trim() || 'input';
	const outputName = outputFilename.value.trim() || 'output';
	
	let command = 'convert ' + inputName + '.' + from;
	
	// Add resize if specified
	if (resize) {
		if (resize.includes('%')) {
			command += ' -resize ' + resize;
		} else {
			command += ' -resize ' + resize;
		}
	}
	
	// Add quality if specified (for JPEG/WebP)
	if (quality && (to === 'jpg' || to === 'webp')) {
		command += ' -quality ' + quality;
	}
	
	command += ' ' + outputName + '.' + to;
	
	return command;
}

function generateVideoCommand() {
	const from = videoFrom.value;
	const to = videoTo.value;
	const codec = videoCodec.value;
	const resolution = videoResolution.value;
	const fps = videoFps.value;
	const bitrate = videoBitrate.value;
	const inputName = inputFilename.value.trim() || 'input';
	const outputName = outputFilename.value.trim() || 'output';
	
	let command = 'ffmpeg -i ' + inputName + '.' + from;
	
	// Add codec if specified
	if (codec) {
		if (codec === 'copy') {
			command += ' -c copy';
		} else {
			command += ' -c:v ' + codec;
		}
	}
	
	// Add resolution if specified
	if (resolution) {
		command += ' -vf scale=' + resolution;
	}
	
	// Add FPS if specified
	if (fps) {
		command += ' -r ' + fps;
	}
	
	// Add bitrate if specified
	if (bitrate) {
		command += ' -b:v ' + bitrate;
	}
	
	// Special handling for GIF output
	if (to === 'gif') {
		if (!resolution) {
			command += ' -vf "fps=10,scale=640:-1:flags=lanczos"';
		} else if (!fps) {
			command += ' -vf "fps=10"';
		}
	}
	
	command += ' ' + outputName + '.' + to;
	
	return command;
}

function generateAudioCommand() {
	const from = audioFrom.value;
	const to = audioTo.value;
	const bitrate = audioBitrate.value;
	const sampleRate = audioSampleRate.value;
	const channels = audioChannels.value;
	const inputName = inputFilename.value.trim() || 'input';
	const outputName = outputFilename.value.trim() || 'output';
	
	let command = 'ffmpeg -i ' + inputName + '.' + from;
	
	// Add bitrate if specified
	if (bitrate) {
		command += ' -b:a ' + bitrate;
	}
	
	// Add sample rate if specified
	if (sampleRate) {
		command += ' -ar ' + sampleRate;
	}
	
	// Add channels if specified
	if (channels) {
		command += ' -ac ' + channels;
	}
	
	// Specific codec recommendations
	if (to === 'mp3') {
		if (!bitrate) {
			// Don't add default codec, let ffmpeg choose
		}
	} else if (to === 'aac' || to === 'm4a') {
		command += ' -c:a aac';
	} else if (to === 'ogg') {
		command += ' -c:a libvorbis';
	} else if (to === 'flac') {
		command += ' -c:a flac';
	}
	
	command += ' ' + outputName + '.' + to;
	
	return command;
}

// Copy command to clipboard
copyBtn.addEventListener('click', () => {
	const command = commandText.textContent;
	
	if (command && command !== 'Select options above to generate a command') {
		navigator.clipboard.writeText(command).then(() => {
			// Visual feedback
			copyBtn.textContent = 'Copied!';
			copyBtn.classList.add('copied');
			
			setTimeout(() => {
				copyBtn.textContent = 'Copy';
				copyBtn.classList.remove('copied');
			}, 2000);
		}).catch(err => {
			console.error('Failed to copy:', err);
			// Fallback for older browsers
			fallbackCopyTextToClipboard(command);
		});
	}
});

// Fallback copy function for older browsers
function fallbackCopyTextToClipboard(text) {
	const textArea = document.createElement('textarea');
	textArea.value = text;
	textArea.style.position = 'fixed';
	textArea.style.top = '0';
	textArea.style.left = '0';
	textArea.style.width = '2em';
	textArea.style.height = '2em';
	textArea.style.padding = '0';
	textArea.style.border = 'none';
	textArea.style.outline = 'none';
	textArea.style.boxShadow = 'none';
	textArea.style.background = 'transparent';
	document.body.appendChild(textArea);
	textArea.focus();
	textArea.select();
	
	try {
		document.execCommand('copy');
		copyBtn.textContent = 'Copied!';
		copyBtn.classList.add('copied');
		
		setTimeout(() => {
			copyBtn.textContent = 'Copy';
			copyBtn.classList.remove('copied');
		}, 2000);
	} catch (err) {
		console.error('Fallback: Could not copy text', err);
	}
	
	document.body.removeChild(textArea);
}

// Initialize with default command
generateCommand();
