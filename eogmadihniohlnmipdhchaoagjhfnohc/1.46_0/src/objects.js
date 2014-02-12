;(function(document, window, undefined) {

var Tile = Cevent.Rect.extend({
    init: function(x, y, w, h, img, imgx, imgy) {
        this._super(x, y, w, h);
        this.image    = img;
        this.imgx     = imgx;
        this.imgy     = imgy;
        this.selected = false;
    },
    
    draw: function(ctx) {
        this.setTransform(ctx);

        // drawImage(img, source_x, source_y, source_w, source_h, dest_x, dest_y, dest_w, dest_h);
        ctx.drawImage(this.image.image, this.imgx, this.imgy+(this.selected*this.h),
                                        this.w, this.h, this.x, this.y, this.w, this.h);
    }
});

Cevent.register("tile", Tile);

}(document, window));