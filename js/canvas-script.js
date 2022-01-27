//must make the buttons div have no background for some reason cache not clearing
//also make the portfolio like actuall stuff appear

function trapezium(e){

    var trapez = document.getElementById("trapezium");
    var buttons = document.getElementsByClassName("menu-button"); //list of buttons not actual buttons div
    var main_div = document.getElementsByClassName("menu-text-div")[0];
    //welcome text (text page 2 initially)
    var welcome_undertext = document.getElementsByClassName("splash-undertext")[0];

    
    //alert(e.deltaY);
    if (e.deltaY>0 ){
        
        //going down (intro)

        trapez.style.marginLeft = "-100vw";  //moves white trapez
        main_div.style.left = "12vw"; //intro portfolio

        
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


        welcome_undertext.style.opacity = 100; //fades in scrolltext
        welcome_undertext.style.transition = "none";
        welcome_undertext.style.left = "-50vw"; //but moves to left 
        welcome_undertext.classList.add("splash-undertext-animation"); //restarts animation




        for (let i=0; i < buttons.length; i++) {
            buttons[i].style.color = "#1D1D1D";  
        }
        
    }
}


window.addEventListener('wheel', trapezium);
window.addEventListener('mousewheel', trapezium);
window.onscroll = trapezium;