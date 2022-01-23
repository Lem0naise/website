
//Browser detection


// Opera 8.0+
var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

// Firefox 1.0+
var isFirefox = typeof InstallTrigger !== 'undefined';

// Safari 3.0+ "[object HTMLElementConstructor]" 
var isSafari = navigator.userAgent.indexOf("Safari") != -1;

// Internet Explorer 6-11
var isIE = /*@cc_on!@*/false || !!document.documentMode;

// Edge 20+
var isEdge = !isIE && !!window.StyleMedia;

// Chrome 1 - 79
var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

// Edge (based on chromium) detection
var isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") != -1);

// Blink engine detection
var isBlink = (isChrome || isOpera) && !!window.CSS;




//ok done finally





var time = 0;

document.onload = onEntry()

var empty = true;

async function onEntry() {
    await waitForMs(200);


}


async function home() {

    if (isSafari){
        uss.scrollIntoView(document.getElementById('home'));
        
    }
    else {
        document.getElementById('home').scrollIntoView({behavior:"smooth"});
        
    }
}

async function portfolio() {

    if (isSafari){
        uss.scrollIntoView(document.getElementById('portfolio'));
        
    }
    else {
        document.getElementById('portfolio').scrollIntoView({behavior:"smooth"});
        
    }
}




function waitForMs(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function jsplayground() {
    
    document.getElementById("jsplayground_seperation").style.display = "block"
    document.getElementById("jsplayground").style.display = "block"

    uss.scrollIntoView(document.getElementById("jsplayground_seperation"));

}

function rps() {
    
}