var profs = [
    " HTML.",
    " Javascript.",
    " CSS.",
    " Python.",
    " Bash.",
    " C++.",
    " C#.",
    " SQL.",
]

var colours = [
    "orange",
    "yellow",
    "lightblue",
    "deepbluesky",
    "white",
    "green",
    "olivedrab",
    "paleturquoise"
]

var time = 0;

document.onload = onEntry()

var empty = true;

async function onEntry() {
    await waitForMs(200);
    typeSplash();
    await waitForMs(3000);

    uss.scrollIntoView(document.getElementById('portfolio'));
    //document.getElementById('portfolio').scrollIntoView({behavior:"smooth"});
}


async function home() {

    uss.scrollIntoView(document.getElementById('home'));
}

async function portfolio() {

    uss.scrollIntoView(document.getElementById('portfolio'));
}


async function typeSplash(delay = 100) {

    if (time>=profs.length){
        time = 0;
    }

    let splash = document.getElementById("splash");


    await waitForMs(500)
    
    //if is empty, put the next one
    if (empty){



        splash.style.color = colours[time];

 
        
        var letters = profs[time];
        let i = 0;
    
        while(i<letters.length) {
            await waitForMs(delay);
    
    
            splash.innerHTML = splash.innerHTML + letters[i];
            
            i++;
        }

        empty = false;
        time++;
    }

    //if is already text there, take it away
    else if (!empty){
        await waitForMs(500)
        let i = 0;

        while(splash.innerHTML.trim() != "") {

            await waitForMs(delay);
    
    
            splash.innerHTML = splash.innerHTML.substring(0, splash.innerHTML.length-1)

        }
        empty = true;

    }




    typeSplash();
    return;

}



function waitForMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}