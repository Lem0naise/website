let hamburger_int = 0


function hamburger() {

  let buttons = document.getElementById("button_margin");
  let hamburger = document.getElementById("hamburger");

  if (hamburger_int == 0){

    hamburger.style.transform = "rotate(90deg)";
    buttons.style.opacity = "1";
    buttons.style.marginLeft = "5vw";
    hamburger_int = 1;
  }
  else{

    hamburger.style.transform = "";
    buttons.style.opacity = "0";
    buttons.style.marginLeft = "-20vw";
    hamburger_int = 0;
  }

}


var tings = [
  '1',
  '1'
]

function downloadfile(item){
  window.open(item.getAttribute("data-link"));

}


$('#website_a').hover(function() {

  $('#website_img').css('opacity', tings[0]);

  if(tings[0]=='1'){
    tings[0] = '0';
  }
  else{
    tings[0] = '1';
  }
})


$('#wordle').hover(function() {
  
  $('#wordle_img').css('opacity', tings[1]);
  if(tings[1]=='1'){
    tings[1] = '0';
  }
  else{
    tings[1] = '1';
  }
})


$('#toptrumps').hover(function() {
  
  $('#toptrumps_img').css('opacity', tings[1]);
  if(tings[1]=='1'){
    tings[1] = '0';
  }
  else{
    tings[1] = '1';
  }
})


