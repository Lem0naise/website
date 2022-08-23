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

	if (outMax - outMin >0){
		ans = ans - outMin;
		ans = ans + outMax;
	}

	if (!limit) {return ans;}//if normal then return
	
	else{ // if want to limit at range
		if (ans > outMax || ans < outMin){
				

			if (outMax - outMin <0){
				ans = ans - outMin;
				ans = ans + outMax;
				return ans;
			}

			if ((outMin-outMax)<0){return outMax;}//if normal range
			else{return outMin;}
		}
		else{return ans;}
	}
}



//SCROLLING FUNCTION
let lastScroll = 0;
let ticking = false;

var background_image_disappear = 500;
var title_sticky = 280;


var first_time = true;
var item_list;

function scrolled(scrollPos) {
	
	if (first_time){

		item_list = [ // [item, appear, sticky, disappear, description item]
			[$('#wordle'), 250, 450, 600, $('#wordle_text')], // wordle
		]	
	}
	first_time = false;


	console.log(scrollPos)	

	// fading title and moving background image
  	$('#back-image').css("opacity", scale(scrollPos, 0, 200, 1, 0))
	$('#back-image').css("margin-left", scale(scrollPos, 0, background_image_disappear, 0, -100).toString() + "vw")
	$('.name').css("opacity", scale(scrollPos, 0, 200, 1, 0))
	$('.bio').css("opacity", scale(scrollPos, 0, 200, 1, 0))


	for (i=0; i<item_list.length; i++){
		
		if (scrollPos >= item_list[i][1]){ //appear
			item_list[i][0].css("opacity", scale(scrollPos, item_list[i][1], item_list[i][2], 0, 1))
			item_list[i][0].css("margin-top", scale(scrollPos, item_list[i][1], item_list[i][2], 100, 25).toString() + "vh")
		}
		else{
			item_list[i][0].css("opacity",0)
		}

		// sticky time
		if (scrollPos >= item_list[i][2]){ // text appear
			item_list[i][4].css("margin-right", (scale(scrollPos, item_list[i][2], item_list[i][3], -50, -5, true)).toString() + 'vw')
			item_list[i][4].css("opacity", scale(scrollPos, item_list[i][2], item_list[i][3], 0, 1))
			
		}

		if (i == 0){ // wordle (w two texts and images)
			if (scrollPos >= 700){ // move text time
				$('#wordle1').css("margin-left", scale(scrollPos, 700, 800, 0, -100).toString()+'vw')
				$('#wordle_text').css("margin-right", scale(scrollPos, 700, 800, -5, 50, true).toString()+'vw')
			}
			else if (scrollPos < 700){
				$('#wordle1').css("margin-left", "0vw");
				if ($("#wordle_text").html() == "Or online"){
					change($('#wordle_text'), 'Wordle in your terminal')}
			}
			if (scrollPos >= 800){
				if ($("#wordle_text").html() != "Or online"){
					change($("#wordle_text"), "Or online")}
				$('#wordle2').css("display", "block");
				$('#wordle2').css("opacity", "1");
				$('#wordle2').css("transform", "translateX(" + scale(scrollPos, 800, 900, 120, 60, true).toString() + "vw");
			}
			

		}
	}
}

var changing = false;
function change(elem, text){
	if (!changing){
		var changing = true;
		elem.fadeOut(function(){
			elem.html(text);
			elem.fadeIn();
			})
	var changing = false;
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