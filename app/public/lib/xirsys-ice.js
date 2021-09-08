
if(!$xirsys) var $xirsys = new Object();
var _ice = $xirsys.ice = function (apiUrl, info) {
    if(!info) info = {};
    this.info = info;
    this.apiUrl = !!apiUrl ? apiUrl : '/webrtc';
    this.evtListeners = {};

    //path to channel we are sending data to.
    this.channelPath = !!info.channel ? this.cleanChPath(info.channel) : '';

    this.iceServers;
    if(!!this.apiUrl){
        if(this.info.ident && this.info.secret){
            this.doICE(this.info.ident, this.info.secret);//first get our token.
        }else {
            this.doICE();
        }
    }
}

_ice.prototype.onICEList = 'onICEList';

_ice.prototype.doICE = function (ident,secret) {
    console.log('*ice*  doICE: ',this.apiUrl+"/_turn"+this.channelPath);
    var own = this;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function($evt){
        if(xhr.readyState == 4 && xhr.status == 200){
            var res = JSON.parse(xhr.responseText);
            console.log('*ice*  response: ',res);
            own.iceServers = own.filterPaths(res.v.iceServers);

            own.emit(own.onICEList);
        }
    }
    var path = this.apiUrl+"/_turn/"+this.channelPath;
    xhr.open("PUT", path, true);
    if(ident && secret)xhr.setRequestHeader ("Authorization", "Basic " + btoa(`${ident}:${secret}`) );
    xhr.send();
}

//check for depricated RTCIceServer "url" property, needs to be "urls" now.
_ice.prototype.filterPaths = function(arr){
    var l = arr.length, i;
    var a = [];
    for(i=0; i<l; i++){
        var item = arr[i];
        var v = item.url;
        if(!!v){
            item.urls = v;
            delete item.url;
        }
        a.push(item);
    }
    return a;
}

//formats the custom channel path how we need it.
_ice.prototype.cleanChPath = function(path){
    //has slash at front
    console.log('cleanChPath path recv: '+path);
    if(path.indexOf('/') != 0) path = '/'+path;
    if(path.lastIndexOf('/') == (path.length - 1)) path = path.substr(0,path.lastIndexOf('/'));
    console.log('cleanChPath new path: '+path);
    return path;
}

_ice.prototype.on = function(sEvent,cbFunc){
    //console.log('*ice*  on ',sEvent);
    if(!sEvent || !cbFunc) {
        console.log('error:  missing arguments for on event.');
        return false;
    }
    if(!this.evtListeners[sEvent]) this.evtListeners[sEvent] = [];
    this.evtListeners[sEvent].push(cbFunc);
}
_ice.prototype.off = function(sEvent,cbFunc){
    if (!this.evtListeners.hasOwnProperty(sEvent)) return false;//end

    var index = this.evtListeners[sEvent].indexOf(cbFunc);
    if (index != -1) {
        this.evtListeners[sEvent].splice(index, 1);
        return true;//else end here.
    }
    return false;//else end here.
}

_ice.prototype.emit = function(sEvent, data){
    var handlers = this.evtListeners[sEvent];
    if(!!handlers) {
        var l = handlers.length;
        for(var i=0; i<l; i++){
            var item = handlers[i];
            item.apply(this,[{type:this.onICEList}]);
        }
    }
}

console.log('$xirsys.ice Loaded Successfuly!!!');
_ice = null;
