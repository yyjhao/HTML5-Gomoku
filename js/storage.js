gameData={
    prefix: 'yyjhao.gomoku.',
    records: {},
    addRecord: function(name, defaultVal,applyFunc){
        this.records[name]=defaultVal;
        var func;
        if(!applyFunc){
            func=function(){};
        }
        else{
            func=applyFunc;
        }
        Object.defineProperty(this, name, {
            get: function(){
                return localStorage[this.prefix+name];
            },
            set: function(val){
                func(val);
                localStorage[this.prefix+name] = val;
            }
        });
    },
    ini: function(){
        for(var i in this.records){
            this[i]=this.records[i];
        }
    },
    apply: function(){
        for (var i in this.records){
            this[i]=this[i];
        }
    }
};

gameData.addRecord('firstTime','firstTime');

gameData.addRecord('mode', 'vscomputer', function(val){
    $('#mode-select input[value="'+val+'"]').attr('checked',true);
    $('#mode-select input[type="radio"]').checkboxradio('refresh');
    if(val=='vshuman'){
        $('.vs-computer').hide();
    }else $('.vs-computer').show();
});
gameData.addRecord('color', 'black', function(val){
    $('#color-select input[value="'+val+'"]').attr('checked',true);
    $('#color-select input[type="radio"]').checkboxradio('refresh');
});
gameData.addRecord('level', 'medium', function(val){
    $('#level-select input[value="'+val+'"]').attr('checked',true);
    $('#level-select input[type="radio"]').checkboxradio('refresh');
});

gameData.load=function(){
    if(!this.firstTime){
        this.ini();
    }
    this.apply();
};
