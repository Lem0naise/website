//onloads
document.getElementById('bio').style.transform = 'translateY(0)';
document.getElementById('bio').style.opacity = 1;
document.getElementById('header').style.opacity = 1;

window.scrollTo(0, 0);

function load_about() {
    let grid = document.getElementById("bio")
    let gridChildren = grid.children;
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
        }, 100)
    }
    childrenLoop();
}

function unload_about() {
    let grid = document.getElementById("bio")
    let gridChildren = grid.children;
    for (let x=0;x<gridChildren.length;x++){
        gridChildren[x].style.transform = "translateY(20px)";
        gridChildren[x].style.opacity = "0";
    }
}

function load_portfolio(){
    let grid = document.getElementById("portfolio-grid")
    let gridChildren = grid.children;
    let i = 0;
    for (let x=0;x<gridChildren.length;x++){
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
        }, 100)
    }
    childrenLoop();
}

function unload_portfolio(){
    let grid = document.getElementById("portfolio-grid")
    let gridChildren = grid.children;
    for (let x=0;x<gridChildren.length;x++){
        gridChildren[x].style.transform = "translateY(20px)";
        gridChildren[x].style.opacity = "0";
    }
}

window.onload = function(){
    let grid = document.getElementById("bio")
    let gridChildren = grid.children;
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
        }, 100)
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
        let vals = document.getElementsByClassName("val");
        vals[cur_tab].style.opacity = "0";
        setTimeout(function(){
            vals[cur_tab].style.display = "none";
            document.getElementById(nam).style.display = type;
            vals[new_tab].style.opacity = "0";
            cur_tab = new_tab;
        }, 50);
        setTimeout(function(){
            vals[new_tab].style.opacity = "1";
        }, 100);

        if (nam=="portfolio"){
            unload_about()
            load_portfolio()
        }
        else {
            unload_portfolio()
            load_about()
        }
    }   
}

function openLink(element, internal){
    let target = internal ? "_self" : "_blank";
    let url = element.getAttribute('data-url');
    window.open(url, target);
} 

function github(){
    window.open("https://github.com/Lem0naise");
}

document.addEventListener('DOMContentLoaded', function() {
    const projectItems = document.querySelectorAll('.project-item');
    
    projectItems.forEach((item, index) => {
        item.setAttribute('tabindex', 0);
        item.setAttribute('id', index);
        
        const isExternal = item.getAttribute('data-external') === 'true';
        item.setAttribute('onclick', `openLink(this, ${isExternal});`);
        
        // Add keyboard support
        item.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLink(this, isExternal);
            }
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const dropdown = document.getElementById('contactDropdown');
        const toggle = document.querySelector('.dropdown-toggle');
        
        if (dropdown && !dropdown.contains(event.target) && !toggle.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });
});

function toggleDropdown() {
    const dropdown = document.getElementById('contactDropdown');
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}