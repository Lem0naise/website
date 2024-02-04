const black = "#292429"
const white = "#e8e6e3"
const red = "#962942"
const green = "#459945"
var screen_d
var text
var timer

function home(){
	alert("yoo");
	window.href = '..';
}


var state = "stopped";
// stopped, white

function screen_click(){ // when screen clicked
	if (state=="white"){stopwatch_end();}
	else if (state=='stopped'){ start();}
	else if (state =='timer'){ early();}
}

function start(){
	clearTimeout(timer);
	state = "timer";
	text = document.getElementById("text");
	screen_d = document.getElementById("screen");
	screen_d.style.setProperty("background-color", black);
	text.style.setProperty("color", white);
	screen_d = document.getElementById("screen");
	text = document.getElementById("text");
	text.innerText = "Wait..."

	let max = 4000;
	let min = 1000;
	let wait = Math.random() * (max - min + 1) + min; // random wait time 

	timer = setTimeout(function(){ // once screen turns white
		screen_d.style.setProperty("background-color", white); 
		text.style.setProperty("color", black);
		text.innerText = "Go!";
		state = 'white';
		stopwatch_start();
	}, wait)
}

function early(){
	clearTimeout(timer);

	state = 'stopped';
	text = document.getElementById("text");
	text.innerText = "Too early!"
	screen_d = document.getElementById("screen");
	screen_d.style.setProperty("background-color", red);

	let wait = 1000;
	timer = setTimeout(function(){ 	
		start()
	}, wait)
}


// ~~~ STOPWATCH ~~~~

var t_taken = 0; // time taken
var start_d = new Date;
var end_d = new Date;

function stopwatch_start(){ // when screen turns white
	start_d = Date.now()
}
function stopwatch_end(){
	state = 'calculating';
	end_d = Date.now()
	t_taken = end_d - start_d;
	let time_str = "Reaction time of "
	if (t_taken < 1000){
		time_str += t_taken + "ms"
	}
	else {
		time_str += t_taken / 1000 + "s"
	}

	screen_d.style.setProperty("background-color", green);
	text.style.setProperty("color", white);
	text.innerHTML = time_str + ".<br>Click anywhere to try again.";
	state = 'stopped';
}
