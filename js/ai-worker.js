self.addEventListener('message', function(e){
    switch(e.data.type){
        case 'ini':
            ai.ini(e.data['mode'],e.data['color']);
            break;
        case 'watch':
            ai.watch(e.data['r'],e.data['c'],e.data['color']);
            break;
        case 'compute':
            ai.move();
            break;
        case 'show_me':
            postMessage(ai.map);
            break;
    }
});

function mapPoint(r,c){
    this.r=r;
    this.c=c;
    this.set=false;
    this.score=0;
    this.valid=false;
    this.info=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
}

mc=0;
ai={};
ai.sum=0;
ai.setNum=0;
ai.scoreMap=[];
ai.scorequeue=[];
ai.map=[];
for (var i=0;i<15;i++){
    var tmp=[];
    for(var j=0;j<15;j++){
        var a=new mapPoint(i,j);
        tmp.push(a);
        ai.scorequeue.push(a);
    }
    ai.map.push(tmp);
}

boardBuf = new ArrayBuffer(255);
boardBufArr = new Uint8Array(boardBuf);
function bufToString(){
    return String.fromCharCode.apply(null, boardBufArr);
}

ai.ini=function(mode,color){
    this.color=color;
    if(color=='black'){
        this.otc='white';
    }else{
        this.otc='black';
    }
    switch(mode){
        case 'test':
        this.move=function(){
            postMessage({
                'type': 'decision',
                'r': this.scorequeue[0].r, 
                'c': this.scorequeue[0].c
            });
            }
        case 'novice':
        this.depth=3;
        this.totry=[30,30];
        break;
        case 'medium':
        this.depth=5;
        this.totry=[12,8];
        break;
        case 'expert':
        this.depth=7;
        this.totry=[10,10];
        break;
        default:
        postMessage({'type': 'ini_error', 'reason': mode+' not supported'});
    }
    postMessage({'type': 'ini_complete'});
};

ai.watch=function(r,c,color){
    this.updateMap(r,c,color);
    if(color=='remove')this.setNum--;
    else this.setNum++;
    this.scorequeue.sort(this.sortMove);
    postMessage({'type': 'watch_complete'});
};

ai.updateMap=function(r,c,color){
    var remove=false,num;
    if(color==this.color){
        num=1;
    }else if(color==this.otc){
        num=0;
    }else{
        remove=true;
        num=this.map[r][c].set-1;
    }
    return this._updateMap(r,c,num,remove);
};

ai.moves=[
        [-1,-1],
        [-1,0],
        [0,-1],
        [-1,1]
    ];
ai.coe=[-2,1];
ai.scores=[0,1,10,2000,4000,100000000000];

ai._updateMap=function(r,c,num,remove){
    var moves=this.moves,
        coe=this.coe,
        scores=this.scores,
        i=4,x,y,step,tmp,xx,yy,cur,changes=0,s,e;
    if(!remove){
        boardBufArr[r * 15 + c] = num + 2;
        this.map[r][c].set=num+1;
        while(i--){
            x=r;
            y=c;
            step=5;
            while( step-- && x>=0 && y>=0 && y<15 ){
                xx=x-moves[i][0]*4;
                yy=y-moves[i][1]*4;
                if(xx>=15 || yy<0 || yy>=15){
                    x+=moves[i][0];
                    y+=moves[i][1];
                    continue;
                }
                cur=this.map[x][y].info[i];
                if(cur[2]>0){
                    tmp=5;
                    xx=x;
                    yy=y;
                    s=scores[cur[2]];
                    changes-=s*cur[3];
                    while( tmp-- ){
                        this.map[xx][yy].score-=s;
                        xx-=moves[i][0];
                        yy-=moves[i][1];
                    }
                }
                cur[num]++;
                if(cur[1-num]>0){
                    cur[2]=0;
                }else{
                    cur[2]=cur[num];
                    e=coe[num];
                    cur[3]=e;
                    s=scores[cur[2]];
                    tmp=5;
                    xx=x;
                    yy=y;
                    changes+=s*cur[3];
                    while( tmp-- ){
                        this.map[xx][yy].score+=s;
                        xx-=moves[i][0];
                        yy-=moves[i][1];
                    }
                }
                x+=moves[i][0];
                y+=moves[i][1];
            }
        }
    }else{
        boardBufArr[r * 15 + c] = 0;
        this.map[r][c].set=false;
        while(i--){
            x=r;
            y=c;
            step=5;
            //others 0 i am 1-> sc=0
            //others 0 i am more than 1-> sc=1
            //i am >0 others >0 -> sc=-1
            while( step-- && x>=0 && y>=0 && y<15 ){
                xx=x-moves[i][0]*4;
                yy=y-moves[i][1]*4;
                if(xx>=15 || yy<0 || yy>=15){
                    x+=moves[i][0];
                    y+=moves[i][1];
                    continue;
                }
                cur=this.map[x][y].info[i];
                var sc=0;
                cur[num]--;
                if(cur[2]>0){
                    tmp=5;
                    xx=x;
                    yy=y;
                    s=scores[cur[2]];
                    changes-=s*cur[3];
                    while( tmp-- ){
                        this.map[xx][yy].score-=s;
                        xx-=moves[i][0];
                        yy-=moves[i][1];
                    }
                    cur[2]--;
                    if(cur[num]>0)sc=1;
                }else if(cur[1-num]>0 && !cur[num]){
                    sc=-1;
                }
                if(sc===1){
                    tmp=5;
                    s=scores[cur[2]];
                    xx=x;
                    yy=y;
                    changes+=s*cur[3];
                    while( tmp-- ){
                        this.map[xx][yy].score+=s;
                        //if(!this.map[xx][yy].set)changes+=s*cur[3];
                        xx-=moves[i][0];
                        yy-=moves[i][1];
                    }
                }else if(sc===-1){
                    cur[2]=cur[1-num];
                    tmp=5;
                    s=scores[cur[2]];
                    cur[3]=coe[1-num];
                    xx=x;
                    yy=y;
                    changes+=s*cur[3];
                    while( tmp-- ){
                        this.map[xx][yy].score+=s;
                        //if(!this.map[xx][yy].set)changes+=s*cur[3];
                        xx-=moves[i][0];
                        yy-=moves[i][1];
                    }
                }
                x+=moves[i][0];
                y+=moves[i][1];
            }
        }
    }
    this.sum+=changes;
};

ai.simulate=function(x,y,num){
    this.setNum++;
    this._updateMap(x,y,num,false);
};

ai.desimulate=function(x,y,num){
    this._updateMap(x,y,num,true);
    this.setNum--;
};

ai.sortMove=function(a,b){
    if(a.set)return 1;
    if(b.set)return -1;
    if(a.score<b.score){
        return 1;
    }
    else return -1;
};

ai.cache={};

ai.nega=function(x,y,depth,alpha,beta){
    var pt=this.map[x][y].info, i=4, num=depth%2;
    this.simulate(x,y,num);
    var bufstr = bufToString();
    if(this.cache[bufstr]){
        return this.cache[bufstr];
    }
    if(Math.abs(this.sum)>=10000000)return -1/0;
    if(this.setNum===225){
        return 0;
    }else if(depth===0){
        return this.sum;
    }
    this.scorequeue.sort(this.sortMove);
    var i=this.totry[num], tmp, tmpqueue=[], b=beta;
    while(i--){
        tmp=this.scorequeue[i];
        if(tmp.set) continue;
        tmpqueue.push(tmp.c);
        tmpqueue.push(tmp.r);
    }
    depth-=1;
    i=tmpqueue.length-1;
    x=tmpqueue[i];
    y=tmpqueue[--i];
    var score=-this.nega(x,y,depth,-b,-alpha);
    this.desimulate(x,y,depth%2);
    if(score>alpha){
        bufstr = bufToString();
        this.cache[bufstr] = score;
        alpha=score;
    }
    if(alpha>=beta){
        bufstr = bufToString();
        this.cache[bufstr] = beta;
        return alpha;
    }
    b=alpha+1;
    while(i--){
        x=tmpqueue[i];
        y=tmpqueue[--i];
        score=-this.nega(x,y,depth,-b,-alpha);
        this.desimulate(x,y,depth%2);
        if(alpha<score && score<beta){
            score=-this.nega(x,y,depth,-beta,-alpha);
            this.desimulate(x,y,depth%2);
        }
        if(score>alpha){
            alpha=score;
        }
        if(alpha>=beta){
            return alpha;
        }
        b=alpha+1;
    }
    return alpha;
};

ai.move=function(){
    ai.cache={};
    postMessage({
        type: 'starting'
    });
    var alpha=-1/0, beta=1/0,bestmove=[this.scorequeue[0].r, this.scorequeue[0].c];
    var i=20, tmp, tmpqueue=[],depth=this.depth;
    while(i--){
        tmp=this.scorequeue[i];
        if(tmp.score.set)continue;
        tmpqueue.push(tmp.c);
        tmpqueue.push(tmp.r);
    }
    i=tmpqueue.length-1;
    var x,y,b=beta;         
    x=tmpqueue[i];
    y=tmpqueue[--i];
    var score=-this.nega(x,y,depth,-b,-alpha);
    this.desimulate(x,y,depth%2);
    if(score>alpha){
        alpha=score;
        bestmove=[x,y];
    }
    b=alpha+1;
    while(i--){
        x=tmpqueue[i];
        y=tmpqueue[--i];
        score=-this.nega(x,y,depth,-b,-alpha);
        this.desimulate(x,y,depth%2);
        if(alpha<score && score<beta){
            score=-this.nega(x,y,depth,-beta,-alpha);
            this.desimulate(x,y,depth%2);
        }
        if(score>alpha){
            alpha=score;
            bestmove=[x,y];
        }
        b=alpha+1;
    }
    postMessage({
        type: 'decision',
        'r': bestmove[0], 
        'c': bestmove[1]
    });
};

