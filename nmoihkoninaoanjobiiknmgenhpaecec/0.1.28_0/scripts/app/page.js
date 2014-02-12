(function() { // Page
    Page.linkify = function replaceURLWithHTMLLinks(text) {
        var href = /(\bhttps?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
            settings = /\b(memonotepad:\/\/settings)\b/ig,
            create = /\b(memonotepad:\/\/new)\b/ig,
            share = /\b(memonotepad:\/\/email)\b/ig,
            trash = /\b(memonotepad:\/\/delete)\b/ig,
            mail = /((([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})))/ig;

        text = text.
        replace(settings, '<a spellcheck="false" class="btn btn-mini" href="$1" contenteditable="false"><i contenteditable="false" class="icon-cog"></i><span class="address">$1</span></a>').
        replace(create, '<a spellcheck="false" class="btn btn-mini" href="$1" contenteditable="false"><i contenteditable="false" class="icon-pencil"></i><span class="address">$1</span></a>').
        replace(share, '<a spellcheck="false" class="btn btn-mini" href="$1" contenteditable="false"><i contenteditable="false" class="icon-share-alt"></i><span class="address">$1</span></a>').
        replace(trash, '<a spellcheck="false" class="btn btn-mini" href="$1" contenteditable="false"><i contenteditable="false" class="icon-trash"></i><span class="address">$1</span></a>').
        replace(href, '<a spellcheck="false" href="$1">$1</a>').
        replace(mail, '<a spellcheck="false" href="mailto:$1">$1</a>').
        replace(/\n/ig, '<br>');

        return text;
    }

    Page.note = function(in_text) {
        var note = $('#notes');

        if (in_text || in_text === '') {
console.log('SETTING NOTE TEXT NOW');

            note.text(in_text);

            note.html(Page.linkify(Page.note()) + '<br>');

            return;
        }

        var pieces = $('<div>' + note.html() + '</div>').contents(),
            content = '',
            numPieces = pieces.length;

        pieces.each(function(i, piece) {
            var text = $(piece).text();

//            console.log(i, 'PIECE IS', text, piece.nodeName, piece.nodeType)

            if (piece.nodeType === 3) {
                if (numPieces === 1 || i !== numPieces - 1)
                    content+= text;
                else if (text !== '')
                    content+= text;
            }

            if (piece.nodeType === 1 && text) {
                if (i !== 0 && piece.nodeName === 'DIV') content+= '\n';

                if (text === '' && piece.nodeName === 'DIV') content = '\n' + content + '\n';

                content+= text;

                if (piece.nodeName === 'A') {
                    var numBrs = $(piece).find('br').length;

                    for (var j = 0; j < numBrs; j++) content+= '\n';
                }
            }

            if (piece.nodeType === 1 && text === '' && i !== numPieces -1) content+= '\n';
        });

        if (content === '\n') content = '';

//console.log('FINAL CONTENT', JSON.stringify({content: content}))

        return content.replace(/\u00a0/g, ' ');
    };

    Page.start = function() {
        Client.log(null, 'init');

        async.auto({
            clearEmptyNotes: Data.clearEmptyNotes,
            getSelectedNote: ['clearEmptyNotes', function(go_on) {
                return (!localStorage.selectedNoteId) ? go_on() :
                    Data.getNote({id: localStorage.selectedNoteId}, go_on);
            }],
            getRecentNotes: ['getSelectedNote', 'clearEmptyNotes', function(go_on, res) {
                return (res.getSelectedNote) ?
                    go_on() : Data.getRecentNotes({limit: 1}, go_on);
            }],
            addNewNote: ['getSelectedNote', 'getRecentNotes', function(go_on, res) {
                if (res.getSelectedNote) return go_on();
                if (res.getRecentNotes && res.getRecentNotes.length) return go_on();

                Data.addNote({}, go_on);
            }]
        },
        function(err, res) {
            if (err) {
                Data.logout({}, function() {
                    Data.start(function() {
                        Page.start();
                    })
                });
                Sync.reset();

                return console.log('START', err);
            }

            var note = res.getSelectedNote || res.addNewNote || res.getRecentNotes[0];

            Page.focus(note);

            if (!User.username) Client.getAnonNotice();
        });
    };

    // Update the style of paper
    Page.updatePaperType = function() {
        var paper = $('#paper'),
            style = paper.data('paper_type');

        paper.css({background: style ? 'black url(/img/papers/' + style+ '.png)' : ''});

        $('#paper_type .paper').removeClass('selected');
        $('#paper_type .paper.'+style).addClass('selected');

        $('#notes').css('color', '');

        paper.toggleClass('white_type', !!style);

    };

    Page.lockNote = function(locked) {
        $('#paper').toggleClass('locked', locked);
        $('#stacks .selected .title').prepend('<i class="icon-lock"/>');

        $('#paper form.unlock').remove();

        $('#paper').prepend($('<form class="unlock"><div class="input input-prepend input-append"></div></form>'));
        $('#paper .unlock .input').append($('<input class="unlock_pw span6" type="password"/>'));
        $('#paper .unlock .input').append($('<button class="unlock_btn btn btn-primary">Unlock</button>'));

        $('#paper .unlock_pw').prop('placeholder', 'Password');

        $('#paper form.unlock').submit(function(e) {
            e.preventDefault();

            var pw = $('#paper .unlock_pw'),
                btn = $('#paper .unlock_btn');

            var account_pw = User.authBlock && User.username ?
                atob(User.authBlock).substring(User.username.length + 1) : null;

            if (!account_pw) return btn.text('Please sign in to cloud sync.');

            if (pw.val() === account_pw) {
                $('#paper form.unlock').remove();
                $('#paper').removeClass('locked');
            }
            else {
                btn.text('Incorrect');
                pw.val('');

                setTimeout(function() { btn.text('Unlock'); }, 3000);
            }

            console.log('UNLOCK NOTE FOR EDITING');
        });
    };

    Page.noteStacks = function(cbk) {
        cbk = cbk || function(){};

        Data.getRecentNotes({}, function(err, notes) {
            var ids = {};

            var selected = $('#stacks .selected');

            notes.forEach(function(n) { ids[n.id] = true; Page.stack({note: n}); });

            var stacks = [];

            $('#stacks .stack').each(function(i, n) { stacks.push($(n)); });

            stacks.sort(function(a, b) {
                var aM = a.data('lm'), bM = b.data('lm'),
                    aI = a.data('id'), bI = b.data('id');

                return (aM === bM) ? ((aI > bI) ? -1 : 1) : ((aM > bM) ? -1 : 1);
            });

            stacks.forEach(function(stack) { stack.appendTo('#stacks'); });

            $('#stacks .stack').filter(function() { return !ids[$(this).data('id')]; }).
            remove();

            $('#stacks .empty').not('.selected').remove();

            cbk(err);
        });

        return Page;
    };

    Page.stack = function(args) {
        var existing = $('#stacks .stack').filter(function(i, stack) {
            return $(stack).data('id') == args.note.id; });

        existing = (existing.length === 0) ? null : $(existing[0]);

        var stack = existing || $('<li class="row"></li>'),
            title = Page.stackTitle(args.note.text || '');

        if (!existing) stack.append($('<span class="span12 title"/>').text(title));
        else stack.find('.title').text(title);

        stack.
            data('id', args.note.id).
            data('lm', args.note.text_last_modified).
            addClass('stack').
            removeClass('highlight').
            toggleClass('empty', (args.note.text === '')).
            toggleClass('notice', (args.note.destination !== undefined)).
            toggleClass('selected', (args.note.id === Page.noteId()));

        if (!existing) {
            $('#stacks').append(stack.click(Events.clickNoteStack));

            setTimeout(function() { stack.addClass('added') }, 20);
        }

        return Page;
    };

    Page.save = function(cbk) {
        cbk = cbk || function(){};

        var text = Page.note(),
            id = Page.noteId();

        async.auto({
            get: function(go_on) { Data.getNote({id: id}, go_on); },

            add: ['get', function(go_on, res) {
                return res.get ? go_on() : Data.addNote({id: id}, go_on); }],

            edit: ['add', function(go_on, res) {
                Data.editNote({id: (res.add) ? res.add.id : id, text: text}, go_on); }]
        },
        function(err, res) {
            if (err) return cbk(err);

            Page.noteStacks();

            if (res.get && res.get.text && res.get.text !== text && Client.saveTyping)
                $('#stacks').animate({scrollTop: 0}, 150);

            var note = res.add || res.edit;

            Page.noteTime(note);

            cbk(null, note);
        });
    };

    Page.trashNote = function(cbk) {
        cbk = cbk || function(){};

        async.auto({
            get: function(go_on) {
                Data.getNote({id: Page.noteId()}, go_on);
            },

            older: ['get', function(go_on, res) {
                if (!res.get) return go_on('Note does not exist');

                Data.getRecentNotes({before: res.get.text_last_modified}, go_on);
            }],

            down: ['older', function(go_on, res) {
                if (!res.older) return go_on();

                for (var i = 0, old; old = res.older[i]; i++)
                    if (old.id !== res.get.id && old.text !== '')
                        return go_on(null, old);

                return go_on();
            }],

            newer: ['down', function(go_on, res) {
                if (res.down !== undefined) return go_on();

                Data.getRecentNotes({
                    direction: 'next',
                    after: res.get.text_last_modified
                },
                go_on);
            }],

            up: ['newer', function(go_on, res) {
                if (res.down !== undefined) return go_on();

                async.detectSeries(res.newer,
                function(note, next) { next(note.text !== ''); }, function(up) {
                    go_on(null, up);
                });
            }],

            empty: ['up', function(go_on, res) {
                return (res.down || res.up || res.get.text === '') ? 
                    go_on() : Data.addNote({}, go_on);
            }],

            next: ['empty', function(go_on, res) {
                if (!res.down && !res.up && res.get.text === '') res.empty = res.get;

                return go_on(null, res.down || res.up || res.empty);
            }],

            animate: ['empty', 'next', function(go_on, res) {
                if (res.empty) return go_on();

                $('#stacks .stack').filter(function(i, n) {
                    return $(n).data('id') === Page.noteId(); }).
                addClass('removed');

                $('#stacks .stack').filter(function(i, n) {
                    return $(n).data('id') === res.next.id; }).
                addClass('selected');

                setTimeout(go_on, 200);
            }],

            commit: ['animate', function(go_on, res) {
                Page.focus(res.next);

                Data.editNote({id: res.get.id, text: ''}, go_on);
            }],

            stacks: ['commit', Page.noteStacks]
        },
        cbk);
    };

    Page.noteId = function(id) {
        return id ? $('#notes').data('id', id) : $('#notes').data('id');
    };

    Page.noteTime = function(note) {
        var display = $('#metadata .date .value');

        if (note.text === '') return display.text('');

        var language = navigator.language.toLowerCase();

        try { moment.lang(language); }
        catch(e) {
            try { moment.lang(language.split('-')[0]); }
            catch (e) {
                moment.lang('en');
            }
        }

        moment.calendar = {
            sameDay: 'LT',
            lastDay: 'dddd LT',
            nextDay: 'LT',
            lastWeek: 'dddd',
            nextWeek: 'LT',
            sameElse: 'MMM D'
        };

        display.text(moment(note.text_last_modified).calendar());
    };

    Page.resetExtraActions = function() {
        $('#metadata .section select option').each(function(i, o) {
            var action = $(o).prop('value');

            $('#metadata').removeClass(action);
            $('#metadata .' + action).removeClass('active processing');
            $('#metadata .' + action + ' .processing.btn').remove();
        });

        return Page;
    };

    /*
        Makes the note visible
    */
    Page.focus = function(note) {
        $('#stacks .confirm').remove();
        $('#stacks .title').removeClass('span8').addClass('span12');

        $('#paper').data({
            paper_type: note.paper || null,
            locked: note.locked || false
        });

        Page.updatePaperType();

        if (!note || note.text === undefined) {
            Client.log('Bad note data');

            Data.addNote({}, function(err, note) { if (!err) Page.focus(note); });

            return Page;
        }

        Page.noteTime(note);

        if (Page.noteId() === note.id) return Page;

        if (note.text === '') $('#notes').focus();

        Page.resetExtraActions();

        $('#metadata').removeClass('active');

        Page.noteId(note.id);
        Page.note(note.text);

        localStorage.selectedNoteId = note.id;

        $('#notice_icon').remove();

        var isNotice = !!(note.destination_icon && note.destination);

        if (isNotice) {
            var notice = $('<a id="notice_icon"></a>');

            notice.prop('target', '_blank')
                .prop('href', note.destination)
                .append($('<img src="' + note.destination_icon + '">'));

            $('#paper').prepend(notice);
        }

        $('#notes').animate({scrollTop: 0}, 100);

        Page.noteStacks();

        return Page;
    };

    Page.authorizing = function() {
        if (!User.loggedIn) $('#account').addClass('authorizing');
    };

    Page.authorized = function() {
        if (User.loggedIn) return;

        User.loggedIn = true;
        Client.wasLoggedIn = true;
        $('#user').addClass('authorized');
        $('#account').removeClass('registering authorizing');
        $('#account .email').prop('disabled', true);
        $('#account .error').text('');
        Page.start();
    };

    /*
        Reset to start

        {
            keep_notes: [false]
        }
    */
    Page.logout = function(args) {
        localStorage.clear();

        $('#account #account_register').text('I am a new user');
        $('#account').prop('class', '');
        $('#account .email').prop('disabled', false);
        $('#user .password').val('');

        Sync.reset();

        Page
            .setRemoteSync({})
            .resetBufferPublish()
            .syncStop()
            .setAuthError()
            .hideSearch()
            .resetError();

        User = {};

        if (args.keep_notes === true) return Page.start();

        $('#user input').val('');
        $('#stacks, #notes').html('');

        Data.logout({}, function() {
            Data.start(function() {
                Page.start();
            });
        });
    };

    Page.showSearchResults = function(results) {
        var ids = {};

        results.forEach(function(note) { ids[note.id] = true; });

        $('#stacks .stack').each(function(i, n) {
            $(n).toggleClass('searchMiss', $(n).is('empty') || !ids[$(n).data('id')]);
        });
    };

    Page.syncStop = function() {
        $('#account, #user').removeClass('error authorized authorizing');

        return Page;
    };

    Page.setAuthError = function(code) {
        code = (code === undefined) ? '' : 'status_' + code;

        $('#account').
            toggleClass('error', !!code).
            find('.error_message').
            prop('class', '').
            addClass('error_message ' + code);

        return Page;
    };

    Page.authFail = function(err) {
        if (err.status === 403) $('#account .password').val('');

        Page.syncStop().setAuthError(err.status);
    };

    Page.showError = function(err) {
        $('#account').removeClass('authorizing').addClass('error');

        if (err.status !== undefined)
            $('#account .error_message').prop('class', 'error_message status_'+err.status);

        Client.log(err, 'page');
    };

    Page.resetError = function() {
        $('#account').
        removeClass('error').find('.error_message').prop('class', 'error_message');
    };

    Page.hideSearch = function() {
        $('#action_search, #action_search i, #search').
        removeClass('btn-primary icon-white active');

        $('#search input').val('');
        Events.keyupSearchSection();

        return Page;
    };

    Page.stackTitle = function(text) {
        var match = text.match(/[^ \t\n\xa0][^\n]*(?=\s|$)/gm);

        return (match) ? match[0] : 'New Note';
    };

    Page.updateCurrentNote = function(note) {
        if (Page.note() === note.text) return;

        Page.note(note.text);
        Page.stack({note: note});
    };

    Page.setStyle = function(type) {
        Client.style = type;

        var color = ['rgb(255,255,255)', 'rgb(0,0,24)'];

        if ($('#paper').is('.white_type')) color.reverse();

        $('#notes').css({color: color.shift()}).animate({color: color.shift()}, 150);

        $('#style li').each(function(i, li) {
            var t = $(li).data('type');

            $('#paper, #style').toggleClass(t, t === type);
        });

        $('#share').attr('data-style', type);
    };

    // Update checkbox with state of email integration
    Page.setState = function(option, state) {
        var checkbox = $(option);

        checkbox.removeClass('on off indeterminate');

        if (state === true) checkbox.addClass('on');
        else if (state === false) checkbox.addClass('off');
        else checkbox.addClass('indeterminate');

        return Page;
    };

    /*
        Update checkbox with state of remote sync

        {
            service
            on
        }
    */
    Page.setRemoteSync = function(args) {
        var service = args.service || ['remote'],
            checkbox = $('#sync .' + service.join('_'));

        checkbox.removeClass('on off indeterminate');

        if (args.on === true) checkbox.addClass('on');
        else if (args.on === false) checkbox.addClass('off')
        else checkbox.addClass('indeterminate');

        return Page;
    };

    // Buy dropbox sync
    Page.purchase_dropbox = function() {
        Page._purchaseSync({service: ['dropbox']});
    };

    // buy google drive sync
    Page.purchase_google_drive = function() {
        Page._purchaseSync({service: ['google', 'drive'], product: 'googleDrive'});
    };

    Page.purchase_emailIntegration = function() {
        async.auto({
            getToken: function(go_on) {
                Sync.getProductToken({product: 'emailIntegration'}, go_on);
            },
            loadGoog: function(go_on) {
                if (window.goog) return go_on();

                google.load('payments', '1.0', {
                    packages: ['production_config'],
                    callback: go_on
                });
            }
        },
        function(err, res) {
            if (err || !window.goog || !res.getToken) return Page.showError({status: 400});

            goog.payments.inapp.buy({
                jwt: res.getToken,
                success: function() {
                    Sync.toggleEmailIntegration(true);

                    $('#account').removeClass('email_to_info');

                    Client.track('purchase/emailIntegration/success');
                },
                failure: function(r) {
                    Sync.account();

                    var reason = (r && r.response && r.response.errorType) ?
                        r.response.errorType : 'failure';

                    Client.track('purchase/emailIntegration/' + reason);
                }
            });
        });
    };

    /*
        Purchase product

        {
            service
            product
        }
    */
    Page._purchaseSync = function(args) {
        var service = args.service,
            product = args.product || service[0];

        Sync.getServiceAuthUrl({service: service});
        Page.setRemoteSync({service: service});

        async.auto({
            getToken: function(go_on) {
                Sync.getProductToken({product: product + 'Sync'}, go_on);
            },
            loadGoog: function(go_on) {
                if (window.goog) return go_on();

                google.load('payments', '1.0', {
                    packages: ['production_config'],
                    callback: go_on
                });
            }
        },
        function(err, res) {
            if (err || !window.goog || !res.getToken) return Page.showError({status: 400});

            var trackPath = 'purchase/' + service.join('_') + '/';

            goog.payments.inapp.buy({
                jwt: res.getToken,
                success: function() {
                    Sync.account();
                    $('#account').removeClass(service.join('_') + '_sync_info');

                    Client.track(trackPath + 'success');
                },
                failure: function(result) {
                    Sync.account();

                    var reason = (result && result.response && result.response.errorType) ?
                        result.response.errorType : 'failure';

                    Client.track(trackPath + reason)
                }
            });
        });
    };

    /*
        Show service info

        {
            service
        }
    */
    Page.remoteSyncInfo = function(args) {
        $('#account').addClass(args.service.join('_') + '_sync_info');
    };

    Page.resetBufferPublish = function() {
        $('#metadata .buffer .dropdown-menu li').remove();

        $('#metadata .buffer a.primary')
            .attr('data-destination', 'facebook')
            .attr('data-params', null);

        ['Facebook', 'Twitter', 'Linkedin'].forEach(function(service) {
            var option = $('<li><a href="#"></a><i class="icon-' + 
                service.toLowerCase() + '"></i> ' + service + '</li>');

            option.attr('data-destination', service.toLowerCase());

            $('#metadata .buffer .dropdown-menu').append(option);
        });

        return Page;
    };

    Page.initBufferPublish = function() {
        if (!User.account || !User.account.buffer || !User.account.buffer.profiles) return;

        if (!User.account.buffer.profiles.length) return;

        $('#metadata .buffer .dropdown-menu li').remove();

        User.account.buffer.profiles.forEach(function(p, i) {
            if (!p.id || !p.service || !p.verb || !p.service_username) return;
            if (['linkedin', 'facebook', 'twitter'].indexOf(p.service) === -1) return;

            var option = $('<li><a href="#"></a></li>');

            option.find('a')
                .attr('data-destination', p.service)
                .attr('data-params', JSON.stringify({id: p.id}))
                .text(' ' + p.service_username);

            if (i === 0) $('#metadata .buffer a.primary')
                .attr('data-destination', p.service)
                .attr('data-params', JSON.stringify({id: p.id}))
                .text(p.formatted_service);

            option.find('a').prepend($('<i class="icon-' + p.service + '"></i>'));

            $('#metadata .buffer .dropdown-menu').append(option);
        });

        $('#metadata .buffer .dropdown-menu a').click(Events.clickPublishPost('buffer'));

        var accounts = User.account.buffer
    };

    Page.removeStack = function(stack) {
        Data.getNote({id: stack.data('id')}, function(err, note) {
            if (err || !note || !note.text) return;

            if (stack.data('trashing')) return;

            stack.data('trashing', true);

            stack.find('.confirm').remove();

            Page.trashNote(function(err, res) {
                stack.data('trashing', false);

                if (err) Client.log(err);
            });
        });

        Client.track('stacks/trash');
    };
})();