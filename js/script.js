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
		if (ans > outMax || ans < outMin){
			if (outMax - outMin <0){
				ans = ans - outMin;
				ans = ans + outMax;
				return ans;
			}
			else{return ans;}
		}
		else{return ans;}
	}
}



//SCROLLING FUNCTION
let lastScroll = 0;
let ticking = false;
var first_time = true;
var item_list;


var trigger_pos = [
	[250, 350, 450, 600]
]
function scrolled(scrollPos) {
	
	if (first_time){
		item_list = [ // [item, appear, sticky, disappear, description item]
			[$('#wordle'), 250, 450, 600, $('#wordle_text')], // wordle
		]	
	}
	first_time = false;

	console.log(scrollPos)	

	// DO STUFF BELOW HERE ON SCROLL

	// fading title and moving background image
	if (scrollPos <= 185){
  		$('#back-image').css("opacity", scale(scrollPos, 0, 200, 1, 0))}
	if (scrollPos >= 185){
		$('.splash').css("transition", "none")
		$('.splash').css("opacity", scale(scrollPos, 185, 250, 1, 0))
	}else{$('.splash').css("opacity", 1)}


	for (i=0;i<trigger_pos.length;i++){
		if (scrollPos >= trigger_pos[i][2]){
			//stfu kill youself
		}
		else{
			if (scrollPos >= trigger_pos[i][0]){
				$('#wordle').css("transform", "translate(" + scale(scrollPos, trigger_pos[i][0], trigger_pos[i][1], 0, 50) + "vw," + 0 + ")")
			}
			else{
				$('#wordle').css("transform", "none")
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