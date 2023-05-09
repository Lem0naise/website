window.onload = function(){
    let hmenu = document.getElementById("hmenu");
    hmenu.style.transform = "rotate(0deg)";
}
var menu_out = false;
function hmenu(){
    let hmenu = document.getElementById("hmenu");
    let fmenu = document.getElementById("fullmenu");

    if (!menu_out){
        fmenu.style.marginLeft = "0";
        hmenu.style.transform = "rotate(-90deg)";
        setTimeout(function(){menu_out = true}, 500)
    }
    else {
        fmenu.style.marginLeft = "-80vw";
        hmenu.style.transform = "rotate(0deg)";
        setTimeout(function(){menu_out = false}, 500)
    }

}