$(document).ready(function(){
    var game = new Game($(".go-board"));
    $(window).resize(adjustSize);

    adjustSize();
    $.mobile.defaultDialogTransition = 'flip';
    $.mobile.defaultPageTransition = 'flip';
    
    $('#mode-select input[type="radio"]').on('change', function(){
        gameData.mode=$(this).val();
    });
    
    $('#color-select input[type="radio"]').on('change', function(){
        gameData.color=$(this).val();
    });
    
    $('#level-select input[type="radio"]').on('change', function(){
        gameData.level=$(this).val();
    });
    
    $('.back-to-game').on('tap',function(){
        $.mobile.changePage('#game-page');
    });
    
    $("#start-game").on('click',function(){
        try{
            game.white.worker.terminate();
            game.black.worker.terminate();
        }catch(e){}
        if(gameData.mode==='vshuman'){
            game.mode='hvh';
            game.init(new HumanPlayer("black"), new HumanPlayer("white"));
        }else{
            var color, other;
            if(gameData.color==='black'){
                color='black';
                other='white';
            }else{
                color='white';
                other='black';
            }
            game.mode=gameData.level;
            game.init(new HumanPlayer(color), new AIPlayer(game.mode, other));
        }
        $.mobile.changePage('#game-page');
        game.start();
        setTimeout(function(){$('.back-to-game').button('enable');},100);
    });

    $("#undo-button").on('tap', function(){
        game.undo();
    });
    
    $('.fullscreen-wrapper').on('tap', function(){
        $(this).hide();
        $.mobile.changePage('#game-won');
    });
    
    $('#new-game').page();
    $('#game-won').page();
    gameData.load();
    $('.back-to-game').button('disable');
    $.mobile.changePage('#new-game',{changeHash: false});
});

function showWinDialog(game){
    gameInfo.blinking=false;
    console.log(game);
    if(game.mode === 'hvh'){
        var who=(function(string){ return string.charAt(0).toUpperCase() + string.slice(1);})(game.getCurrentPlayer().color);
        $("#game-won h4").html(who+' Won!');
        gameInfo.value=who+' won.'
        $("#win-content").html(who+' won the game. Play again?');
        $('#happy-outer').fadeIn(500);
    }else{
        if(game.getCurrentPlayer() instanceof HumanPlayer){
            $("#game-won h4").html('You Won!');
            $("#win-content").html('You won the game. Play again?');
            gameInfo.value='You won.'
            $('#sad-outer').fadeIn(500);
        }else{
            $("#game-won h4").html('You Lost.');
            $("#win-content").html('Meh. You lost to the computer. Play again?');
            gameInfo.value='Computer won.'
            $('#happy-outer').fadeIn(500);
        }
    }
}

gameInfo={
    get blink(){
        return $('#game-info').hasClass('blinking');
    },
    set blinking(val){
        if(val){
            $('#game-info').addClass('blinking');
        }else{
            $('#game-info').removeClass('blinking');
        }
    },
    get value(){
        return $('#game-info>.cont').html();
    },
    set value(val){
        $('#game-info>.cont').html(val);
    },
    get color(){
        if($('#game-info>.go').hasClass('black')){
            return 'black';
        }else if($('#game-info>.go').hasClass('white')){
            return 'white';
        }else{
            return 'none';
        }
    },
    set color(val){
        $('#game-info>.go').removeClass('white').removeClass('black');
        if(val) $('#game-info>.go').addClass(val);
    }
}

