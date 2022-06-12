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

    $('#square' + current_row + current_column).addClass('selected_square'); // set the first square to selected


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
        e.which // get key code
        if (65 <= e.which && e.which <= 90){ // if it is a letter 
            var letter_input = String.fromCharCode(e.which); // get actual letter 
            letter(letter_input);
        }
        else if (e.which == 8) { backspace(); }// if it is backspace
    }
}

function letter(letter){ // letter input
    if (current_column <= 4){
        $('#square' + current_row + current_column).html(letter); // set square to letters
        $('#square'+current_row+current_column).removeClass('selected_square'); // unselect that square
        current_column += 1;
        $('#square'+current_row+current_column).addClass('selected_square'); // select next square
    }
    else { // this word is finished
        // don't set the square to the letter
    }
}
function backspace() {
    if (current_column > 0) {current_column -= 1;}
    $('#square' + current_row + current_column).html(''); // set square to nothing
}