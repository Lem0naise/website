function trapezium(e){

    var trapez = document.getElementById("trapezium");
    var buttons = document.getElementsByClassName("menu-button");


    //alert(e.deltaY);
    if (e.deltaY>0 ){


        //going down
        trapez.style.left = "-300vw";

        for (let i=0; i < buttons.length; i++) {

            buttons[i].style.color = "#1D1D1D";
            
        }
    }
    else if (e.deltaY <0){


        //going up
        trapez.style.left = "-230vw";

        for (let i=0; i < buttons.length; i++) {

            buttons[i].style.color = "#DCDCDC";
            
        }
    }

}

window.addEventListener('wheel', trapezium);