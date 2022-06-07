function downloadfile(item){
  window.open(item.getAttribute("data-link"));
}

var left = false //this variable is true when the page has moved to the left

// combined hover function 
function moveleft(name){

  if (!left){ // if the page is not already split

    $('#left_page').css("width", "50vw"); //split the page into two
    $('#right_page').css("width", "45vw");

    $('#right_page').find("#"+name).css("opacity", "1"); // show relevant image
    
    setTimeout(function(){left = true;}, 500); // set 'split' variable to true after .5 seconds

  }

  else {  // if the page is already split and you clicked on a button, close and reopen the window

    console.log("so here we have to close and open it again");

    unmove(true, name); // so first move this back
    
  }

}

function unmove(second=false, name='') {


  if (left){

    console.log("starting moving back right");

    $('#left_page').css("width", "100vw");
    $('#right_page').css("width", "0vw"); // unsplit the pages

    setTimeout(function() {$('#right_page').children().css("opacity", "0");}, 500);
    // rehide the image onces its behind the left page
    
    console.log("finished moving back right");
    left = false; // set left back to false because the page is unsplit

    setTimeout(function() {
      if (second){  // if you then need to reopen it with a new page (i.e the user clicked a button instead of the page)
        moveleft(name);
      }
    }, 600); //open it 600 ms later

  }


}

// this is the template for downloading, first one to open and second one to download
//data-link = "https://github.com/Lem0naise/top-trumps" href = "https://github.com/Lem0naise/top-trumps/archive/refs/heads/main.zip" onclick="downloadfile(this);



