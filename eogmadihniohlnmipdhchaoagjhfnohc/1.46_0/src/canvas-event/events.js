/*
 * Copyright 2010 Jhonathan Salguero Villa
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
;(function() {

var window = this,
    doc = window.document,
    toString = Object.prototype.toString,
    
    func = "function",
    string = "string",
    array = "array",
    object = "object",
    
    isTouchDevice = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    // para resolver problema con eventos del teclado
    changeKeypress = /webkit|msie/i.exec(window.navigator.userAgent),
    SELECTOR = /^([#]?)([a-z][\w\-]*)$/,
    mouseButtons = ["", "LEFT", "CENTER", "RIGHT"],
    eventQueue = [],

    currentCanvas = null,
    curDrag = null,
    inDrag = false,

    hash = "Cevent" + new Date().getTime(),
    uuid = 0,
    Cache = {},

    // Mejor rendimiento de las animaciones
    requestAnimFrame = (function(){
      return window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(/* function */ callback, /* DOMElement */ fps){
                window.setTimeout(callback, 1000 / 60);
              };
    })(),
    
    
    /* Algunas funciones útiles */
    is = function( obj, type ) {
        return toString.call( obj ).slice(8, -1).toLowerCase() == type;
    },

    each = function( iterable, callback ) {
        var value, i = 0;
        if ( is(iterable, array) ) {
            for ( ;(value = iterable[i++]) && callback(value, i) !== false; ) {}
        }
    },
    
    // crossbrowser addEventListener
    addEventListener = (function() {
        if (document.addEventListener) {
            return function(elem, type, callback) {
                elem.addEventListener(type, callback, false);
            }
        } else {
            return function(elem, type, callback) {
                elem.attachEvent("on"+type, function(e){
                    var e = e || event;
                    e.preventDefault = e.preventDefault || function() { this.returnValue = false; };
                    e.stopPropagation = e.stopPropagation || function() {this.cancelBubble = true; };
                    return callback(e);
                });
            }
        }
    }()),
    
    // soporte Array.indexOf en IE<9
    indexOf = (function(){
        if ([].indexOf) {
            return function(a, e) { return a.indexOf(e); }
        } else {
            return function(a, e) {
                for (var i = 0, l = a.length; i < l; i++) {
                    if (e === a[i]) { return i; }
                }
                return -1;
            }
        }
    }()),
    
    // Webkit (chrome 16+) marca como obsoleto el uso de layerX/layerY
    // se hace necesario hallar "manualmente" la posición del canvas
    findPosition = function (obj) {
        var curleft = 0, curtop = 0;
        if (obj.offsetParent) {
            do {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
        }
        return { x: curleft, y: curtop };
    },

    // Una simplificación de jQuery.data
    data = function( obj, name, data ) {
        var id = obj[ hash ],
            cache;

        if ( !id ) {
            id = obj[ hash ] = ++uuid;
        }

        cache = Cache[ id ];

        // Crear cache si no existe
        if ( !cache ) {
            cache = Cache[ id ] = {};
        }

        if ( name && data !== undefined ) {
            cache[ name ] = data;
        }

        return name ? cache[ name ] : cache;
    },

    // Remover datos asociados a un objeto
    removeData = function( obj, name ) {
        if ( !obj ) {
            return;
        }

        var id = obj[ hash ];

        if ( id && Cache[id] ) {
            if ( name ) {
                delete Cache[ id ][name];
            } else {
                delete Cache[id];
            }
        }
    },

    /* Utilidades para el manejo de eventos */

    // Adicionar eventos a un objeto
    addEvent = function( obj, eventType, fn ) {
        var objData = data( obj ), handlers;
        
        each(eventType.split(" "), function(type) {
            handlers = objData[type] = objData[type] || [];
            handlers.push( fn );
        });
    },

    // Ejecutar sobre obj las funciones almacenados en handlers
    handleEvent = function( obj, handlers, context, event ) {
        var handler, i = 0, ret = true;
        
        context.ctx.save();
        context.ctx.scale(context.__zoom, context.__zoom);
        for ( ;(handler = handlers[i++]); ) {
            if ( handler.call(obj, context, event) === false ) {
                ret = false;
            }
        }
        context.ctx.restore();
        if ( !ret ) {
            event.preventDefault();
        }
       
        return ret;
    },

    // Verificar existencia de evento tipo eventType en shape y globales
    // recolectar eventos existentes en eventQueue
    colectEvent = function( shape, eventType, e, self ) {

        var shapeHandlers = data(shape, eventType),
            globalHandlers = data(self.cv, eventType);

        if ( shapeHandlers && shapeHandlers.length ) {
            eventQueue.push(shape, shapeHandlers);
        }

        if ( globalHandlers && globalHandlers.length ) {
            eventQueue.push(shape, globalHandlers);
        }
    },
    
    // Ejecutar eventos almacenados en eventQueue sobre context
    fireEvents = function (context, event) {
        var i, l;
        context.clear();
        // eventQueue es una array == [object, handlers, object, handlers...]
        for ( i = 0, l = eventQueue.length; i < l; i += 2) {
            handleEvent( eventQueue[i], eventQueue[i+1], context, event);
        }
        eventQueue = [];
        context.draw();    
    },
    
    TOUCH_MOVE,
    
    findObj = function(e, self) {
        e.preventDefault();
        e = e.touches ? e.touches[0] : e;

        // Modificar coordenadas (x,y), sumar y restar 1 en caso que sea 0
        self.x = ((( e && (e.pageX - self._pos.x) + 1) || window.event.offsetX + 1) - 1) / self.__zoom;
        self.y = ((( e && (e.pageY - self._pos.y) + 1) || window.event.offsetY + 1) - 1) / self.__zoom;

        var shape, shapes = self._shapes, i = shapes.length;

        while ( (shape = shapes[--i]) ) {
            // estamos sobre shape?
            if ( shape.hitTest(self) ) {
                // Cambiar objeto seleccionado
                return shape;
            }
        }
    },
    
    /* Eventos del mouse:
     *        El evento mousemove se encarga de seleccionar el objeto sobre el cual
     *        se deben ejecutar las acciones, este objeto se guarda en la propiedad _curHover.
     *        Los demás eventos del mouse solo deben ejecutarse sobre este elemento
     */
    mousemove = function( self, curHover ) {
        return function( e ) {
            var _e = e.touches ? e.touches[0] : e;
            e.preventDefault();
            // Ultima posición del mouse
            self.lastX = self.x; self.lastY = self.y;
            
            // Modificar coordenadas (x,y), sumar y restar 1 en caso que sea 0
            self.x = ((( e && (_e.pageX - self._pos.x) + 1) || window.event.offsetX + 1) - 1) / self.__zoom;
            self.y = ((( e && (_e.pageY - self._pos.y) + 1) || window.event.offsetY + 1) - 1) / self.__zoom;
            
            // Mientras se este arrastrando un objeto no hay necesidad de comprobar nada
            if ( !self._clicked ) {
                //curHover = self._curHover = findObj(e, self);
            }

            // Siempre se ejecuta mousemove
            if ( self._curHover ) {
                colectEvent(self._curHover, "mousemove", e, self);
            }
            
            TOUCH_MOVE = true;

            // Ejecutar eventos almacenados
            if ( eventQueue.length ) { 
                fireEvents(self, e);
            }
        };
    },

    mousedown = function( self ) {
        return function( e ) {
            var curHover = self._curHover = findObj(e, self),
                which = mouseButtons[e.which];
            self._clicked = true;

            // Recordar elemento actual
            // para evitar ejecutar eventos del teclado
            // en varios <canvas> simultáneamente
            currentCanvas = self.cv;

            // Botón del mouse presionado
            self[which] = true;

            if ( curHover ) {
                // ejecutar mousedown
                colectEvent(curHover, "mousedown", e, self);

                if ( curHover !== self.focused ) {
                    // focus al que entra
                    colectEvent( curHover, "focus", e, self );

                    // blur al que sale
                    if ( self.focused ) {
                        colectEvent( self.focused, "blur", e, self );
                    }
                }

                self.focused = curHover;

            } else if ( self.focused ) {
                colectEvent( self.focused, "blur", e, self );
                self.focused = null;
            }

            if ( eventQueue.length ) { 
                fireEvents(self, e);
            }
            self.LEFT = self.CENTER = self.RIGHT = undefined;
        };
    },

    mouseup = function( self ) {
        return function( e ) {
//             var curHover = self._curHover = findObj(e, self);
        
            self._clicked = false;
            if ( self._curHover ) {
                colectEvent( self._curHover, "mouseup", e, self );
                if (!TOUCH_MOVE && isTouchDevice) {
                    colectEvent(self._curHover, "click", e, self );
                }
            }
            
            TOUCH_MOVE = false;

            if ( eventQueue.length ) { 
                fireEvents(self, e);
            }
            
            self._curHover = null;
        };
    },

    click = function( self ) {
        return function( e ) {
            if ( self._curHover ) {
                colectEvent( self._curHover, "click", e, self );
            }

            if ( eventQueue.length ) { 
                fireEvents(self, e);
            }
        };
    },

    dblclick = function( self ) {
        return function( e ) {
            if ( self._curHover ) {
                colectEvent( self._curHover, "dblclick", e, self );
            }

            if ( eventQueue.length ) { 
                fireEvents(self, e);
            }
        };
    },

    /*
     * (c) Copyrights 2007 - 2008
     * This is a modified version of jquery.hotkeys (http://code.google.com/p/js-hotkeys/)
     * License: MIT and GPL
     */
    keyevent = (function () {

        var hotkeys = {
            specialKeys: { 27: "esc", 9: "tab", 32:"space", 13: "return", 8:"backspace", 145: "scroll",
                20: "capslock", 144: "numlock", 19:"pause", 45:"insert", 36:"home", 46:"del",
                35:"end", 33: "pageup", 34:"pagedown", 37:"left", 38:"up", 39:"right",40:"down",
                109: "-", 112:"f1", 113:"f2", 114:"f3", 115:"f4", 116:"f5", 117:"f6", 118:"f7",
                119:"f8", 120:"f9", 121:"f10", 122:"f11", 123:"f12", 191: "/", 96: "0", 97:"1",
                98: "2", 99: "3", 100: "4", 101: "5", 102: "6", 103: "7", 104: "8", 105: "9", 106: "*",
                107: "+", 110: ".", 111 : "/"
                // Error en chrome linux (en mi pc)
                , 187: "+", 189: "-"},

            shiftNums: { "`":"~", "1":"!", "2":"@", "3":"#", "4":"$", "5":"%", "6":"^", "7":"&",
                "8":"*", "9":"(", "0":")", "-":"_", "=":"+", ";":":", "'":"\"", ",":"<",
                ".":">", "/":"?", "\\":"|" }
        },
        
        code;

        return function( type, self ) {
            // Inicializar Contenedor de eventos
            // Crear un objeto global para guardar manejadores de evento
            var eventObj = data(self.cv, type, {}),
                Handlers = data( eventObj );
            return function(e) {
                
                // TODO: es esto conveniente?
                // solo ejecutar si el canvas esta seleccionado
                if ( currentCanvas !== self.cv && !self.__globalkeyevents ) {
                    return;
                }

                // Dadas las diferencias del keyCode según el navegador
                // usamos el primero que se genera en los demás eventos (keypress/keyup)
                code = type == "keydown" ? e.keyCode : code;

                var special = hotkeys.specialKeys[code],
                    // prevent f5 overlapping with "t" (or f4 with "s", etc.)
                    character = special || String.fromCharCode(code || e.charCode).toLowerCase(),
                    modif = "",
                    handlers;
                    
                    if (e.altKey) { modif += "alt+"; }

                    if (e.ctrlKey || e.metaKey) { modif += "ctrl+"; }
                    
                    if (e.shiftKey) { modif += "shift+"; }
                    
                    //console.log(type, character, code, e.charCode)
                    handlers = (Handlers[modif+character] ||
                                Handlers[modif+hotkeys.shiftNums[character]] ||
                                // "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
                                (modif === "shift+" && Handlers[hotkeys.shiftNums[character]]) ||
                                Handlers.any
                               );

                if ( handlers ) {
                    var ret = handleEvent(self, handlers, self, e);

                    if ( !self.play ) { self.redraw(); }

                    return ret;
                }
            };
        };
    })(),

    Cevent = function( canvas, shapes ) {
        canvas = is( canvas, string ) ? doc.getElementById( canvas ) : canvas;
        
        // Soporta canvas o excanvas/FlashCanvas
        if (canvas.getContext || window.G_vmlCanvasManager) {
            return new Cevent.fn.init(canvas, shapes);

        } else {
            throw Error("Your browser sucks");
        }
    };

Cevent.all_instances = [];

Cevent.forse_redraw = function() {
    for (var i = 0; i < Cevent.all_instances.length; i++) {
        Cevent.all_instances[i].redraw();
    }
}

Cevent.fn = Cevent.prototype = {
    init: function( cv, shapes ) {
        this.cv  = cv;
        if (!cv.getContext) {
            G_vmlCanvasManager.initElement(cv);
        }
        this.ctx = cv.getContext("2d");

        this.width  = cv.width;
        this.height = cv.height;
        this.__zoom = 1;

        this.x = 0;
        this.y = 0;

        // Eventos Se aplican una sola vez
        if ( !this.cv[hash] ) {
            Cevent.all_instances.push(this);
            // Contenedores
            this._shapes = data(cv, "shapes", []);
            this._last = null;
            
            // hallar posición del canvas
            this.calcCanvasPosition();

            if (!/mobile/i.exec(navigator.userAgent)) {
                // Eventos del mouse
                addEventListener(cv, "mousemove", mousemove(this), false);
                addEventListener(cv, "dblclick", dblclick(this), false);
                addEventListener(cv, "click", click(this), false);
                addEventListener(cv, "mouseup", mouseup(this), false);
                addEventListener(cv, "mousedown", mousedown(this), false);

                // Eventos del teclado
                addEventListener(doc, "keydown", keyevent("keydown", this), false);
                addEventListener(doc, "keyup", keyevent("keyup", this), false);

                if ( !changeKeypress ) {
                    addEventListener(doc, "keypress", keyevent("keypress", this), false);
                }

                // Prevenir cambio de cursor al arrastrar (webkit)
                if ("onselectstart" in cv) {
                    cv.onselectstart = function() { return false; };
                    cv.onmousedown = function() { return false; };
                }
            }
            if (isTouchDevice) {
                addEventListener(cv, "touchmove", mousemove(this), false);
                addEventListener(cv, "touchend", mouseup(this), false);
                addEventListener(cv, "touchstart", mousedown(this), false);
            }

        } else {
            this._shapes = data(cv, "shapes");
            this._last = shapes;
        }
    },
    
    // Si se cambia dinámicamente la posición del canvas (margin, padding, top..)
    // es necesario recalcularla con calcCanvasPosition.
    calcCanvasPosition: function() {
        this._pos = findPosition(this.cv);
        return this;
    },

    // obtener el elemento en la posición i o todos si no se especifica
    get: function( i ) {
        i = i < 0 ? this._shapes.length + i : i;

        return this._shapes[ i ] || this._shapes;
    },
    
    // Retornar array con objetos que coinciden con selector
    getAll: function( selector ) {
        var ret = [], match = SELECTOR.exec( selector ), type, name;

        if ( selector === "*" ) {
            ret = this._shapes.slice(0);

        } else if ( match ) {
            type = match[1];
            name = match[2];

            each(this._shapes, function( shape ) {
                if ( shape[ type ] === name ) {
                    ret.push( shape );
                }
            });
        }

        return ret;
    },

    // Remover Objeto
    remove: function( shape ) {
        var i = indexOf(this._shapes, shape);

        if ( i >= 0 ) {
            this._shapes.splice( i, 1 );
        }

        return;
    },

    // agregar id a objetos almacenados en _last
    addId: function( id ) {
        var match = SELECTOR.exec( id ), shapes = this._last;

        if ( match && !match[1] && shapes ) {

            if ( !shapes.length ) {
                shapes["#"] = id;

            } else {
                each(shapes, function( shape ) {
                    shape["#"] = id;
                });
            }
        }

        return this;
    },

    // remover id a objetos almacenados en _last
    removeId: function() {
        var shapes = this._last;

        if ( shapes && !shapes.length ) {
            shapes["#"] = "";

        } else {
            each(shapes, function( shape ) {
                shape["#"] = "";
            });
        }

        return this;
    },

    // Encontrar todos los objetos que coinciden con selector
    find: function( selector ) {
        var ret = this.getAll(selector);
        return Cevent( this.cv, ret.length == 1 ? ret[0] : ret);
    },
    
    // Modificar atributos de un Objeto
    attr: function( attrs, value ) {
        var shapes = this._last;
        

        if ( shapes && shapes.attr ) {
            shapes.attr( attrs, value );

        } else {
            each(shapes, function( shape ) {
                shape.attr( attrs, value );
            });
        }

        return this;
    },

    rotate: function( angle ) {
        return this.attr({rotation: angle});
    },

    translate: function( x, y ) {
        return this.attr({tx: x, ty: y});
    },

    scale: function( x, y ) {
        return this.attr({scaleX: x, scaleY: y});
    },

    skewX: function( val ) {
        return this.attr({skewX: val});
    },

    skewY: function( val ) {
        return this.attr({skewY: val});
    },
    
    zoomTo: function(value) {
        if (is(value, 'number')) {
            this.__zoom = value;
        }
        return this;
    },
    
    zoomIn: function() {
        this.zoomTo(this.__zoom+.1);
        return false;
    },
    
    zoomOut: function() {
        this.zoomTo(this.__zoom-.1);
        return false;
    },
    
    // true: los eventos del teclado se ejecutan siempre
    // false: los eventos solo se ejecutan si el canvas tiene el foco
    setGlobalKeyEvents: function(v) {
        this.__globalkeyevents = v;
        return this;
    },

    // Asociar un evento con un objeto
    // obj es para uso interno
    bind: function( name, fn, obj ){
        var shapes = obj || this._last, type;
        
        // ce.bind(selector,{event1: function, event2: function})
        if (is(name, string) && is(fn, object)) {
            for ( type in fn ) {
                this[ type ]( name, fn[type] );
            }
        // ce.bind({event1: function, event2: function})
        } else if (is(name, object)) {
            for ( type in name ) {
                this[ type ]( name[type] );
            }
        // ce.bind(event, function)
        } else if ( shapes && !shapes.length ) {
            addEvent( shapes, name, fn );
        } else {
            each(shapes, function( shape ) {
                addEvent( shape, name, fn );
            });
        }

        return this;
    },
    
    beforeDraw: function(fn) {
        if ( is(fn, func) ) {
            this.__beforeDraw = fn;
        }
        return this;
    },
    
    afterDraw: function(fn) {
        if ( is(fn, func) ) {
            this.__afterDraw = fn;
        }
        return this;
    },

    // Borrar un área del lienzo o todo
    clear: function( x, y, width, height ) {
        x = x || 0;
        y = y || 0;
        width  = width  || this.cv.width;
        height = height || this.cv.height;

        this.ctx.clearRect(x, y, width/this.__zoom, height/this.__zoom);
        return this;
    },

    // Dibujar Objetos almacenados
    draw: function() {
        var shape, i = 0, shapes = this._shapes;
        
        this.ctx.save();
        // Aplicar zoom
        Cevent.__zoom = this.__zoom;
        
        for ( ; (shape = shapes[i++]); ) {
            shape.draw( this.ctx );
        }

        Cevent.__zoom = 1;
        this.ctx.restore();
        // Todos los cambios aplicados
        return this;
    },

    // redraws: 0,

    redraw: function() {
        // console.log( "redraw: ", ++this.redraws );
        return this.clear().draw();
    },

    /* TODO: una buena implementación de animaciones */
    loop: function( fn ) {
         var self = this, tdata = data(this.cv), play_flag;
        
//        if (!is(fn, func) && !is(tdata.loop, func)) {
//            throw new Error("Function required");
//        }

        if ( is(fn, func) ) {
            tdata.loop = fn;
        }

        fn = tdata.loop;
        
        // play_flag se guarda por closure
        play_flag = this.play = ++uuid;

        (function() {
            if (play_flag !== self.play) { return; }

            requestAnimFrame(arguments.callee);

            self.redraw();

            if ( fn ) {
                self.ctx.save();
                fn.call(self, self);
                self.ctx.restore();
            }

            self.frameCount += 1;
        }());

        return this;
    },

    frameCount: 0,

    // detener Loop
    stop: function() {
        delete this.play;
        return this;
    }
};

Cevent.fn.init.prototype = Cevent.prototype;

// Exponer addEventListener
Cevent.addEventListener = addEventListener;

// Aplicar fn a Objetos que coincidan con selector
function makeLive( selector, fn ) {
    var match = SELECTOR.exec( selector );

    return function( self, e ) {
        if ( match && this[ match[1] ] === match[2] || selector === "*" ) {
            fn.call( this, self, e );
        }
    };
}

// Eventos del mouse.
// Uso:
//        Cv.mousedown( selector, function ) => Evento Live
//        Cv.mousedown( function )
each("mousemove mouseover mouseout mousedown mouseup click dblclick focus blur".split(" "), function( name ) {
    Cevent.fn[ name ] = function( fn, match ) {
        var obj;

        // evento live
        if ( is(match, func) ) {
            fn = makeLive( fn, match );
            obj = this.cv;
        }

        return this.bind( name, fn, obj );
    };
});

// Eventos del teclado
// combi (opcional) especifica combinación de teclado en el orden alfabetico
each("keydown keypress keyup".split(" "), function( name ) {
    Cevent.fn[name] = function( combi, fn ) {

        // The any key ;)
        if ( !fn && is(combi, func) ) {
            fn = combi;
            combi = "any";
        }

        combi = (combi + "").toLowerCase();

        return this.bind( combi, fn, data(this.cv, name) );
    };
});

// En Webkit/IE9 keypress no funciona en teclas que no insertan caracteres 
// (http://code.google.com/p/chromium/issues/detail?id=2606)
// y retorna un keyCode diferente a keydown/keyup 
// Eje:
//     j = 74 con keydown y keyup
//     j = 106 con keypress
// por lo demás keydown se comporta igual a keypress, Así que los cambiamos
if ( changeKeypress ) {
    Cevent.fn.keypress = Cevent.fn.keydown;
}

// TODO: permitir evento live
// Evento drag
// handlers (opcional) es un objeto con las funciones start/move/end
Cevent.fn.drag = function( handlers ) {
    var start, move, end, self, objs = [],
        dragid = "Cevent-drag"+hash, shapes = this._last;

    if ( shapes && !shapes.length ) {
        shapes = [ shapes ];
    }

    each(shapes, function( shape ) {
            if ( !data(shape, dragid) ) {
                data( shape, dragid, true );
                objs.push( shape );
            }
    });

    self = Cevent( this.cv, objs );

    // los manejadores de eventos son guardados por closure
    // ¿está esto mal?
    if ( handlers ) {
        start = handlers.start;
        move = handlers.move;
        end = handlers.end;
    }

    self.bind({
        mousedown: function( c, e ) {
            if ( c.LEFT ) { curDrag = this; }
        },

        mousemove: function( c, e ) {
            if ( this === curDrag ) {
                this.rmove( c.x - c.lastX, c.y - c.lastY );

                if ( !inDrag ) {
                    inDrag = true;
                    if ( start ) {    start.call( this, c, e );    }
                }

                if ( move ) { move.call( this, c, e ); }
            }
        },

        mouseup: function( c, e ) {
            if ( this === curDrag ) {
                curDrag = inDrag = null;

                if ( end ) { end.call( this, c, e ); }
            }
        }
    });

    return this;
};

/* Registrar Una Clase */
// para no dañar código previo se mantiene registre y register
Cevent.registre = Cevent.register = function( name, Class ) {
        name = name.toLowerCase();
    var constName = name.charAt(0).toUpperCase() + name.substring(1);

    // Acceso al constructor
    this[ constName ] = Class;

    // Agregar clase al prototipo
    this.prototype[ name ] = function() {

        var shape = Class.apply( this, arguments );

        shape[""] = name;

        this._shapes.push( shape );

        this._last = shape;

        return this;
    };
};

// Deseleccionar canvas al hacer click sobre otro elemento
addEventListener(doc, "mousedown", function(e) {
    // Si no es un canvas inicializado con canvas-event
    var target = e.target || e.srcElement;
    // FlashCanvas usa un objeto Flash anidado en el canvas original
    target = target.nodeName == "OBJECT" ? target.parentNode : target;
    if (!target[hash]) {
        currentCanvas = target;
    }
}, false);

window.Cevent = Cevent;
}());
