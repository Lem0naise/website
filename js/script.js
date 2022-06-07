function downloadfile(item){
  window.open(item.getAttribute("data-link"));
}

var left = false //this variable is true when the page has moved to the left

// combined hover function 
function moveleft(name){


  console.log("cool", name);
  console.log(left);

  $('#left_page').css("width", "50vw");
  
  if (!left){
    setTimeout(function(){left = true;}, 500);
  }



}

function unmove() {

  if (left){
    $('#left_page').css("width", "100vw");
    left = false;
  }

}


// this is the template for downloading, first one to open and second one to download
//data-link = "https://github.com/Lem0naise/top-trumps" href = "https://github.com/Lem0naise/top-trumps/archive/refs/heads/main.zip" onclick="downloadfile(this);



