//关于异步流的轮子
//通过when、trigger方法来注册、释放信号
//达到异步流的监听控制
;(function(){
var uid = 1;
var SetCallback = function(){
    this.map = [];
    this.cmap = [];
}

var indexOf = Array.prototype.indexOf || function(obj){
    for( var i=0, len=this.length; i<len; i++ ){
        if(this[i] === obj) return i;
    }
    return -1;
}

var fire = function(callback,thisObj){
    setTimeout(function(){
        callback.call(thisObj);
    }, 0)
}

SetCallback.prototype = {

    //把需要监听的对象传入，并存储到map，cmap
    when : function(resources,callback,thisObj){
        var map = this.map,cmap = this.cmap;
        if(typeof resources === "string") resources = [resources];
        var id = (uid++).toString(16);
        map[id] = {
            waiting : resources.slice(0),
            callback : callback,
            thisObj : thisObj || window
        };

        for(var i=0, len=resources.length; i<len; i++){
            var res = resources[i],
                list = cmap[res] || (cmap[res] = []);
                //list = cmap[res] = [];因为第一次执行时 cmap[res]=false;
                //第二次执行cmap[res]已存在；则赋值给list继续添加id
            list.push(id);
        }

        return this;
    },
    trigger : function(resources){
        if(!resources) return false;
        var map = this.map,cmap = this.cmap;
        if(typeof resources === "string") resources = [resources];
        for(var i=0, len=resources.length; i<len; i++){
            var res = resources[i];
            if (cmap[res] === "undefined") continue;//检测cmap是否存储有trigger传入来的参数 没有则跳出
            this._release(res, cmap[res]);//调用_release回响
            delete cmap[res];
        }
        return this;
    },
    _release : function(res,list){
        var map = this.map,cmap = this.cmap;
        for(var i=0, len=list.length; i<len; i++){
            var uid = list[i], mapItem = map[uid], waiting = mapItem.waiting,
                pos = indexOf.call(waiting, res);
            waiting.splice(pos, 1);//waiting匹配删除
            if(waiting.length === 0){//如果when存入的数组被删除完 则回调fire
                fire(mapItem.callback, mapItem.thisObj);
                delete map[uid];
            }
        }
    }
}
window.SetCallback = SetCallback;
})();

var set = new SetCallback();
set.when(["C","D"],function(){
    alert("C、D finish！")
})

setTimeout(function(){
    set.trigger("C");
},1000)
setTimeout(function(){
    set.trigger("D");
},500)