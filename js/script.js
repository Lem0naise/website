var tings = [
  '1',
  '1'
]
// i dont fucking know what this is either fam
// just copy it whenver u want to make a new function
// i spent ages on it and i didnt bother to write comments lmao

var list = [ // list of all slideshowing images
  'wordle',
  'toptrumps'
]

function downloadfile(item){
  window.open(item.getAttribute("data-link"));
}


// image to longer and more formal string
var img_to_str = {
  'wordle': "Wordle",
  'toptrumps': "Top Trumps",
}


function slideshowhover(name, opacity){ //hover without the weird toggling

  $("#"+name+"_img").css('opacity', opacity); // set the named image to visible
  textchange(img_to_str[name]); // change the text to the named image's name

}


var i = 0
// function to change the picture every couple of seconds
function slideshow(){

  console.log(i)
  console.log(list[i])

  if (i!=0){
    slideshowhover(list[i-1], 0); //hide previous image
  }
  else{
    console.log("last img bois")
    slideshowhover(list[list.length-1], 0) // hide last image
  }
 
  slideshowhover(list[i], 1); // show next image

  if (i+1>=list.length){
    i=0
  }
  else{
    i+=1;
  }


  setTimeout(slideshow, 8000); // wait 4 seconds and then show next pic

}
setTimeout(slideshow, 1000); // run the first slideshow 1 second after

// to change the title text
function textchange(text){
  $('#pic_title').css('opacity', tings[1]);
  $('#pic_title').html(text);
}


// combined hover function 
function hover(name){


  for (i=0;i++;i<list.length){ //hide all other images
    slideshowhover(list[i], 0) // hide that image
  }

  $("#"+name+"_img").css('opacity', tings[1]); // set the named image to visible
  textchange(img_to_str[name]); // change the text to the named image's name
  
  // will change this in a second, this is just toggling im pretty sure
  if(tings[1]=='1'){
    tings[1] = '0';
  }
  else{
    tings[1] = '1';
  }


}


// each individual picture hover function

$('#wordle').hover(function() {
  
  hover("wordle");

})


$('#toptrumps').hover(function() {
   
  hover("toptrumps");

})




