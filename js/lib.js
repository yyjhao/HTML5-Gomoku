function tester(b,w){
    game.black=new goAi(b,'black');
    game.white=new goAi(w,'white');
    game.initialize();
    game.playing=true;
    game.black.myTurn();
}
