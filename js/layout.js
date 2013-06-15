function adjustSizeGen(){
    var smallScreen = navigator.userAgent.toLowerCase().match(/(iphone|ipod)/);

    var gameRegion = $("#game-region"),
        tds = $('.board td'),
        board = $('.go-board'),
        gameHeader = $('header.game-ult'),
        gameInfo = $('#game-info'),
        mainButs = $('#main-but-group'),
        otherButs = $('#other-but-group');

    return function(){
        var avaih = window.innerHeight,
            avaiw = window.innerWidth,
            h = Math.max(avaih - 7, avaih * 0.98),
            w = Math.max(avaiw - 7, avaih * 0.98),
            vspace = Math.min(h - 150, w),
            hspace = Math.min(w - 320, h - 40),
            hsize;

        if(smallScreen){
            if(avaih > avaiw){
                vspace = avaiw;
                hspace = 0;
            }else{
                hspace = avaih - 40;
                vspace = 0;
            }
        }

        if(vspace > hspace){
            hsize = Math.min(~~((vspace - 15) / 15 / 2), ~~((avaiw - 22) / 15 / 2));
            gameRegion.css({
                'padding': hsize+6,
                'margin-left': -((2*hsize+1)*15+12)/2,
                'padding-top': 100+hsize,
                'padding-bottom': 50+hsize,
                'margin-top':  -(15 * hsize + 82)
            });
            tds.css('padding',hsize);
            board.css({
                'top': 100,
                'bottom': 50,
                'left': 6,
                'right': 6
            });
            gameHeader.css('line-height', 80+'px');
            gameInfo.css({
                'top': 20,
                'width': ((2*hsize+1)*15+12)/2-150
            });
            mainButs.css({
                'top': 6,
                'right': 6,
                'width': 160
            });
            otherButs.css({
                'bottom': 6,
                'right': 6,
                'width': 160
            });
        }else{
            hsize = ~~((hspace - 15) / 15 / 2);
            gameRegion.css({
                'padding': hsize+6,
                'margin-left': -((2*hsize+1)*15+320)/2,
                'padding-left': 160+hsize,
                'padding-right': 160+hsize,
                'padding-top': 36+hsize,
                'margin-top': -(hsize * 15 + 28)
            });
            tds.css('padding',hsize);
            board.css({
                'top': 36,
                'bottom': 6,
                'left': 160,
                'right': 160
            });
            gameHeader.css('line-height', 36+hsize+'px');
            gameInfo.css({
                'left': 15,
                'top': 36+hsize,
                'width': 160+6-45-hsize/2
            });
            mainButs.css({
                'top': 36+hsize,
                'right': 6,
                'width': 160
            });
            otherButs.css({
                'bottom': 6+hsize,
                'right': 6,
                'width': 160
            });
        }

    };
}
