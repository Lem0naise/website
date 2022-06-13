function downloadfile(item){
  window.open(item.getAttribute("data-link"));
}
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

// so the page moves back when u click escape
$(document).keypress(function(e){
  if (e.which == 27){ // 27 is key code for escape
	  unmove();
  }
});
$(document).keydown(function(e){
	if (e.which == 27){ // 27 is key code for escape
		unmove();
	}
});