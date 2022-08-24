// WORDLE PARAMS
function checkParams(){
	const queryString = window.location.search;
	if (queryString.includes("wordle=true")){moveleft("wordle");}
}

function downloadfile(item){
  window.open(item.getAttribute("data-link"));
  window.location.href = (item.getAttribute("data-download"));
}


// ONLOAD OF IMG
function background_load(){
	if (document.getElementById("back-image").complete){
		$('.back_image').css("opacity", "1")
		window.setTimeout(function(){$(".splash").css("opacity", "1")}, 500);
	}
	else{
		window.setTimeout(background_load, 100);
	}
}

// RANGE MAPPING FUNCTION
function scale (number, inMin, inMax, outMin, outMax, limit=false) {
	var ans = (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	if (!limit) {return ans;}//if normal then return
	else{ // if want to limit at range
		if (outMax - outMin >0){ // if positive range
			if (ans > outMax){return outMax;}
			else if (ans < outMin){return outMin;}
			else{return ans;}
		}
		else{// negative range
			if (ans < outMax){return outMax;}
			else if (ans > outMin){return outMin;}
			else{return ans;}
		}
	}
}



//SCROLLING FUNCTION
let lastScroll = 0;
let ticking = false;


var is_ready = false;
function ready(){

	$('.sticky_container').eq(0).css("margin-top", "100vh") //adding margin to topmost sticky container


	for (j=0;j<trigger_pos.length;j++){
		for (x=0;x<trigger_pos[j].length;x++){
			trigger_pos[j][x] = (trigger_pos[j][x] * window.innerHeight/100)

		}
	}

	console.log(trigger_pos)
	is_ready = true;
}


var trigger_pos = [ //[appear, finish appearing, disappear, finish disappearing]
	[0, 50, 120, 150],
	[100, 150, 200, 300]
]

function scrolled(scrollPos) {
	
	if (!is_ready){
		ready();
	}

	console.log(scrollPos)	

	// DO STUFF BELOW HERE ON SCROLL

	// fading title and moving background image
	if (scrollPos <= 250){
  		$('#back-image').css("opacity", scale(scrollPos, 0, 250, 1, 0.2));
		$('.splash').css("transition", "none");
		$('.splash').css("opacity", scale(scrollPos, 0, 250, 1, 0));
	}else{
		$('#back-image').css("opacity", 0.2);
		$('.splash').css("opacity", 0);
	}


	for (i=0;i<trigger_pos.length;i++){
		if (scrollPos >= trigger_pos[i][2]){
			$('.sticky').eq(i).css("transform", "translate(" + scale(scrollPos, trigger_pos[i][2], trigger_pos[i][3], 100, 0, true) + "vw," + 0 + ")")
			$('.sticky').eq(i).css("opacity", scale(scrollPos, trigger_pos[i][2], trigger_pos[i][3], 1, 0, true))
		}
		else{
			if (scrollPos >= trigger_pos[i][0]){
				console.log("we moving it ")
				$('.sticky').eq(i).css("transform", "translate(" + scale(scrollPos, trigger_pos[i][0], trigger_pos[i][1], 0, 100, true) + "vw," + 0 + ")")
				$('.sticky').eq(i).css("opacity", scale(scrollPos, trigger_pos[i][0], trigger_pos[i][1], 0, 1, true))
			}
			else{
				$('.sticky').eq(i).css("transform", "none")
			}
		}
	}

}


document.addEventListener('scroll', (e) => {
  	lastScroll = window.scrollY;
  	if (!ticking) {
    	window.requestAnimationFrame(() => {
      	scrolled(lastScroll);
      	ticking = false;
   	});
    ticking = true;
  	}
});


// WORDLE FUNCTIONS
var left = false //this variable is true when the page has moved to the left
var playing_wordle = false // this is true if currently playing wordle

function moveleft(name){
  if (!left){ // if the page is not already moved
	if (name == "wordle"){ playing_wordle=true; }

	// css changing
	$('#left_page').css("margin-left", "-200vw");
	setTimeout(function(){$('#left_page').css("opacity", "0");}, 500)
	$('#right_page').css("margin-left", "0vw");
	$('#right_page').css("opacity", "1");
	$('#back').css("opacity", "1");
	$('#back').css("cursor", "pointer");

	if (playing_wordle){wordle();} // if they clicked wordle, start the wordle function
	setTimeout(function(){left = true;}, 500); // set 'split' (left) variable to true after .5 seconds
  }

  // --- DEPRECATED --- (the page now moves the whole way)
  /*
  else {  // if the page is already split and you clicked on a button, close and reopen the window 
	unmove(true, name); 
	
  } 
  */
}

function unmove(name='') {
  if (left){
	document.title = "Zac Nolan";
	//css changing
	$('#left_page').css("margin-left", "0vw");
	$('#left_page').css("opacity", "1");
	$('#right_page').css("margin-left", "100vw");// unsplit the pages
	$('#back').css("opacity", "0");
	setTimeout(function(){$('#back').css("cursor", "default");}, 500);
	setTimeout(function(){$('#right_page').css("opacity", "0");}, 500)

	left = false; // set left back to false because the page is unsplit
  }
}