function downloadfile(item){
  window.open(item.getAttribute("data-link"));
}

var left = false //this variable is true when the page has moved to the left

// combined hover function 
function moveleft(name){

  
  console.log($('#portfolio').children());

  
  console.log("cool", name);
  console.log(left);

  $('#left_page').css("width", "50vw");
  $('#right_page').css("width", "45vw");


  $('#right_page').find("#"+name).css("opacity", "1");

  
  if (!left){
    setTimeout(function(){left = true;}, 500);
  }



}

function unmove() {

  if (left){
    $('#left_page').css("width", "100vw");
    $('#right_page').css("width", "0vw");

    setTimeout(function() {$('#right_page').children().css("opacity", "0");}, 500);
    // rehide the image onces its behind the left page
    
    left = false;
  }

}


// this is the template for downloading, first one to open and second one to download
//data-link = "https://github.com/Lem0naise/top-trumps" href = "https://github.com/Lem0naise/top-trumps/archive/refs/heads/main.zip" onclick="downloadfile(this);



