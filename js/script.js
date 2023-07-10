
document.getElementById('bio').style.opacity = 0;
document.getElementById('portfolio').style.opacity = 0;
document.getElementById('name').style.opacity = 0;
document.getElementById('bio').style.opacity = 1;
document.getElementById('portfolio').style.opacity = 1;
document.getElementById('name').style.opacity = 1;
setTimeout(function(){
    document.getElementsByClassName("container")[0].style.marginTop = "calc(50px + 10vh)"
}, 1500)
window.scrollTo(0, 0)

window.onscroll = function(e){
    document.getElementById('it').style.marginTop = (window.scrollY / window.innerHeight)*80 + "vh";
    document.getElementById('it').style.opacity = 1-(window.scrollY / window.innerHeight)*.5;
}
document.getElementById('it').onload = function(){
    document.getElementById('it').style.opacity = "1";
    document.getElementById("menu").style.opacity = "1";
    document.getElementById("menu").style.bottom = "5vh";
}
function preloadImage(url){
    var img=new Image();
    img.src=url;
}

cur_tab = 0;
function tab(new_tab){
    if (new_tab != cur_tab){
        let nam = document.getElementsByClassName("tab")[new_tab].dataset.name; 
        let type = document.getElementsByClassName("tab")[new_tab].dataset.type;
        let vals = document.getElementsByClassName("val"); // get all tabs
        vals[cur_tab].style.opacity = "0";
        setTimeout(function(){
            vals[cur_tab].style.display = "none"; // hide current tab
            document.getElementById(nam).style.display = type; // show new tab
            vals[new_tab].style.opacity = "0";
            cur_tab = new_tab;
        }, 300);
        setTimeout(function(){
            vals[new_tab].style.opacity = "1";
        }, 500);
    }    
}

function openLink(e, internal){
    let target
    if (internal) {target="_self"}
    else{target="_blank"}
    window.open(items[e.id][2], target)
} 
function github(){
    window.open("https://github.com/Lem0naise");
}

var items = [ 
    ["Fantasteroids", "A small but fun arcade game that I wrote in C# and a mix of other languages. It's on Steam for free!", "https://store.steampowered.com/app/1790870/Fantasteroids/", false],
    ["Planet in Peril", "I built the website and backend for Planet in Peril, an environmental workshop for schools in the UK.", "https://www.planetperil.com", "false"],
    ["Reaction Time Test ", "A very small, light and fun website to test your reaction time!", "reaction", true],
    ["Colour Palette Generator", "A web-based colour palette generator for graphic designers.", "palette", true],
    ["Wordle", "An free and unlimited version of the popular word game, Wordle.", "wordle", "true"],
    ["Maze Solver", "A program written in Python which recognises mazes from your camera and outputs solutions using multiple different maze traversal algorithms. Worked on in collaboration with <a href='https://danileliasov.com/'>Danil Eliasov</a>.", "https://github.com/Lem0naise/maze-solver", false]
]

var port = document.getElementById("portfolio")

for (let i = 0; i < items.length; i++){
    let new_obj = document.createElement("div")
    new_obj.classList.add("item")
    new_obj.style.cursor = "pointer";
    new_obj.setAttribute("id", i)
    new_obj.setAttribute("onclick", `openLink(this, ${items[i][3]});`)

    // children
    let new_title = document.createElement("p");
    new_title.innerHTML = items[i][0];
    let new_desc = document.createElement("p");
    new_desc.innerHTML = items[i][1];

    // appending
    new_obj.appendChild(new_title);
    new_obj.appendChild(new_desc);

    port.appendChild(new_obj);
}



var imgs = 'imgs/back/p'
for (i=0; i<6; i++){
    preloadImage(imgs + i + ".webp");
}
