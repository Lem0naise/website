function trapezium(e){

    var trapez = document.getElementById("trapezium");
    var buttons = document.getElementsByClassName("menu-button");
    var main_div = document.getElementsByClassName("menu-text-div")[0];
    //welcome text (text page 2 initially)
    var welcome_undertext = document.getElementsByClassName("splash-undertext")[0];

    
    //alert(e.deltaY);
    if (e.deltaY>0 ){
        
        //going down
        trapez.style.marginLeft = "-100vw";
        main_div.style.left = "12vw";


        welcome_undertext.classList.remove("splash-undertext-animation");
        welcome_undertext.style.left = "5vw";
        welcome_undertext.style.opacity = 0;


        for (let i=0; i < buttons.length; i++) {
            buttons[i].style.color = "#DCDCDC";
        }
    }
    else if (e.deltaY <0){

        //going up
        trapez.style.marginLeft = "0";

        welcome_undertext.style.opacity = 100;
        welcome_undertext.classList.add("splash-undertext-animation");


        main_div.style.left = "-50%";

        for (let i=0; i < buttons.length; i++) {
            buttons[i].style.color = "#1D1D1D";  
        }
    }
}



window.addEventListener('wheel', trapezium);
