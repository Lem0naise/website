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
	var scrollPosvh = scrollPos/winHeight; // scrollPos in vh

	if (scrollPosvh < 1){ // if scrolling back up to the splash
		$('.back_image').css("opacity", scale(scrollPosvh, 0.8, 0, 0.2, 1, true));
	}
	else if (scrollPosvh > 0){ // if on the normal pages
		$('.back_image').css("opacity", 0.2);
	}

	if (checkVisible($('#extendedbio'))){ // once the second page (FAQ / extended bio) is visible
		var bio_offset = $('#extendedbio').offset().top/winHeight;
		$('#extendedbio').css("transform", "translateX(" + scale(bio_offset, 0.5, 0, -10, 0, true) + "vw)");
		$('#extendedbio').css("opacity", scale(bio_offset, 0.5, 0, 0, 1, true))
	}

	if (checkVisible($('.projects'))){
		var projects_offset = $(".projects").offset().top/winHeight;
		$(".projects_title").css("opacity", scale(projects_offset, 1, 0.6, 0, 1, true));
		var i = 0
		$(".image").each(function(){
			$(this).css("opacity", scale(projects_offset, 0.8-i, 0.5-i, 0, 1, true));
			$(this).css("margin-top", scale(projects_offset, 0.8-i, 0.5-i, 10, 0, true) + "vh");
			i+=0.2;
		})

	}

	/*
	else if (scrollPosvh> 2.5){ // if right at the bottom (contact me page)
		$('.back_image').css("opacity", 0.1);
	}

	*/

	oldScroll = scrollPos;
}