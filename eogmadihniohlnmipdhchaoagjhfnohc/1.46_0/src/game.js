;(function(document, window, $, undefined) {
    /******************
     * game namespace *
     ******************/

    game = {};

    /**********************
     * Private attributes *
     **********************/

    var tiles,
        tmpTiles     = [],
        pairs        = document.getElementById("pairs"),
        isMobile     = "ontouchstart" in window && /mobile/i.exec(navigator.userAgent),
        gameover     = false,
        BOARD_HEIGHT = 648,
        BOARD_WIDTH  = 832,
        CACHE        = {},
        FOUNDS       = 0;

    var OPTS = {
        sprite:    "images/smooth.png",
        map:       "space",
        maxUndo:   30,
        timePenalty: 60000
    };

    /********************
     * Public methods *
     ********************/

// Game constructor
    function Mahjong(opts) {
        var self   = this,
            $modal = $("#modal");

        this.opts       = $.extend(OPTS, opts);
        this.view       = new Cevent("canvas");
        this.timer      = new game.Timer("game-time");
        this.cmdManager = new game.CommandManager(this.opts.maxUndo);

        // GUI
        $("#toolbar").bind("touchmove", function(e){e.preventDefault();});
        $("#restart").click(this.restart.bind(this));
        $("#shuffle").click(shuffle.bind(this));

        $("#undo").click(this.undo.bind(this));

        $("#options-button").click(function(){
            game.Modal.open("options");
            $("#tile-style").attr("value", self.opts.sprite);
        });
        $modal.on("click", "button.shuffle", function(){
            shuffle.call(self);
            game.Modal.close();
        });
        $modal.on("click", "button.restart", function() {
            self.restart.call(self);
            game.Modal.close();
        });

        // internal events
        this.on("gameover", function() {
            // show just one time
            if (!gameover) {
                gameover = true;
                game.Modal.open("gameover");
            }
        });

        this.on("shuffle", this.timer.addTime.bind(this.timer, this.opts.timePenalty));

        // Load game resources
        var resources = {
            images:  { image: this.opts.sprite },
            ajax:    { map:   "maps/"+this.opts.map+".txt" },
            context: this
        };

        function onLoad() {
            processMap(this.map, this.image);
            this.$$loaded = true;
            this.view.clear();
            this.start();
        }

        $modal.on("click", "#maps img", function(e) {
            self.$$loaded = false;
            resources.ajax.map = "maps/" + $(this).data("map") + ".txt";
            game.loadResources(resources, onLoad);
        });

        $modal.on("change", "select", function(e) {
            resources.images.image = self.opts.sprite = this.value;
            game.loadResources(resources, self.view.redraw.bind(self.view));
        });

        game.loadResources(resources, onLoad);

        initEvents.call(this);
    }

    jQuery.extend(Mahjong.prototype, jQuery.eventEmitter);

// Inicia juego
    Mahjong.prototype.start = function() {
        // resources have not downloaded
        if (!this.$$loaded) { return; }

        this.cmdManager.reset();

        // Reiniciar marcador
        this.timer.restart();

        gameover = false;

        FOUNDS = 0;

        this.view._shapes.length = 0;

        // Dibujar mapa
        drawMap.call(this);
    };

// start game
    Mahjong.prototype.restart = Mahjong.prototype.start;

    Mahjong.prototype.undo = function() { if (this.cmdManager.undo()) { FOUNDS -= 2; } };

    /********************
     * Private methods *
     ********************/
// shuffle tiles
    function shuffle() {
        var tiles     = this.view.getAll("tile"),
            spritePos = $.map(tiles, function(t) { return t.imgx; });

        // shuffle and change position
        $.each($.shuffle(spritePos), function(i, pos) {
            tiles[i].imgx = pos;
        });

        this.emit("shuffle");

        this.view.redraw();
        setTimeout(check.bind(this), 100);
    }

    function isValidMove(tile) {
        /* Positions to verify */
        var left  = tile.layer       + "," + (tile.col-1) + "," + tile.row,
            right = tile.layer       + "," + (tile.col+1) + "," + tile.row,
            up    = (tile.layer + 1) + "," + (tile.col)   + "," + tile.row;

        return (CACHE[left] && CACHE[right]) || CACHE[up] ? null : tile;
    }

    function check() {
        var a      = $.map(this.view.get(), function(tile) { return isValidMove(tile); }),
            total  = {},
            left   = 0,
            length = a.length;

        // contar fichas iguales
        while (length) {
            // hay una ficha igual
            if (total[a[--length].imgx]) {
                left++;
                total[a[length].imgx] = 0;
            // primera vez que aparece
            } else {
                total[a[length].imgx] = 1;
            }
        }

        if (!left && FOUNDS != tmpTiles.length) { this.emit("gameover"); }

        pairs.innerHTML = left + (left == 1 ? " pair" : " pairs") + " remaining";
    }

// Validate and extract  map information
    function processMap(map, image) {
        var length = map.match(/:/g).length,
            tiles  = image.width / 64,
            tile;

        if (length % 2) { throw new Error("The number number of tiles should be even"); }

        tmpTiles = [];

        do {
            tile = ~~(Math.random() * tiles);
            tmpTiles.push(tile, tile);
        } while (length -= 2)
    }

// Draw map
    function drawMap() {
        var layers = this.map.split(/#.*\n/);

        CACHE = this.view.CACHE = {};

        tiles = $.shuffle(tmpTiles.slice(0));

        $.each(layers, drawLayer.bind(this));

        //
        this.view.find("tile").translate(40, 20);
        this.view.draw();
        setTimeout(check.bind(this), 100);
    }

// Draw map layer
    function drawLayer(layerNumber, layer) {
        var offset = layerNumber * 7,
            cell,
            id,
            tileType, j;

        layer = layer.split("\n");

        $.each(layer, (function(i, row) {
            for (j = row.length - 1; (cell = row.charAt(j)); j--) {
                if (cell == ":") {
                    id = layerNumber + "," + j + "," + i;
                    tileType = tiles.pop();
                    this.view
                        .tile(56 * j + offset,
                        80 * i - offset,
                        64, 88, this,
                        64 * tileType, 0)
                        .attr({
                            layer: layerNumber,
                            col: j,
                            row: i,
                            id: id
                        }).addId("r"+i);

                    CACHE[id] = this.view.get(-1);
                }
            }
        }).bind(this));
    }

// Inicia eventos
    function initEvents() {
        var selected = null, // currently selected tile
            self     = this;

        // Verifica
        this.view.mousedown("tile", function(c, e) {

            // already selected
            if (selected === this) {
                selected.selected = false;
                selected = null;
                c.redraw();
                return;
            }

            if (!isValidMove(this)) { return; }

            // Compare to another
            if (selected) {
                if (selected.imgx == this.imgx) {
                    FOUNDS += 2;

                    self.cmdManager.exec(new game.RemoveCommand(c, this, selected));

                    selected = null;

                    if (FOUNDS == tmpTiles.length) {
                        self.timer.stop();
                        self.emit("finish", self.timer.time());
                        game.Modal.open("congrat", {
                            time: self.timer.time()
                        });
                    }

                    c.redraw();

                    setTimeout(check.bind(self), 100);
                    return;
                }

                selected.selected = false;
            }

            // Remember selected
            this.selected = !this.selected;
            selected = this;
            c.redraw();
        });

        this.view.keydown("ctrl+z", this.undo.bind(this)).setGlobalKeyEvents(true);

        var resize = resizeGame.bind(this);

        window.onload   = resize;
        window.onresize = resize;

        if ("onorientationchange" in window) {
            window.onorientationchange = resize;
        }
    }


// TODO: Mover a otro archivo
// Resize board to fit the screen
    function resizeGame (e){
        var w     = document.documentElement.clientWidth,
            h     = document.documentElement.clientHeight - 20,
            ratio = 1;

        /* smartphones */
        if (w > 320 && w <= 480) {
            w -= 100;
        } else if (w > 480) {
            w -= 200;
        }

        // The game does not fit in its original size
        if (h < BOARD_HEIGHT || w < BOARD_WIDTH) {
            ratio = Math.min(h / BOARD_HEIGHT, w / BOARD_WIDTH);
            this.view.zoomTo(ratio);
        } else {
            this.view.zoomTo(1);
        }

        this.view.cv.width  =  BOARD_WIDTH * ratio;
        this.view.cv.height = (BOARD_HEIGHT + 80) * ratio;
        this.view.cv.style.marginLeft = (w - this.view.cv.width)/2+"px";

        this.view.calcCanvasPosition();
        this.view.redraw();

        if (isMobile) { $.fullScreen(); }
    }

    game.Mahjong = Mahjong;
}(document, window, jQuery));
