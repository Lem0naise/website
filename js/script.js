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


var is_ready = false;
var count_items = 0;
var winHeight
// ON PAGE READY FUNCTION
function ready(){
	winHeight = window.innerHeight;
	$('.sticky_container').each(function(){ // counting number of projects
		count_items += 1;
	})
	$('.sticky_container').eq(0).css("margin-top", "100vh") //adding margin to topmost sticky container
	for (j=0;j<set_triggers.length;j++){ // converting vh into pixels
		set_triggers[j] = (set_triggers[j] * winHeight/100)
	}
	is_ready = true;
}


var set_triggers = [0, 50, 120, 150]  //[appear, finish appearing, disappear, finish disappearing]

// ON SCROLL FUNCTION
function scrolled(scrollPos) {
	if (!is_ready){
		ready();
	}
	//console.log(scrollPos)	

	// fading title and moving background image
	if (scrollPos <= 250){
  		$('#back-image').css("opacity", scale(scrollPos, 0, 250, 1, 0.2));
		$('.splash').css("transition", "none");
		$('.splash').css("opacity", scale(scrollPos, 0, 250, 1, 0));
	}else{
		$('#back-image').css("opacity", 0.2);
		$('.splash').css("opacity", 0);
	}

	// each element
	for (i=0;i<count_items;i++){
		var trigger_pos = []
		for (x=0;x<set_triggers.length;x++){ // incrementing trigger pos by 1 viewport
			trigger_pos.push(set_triggers[x] + (winHeight*i));
		}
		if (scrollPos >= trigger_pos[2]){
			$('.sticky').eq(i).css("transform", "translate(" + scale(scrollPos, trigger_pos[2], trigger_pos[3], 100, 85, true) + "vw," + 0 + ")")
			$('.sticky').eq(i).css("opacity", scale(scrollPos, trigger_pos[2], trigger_pos[3], 1, 0, true))
			$('.label-text').eq(i).css("opacity", scale(scrollPos, trigger_pos[3]-(winHeight/2), trigger_pos[3], 1, 0));
		}
		else{
			if (scrollPos >= trigger_pos[0]){
				$('.sticky').eq(i).css("transform", "translate(" + scale(scrollPos, trigger_pos[0], trigger_pos[1], 85, 100, true) + "vw," + 0 + ")")
				$('.sticky').eq(i).css("opacity", scale(scrollPos, trigger_pos[0], trigger_pos[1], 0, 1, true));
				$('.label-text').eq(i).css("opacity", scale(scrollPos, trigger_pos[1], trigger_pos[1]+(winHeight/2), 0, 1));
			}
			else{
				$('.sticky').eq(i).css("transform", "none");
				$('.label-text').eq(i).css("opacity", 0);
			}
		}
	}

}




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