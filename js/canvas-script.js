function trapezium(e){

    var trapez = document.getElementById("trapezium");
    var buttons = document.getElementsByClassName("menu-button");

    //text page 2
    var t_pg2 = document.getElementsByClassName("splash-pg2")[0];
    

    //alert(e.deltaY);
    if (e.deltaY>0 ){
        //going down
        trapez.style.left = "-100vw";
        alert(trapez.style.left);
        t_pg2.style.opacity = "0%";

        for (let i=0; i < buttons.length; i++) {

            buttons[i].style.color = "#DCDCDC";
            
        }
    }
    else if (e.deltaY <0){


        //going up
        trapez.style.left = "0";
        alert(trapez.style.left);
        t_pg2.style.opacity = "100%";


        for (let i=0; i < buttons.length; i++) {

            buttons[i].style.color = "#1D1D1D";
            
        }
    }
}

function page_load(){

    var trapez = document.getElementById("trapezium");

    //text page 2
    var t_pg2 = document.getElementsByClassName("splash-pg2")[0];

    //going up

}

function last_button_load(){
    
    var buttons = document.getElementsByClassName("menu-button");

    for (let i=0; i < buttons.length; i++) {

        buttons[i].style.color = "#1D1D1D";
        
    }
}

window.addEventListener('wheel', trapezium);
