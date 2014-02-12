(function() { // DOM Events
    Events.stopDefault = function(e) {
        e.preventDefault();
    };

    Events.keyupSearchSection = function() {
        Data.search({q: $('#search input').val()}, function(err, results) {
            if (err) return Client.log(err);

            Page.showSearchResults(results);
        });
    };

    Events.submitSearchSection = Events.stopDefault;

    Events.keydownDocument = function(e) {
        if (!e.which) return;

        if (e.which === 9 && $(e.target).is("#notes")) {
            var selection = window.getSelection(),
                range = selection.getRangeAt(0),
                space = document.createTextNode('\u00a0\u00a0');
                range.deleteContents();
                range.insertNode(space);

                range.setStartAfter(space);
                range.setEndAfter(space);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);

            return Events.stopDefault(e);
        }

        if (!e.ctrlKey) return;

        var c = String.fromCharCode(e.which);

        if (c === 'N') return Events.clickNewAction();
        if (c === 'S') { Page.save(); e.preventDefault(); return; }
    };

    // Typing in notes section
    Events.keyupNotesSection = function() {
        clearTimeout(Client.saveTyping);

        var selectedStack = $('#stacks .selected'),
            noteText = Page.note();

        selectedStack.
            toggleClass('empty', noteText === '').
            find('.title').text(Page.stackTitle(noteText));

        $('#stacks .confirm').removeClass('appear');

        var timeout = selectedStack.index() === 0 ? 500 : 100;

        Client.saveTyping = setTimeout(function() {
            Page.save();
            clearTimeout(Client.saveTyping);
        },
        timeout);

        if (!this.lastChild || this.lastChild.nodeName.toLowerCase() !== 'br')
            $(this).append($('<br>'));
    };

    // Click on the search action button
    Events.clickSearchAction = function() {
        $('#action_search').toggleClass('btn-primary').find('i').toggleClass('icon-white');
        $('#search').toggleClass('active');

        $('#stacks .confirm').removeClass('appear');

        if (!$('#search').is('.active')) {
            $('#search input').val('');
            Events.keyupSearchSection();
        }

        setTimeout(function() {
            $('#search input')[$('#search').is('.active') ? 'focus' : 'blur'](); }, 300);

        Client.track('stacks/search/' + ($('#search').hasClass('active') ? 'on' : 'off'));
    };

    Events.clickNewAction = function() {
        Page.hideSearch();

        $('#stacks').animate({scrollTop: 0}, 200);

        clearTimeout(Client.saveTyping);

        async.auto({
            save: Page.save,
            note: ['save', function(go_on) { Data.addNote({}, go_on); }]
        },
        function(err, res) {
            return (err) ? Page.showError(err) : Page.focus(res.note);
        });

        Client.track('stacks/new');
    };

    // Change in visibility of document
    Events.visibleDocument = function() {
        if (document.webkitHidden) return;

        Page.noteStacks();

        if (User.loggedIn) Sync.get();

        Data.getNote({id: Page.noteId()}, function(err, note) {
            if (err || !note) return;

            if (Page.note() !== note.text) Page.note(note.text);
        });
    };

    Events.clickNoteStack = function() {
        var selected = $('#stacks .selected'),
            stack = $(this),
            id = stack.data('id')+'';

        if (id === Page.noteId()) return;

        if ($('#paper_type').is('.active')) Events.clickTypeAction();

        $(this).addClass('highlight');

        async.auto({
            get: function(go_on) { Data.getNote({id: id}, go_on)},

            animate: ['get', function(go_on, res) {
                if (id === Page.noteId() || Page.note() !== '')
                    return go_on();

                selected.addClass('removed');
                stack.addClass('selected');

                setTimeout(go_on, 200);
            }],

            save: ['animate', function(go_on) {
                return (id === Page.noteId()) ? go_on() : Page.save(go_on);
            }]
        },
        function(err, res) {
            if (err) return Page.showError(err);

            Page.focus(res.get);
        });

        Client.track('stacks/select/note_' + stack.index());
    };

    Events.clickRegisterButton = function(e) {
        localStorage.clear();
        Page.setAuthError();
        if ($('#account').is('.registering')) return $('#account').submit();

        $(this).text('Register');
        $('#account').addClass('registering');

        Client.track('account/register');
    };

    Events.clickShareAction = function() {
        $('#share').modal();
        $('#share h3 .title').text(Page.stackTitle(Page.note()))
        $('#share .preview .content').text(Page.note());
        $('#share .message, #share .emails').val('');
    };

    // On the share modal, click the button to send a copy
    Events.clickShareCopyButton = function() {
        var text = Page.note();

        text+= '\n\nSent from Memo Notepad\nhttp://memonotepad.com';

        var message = $('#share .message').val() || '';

        if (message.length) message+= '\n\n';

        var emails = $('#share .emails').val().split(' ').join(', ');

        var title = Page.stackTitle(text).substring(0, 75);

        var link = 'mailto:' + encodeURIComponent(emails)
            + '?subject=' + encodeURIComponent(title)
            + '&body=' + encodeURIComponent(message) + encodeURIComponent(text);

        var mailto = window.open(link);
        setTimeout(function() { mailto.close(); }, 200);

        Client.track('stacks/share');
    };

    Events.clickTrashAction = function(e) {
        $('#notes').focus();
        $('#stacks .confirm').remove();

        var confirm = $('<button><i class="icon-trash"></i></button>'),
            stack = $('.selected.stack:eq(0)');

        if (stack.is('.empty')) return;

        confirm.addClass('span4 confirm trash btn pull-right');

        confirm.click(function(e) {
            e.stopPropagation();

            Page.removeStack(stack);
        });

        stack.find('.title').removeClass('span12').addClass('span8');
        stack.append(confirm);

        setTimeout(function() { confirm.addClass('appear'); }, 20);
    };

    Events.clickFontStyle = function() {
        var type = $(this).data('type');

        Page.setStyle(type);

        if (window.chrome && chrome.storage) chrome.storage.sync.set({style: type});

        Client.track('account/style/' + type);
    };

    Events.clickLogoutButton = function() {
        Data.getDirtyNotes({}, function(err, res) {
            if (!err && res.length) {
                Page.showError({status: 'lose_data_warning'});
                return Sync.pushChanges();
            }

            Page.logout({});
        });

        Client.track('account/logout');
    };

    Events.submitAuthSection = function(e) {
        e.preventDefault(); e.stopPropagation();

        var email = $('#account .email').val(),
            password = $('#account .password').val();

        if (!email)
            return Page.authFail({status:'missing_email'});
        if (!password)
            return Page.authFail({status:'missing_password'});
        if ($('#account').is('.registering') && !EMAIL_MATCH.test(email))
            return Page.authFail({status: 'invalid_email'});

        User.username = email;
        User.password = $('#account .password').val();

        Page.setAuthError();

        Sync.start({register: $('#account').is('.registering')});

        Client.track('account/authenticate/' +
            ($('#account').hasClass('registering') ? 'register' : 'login'));
    };

    // Scrolling in notes section
    Events.scrollNotesSection = function() {
        $('#paper').css('background-position-y', -3 - $('#notes').scrollTop());
    };

    // Pasting in notes section
    Events.pasteNotesSection = function(e) {
        e.preventDefault();

        var text = e.originalEvent.clipboardData.getData('Text').split('\n');

        var selection = window.getSelection(),
            range = selection.getRangeAt(0);

        range.deleteContents();

        var div = document.createElement('div');

        range.insertNode(div);

        text.forEach(function(t, i) {
            var textNode = document.createTextNode(t.replace(/ /g, '\u00A0')),
                br = null;

            if (text.length > 1) {
                br = document.createElement('br');
                range.insertNode(br);
            }

            range.insertNode(textNode);

            range.setStartAfter(br || textNode);
            range.setEndAfter(br || textNode);

            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        });

        // Scroll down if necessary
        var cursorPosition = $(div).position().top,
            scrollTop = $('#notes').scrollTop(),
            visibleDistance = cursorPosition - $('#notes').height() + scrollTop + 15,
            bottomDistance = $('#notes').height() - cursorPosition;

        if (visibleDistance && bottomDistance < 20)
            $('#notes').animate({scrollTop: visibleDistance}, 50);

        $(div).remove();

        Page.save();
    };

    Events.clickPublishPost = function(service) {
        return function(e) {
            var publish = {
                noteId: Page.noteId()+'',
                destination: $(this).attr('data-destination')+'',
                params: $(this).attr('data-params') || null,
                content: Page.note()+''
            };

            if ($(this).is('.dropdown-toggle')) return true;

            Events.stopDefault(e);

            if (!publish.content) return Page.showError({status: 'publish_no_content'});

            async.auto({
                getPostContent: function(go_on) {
                    var post = {content: Page.note()+''};

                    return (publish.noteId && publish.destination && post.content) ?
                        go_on(null, post) : go_on([0, 'Invalid post content']);
                },

                addProcessingLabel: function(go_on) {
                    var processing = $('<a/>');

                    $('#metadata .' + service + ' label').after(processing);

                    Client.track('share/' + service + '/' + publish.destination);

                    processing.addClass('btn btn-large btn-primary processing');

                    $('#metadata .' + service).addClass('processing');
                    $('#metadata .' + service + ' .processing').text('Connecting...');

                    go_on();
                },

                auth: function(go_on) {
                    return (User.account && User.account[service + '_auth']) ?
                        go_on() : Sync.remoteAuth({service: [service]}, go_on);
                },

                account: ['auth', function(go_on) {
                    var state = Client.messages.publishing[service][publish.destination];

                    $('#metadata .' + service + ' .processing').text(state + '...');

                    return (User.account && User.account[service]) ?
                        go_on() : Sync.account(go_on);
                }],

                post: ['account', 'getPostContent', function(go_on, res) {
                    Sync.publishPost({
                        service: service,
                        content: res.getPostContent.content,
                        state: publish.destination,
                        params: publish.params
                    },
                    go_on);
                }]
            },
            function(err, res) {
                // Client has shifted away from this note
                if (Page.noteId() !== publish.noteId) return;

                if (err) {
                    Client.trackFailure('share/' + service, err);

                    var message = (err && err.length === 2) ?
                        [err[0], service, err[1]].join('_') : service+'_post_failure';

                    return Page
                        .resetExtraActions()
                        .showError({status: message});
                }

                Client.track('share/' + service + '/success');

                var state = Client.messages.published[service][publish.destination];

                $('#metadata .' + service + ' .btn.processing')
                    .prop('target', '_blank')
                    .prop('href', res.post.url || res.post.edit_url)
                    .text(state+'.');
            });
        };
    };

    Events.selectSpecial = function(e) {
        Page.resetExtraActions();

        var special = $(this).val();

        $('#metadata').addClass(special);

        Events.stopDefault(e);

        $(this).val('none').blur();
    };

    // Select publish service
    Events.changePublishButton = function(e) {
        Page.resetExtraActions();

        var selectedService = $(this).val(),
            knownServices = ['facebook', 'tumblr', 'wordpress', 'github', 'buffer'];

        if (knownServices.indexOf(selectedService) !== -1) {
            Client.track('share/' + selectedService + '/init');
            $('#metadata').addClass(selectedService);
        }

        if (selectedService === 'buffer') Page.initBufferPublish();

        Events.stopDefault(e);

        $(this).val('none').blur();
    };

    Events.clickMetadataButton = function(e) {
        Events.stopDefault(e);

        if ($('#account').is('.options')) Events.clickAccountButton(e);

        $('#metadata').toggleClass('active');

        if (!$('#metadata').is('.active')) Page.resetExtraActions();
    };

    // Click on name to toggle account details
    Events.clickAccountButton = function(e) {
        if (!User.loggedIn) return;

        if ($('#metadata').is('.active')) Events.clickMetadataButton(e);

        $('#account')
            .toggleClass('options')
            .removeClass('google_drive_sync_info email_to_info dropbox_sync_info');

        Client.track('account/settings');

        Sync.account();
    };

    // Click forgot password button
    Events.clickResetPasswordButton = function() {
        Page.showError({status: 'password_reset_sent'});

        var url = 'https://adylitica-sync.herokuapp.com/sync/v2/reset_password',
            email = $('#email .email').val();

        if (!EMAIL_MATCH.test(email)) return;

        $.get(url+'?email='+encodeURIComponent(email));

        Client.track('account/authenticate/reset');
    };

    // Append a new line when there is a keypress on notes section
    Events.keypressNotesSection = function(e) {
        if (e.which !== 13 || !window.getSelection) return null;

        var selection = window.getSelection(),
            range = selection.getRangeAt(0),
            br = document.createElement('br');
            range.deleteContents();
            range.insertNode(br);

            var div = document.createElement('div');
            range.insertNode(div)

            range.setStartAfter(br);
            range.setEndAfter(br);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);

        // Scroll down if necessary

        var cursorPosition = $(div).position().top,
            scrollTop = $('#notes').scrollTop(),
            visibleDistance = cursorPosition - $('#notes').height() + scrollTop + 15,
            bottomDistance = $('#notes').height() - cursorPosition;

        if (visibleDistance && bottomDistance < 20)
            $('#notes').animate({scrollTop: visibleDistance}, 50);

        $(div).remove();

        return false;
    };

    // Add an empty line when done typing in notes section
    Events.mouseupNotesSection = function() {
        if (!this.lastChild || this.lastChild.nodeName.toLowerCase() !== 'br')
            $(this).append($('<br>'));
    };

    Events.action = function(name) {
        switch (name) {
            case 'settings':
                $('#account').addClass('options');
                break;
            case 'new':
                Events.clickNewAction();
                break;
            case 'email':
                Events.clickShareAction();
                break;
            case 'search':
                Events.clickSearchAction();
                break;
            case 'delete':
                Events.clickTrashAction();
                break;
            default:
                break;
        }

        return false;
    };

    // Clicks something in the notes section
    Events.clickNotesSection = function(e) {
        var target = $(e.target);

        if (target.is('i')) target = target.closest('a');

        var href = target.attr('href');

        if (/^memonotepad:/.test(href)) return Events.action(href.substring(14));

        if (!target.is('a')) return;

        window.open(href, '_blank');

        Client.track('note/anchor');
    };

    // Hover over the notes section
    Events.hoverNotesSection = function(e) {
        var target = $(e.target);

        if (!target.is('a')) return;

        target.css('cursor', 'pointer');
    };

    // Click to get information about some feature
    Events.clickInfoButton = function(e) {
        Events.stopDefault(e);

        var id = $(this).data('id')+'';

        var text = {
            email: [
            'Memo Notepad: Notes Via Email',
            '',
            'Enabling this option allows notes to be added via email',
            '',
            'Send an email to note@memonotepad.com and it will appear as a new note!',
            '',
            'This lets you send notes to your notepad from anywhere.',
            '',
            'Tips:',
            '1. You must send email from your email address: ' + User.username,
            '2. It may take a few minutes for email to appear.',
            '3. If your email cannot be automatically confirmed, you must reply to confirm.'
            ],
            google: [
            'Memo Notepad: Google Drive Sync',
            '',
            'Google Drive sync keeps your notes in sync with your Google Drive.',
            '',
            'Every time you add or edit a note on Memo Notepad, it will sync to GDrive.',
            '',
            'If you edit a note on Google Drive, it will also sync back to Memo Notepad.',
            '',
            'Tips:',
            '1. Memo Notepad will create a new folder for your notes in your GDrive',
            '2. Notes are saved to your Google Drive as plain .txt files',
            '3. Google may not allow you to view plain .txt, but many apps support .txt'
            ],
            dropbox: [
            'Memo Notepad: Dropbox Sync',
            '',
            'Dropbox sync keeps your notes in sync with your Dropbox.',
            '',
            'Every time you add or edit a note on Memo Notepad, it will sync to Dropbox.',
            '',
            'If you add or edit a note on Dropbox, it will also sync back to Memo Notepad.',
            '',
            'Tips:',
            '1. You can save txt files in your Memo Notepad director to add new notes.',
            '2. All notes are saved to your Dropbox folder as plain .txt files.',
            '3. You can view and take your notes mobile using Dropbox iOS/Android.'
            ],
            android: [
            'Memo Notepad for Android',
            '',
            'A Memo Notes App for Android is coming that will bring easy notes to Android!',
            '',
            'It is not ready yet, but we can send you Email with news about its release.',
            '',
            'We have some big goals for this app:',
            '1. Cloud Syncing, keeping your notes backed up and in sync.',
            '2. Great support for a lot of Android phones.',
            '3. Simple and easy design.',
            '',
            'Ideas for the Android App? Let us know at web-support@adylitica.com'
            ],
            iphone: [
            'Memo Notepad for iPhone',
            '',
            'An iPhone App is on its way, that will bring Memo Notepad to the App Store!',
            '',
            'We are still hard at work on it, but we can let you know via Email about the release',
            '',
            'Our goals for the iPhone App',
            '1. Super easy, fast and clean design, just let your thoughts hit the page.',
            '2. Cloud Sync that just works: save, sync and backup without any hassle.',
            '3. Great sharing options as well as full support for iOS6 sharing.',
            '',
            'Ideas for the iPhone App? Let us know at web-support@adylitica.com'
            ]
        }[id];

        if (!text) return;

        Data.addNote({text: text.join('\n')}, function(err, note) {
            if (err) return;

            Client.track('info/' + id);

            Page.focus(note);
        });
    };

    // Click to toggle mailing list subscription
    Events.clickMailingListCheckbox = function(e) {
        if ($(e.target).is('.info')) return Events.stopDefault(e);

        var id = $(this).data('id');

        Sync.toggleMailingList({
            list: id,
            on: User.account.mailing_lists.indexOf(id) === -1
        });
    };

    // Click to toggle Email Integration
    Events.clickEmailtoCheckbox = function(e) {
        if ($(e.target).is('.info')) return Events.stopDefault(e);

        if (User.account.privs.indexOf('email') === -1)
            return $('#account').addClass('email_to_info');

        Sync.toggleEmailIntegration(!User.account.email_integration);
    };

    /*
        Click remote sync service checkbox

        {
            service
            priv
        }
    */
    Events.clickRemoteSyncCheckbox = function(args) {
        return function(e) {
            if ($(e.target).is('.info')) return Events.stopDefault(e);

            var service = args.service,
                priv = args.priv || service[0];

            if (!User.account || !User.account.privs) return;

            // Turn off sync
            if (User.account[service[0]] && User.account[service[0]].notes_sync) {
                Sync.toggleRemoteSync({service: service, on: false});

                return;
            }

            // Tell user about remote sync
            if (User.account.privs.indexOf(priv) === -1) {
                Client.track('purchase/' + priv + '/info');

                return Page.remoteSyncInfo({service: service});
            }

            // Turn on remote sync
            Client.track('account/' + priv + '/on');
            Sync.toggleRemoteSync({service: service, on: true});
            Page.setRemoteSync({service: service});
        };
    };

    /*
        Click confirm purchase remote sync

        {
            service
        }
    */
    Events.clickPurchase = function(args) {
        return function(e) {
            e.preventDefault(); e.stopPropagation();

            Client.track('purchase/' + args.service.join('_') + '/confirm');

            if (window.google) return Page['purchase_' + args.service.join('_')]();

            $.ajax({
                url: 'https://www.google.com/jsapi?callback=Page.purchase_' +
                    args.service.join('_'),
                type: 'GET',
                crossDomain: true,
                dataType: 'jsonp',
                success: function() { },
                error: function() { },
            });
        };
    };

    // Share modal is shown
    Events.shownShareSection = function() {
        $('#share .emails').focus();
    };

    // Share modal message scroll
    Events.scrollShareMessageSection = function() {
        $(this).css('background-position-y', -4 - $(this).scrollTop());
    };

    // Click on the error message
    Events.clickErrorMessage = function() {
        Page.resetError;
    };

    // Select a paper style
    Events.clickPaperStyle = function() {
        $('#paper').data('paper_type', 'dark_' + $(this).index());

        Page.updatePaperType();
        Page.setStyle(Client.style);
    };

    // Click to toggle note locking
    Events.clickLockNoteCheckbox = function() {
        var checkbox = $('#paper_type .lock_note .toggle');

        checkbox.toggleClass('icon-check-empty icon-check');

        $('#paper').data('locked', checkbox.is('.icon-check'));
    };

    // Click use paper button
    Events.clickUsePaperButton = function() {
        var paper = $('#paper').data('paper_type'),
            locked = !!$('#paper').data('locked');

        if (!paper) return;

        Data.editNote({
            id: Page.noteId(),
            paper: paper,
            locked: locked
        },
        function(err, note) {
        });
    };

    // Click to select a special paper
    Events.clickTypeAction = function() {
        $('#action_type').toggleClass('btn-primary').find('i').toggleClass('icon-white');
        $('#paper_type').toggleClass('active');
        $('#stacks .confirm').removeClass('appear');

        if ($('#paper_type').not('.active')) {
            Data.getNote({id: Page.noteId()}, function(err, note) {
                if (note) Page.focus(note);
            });
        }
    };

    // Turns name_name_name into nameNameName
    var _camelCase = function(str) {
        return str
            .replace(/(?:^|[\s_])[a-z]/g, function(match) { return match.toUpperCase(); })
            .replace(/_/g, '');
    };

    var _EVENT_TYPES = ('click scroll keyup keypress paste submit shown change hover ' +
        'mouseup').split(' ');

    /*
        Bind event selectors - automatically bind all eventBindingName events

        Ex: {cool_button: #cool_button} will map Events.clickCoolButton

        This is because of the naming convention of all events: $eventThingName

        {
            binding: 'selector'
        }
    */
    Events.bind = function(bindings) {
        $(document).keydown(Events.keydownDocument);

        for (var toBind in bindings) {
            _EVENT_TYPES.forEach(function(eventName) {
                if (Events[eventName + _camelCase(toBind)] === undefined) return;

                $(bindings[toBind]).on(eventName, Events[eventName + _camelCase(toBind)]);
            });
        }
    };
})();