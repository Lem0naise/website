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

// CHECKING VISIBLE FUNCTION
function checkVisible( elm, evalType ) {
    evalType = evalType || "visible";

    var vpH = $(window).height(), // Viewport Height
        st = $(window).scrollTop(), // Scroll Top
        y = $(elm).offset().top,
        elementHeight = $(elm).height();

    if (evalType === "visible") return ((y < (vpH + st)) && (y > (st - elementHeight)));
    if (evalType === "above") return ((y < (vpH + st)));
}

// RANGE MAPPING FUNCTION
function scale (number, inMin, inMax, outMin, outMax, limit=false) {
	var ans = (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
	if (!limit) {return ans;}//if normal then return
	else{ // if want to limit at range
		if (outMax - outMin >0){ // if positive range
			if (ans > outMax){return outMax;}
			else if (ans < outMin){return outMin;}
			else{return ans;}
		}
		else{// negative range
			if (ans < outMax){return outMax;}
			else if (ans > outMin){return outMin;}
			else{return ans;}
		}
	}
}

//SCROLLING FUNCTION
let lastScroll = 0;
let ticking = false;
document.getElementById("page").addEventListener('scroll', (e) => {
	console.log("scrolled");
	lastScroll = document.getElementById("page").scrollTop;
	if (!ticking) {
	  window.requestAnimationFrame(() => {
		scrolled(lastScroll);
		ticking = false;
	 });
  ticking = true;
	}
});


var oldScroll = 0;
// ON SCROLL FUNCTION
function scrolled(scrollPos) {
	var winHeight = window.innerHeight;
	if (scrollPos-oldScroll < 1 && scrollPos/winHeight < 1){ // if scrolling back up to the splash
		$('.back_image').css("opacity", 1);
	}
	else if (scrollPos/winHeight > 2.5){ // if right at the bottom (contact me page)
		$('.back_image').css("opacity", 0.1);
	}
	else if (scrollPos/winHeight > 0){ // if on the normal pages
		$('.back_image').css("opacity", 0.2);
	}
	oldScroll = scrollPos;
}