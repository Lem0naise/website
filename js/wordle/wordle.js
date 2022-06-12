var current_row = 0;
var current_column = 0;

function wordle(){

    $('#right_page').html(''); // clear page

    current_row = 0;
    current_column = 0;

    //spaces for guesses on load
    for (i=0; i<5; i++){
        $('#right_page').append("<div class = 'guesses' id = 'guesses" + i + "'></div>");
        for (j=0; j<5;j++){
            $('#guesses' + i).append("<div id='square"+ i + j + "' class = 'square'></div>")
        }
    }
    $('.square').css("height", $('.square').css('width')); // make all the squares actually square

    // alphabet on load
    $('#right_page').append('<div class = "alphabet" id = "alphabet"></div>');
    var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    for (i=0; i<alphabet.length;i++){
        $("#alphabet").append("<div onclick = 'letter(" + alphabet[i] + ".innerHTML)' class='alphabet_letter' id = '" + alphabet[i] + "'>" + alphabet[i] +  " </div>");
    }
    console.log("wordle time!!!!");
}


window.onkeydown = function(e) {
    if (playing_wordle){
        var textContext = e.which; // get key code
        if (65 <= textContext && textContext <= 90){ // if it is a letter
            var letter_input = String.fromCharCode(textContext); // get actual letter
            letter(letter_input);
        }
    }
}

function letter(letter){ // letter input

    $('#square' + current_row + current_column).html(letter); // set square to letter
    
    if (current_column < 4){
        current_column += 1;
    }
    else { // this word is finished
        current_row += 1;
        current_column = 0;
    }

}