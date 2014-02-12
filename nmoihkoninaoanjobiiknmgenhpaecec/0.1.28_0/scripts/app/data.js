(function() { // Data
    var _store = function() { return $.indexedDB('notepad').objectStore('notes'); },
        _fail = function(err) { Client.log(err, 'db'); };

    var _UPDATING = {}; // Lock for rows

    var _get = function(id, cbk) {
        if (_UPDATING[id] === true) console.log('BLOCKED')
        if (_UPDATING[id] === true) return cbk({status: 'updating'});

        _store().get(id).
        done(function(row) { cbk(null, row); }).
        fail(function(err) { cbk(err); });
    };

    var _index = function(args, cbk) {
        var items = [],
            range = (args.range) ? [args.range[0] || '', args.range[1]] : null;

        _store().index(args.index).

        each(function(row) {
            items.push(row.value);

            if (items.length === args.limit) return false;
        },
        range, args.direction).

        done(function() { cbk(null, items); }).
        fail(function(err) { cbk(err); });
    };

    var _add = function(args, cbk) {
        if (!args.row) return cbk('nothing to add');

        _store().add(args.row).done(function() { cbk(null, args.row); }).fail(cbk);
    };

    var _update = function(args, cbk) {
        _UPDATING[args.row.id] = true; // Lock this row

        _store()
        .delete(args.row.id)
        .done(function() {
            _add(args, function(err, row) {
                delete _UPDATING[args.row.id];

                return err ? cbk(err) : cbk(null, row)
            });
        })
        .fail(function(err) {
            delete _UPDATING[args.row.id];

            cbk(err);
        });
    };

    var _delete = function(id, cbk) {
        _store().delete(id).done(function() { cbk(); }).fail(cbk);
    };

    Data.schema = {
        '1': function(trans) {
            var notes = trans.createObjectStore('notes', {keyPath: 'id'});

//console.log('NOTES', notes)

            notes.createIndex('last_modified'); // global last modified
            notes.createIndex('dirty_since'); // local last modified
        }
    };

    Data.clearEmptyNotes = function(cbk) {
        _index({index: 'last_modified'}, function(err, notes) {
            if (err || !notes.length) return cbk(err);

            async.each(notes, function(note, go_on) {
                return note.dirty_since === undefined && note.text === '' ?
                    _delete(note.id, go_on) : go_on();
            }, cbk);
        });
    };

    Data.getNote = function(args, cbk) { _get(args.id, cbk); };

    Data.getDirtyNotes = function(args, cbk) {
        _index({
            index: 'dirty_since',
            range: [args.since, new Date().toISOString()]
        },
        function(err, notes) {
            if (err) return cbk(err);

            notes = notes.filter(function(note) {
                return !(note.text === '' && note.created_at === note.dirty_since); });

            cbk(null, notes);
        });
    };

    Data.markAsClean = function(args, cbk) {
        cbk = cbk || function(){};

        if (!args.notes.length) return cbk();

        async.each(args.notes, function(note, go_on) {
            Data.getNote({id: note.id}, function(err, currentNote) {
                if (err) return go_on(err);

                if (!currentNote || !currentNote.dirty_since) return go_on();

                if (args.before && currentNote.dirty_since > args.before) return go_on();

                delete note.dirty_since;

                _update({row: note}, go_on);
            });
        },
        cbk);
    };

    Data.getRecentNotes = function(args, cbk) {
        var opt = {index: 'last_modified', direction: 'prev'};

        if (args.before) opt.range = ['', args.before];
        if (args.after) opt.range = [args.after, new Date().toISOString()];
        if (args.limit) opt.limit = args.limit;
        if (args.direction) opt.direction = args.direction;

        _index(opt, cbk);
    };

    Data.search = function(args, cbk) {
        Data.getRecentNotes({}, function(err, notes) {
            if (err) return cbk(err);
            if (args.q == '') return cbk(null, notes);

            var qx = new RegExp(args.q.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"), 'im');

            cbk(null, notes.filter(function(n) { return qx.test(n.text); }));
        });
    };

    Data.getDefaultNote = function(cbk) {
        

        var note = null;

        _store().index('last_modified').each(function(row) {
            note = row.value;

            return false;
        },
        null, 'prev').done(function() { cbk(null, note); }).fail(_fail);
    };

    /*
        Create a new blank note

        [id]
        [text]
        [destination]
        [destination_icon]
    */
    Data.addNote = function(args, cbk) {
        var now = new Date().toISOString();

        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16); });

        var row = {
            id: args.id || uuid,
            text: args.text || '',
            created_at: now,
            last_modified: now,
            text_last_modified: now,
            dirty_since: now
        };

        if (args.destination && args.destination_icon) {
            row.destination = args.destination;
            row.destination_last_modified = now;
            row.destination_icon = args.destination_icon;
            row.destination_icon_last_modified = now;
        }

        _add({row: row},
        function(err, note) {
            if (err && err.name === 'ConstraintError') return Data.addNote({}, cbk);

            return err ? cbk(err) : cbk(null, note);
        });
    };

    // Add an anonymous notice
    Data.addAnonNotice = function(notice) {
        if (!notice.id || !notice.content) return;

        _get(notice.id, function(err, note) {
            if (err || note) return;

            Data.addNote({
                id: notice.id,
                text: notice.content,
                destination: notice.destination,
                destination_icon: notice.destination_icon,
            },
            function(err, note) {
                if (err) return console.log(err);

                Page.noteStacks();

                Client.track('notices/received/' + notice.id);
            });
        });
    };

    // update notes to the server's version of them
    Data.updateNote = function(note, cbk) {
        note.last_modified = note.text_last_modified;

        _get(note.id, function(err, row) {
            if (err) return console.log(err);

            if (row === undefined) return !note.text ? cbk() : _add({row: note}, cbk);

            var mod = false;

            ['text'].forEach(function(type) {
                var lm = type+'_last_modified';

                if (note[lm] && (row[type] === undefined || row[lm] < note[lm])) {
                    if (row[type] === undefined) row[type] = '';
                    if (note[type] === undefined) note[type] = '';

                    row[type] = note[type];
                    row[lm] = note[lm];

                    mod = mod || true;
                }
            });

            if (mod === false) return cbk(); // nothing was modified

            row.last_modified = note.text_last_modified;

            if (row.id === Page.noteId()) Page.updateCurrentNote(row);

            _update({row: row}, cbk);
        });
    };

    /*
        User prompted edit to a note

        {
            id
            text

            paper
            locked

            [force] (update values even if not changed)
        }
    */
    Data.editNote = function(args, cbk) {
        cbk = cbk || function(){};

        _get(args.id, function(err, row) {
            if (err) return cbk(err);

            if (row === undefined) return cbk({status: 0, statusText: 'non existing'});

            var mod = false;

            if (args.text && args.text.length > 30000)
                args.text = args.text.substring(0, 30000);

            ['text', 'paper', 'locked'].forEach(function(type) {
                if (args[type] === undefined) return;
                if (row[type] === args[type] && args.force !== true) return;

                row[type] = args[type];
                row[type+'_last_modified'] = mod = new Date().toISOString();

                if (!row.dirty_since || mod > row.dirty_since) row.dirty_since = mod;
            });

            if (mod === false) return cbk(null, row);

            row.last_modified = row.text_last_modified;

            _update({row: row}, function() {
                cbk(null, row);
                setTimeout(function() {
                    Sync.pushChanges({rows: [row]});
                },
                Math.random() * 1000);
            });
        });
    };

    Data.start = function(cbk) {
        cbk = cbk || function() {};

        User.username = localStorage.username;

        $.indexedDB('notepad', {schema: Data.schema})
        .done(function() {
            setTimeout(function() {
                cbk();
            },
            100);
        })
        .fail(function(err) {
            console.log(err);
            cbk(err);
        });
    };

    Data.logout = function(args, cbk) {
        cbk = cbk || function(){};

        User = {};
        localStorage.clear();

        $.indexedDB('notepad').deleteDatabase().done(cbk).fail(_fail);
    };
})();

