(function() { // Sync
    var _lastPushAt = null,
        _requests = [];

    /*
        Make an authorized request to the sync service

        {
            json: {}
            body: ''
            method: ''
            url: ''
        }
    */
    var _req = function(args, cbk) {
        cbk = cbk || function() {};

        if (args.json) args.body = JSON.stringify(args.json);

        return $.ajax({
            data: args.body || null,
            type: args.method || 'GET',
            url: args.url,
            contentType: !!args.body ? 'application/json; encoding=UTF-8' : null,
            beforeSend: function(xhr) {
                User.authBlock = (localStorage.authBlock) ? localStorage.authBlock : 
                    btoa(User.username+':'+User.password);

                var profile = Client.profile();

                xhr.setRequestHeader('Authorization', 'Basic ' + User.authBlock);
                xhr.setRequestHeader('X-User-Profile', JSON.stringify(profile));
            }
        }).
        done(function(results, status, xhr) {
            cbk(null, results, status, xhr);
        }).
        fail(function(xhr) {
            cbk(xhr);
        });
    };

    var _cleanRequests = function() {
        _requests = _requests.filter(function(r) { return r.status === undefined; });
    };

    var _get = function(path, cbk) {
        _requests.push(_req({url: (Sync.SYNC_SERVER || '') + path+''}, cbk));
    };

    Sync.isReady = function() {
        return (Sync.SYNC_SERVER && User.username);
    };

    Sync.account = function(cbk) {
        cbk = cbk || function() {};

        var req = _req({url: Sync.SYNC_SERVER + '/v0/account/'}, function(err, account) {
            if (err || !account) return cbk(err);

            User.account = account;

            Page.setState('#emailing .email_to', !!account.email_integration);

            Page.setState('#emailing .mn_android',
                account.mailing_lists.indexOf('mn_android') !== -1);
            Page.setState('#emailing .mn_iphone',
                account.mailing_lists.indexOf('mn_iphone') !== -1);

            [['google', 'drive'], ['dropbox']].forEach(function(service) {
                Page.setRemoteSync({
                    service: service,
                    on: !!(account[service[0]] && account[service[0]].notes_sync)
                });
            });

            cbk(null, account);
        });

        _requests.push(req);

        return Sync;
    };

    Sync.start = function(args) {
        args = args || {};

        async.auto({
            service: function(go_on) {
                if (Sync.SYNC_SERVER) return go_on();

                _req({url: '/'}, function(err, server) {
                    if (err || !server || !server.SYNC_SERVER) return go_on({status: 404});

                    return go_on(null, server.SYNC_SERVER);
                });
            }
        },
        function(err, res) {
            if (err) Sync.SYNC_SERVER = 'https://notesweb.herokuapp.com';

            Sync.SYNC_SERVER = Sync.SYNC_SERVER || res.service;

            if (!Sync.SYNC_SERVER) return Page.showError('Could not connect to sync server');

            if (!User.username) return;

            if ($('body').length !== 1) return;

            async.series({
                register: function(go_on) {
                    if (!args.register) return go_on();

                    Page.authorizing();

                    _req({
                        method: 'POST',
                        url: Sync.SYNC_SERVER + '/v0/notes/',
                        body: '[]'
                    },
                    go_on);
                },

                get: function(go_on) {
                    if (!$('#stacks').length) return go_on();

                    Sync.account().get(go_on);
                },

                push: function(go_on) {
                    Sync.pushChanges({}, go_on);
                }
            },
            function(err) {
                if (err) Page.showError(err);
            });
        });
    };

    Sync.abortRequests = function() {
        _requests.forEach(function(req) { req.abort(); });
    };

    Sync.reset = function() {
        Sync.abortRequests();
        _lastPushAt = null;
        localStorage.removeItem('last_sync_at');
    };

    Sync.getProductToken = function(args, cbk) {
        _req({url: Sync.SYNC_SERVER + '/v0/product_tokens/' + args.product},
        function(err, tok) {
            return err ? cbk(err) : cbk(null, tok);
        });
    };

    Sync.pushChanges = function(args, cbk) {
        args = args || {};
        cbk = cbk || function() {};

        if (!Sync.isReady()) { cbk(); return Sync; }

        _cleanRequests();

        if (_requests.length !== 0) {
            setTimeout(function() { Sync.pushChanges({}, cbk); }, Math.random() * 2000);
            return Sync;
        }

//console.log('PUSHING CHANGES')

        async.auto({
            direct: function(go_on) { go_on(null, args.rows) },

            dirty: ['direct', function(go_on, res) {
                if (res.direct) return go_on();

                Data.getDirtyNotes({since: _lastPushAt}, go_on);
            }]
        },
        function(err, res) {
            if (err) return cbk(err);

            var notes = res.direct || res.dirty || [];

if (notes.length) console.log(notes.length, 'DIRTY NOTES MUST BE SYNCED', res)

            if (!notes.length) return cbk();

            var syncAt = new Date().toISOString();

            _lastPushAt = syncAt+'';

            var updates = Sync.updatesFromNotes(notes);

            if (!updates.length) return cbk();

            for (var i = 0, chunked = [], chunk = 5; i < updates.length; i += chunk)
                chunked.push(updates.slice(i,i+chunk));

            async.each(chunked, function(updateChunk, next) {
                _requests.push(_req({
                    method: 'POST',
                    url: Sync.SYNC_SERVER + '/v0/notes/',
                    body: JSON.stringify(updateChunk)
                },
                next));
            },
            function(err) {
                _cleanRequests();

                if (!_requests.length) _lastPushAt = null;

                if (err && err.status === 403) Page.logout({keep_notes: true});

                if (err) return cbk(err);

                Page.resetError();

                Data.markAsClean({notes: notes, before: syncAt}, function(err) {
                    if (err) return cbk(err);

                    Data.getDirtyNotes({}, function(err, res) {
                        if (err) return cbk(err);

                        Sync.pushChanges({}, cbk);
                    });
                });
            });
        });

        return Sync;
    };

    Sync.updatesFromNotes = function(notes) {
        var allowed = {
            id: true,
            text: true,
            text_last_modified: true,
            created_at: true
        };

        return notes.map(function(note) {
            var update = {};

            if (note.text && note.text.length > 30000)
                note.text = note.text.substring(0, 30000);

            for (var attr in note) if (allowed[attr]) update[attr] = note[attr];

            return update;
        });
    };

    Sync.get = function(cbk) {
        cbk = cbk || function(){};

        if (!Sync.isReady()) { cbk(); return Sync }; // Not logged in

        if (!$('#stacks').length) return Sync; // Not ready

        Page.authorizing();

        var api = localStorage.last_sync_at || '/v0/notes/',
            hasMoreResults,
            current_url;

        async.until(function() { return hasMoreResults === false; }, function(go_on) {
            _get(api, function(err, results, status, xhr) {
                if (err) return go_on(err);

                Page.authorized();
                localStorage.username = User.username;
                localStorage.authBlock = User.authBlock;

                var link = xhr.getResponseHeader('Link'),
                    next = (link) ? link.match(/<([^<]*)>; rel=.next./) : null,
                    current = (link) ? link.match(/<([^<]*)>; rel=.current./) : null;

                if (next && next.length === 2) api = next[1];
                else hasMoreResults = false;

                if (current && current.length === 2) current_url = current[1];

                if (!results) return go_on();

                async.each(results, Data.updateNote, function() {
                    Page.noteStacks();
                    go_on();
                });
            });
        },
        function(err) {
            if (err && err.status === 403) {
                Page.logout({keep_notes: true});

                cbk(err);
            }

            if (current_url) localStorage.last_sync_at = current_url;

            if (err) { cbk(err); return Page.showError(err); }

            Page.resetError();

            Client.log(null, 'sync/get');

            cbk();
        });

        return Sync;
    };

    // Toggle email integration
    Sync.toggleEmailIntegration = function(on) {
        Page.setState('#emailing .email_to');

        _req({
            method: on ? 'PUT' : 'DELETE',
            url: Sync.SYNC_SERVER + '/v0/email/'
        },
        function(err) {
            if (err) Page.showError(err);

            Sync.account();
        });
    };

    /*
        Toggle remote sync service

        {
            service
            on
        }
    */
    Sync.toggleRemoteSync = function(args) {
        if (!args.on) Sync.stopRemoteSync({service: args.service});

        Sync.remoteAuth({service: args.service}, function(err) {
            if (err) return;

            Sync.startRemoteSync({service: args.service});
        });
    };

    /*
        Toggle mailing list

        {
            list
            on
        }
    */
    Sync.toggleMailingList = function(args, cbk) {
        cbk = cbk || function(){};

        Page.setState('#emailing .' + args.list);

        if (args.on) Client.track('subscribe/' + args.list);

        _req({
            url: 'https://adylitica-auth.herokuapp.com/v0/mailing_list/' + args.list,
            method: (args.on === true) ? 'PUT' : 'DELETE'
        },
        function(err, r) {
            if (err) return cbk(err);

            Sync.account();
        });
    };

    /*
        Publish a note to a remote service

        {
            service
            content
            state
            [params]
        }
    */
    Sync.publishPost = function(args, cbk) {
        if (!User.account[args.service]) return cbk([404, 'account_details']);

        var params = {content: args.content},
            blog;

        switch (args.service) {
            case 'tumblr':
                if (!User.account.tumblr.primary_blog) break;

                blog = User.account.tumblr.primary_blog.name;
                params.format = User.account.tumblr.default_post_format || 'html';
                params.content = (params.format === 'html') ?
                    Page.linkify(args.content) : args.content;

                break;

            case 'wordpress':
                if (!User.account.wordpress.primary_blog) break;

                params.content = Page.linkify(args.content);
                blog = User.account.wordpress.primary_blog.name;

                params.format = 'html';
                break;

            case 'facebook':
                if (!User.account.facebook) break;

                blog = User.account.facebook.id;
                break;

            case 'github':
                if (!User.account.github) break;

                blog = 'gist';
                break;

            case 'buffer':
                // params->id specifies specific profile id
                if (args.params) {
                    try { blog = JSON.parse(args.params).id; } catch(e) { break; }
                }

                // Find a default service id if none was specified
                if (!blog && User.account.buffer && User.account.buffer.profiles.length) {
                    var services = User.account.buffer.profiles.filter(function(p) {
                        return p.service === args.service; });

                    if (services.length) blog = services[0].id;
                }

                break;
        }

        if (!blog) return cbk([404, 'missing_id']);

        _req({
            url: Sync.SYNC_SERVER+'/v0/publish/'+args.service+'/'+blog+'/posts/'+args.state,
            method: 'POST',
            json: params
        },
        function(err, r) {
            if (err) return cbk(err);

            cbk(null, r);
        });
    };

    /*
        Retrieve a url to authenticate with a service

        {
            service: []
        }
    */
    Sync.getServiceAuthUrl = function(args, cbk) {
        cbk = cbk || function(){};

        var service = args.service[0],
            authKey = service + 'AuthUrl';

        if (User[authKey]) return cbk(null, User[authKey]);

        _req({url: Sync.SYNC_SERVER + '/v0/authenticate/' + service + '/url'},
        function(err, r) {
            if (err) return cbk(err);
            if (!r || !r.url) return cbk([400, 'Invalid URL'])

            User[authKey] = r.url;

            setTimeout(function() { delete User[authKey]; }, 1000 * 60 * 30);

            cbk(null, User[authKey]);
        });
    };

    /*
        Enable syncing with remote service

        {
            service
        }
    */
    Sync.startRemoteSync = function(args) {
        Page.setRemoteSync({service: args.service});

        Sync.abortRequests();

        _req({method: 'PUT', url: Sync.SYNC_SERVER+'/v0/'+args.service.join('/')+'/notes'},
        function(err) {
            Page.setRemoteSync({service: args.service, on: !err});

            if (err) return;

            Sync.account();

            setTimeout(Sync.get, 20 * 1000);
        });
    };

    /*
        Start auth process against a remote service provider

        {
            service
        }
    */
    Sync.remoteAuth = function(args, cbk) {
        var oauth = window.open();

        Sync.getServiceAuthUrl({service: args.service}, function(err, url) {
            if (err || !url) {
                cbk(err);
                oauth.close();
                return;
            }

            oauth.location = url;

            var checkOAuth = setInterval(function() {
                if (!oauth.closed) return;

                delete User[args.service[0] + 'AuthUrl'];
                clearInterval(checkOAuth);

                cbk();
            },
            200);
        });
    };

    /*
        Disable remote service syncing

        {
            service
        }
    */
    Sync.stopRemoteSync = function(args) {
        Page.setRemoteSync({service: args.service});

        Client.track('account/' + args.service.join('_') + '/off');

        Sync.abortRequests();

        _req({
            url: Sync.SYNC_SERVER + '/v0/' + args.service.join('/') + '/notes',
            method: 'DELETE'
        },
        function(err) {
            Page.setRemoteSync({service: args.service, on: !!err});

            Sync.account();
        });
    };
})();