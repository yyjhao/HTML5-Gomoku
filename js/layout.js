sqrSize=0;

function adjustSize(){
	var avaih=$(window).height(),
		avaiw=$(window).width(),
		h=Math.max(avaih-7,avaih*0.98),
		w=Math.max(avaiw-7,avaiw*0.98);
		if(navigator.userAgent.toLowerCase().match(/(iphone|ipod)/)){
			if(avaih>avaiw){
				var vspace=avaiw,
					hspace=0;
			}else{
				var hspace=avaih-40,
					vspace=0;
			}
		}else{
			var vspace=Math.min(h-150,w),
				hspace=Math.min(w-320,h-40);
		}
	
	if(vspace>hspace){
		var vsqr=(vspace-15)/15,
			hsize=Math.floor(vsqr/2);
		$('#game-region').css({
			'padding': hsize+6,
			'margin-left': -((2*hsize+1)*15+12)/2,
			'padding-top': 100+hsize,
			'padding-bottom': 50+hsize,
			'margin-top':  -(15 * hsize + 82)
		});
		$('.board td').css('padding',hsize);
		$('.go-board').css({
			'top': 100,
			'bottom': 50,
			'left': 6,
			'right': 6,
		});
		$('header.game-ult').css('line-height', 80+'px');
		$('#game-info').css({
			'top': 20,
			'width': ((2*hsize+1)*15+12)/2-150
		});
		$('#main-but-group').css({
			'top': 6,
			'right': 6,
			'width': 160
		});
		$('#other-but-group').css({
			'bottom': 6,
			'right': 6,
			'width': 160
		});
	}else{
		var hsqr=(hspace-15)/15,
			hsize=Math.floor(hsqr/2);
		$('#game-region').css({
			'padding': hsize+6,
			'margin-left': -((2*hsize+1)*15+320)/2,
			'padding-left': 160+hsize,
			'padding-right': 160+hsize,
			'padding-top': 36+hsize,
			'margin-top': -(hsize * 15 + 28)
		});
		$('.board td').css('padding',hsize);
		$('.go-board').css({
			'top': 36,
			'bottom': 6,
			'left': 160,
			'right': 160
		});
		$('header.game-ult').css('line-height', 36+hsize+'px');
		$('#game-info').css({
			'left': 15,
			'top': 36+hsize,
			'width': 160+6-45-hsize/2
		});
		$('#main-but-group').css({
			'top': 36+hsize,
			'right': 6,
			'width': 160
		});
		$('#other-but-group').css({
			'bottom': 6+hsize,
			'right': 6,
			'width': 160
		});
	}
}
