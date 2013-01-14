function tester(b,w){
	game.black=new goAi(b,'black');
	game.white=new goAi(w,'white');
	game.initialize();
	game.playing=true;
	game.black.myTurn();
}

var game={
	mode: 'hvh',
	history:[],
	currentColor: 'black',
	undo:function(){
		if(!this.playing){
			if(this.history.length==0)return;
			var last=this.history.pop();
			this.board.unsetGo(last.r,last.c);
			this.white.watch(last.r,last.c,'remove');
			this.black.watch(last.r,last.c,'remove');
			return;
		}
		do{
			if(this.history.length==0)return;
			var last=this.history.pop();
			this.board.unsetGo(last.r,last.c);
			this.white.watch(last.r,last.c,'remove');
			this.black.watch(last.r,last.c,'remove');
		}while(game[last.color] instanceof goAi);
		var last=this.history[this.history.length-1];
		if(this.history.length>0) this.board.highlight(last.r,last.c);
		else this.board.unHighlight();
		game[last.color].other.myTurn();
		for(var col in {'black':'','white':''}){
			if(game[col] instanceof goAi && game[col].computing){
				game[col].cancel++;
			}
		}
	},
	board:{
		//abstraction of the html elements
		jqueryEl:function(r,c){
			return $('#go-'+r+'-'+c);
		},
		setOnEl: function(place){
			if(!$(".go-board").hasClass("playing"))return;
			var coord=place.attr('id').split('-').map(function(str){return parseInt(str)});
			coord.shift();
			game[game.currentColor].setGo(coord[0],coord[1]);
		},
		enablePlay: function(yes){
			if(yes) $(".go-board").addClass("playing");
			else $(".go-board").removeClass("playing");
		},
		setGo:function(r,c,color){
			var place=this.jqueryEl(r,c);
			place.addClass(color).addClass("set").removeClass("warning");
			this.setNum++;
		},
		unsetGo:function(r,c){
			var place=this.jqueryEl(r,c);
			place.removeClass('black').removeClass('white').removeClass('set').removeClass('last-move');
			this.updateMap(r,c,'remove');
			this.setNum--;
		},
		highlight:function(r,c){
			this.unHighlight();
			this.jqueryEl(r,c).addClass('last-move');
		},
		unHighlight:function(){
			$(".last-move").removeClass('last-move');
		},
		winChange: function(r,c,color){
			if(color=='black')var num=0;
			else var num=1;
			for(var i=0;i<4;i++){
				if(this.map[num][i][r][c]>=5){
					var dir=i;
					break;
				}
			}
			$('.go-place').css('opacity',0.5);
			for(var i=-1;i<2;i+=2){
				var x=r,y=c;
				do{
					this.jqueryEl(x,y).css('opacity',1);
					x+=this.moves[dir][0]*i;
					y+=this.moves[dir][1]*i;
				}while(this.map[num][dir][x][y]==-num);
			}
		},
		isSet:function(r,c){
			return this.jqueryEl(r,c).hasClass('set');
		},
		initialize: function(){
			$(".set").removeClass("black").removeClass("white").removeClass("set");
			$(".warning").removeClass("warning");
			$('.go-place').css('opacity','');
			this.unHighlight();
			this.setNum=0;
			this.map=[];
			//2 colors
			//4 directions
			//15x15
			for (var i=0;i<2;i++){
				var tmp=[];
				for(var j=0;j<4;j++){
					var tmpp=[];
					for(var k=0;k<15;k++){
						var tmpr=[];
						for(var l=0;l<15;l++){
							tmpr.push(1);
						}
						tmpp.push(tmpr);
					}
					tmp.push(tmpp);
				}
				this.map.push(tmp);
			}
		},
		updateWarning: function(r,c,num,dir){
			if(game[['black','white'][num]] instanceof goAi){
				if(this.map[num][dir][r][c] > 4){
					this.jqueryEl(r,c).addClass("warning");
				}else{
					this.jqueryEl(r,c).removeClass("warning");
				}
			}
		},
		moves:	[
					[1,0],
					[0,1],
					[1,1],
					[1,-1]
				],
		updateMap: function(r,c,color){
			var remove=false, num;
			if(color=='black'){
				num=0;
			}else if(color=='white'){
				num=1;
			}else{
				remove=true;
			}
			return this._updateMap(r,c,num,remove);
		},
		_updateMap: function(r,c,num,remove){
			if(remove){
				for(num=0;num<2;num++){
					for(var i=0;i<4;i++){
						this.map[num][i][r][c]=1;
						this.updateWarning(r,c,num,i);
						for(var coe=-1;coe<2;coe+=2){
							var x=r, y=c,len=0;
							do{
								x+=this.moves[i][0]*coe;
								y+=this.moves[i][1]*coe;
								len++;
							}while(x>=0&&y>=0&&x<15&&y<15&&this.map[num][i][x][y]==-num);
							if(x>=0&&y>=0&&x<15&&y<15&&this.map[num][i][x][y]>0){
								this.map[num][i][x][y]=len;
								this.updateWarning(x,y,num,i);
								this.map[num][i][r][c]+=len-1;
								this.updateWarning(r,c,num,i);
								var cont=0,	mx=x+this.moves[i][0]*coe, my=y+this.moves[i][1]*coe;
								while(mx>=0&&my>=0&&mx<15&&my<15&&this.map[num][i][mx][my]==-num){
									cont++;
									mx+=this.moves[i][0]*coe;
									my+=this.moves[i][1]*coe;
								}
								this.map[num][i][x][y]+=cont;
								this.updateWarning(x,y,num,i);
							}else{
								this.map[num][i][r][c]+=len-1;
								this.updateWarning(r,c,num,i);
							}
						}
					}
				}
			}else{
				for(var i=0;i<4;i++)for(var coe=-1;coe<2;coe+=2){
					//compute for the current color
					var x=r, y=c;
					do{
						x+=this.moves[i][0]*coe;
						y+=this.moves[i][1]*coe;
					}while(x>=0&&y>=0&&x<15&&y<15&&this.map[num][i][x][y]==-num)
					if(x>=0&&y>=0&&x<15&&y<15&&this.map[num][i][x][y]>0){
						this.map[num][i][x][y]=this.map[num][i][r][c]+1;
						var cont=0,	mx=x+this.moves[i][0]*coe, my=y+this.moves[i][1]*coe;
						while(mx>=0&&my>=0&&mx<15&&my<15&&this.map[num][i][mx][my]==-num){
							cont++;
							mx+=this.moves[i][0]*coe;
							my+=this.moves[i][1]*coe;
						}
						this.map[num][i][x][y]+=cont;
						this.updateWarning(x,y,num,i);
					}
					//compute for the other color
					x=r;
					y=c;
					do{
						x+=this.moves[i][0]*coe;
						y+=this.moves[i][1]*coe;
					}while(x>=0&&y>=0&&x<15&&y<15&&this.map[1-num][i][x][y]==num-1);
				}
				for(var i=0;i<2;i++)for(var j=0;j<4;j++){
					this.map[i][j][r][c]=-num;
					this.updateWarning(r,c,num,i);
				}
			}
		}
	},
	ifWon:function(r,c,color){
		if(color=='black')var n=0;
		else var n=1;
		for(var i=0;i<4;i++){
			if(this.board.map[n][i][r][c]>4)return true;
		}
	},
	draw:function(){
		this.playing=false;
		game.board.enablePlay(false);
	},
	win:function(){
		this.playing=false;
		game.board.enablePlay(false);
		showWinDialog();
	},
	playing: false,
	initialize:function(){
		this.history.length=0;
		this.board.initialize();
		this.white.other=this.black;
		this.black.other=this.white;
	}
}

function player(color){
	this.color=color;
}

player.prototype.myTurn=function(){
	game.currentColor=this.color;
	gameInfo.value=(function(string){
		return string.charAt(0).toUpperCase() + string.slice(1);
	})(this.color)+"'s turn.";
	gameInfo.color=this.color;
	gameInfo.blinking=false;
}

player.prototype.watch=function(){};

player.prototype.setGo=function(r,c){
	if(!game.playing||game.board.isSet(r,c))return;
	game.history.push({
		r: r,
		c: c,
		color:this.color
	});
	game.board.highlight(r,c);
	game.board.setGo(r,c,this.color);
	if(game.board.setNum==225){
		game.draw();
		return;
	}
	if(game.ifWon(r,c,this.color)){
		game.win();
		game.board.winChange(r,c,this.color);
		return;
	}
	game.board.updateMap(r,c,this.color);
	game.black.watch(r,c,this.color);
	game.white.watch(r,c,this.color);
	if(game.currentColor=='black'){
		game.white.myTurn();
	}else{
		game.black.myTurn();
	}
}

function goHuman(color){
	player.call(this,color);
}

goHuman.prototype=new player();

goHuman.prototype.myTurn=function(){
	player.prototype.myTurn.call(this);
	game.board.enablePlay(true);
	$(".go-board").removeClass("black").removeClass("white").addClass(this.color);
	if(this.other instanceof goAi){
		gameInfo.value='Your turn';
	}
}

function goAi(mode,color){
	player.call(this,color);
	this.computing=false;
	this.cancel=0;
	this.mode=mode;
	if(mode=='old-mode'){
		this.worker=new Worker('js/ai-worker.old.js');
	}else{
		this.worker=new Worker('js/ai-worker.js');
	}
	var self=this;
	this.worker.onmessage=function(e){
		switch(e.data.type){
			/*case 'sum':
				$('#debug-sum').html(e.data.msg);
				break;
			case 'error':
				console.log(e.data.message);
				break;*/
			case 'decision':
				self.computing=false;
				if(self.cancel>0){
					self.cancel--;
				}else{
					self.setGo(e.data.r,e.data.c);
				}
				break;
			case 'starting':
				self.computing=true;
				break;
			case 'alert':
				alert(e.data.msg);
				break;
			case 'simulate':
				simulateMap.push(e.data.msg);
				break;
			default:
				//console.log(e.data);
		}
	}
	this.worker.postMessage({
		type: 'ini',
		color: this.color,
		mode: this.mode,
	});
}

goAi.prototype=new player;

goAi.prototype.setGo=function(r,c){
	player.prototype.setGo.call(this,r,c);
}

goAi.prototype.myTurn=function(){
	simulateMap = [];
	player.prototype.myTurn.call(this);
	game.board.enablePlay(false);
	gameInfo.value="Thinking...";
	gameInfo.blinking=true;
	this.move();
}

goAi.prototype.watch=function(r,c,color){
	this.worker.postMessage({
		type: 'watch',
		r: r,
		c: c,
		color: color
	});
}
goAi.prototype.move=function(){
	if(game.board.setNum==0){
		this.setGo(7,7);
		return;
	}else if(game.board.setNum==1){
		var moves=[
			[6,6],
			[6,7],
			[6,8],
			[7,6],
			[7,7],
			[7,8],
			[8,6],
			[8,7],
			[8,8]
		];
		while(true){
			var ind=Math.floor(Math.random()*moves.length);
			if(!game.board.isSet(moves[ind][0],moves[ind][1])){
				this.setGo(moves[ind][0],moves[ind][1]);
				return;
			}else{
				moves.splice(ind,1);
			}
		}
	}else{
		this.worker.postMessage({
			type: 'compute'
		});
	}
}


