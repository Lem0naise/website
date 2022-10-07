var stars
var title
var cta
function ready(){
    let asts = document.getElementsByClassName("asteroid");
    
    console.log("starting")
    let background = document.getElementsByClassName("background")[0];
    for (let i = 0; i < 3; i++){
        let star = document.createElement("div")
        star.classList.add("stars")
        star.classList.add("stars"+(i+1).toString())
        background.appendChild(star);
    }
    
    stars = document.getElementsByClassName("stars");
    title = document.getElementsByClassName("title")[0];
    cta = document.getElementsByClassName("cta")[0];
    wid = window.innerWidth; // width of window
    window.addEventListener('mousemove', mouse_move)


    move()
}

function move(){
    console.log("starting moving")
    
    //for (i=0; i<stars.length;i++){
     //   console.log(i);
     //   stars[i].style.marginLeft = "0vw";
    //}

}

function mouse_move(e){

    wid = window.innerWidth; // width of window
    dist = (e.clientX/wid)-0.5; // dist from -.5 to .5
    
    hei = window.innerHeight;
    vert_dist = (e.clientY/hei)-0.5; 

    for (i=0;i<3;i++){
        stars[i].style.marginLeft = -(100*(dist*((i+1)/8))) +"vw";
        stars[i].style.marginTop = -(100*(vert_dist*((i+1)/8))) +"vh";
    }

    title.style.marginLeft = 50 - (20*dist) +  "%"
    cta.style.marginLeft = 50 - (20*dist) + "%"
}
function link(){
    var url = "https://store.steampowered.com/app/1790870/Fantasteroids/"
    //var url = "https://google.com"
    window.open(url, "_blank").focus()
}
