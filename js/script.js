function downloadfile(item){
  window.open(item.getAttribute("data-link"));
}
var left = false //this variable is true when the page has moved to the left
var playing_wordle = false // this is true if currently playing wordle
// combined hover function 
function moveleft(name){
  if (!left){ // if the page is not already moved
    if (name == "wordle"){ playing_wordle=true; }
    //move the right page and move the left page
    $('#left_page').css("margin-left", "-200vw");
    setTimeout(function(){$('#left_page').css("opacity", "0");}, 500)
    $('#right_page').css("margin-left", "0vw");
    $('#right_page').css("opacity", "1");
    
    if (!playing_wordle){
      $('#right_page').find("#"+name).css("opacity", "1"); // show relevant image
    }
    else if (playing_wordle){ // if is wordle, start playing wordle
      wordle();
    }
    setTimeout(function(){left = true;}, 500); // set 'split' (left) variable to true after .5 seconds
  }
  else {  // if the page is already split and you clicked on a button, close and reopen the window
    unmove(true, name); // so first move this back
    
  } 
}
function unmove(second=false, name='') {
  if (left){
    $('#left_page').css("margin-left", "0vw");
    $('#left_page').css("opacity", "1");
    $('#right_page').css("margin-left", "100vw");// unsplit the pages
    setTimeout(function(){$('#right_page').css("opacity", "0");}, 500)
    //setTimeout(function() {$('#right_page').children().css("opacity", "0");}, 500);
    // rehide the image onces its behind the left page
    left = false; // set left back to false because the page is unsplit
    setTimeout(function() {
      if (second){  // if you then need to reopen it with a new page (i.e the user clicked a button instead of the page)
        moveleft(name);
      }
    }, 600); //open it 600 ms later
  }
}
// so the page moves back when u click escape
$(document).keypress(function(e){
  if (e.which == 27){ // 27 is key code for escape
      unmove();
  }
});
// this is the template for downloading, first one to open and second one to download
//data-link = "https://github.com/Lem0naise/top-trumps" href = "https://github.com/Lem0naise/top-trumps/archive/refs/heads/main.zip" onclick="downloadfile(this);
