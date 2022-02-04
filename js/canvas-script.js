//must make the buttons div have no background for some reason cache not clearing
//also make the portfolio like actuall stuff appear

var time = false;
var old_scrolldirection = 0;


function trapezium(e){


    var trapez = document.getElementById("trapezium");
    var buttons = document.getElementsByClassName("menu-button"); //list of buttons not actual buttons div
    var main_div = document.getElementsByClassName("menu-text-div")[0];
    var portfolio_div = document.getElementsByClassName("portfolio")[0];
    //welcome text (text page 2 initially)
    var welcome_undertext = document.getElementsByClassName("splash-undertext")[0];


    //alert(e.deltaY);
    if (e.deltaY>0 ){
        
        //going down (intro)

        trapez.style.marginLeft = "-100vw";  //moves white trapez
        main_div.style.left = "12vw"; //intro portfolio title
        portfolio_div.style.left = "-19vw"; //intro portfolio text

        //I AM CURRENTLY TRYING TO MAKE THE PORTFOLIO DIV COME IN IN THE RIGHT TIME

        portfolio_div.style.transition = "opacity .3s, left .5s .5s";
        main_div.style.transition = "opacity .3s, left .5s ease"; //makes delay so the text comes in last

        
        welcome_undertext.style.transition = "opacity .4s, left 1s"
        welcome_undertext.classList.remove("splash-undertext-animation");
        welcome_undertext.style.left = "5vw";

        welcome_undertext.style.opacity = 0;


        for (let i=0; i < buttons.length; i++) {
            buttons[i].style.color = "#DCDCDC";
        }

    }
    else if (e.deltaY <0){

        //going up (outro)

        trapez.style.marginLeft = "0"; //puts white trapez back where it belongs
        main_div.style.left = "-100%"; //outro portfolio title
        portfolio_div.style.left = "-100vw"; //outro portfolio text

        portfolio_div.style.transition = "opacity .3s, left .5s"; //makes delay so the text goes away first


        welcome_undertext.style.opacity = 100; //fades in scrolltext
        welcome_undertext.style.transition = "none";
        welcome_undertext.style.left = "-50vw"; //but moves to left 
        welcome_undertext.classList.add("splash-undertext-animation"); //restarts animation


        for (let i=0; i < buttons.length; i++) {
            buttons[i].style.color = "#1D1D1D";  
        }
        
    }

    //if mobile

    else if (e.deltaY==undefined){ 
        

        var scrolldirection = e.changedTouches[0].screenY;

        if (scrolldirection < old_scrolldirection) {

            //if going down (intro)
            time = true;

                    
            //going down (intro)
            trapez.style.marginLeft = "-100vw";  //moves white trapez
            main_div.style.left = "12vw"; //intro portfolio title
            portfolio_div.style.left = "-19vw"; //intro portfolio text

            //I AM CURRENTLY TRYING TO MAKE THE PORTFOLIO DIV COME IN IN THE RIGHT TIME

            portfolio_div.style.transition = "opacity .3s, left .5s .5s";
            main_div.style.transition = "opacity .3s, left .5s ease"; //makes delay so the text comes in last

            
            welcome_undertext.style.transition = "opacity .4s, left 1s"
            welcome_undertext.classList.remove("splash-undertext-animation");
            welcome_undertext.style.left = "5vw";

            welcome_undertext.style.opacity = 0;


            for (let i=0; i < buttons.length; i++) {
                buttons[i].style.color = "#DCDCDC";
            }
        }


        //if going back up
        if (scrolldirection >= old_scrolldirection){
            time = false;
    
            //going up (outro)
    
            trapez.style.marginLeft = "0"; //puts white trapez back where it belongs
            main_div.style.left = "-100%"; //outro portfolio title
            portfolio_div.style.left = "-100vw"; //outro portfolio text
    
            portfolio_div.style.transition = "opacity .3s, left .5s"; //makes delay so the text goes away first
    
    
            welcome_undertext.style.opacity = 100; //fades in scrolltext
            welcome_undertext.style.transition = "none";
            welcome_undertext.style.left = "-50vw"; //but moves to left 
            welcome_undertext.classList.add("splash-undertext-animation"); //restarts animation
    
    
            for (let i=0; i < buttons.length; i++) {
                buttons[i].style.color = "#1D1D1D";  
            }
                    
        }

        old_scrolldirection = scrolldirection;
    }


}

function mobile_trapez(e) {

    console.log(e);
    trapezium(e);
}


function addTrapezium() {

    window.addEventListener('mousewheel', trapezium);

    window.addEventListener('touchend', mobile_trapez);
  
}


//waits 2 secs and then enables trapezium
setTimeout(addTrapezium, 2000);
