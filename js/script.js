//onloads
document.getElementById('bio').style.transform = 'translateY(0)';
document.getElementById('bio').style.opacity = 1;
document.getElementById('name').style.opacity = 1;

document.getElementById("menu").style.opacity = "1";
//document.getElementById("second").style.transform =  'translateY(0)';
//document.getElementById("second").style.opacity = 1;
window.scrollTo(0, 0);

function load_about() {
    let grid = document.getElementById("bio")
    let gridChildren = grid.children;
    console.log(gridChildren);
    let i = 0;
    for (let x=0;x<gridChildren.length;x++){
        gridChildren[x].style.backgroundColor = "var(--item-background-2)";
    }
    function childrenLoop() {         
        setTimeout(function() {  
            gridChildren[i].style.opacity = "1";
            gridChildren[i].style.backgroundColor = "";
            gridChildren[i].style.transform = "translateY(0)";
            i++;                  
            if (i < gridChildren.length) {   
            childrenLoop();
            }
        }, 150)
        
    }
    childrenLoop();
}

function unload_about() {
    let grid = document.getElementById("bio") // olding bio
    let gridChildren = grid.children;
    console.log(gridChildren);
    for (let x=0;x<gridChildren.length;x++){
        gridChildren[x].style.transform = "translateY(10%)";
        gridChildren[x].style.opacity = "0";
    }
}

function load_portfolio(){
    let grid = document.getElementById("portfolio")
            let gridChildren = grid.children;
            console.log(gridChildren);
            let i = 0;
            for (let x=0;x<gridChildren.length;x++){
                //gridChildren[x].classList.add("item_transition")
                gridChildren[x].style.backgroundColor = "var(--item)";
            }
            function childrenLoop() {         
                setTimeout(function() {  
                    gridChildren[i].style.opacity = "1";
                    gridChildren[i].style.backgroundColor = "";
                    gridChildren[i].style.transform = "translateY(0)";
                    i++;                  
                    if (i < gridChildren.length) {   
                    childrenLoop();
                    }
                }, 150)
                
            }
            childrenLoop();
}

function unload_portfolio(){
    let grid = document.getElementById("portfolio") // olding portfolio
    let gridChildren = grid.children;
    for (let x=0;x<gridChildren.length;x++){
        gridChildren[x].style.transform = "translateY(10%)";
        gridChildren[x].style.opacity = "0";
    }

}


window.onload = function(){

    let grid = document.getElementById("bio")
    let gridChildren = grid.children;
    console.log(gridChildren);
    let i = 0;
    for (let x=0;x<gridChildren.length;x++){
        gridChildren[x].style.backgroundColor = "var(--item-background-2)";
    }
    function childrenLoop() {         
        setTimeout(function() {  
            gridChildren[i].style.opacity = "1";
            gridChildren[i].style.backgroundColor = "";
            gridChildren[i].style.transform = "translateY(0)";
            i++;                  
            if (i < gridChildren.length) {   
            childrenLoop();
            }
        }, 150)
        
    }
    childrenLoop();
}

cur_tab = 0;
tab(0);
function tab(new_tab){
    document.getElementsByClassName('tab')[cur_tab].classList.remove("active");
    document.getElementsByClassName('tab')[new_tab].classList.add("active");
    
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
        }, 200);
        setTimeout(function(){
            vals[new_tab].style.opacity = "1";
        }, 300);

        if (nam=="portfolio"){ // switching to portfolio
            unload_about()
            load_portfolio()
        }
        else { // switching to about
            unload_portfolio()
            load_about()
        }
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
    ["CashCat", "A user-focused personal budgeting app!", "https://cashcat.indigonolan.com", false],
    ["Fantasteroids", "A fast-paced and fun arcade game that I wrote in C# and a mix of other languages. You can download it on Steam for free!", "https://store.steampowered.com/app/1790870/Fantasteroids/", false],
    ["Climate Stories Library", "I built the front-end and back-end of a website designed to host videos and stories of people around the world and their responses to the climate crisis.","https://www.climatestorieslibrary.com",false],
    ["Wordle", "An free and unlimited version of the popular word game, Wordle.", "wordle", "true"],
    ["Reaction Time Test ", "A very small and light website to test your reaction time!", "reaction", true],
    ["Colour Palette Generator", "A web-based colour palette generator for graphic designers.", "palette", true],
    ["Maze Solver", "A program written in Python which recognises mazes from your camera and outputs solutions using multiple different maze traversal algorithms. Worked on in collaboration with <a href='https://danileliasov.com/'>Danil Eliasov</a>.", "https://github.com/Lem0naise/maze-solver", false],
    ["Student Robotics", "I participated in a team in the 2023 Student Robotics Competition at the University of Southampton, placing 5th overall, and winning the Social Media Presence prize.", "https://github.com/Lem0naise/student-robotics-ham", false], 
]

var port = document.getElementById("portfolio")

for (let i = 0; i < items.length; i++){
    let new_obj = document.createElement("div")
    new_obj.classList.add("item")
    new_obj.style.cursor = "pointer";
    new_obj.setAttribute("tabindex", 0)
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