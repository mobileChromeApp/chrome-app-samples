;(function(namespace){
function $(id) { return document.getElementById(id); }

var uuid = 0,
    start,
    stopTime;

function Timer(timer) {
    this.e_timer = $(timer);
    this.restart();
}

Timer.prototype.now = function() { return new Date().getTime(); };

Timer.prototype.restart = function() {
    start = stopTime = this.now();
    this.startTime();
};

Timer.prototype.addTime = function(time) {
    if (typeof time == "number") {
        start -= Math.abs(time);
    }
};

Timer.prototype.startTime = function() {
    var self = this;
    this.uuid = uuid;

    ;(function(){
        if (self.uuid == uuid) {
            var now = stopTime = self.now();

            self.e_timer.innerHTML = self.time();

            setTimeout(arguments.callee, 1000);
        }
    }());
};

Timer.prototype.stop = function() { ++uuid; };

Timer.prototype.getTime = function() { return stopTime - start; };

Timer.prototype.time = function() {
    var t = ~~((stopTime - start)/1000),
        s = t%60,
        m = ~~(t/60),
        h = ~~(m/60);
        m %= 60;

    return (h > 9 ? h : "0" + h) + ":" +
           (m > 9 ? m : "0" + m%60) + ":" +
           (s > 9 ? s : "0" + s);
};

namespace.Timer = Timer;
}(game));
