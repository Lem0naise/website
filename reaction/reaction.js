const black = "#292429"
const white = "#e8e6e3"
const red = "#962942"
const green = "#459945"
var screen_d
var mainText
var subText
var timer

var state = "stopped";
// stopped, white

function screen_click(){ 
	if (state=="white"){stopwatch_end();}
	else if (state=='stopped'){ start();}
	else if (state =='timer'){ early();}
}

function start(){
	clearTimeout(timer);
	state = "timer";
	mainText = document.getElementById("main-text");
	subText = document.getElementById("sub-text");
	screen_d = document.getElementById("screen");
	
	// Apply waiting state
	screen_d.className = "screen-waiting";
	mainText.innerText = "Wait...";
	subText.innerText = "";

	let max = 4000;
	let min = 1000;
	let wait = Math.random() * (max - min + 1) + min;

	timer = setTimeout(function(){
		screen_d.className = "screen-go";
		mainText.innerText = "Go!";
		subText.innerText = "";
		state = 'white';
		stopwatch_start();
	}, wait)
}

function early(){
	clearTimeout(timer);

	state = 'stopped';
	screen_d.className = "screen-early";
	mainText.innerText = "Too early!";
	subText.innerText = "Wait for the signal";

	let wait = 1500;
	timer = setTimeout(function(){ 	
		start()
	}, wait)
}

// ~~~ STOPWATCH ~~~~

var t_taken = 0;
var start_d = new Date;
var end_d = new Date;

function stopwatch_start(){
	start_d = Date.now()
}

function stopwatch_end(){
	state = 'calculating';
	end_d = Date.now()
	t_taken = end_d - start_d;
	
	let time_display = "";
	if (t_taken < 1000){
		time_display = t_taken + "ms";
	} else {
		time_display = (t_taken / 1000).toFixed(2) + "s";
	}

	screen_d.className = "screen-success";
	mainText.innerHTML = `<span class="reaction-time">${time_display}</span>`;
	subText.innerText = "Click anywhere to try again";
	state = 'stopped';
}
	