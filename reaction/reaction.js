const black = "#292429"
const white = "#e8e6e3"
var screen_d
var text

function home(){
	window.open("..", "_self");
}

var turned_white = false;

function screen_click(){ // when screen clicked
	if (turned_white){stopwatch_end();}
	else{ start();}
}

function start(){
	screen_d = document.getElementById("screen");
	text = document.getElementById("text");
	text.innerText = "Click when the screen turns white..."

	let max = 4;
	let min = 1;
	let wait = Math.random() * (max - min + 1) + min; // random wait time 

	setTimeout(function(){ // once screen turns white
		screen_d.style.setProperty("background-color", white); 
		text.style.setProperty("color", black);
		text.innerText = "Go!";
		turned_white = true;
		stopwatch_start();
	}, wait*1000)
}


// ~~~ STOPWATCH ~~~~

var t_taken = 0; // time taken
var start_d = new Date;
var end_d = new Date;

function stopwatch_start(){ // when screen turns white
	start_d = new Date();
}
function stopwatch_end(){
	turned_white = false;
	end_d = new Date();
	t_taken = new Date(end_d - start_d).getTime();

	let time_str = "Reaction time of "
	if (t_taken < 1000){
		time_str += t_taken + "ms"
	}
	else {
		time_str += t_taken / 1000 + "s"
	}

	screen_d.style.setProperty("background-color", black);
	text.style.setProperty("color", white);
	text.innerHTML = time_str + ".<br>Click anywhere to try again.";

}
