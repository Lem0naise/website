

function mobile_trapez_start(e) {


    //starts of with the start point in the scroll
    old_scrolldirection = e.changedTouches[0].screenY;

}

function mobile_trapez_end(e){


    //now calls the trapezium function with the new value
    trapezium(e);

}

function addTrapezium() {

    window.addEventListener('mousewheel', trapezium);

    window.addEventListener('touchstart', mobile_trapez_start)
    window.addEventListener('touchend', mobile_trapez_end);
  
}


//waits 2 secs and then enables trapezium
setTimeout(addTrapezium, 1000);
