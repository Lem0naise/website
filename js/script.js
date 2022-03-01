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


