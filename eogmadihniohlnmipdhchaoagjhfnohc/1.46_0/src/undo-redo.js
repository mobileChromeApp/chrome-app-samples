;(function(document, window, namespace, undefined) {
function CommandManager(maxUndo) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxUndo = maxUndo || 20;
}

CommandManager.prototype.reset = function() {
    this.undoStack.length = 0;
    this.redoStack.length = 0;
};

CommandManager.prototype.exec = function( cmd ) {
    cmd.execute();
    if (this.undoStack.length > this.maxUndo) {
        this.undoStack.shift();
    }
    this.undoStack.push(cmd);
    this.redoStack.splice(0, this.redoStack.length);
};

CommandManager.prototype.undo = function() {
    if (!this.undoStack.length) { return; }
    
    var cmd = this.undoStack.pop();
    cmd.undo();
    return this.redoStack.unshift(cmd);
};

CommandManager.prototype.redo = function () {
    if (!this.redoStack.length) { return; }

    var cmd = this.redoStack.shift();
    cmd.redo();
    this.undoStack.push( cmd );
};

function RemoveCommand(ctx, item1, item2) {
    this.ctx   = ctx;
    this.item1 = item1;
    this.item2 = item2;
    item1.selected = item2.selected = false;
    delete ctx.CACHE[item1.id];
    delete ctx.CACHE[item2.id];
}

RemoveCommand.prototype.execute = function() {
    this.index1 = this.ctx.remove(this.item1);
    this.index2 = this.ctx.remove(this.item2);
};

RemoveCommand.prototype.undo = function() {
    insert.call(this.ctx._shapes, this.index2, this.item2);
    insert.call(this.ctx._shapes, this.index1, this.item1);
    this.ctx.CACHE[this.item2.id] = this.item2;
    this.ctx.CACHE[this.item1.id] = this.item2;
    this.ctx.redraw();
};

function insert(i, item) {
    var tmp, l = this.length;
    for (; i <= l; i++) {
        tmp = this[i];
        this[i] = item;
        item = tmp;
    }
}

namespace.CommandManager = CommandManager;
namespace.RemoveCommand  = RemoveCommand;
}(document, window, game));
