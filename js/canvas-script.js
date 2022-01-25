var canvas = document.querySelector('canvas');

var c = canvas.getContext('2d');
//rhombus (foreground)

c.clearRect(0, 0, canvas.width, canvas.height);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

c.beginPath();
c.moveTo(0, 0); //move to top left
c.lineTo(0, canvas.height); //line to bottom left
c.lineTo(0.6 * canvas.width, canvas.height); //line to bottom middle
c.lineTo(0.7 * canvas.width, 0); //line to 0
c.lineTo(0, 0);  //line back up to top right
c.fillStyle = "#1D1D1D";
c.fill();

function trapezium(e){

    var trapez = document.getElementById("trapezium");
    var buttons = document.getElementsByClassName("menu-button");

    //alert(e.deltaY);
    if (e.deltaY>0 ){

        //going down
        trapez.style.left = "-100vw";

        for (let i=0; i < buttons.length; i++) {

            buttons[i].style.color = "#1D1D1D";        
        }
    }
    else if (e.deltaY <0){

    

        //going up
        trapez.style.left = "0vw";

        for (let i=0; i < buttons.length; i++) {

            buttons[i].style.color = "#DCDCDC";    
        }
    }    
}

window.addEventListener('wheel', trapezium);

