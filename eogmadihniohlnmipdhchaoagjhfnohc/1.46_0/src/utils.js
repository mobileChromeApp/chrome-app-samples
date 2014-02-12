;(function($) {
var slice = [].slice;

function toArray(a, i) { return slice.call(a, i||0); }

if (!Function.prototype.bind) {
    Function.prototype.bind = function() {
        var self = this, ctx = arguments[0], args = toArray(arguments, 1);
        return function() { return self.apply(ctx, args.concat(toArray(arguments))); }
    }
}

$.shuffle = function(array) {
    var tmp, current, top = array.length;
    
    if (top) {
        while (--top) {
            current = ~~(Math.random() * (top + 1));
            
            tmp            = array[current];
            array[current] = array[top];
            array[top]     = tmp;
        }
    }
    return array;
}

$.fullScreen = function () {
    if (document.documentElement.scrollHeight<window.outerHeight/window.devicePixelRatio) {
        document.body.style.height = (window.outerHeight/window.devicePixelRatio)+1+"px";
        setTimeout(function(){ window.scrollTo(1, 1); }, 0);
    } else {
        window.scrollTo(1, 1);
    }
}

/* Simple template */
$.tmpl = function(tmplId, values) {
    var tmpl = document.getElementById(tmplId).innerHTML;
    for (var tag in values) {
        if (values.hasOwnProperty(tag)) {
            tmpl = tmpl.replace(new RegExp("{"+tag+"}", "g"), values[tag]);
        }
    }
    return tmpl;
}

/* Event emitter */
function makeProxy( name ) {
    return function() {
        ( this._JQ || ( this._JQ = $( this ) ) )[name].apply( this._JQ, arguments );
    };
}
 
$.eventEmitter = {
    emit: makeProxy( "trigger" ),
    once: makeProxy( "one" ),
    on: makeProxy( "on" ),
    off: makeProxy( "off" )
};

}(jQuery));
