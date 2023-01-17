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
    ["Fantasteroids", "An arcade game written in C++. It's on Steam for free!", "https://store.steampowered.com/app/1790870/Fantasteroids/", false],
    ["Wordle ", "The popular word game, playable right here in your browser.", "wordle", true],
    ["Colour Palette Generator", "A simple web-based colour palette generator for graphic designers.", "palette", true]
]

var port = document.getElementById("portfolio")

for (let i = 0; i < items.length; i++){
    let new_obj = document.createElement("div")
    new_obj.classList.add("item")
    new_obj.style.cursor = "pointer";
    new_obj.setAttribute("id", i)
    new_obj.setAttribute("onclick", `openLink(this, ${items[i][3]});`)

    let new_title = document.createElement("p");
    new_title.innerText = items[i][0];
    let new_desc = document.createElement("p");
    new_desc.innerText = items[i][1];

    new_obj.appendChild(new_title);
    new_obj.appendChild(new_desc);

    port.appendChild(new_obj);
}

