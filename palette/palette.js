function home(){
    window.open("../index.html", "_self");
}

var palette = document.getElementById("palette");
const NUM_COLS = 5;

function copy(e){
    navigator.clipboard.writeText(e.innerText);
    console.log(e.offsetWidth);
    e.style.max = e.width;
    e.classList.add("after");
    setTimeout(function(){
        e.classList.remove("after");
    }, 1000)
}

function setup() {
    for (let i = 0; i < NUM_COLS; i++){
        let new_col = document.createElement("div");
        new_col.classList.add("col");
        new_col.id = i;

        // hex value
        let new_p = document.createElement("p");
        new_p.id = i.toString() + "p";
        new_p.setAttribute("onclick", "copy(this);");

        // copy text
        //var c_text = document.createElement("p")
        //c_text.innerText = "Copied to the clipboard!";
        //c_text.classList.add("copy");


        new_col.appendChild(new_p); // hex value
        //new_col.appendChild(c_text); // copy text
        palette.appendChild(new_col);   
    }
}

function generate(){
    var s_c = [Math.random()*255, Math.random()*255, Math.random()*255] // starting colour

    var cs = []
    for (let i = 0; i < NUM_COLS; i++){

        let c = (Math.random()) * 100; // constant range from -100 to 100
        let r = Math.ceil(Math.random()*2 - 1); //set r to either 1 or -1
        if (r == 0){r=-1};

        let c_c = [Math.random()*40 + c*r, Math.random()*40 +c*r, Math.random()*40 +c*r] // current colours

        cs.push([s_c[0] + c_c[0], s_c[1] + c_c[1], s_c[2] + c_c[2]]); // list of colours 
        document.getElementById(i).style.backgroundColor = `rgb(${cs[i][0]}, ${cs[i][1]}, ${cs[i][2]})`;
         
        // transforming the rgb into #hex colours
        h_c = []
        for (let x = 0; x < 3; x++){
            h_c.push(("00" + Math.min(Math.max(Math.round(cs[i][x]), 0), 255).toString(16).toUpperCase()).slice(-2))
        }

        document.getElementById(i.toString() + "p").innerText = `#${h_c[0]}${h_c[1]}${h_c[2]}`;
    }
     
}

function press(e){
    if ([13, 32].includes(e.which)){ // if key: enter, space
        generate();
    }
}
document.body.addEventListener("keydown", press)
setup();
generate();


