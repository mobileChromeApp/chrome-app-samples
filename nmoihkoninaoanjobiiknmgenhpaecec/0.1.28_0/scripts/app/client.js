(function() { // Client
    Client.saveTyping = null;

    (function() { // Messages
        Client.messages = {
            publishing: {
                tumblr: {
                    published: 'Posting',
                    queue: 'Queueing',
                    draft: 'Saving'
                },

                wordpress: {
                    publish: 'Posting',
                    draft: 'Saving'
                },

                facebook: {
                    everyone: 'Posting',
                    all_friends: 'Posting',
                    self: 'Posting'
                },

                github: {
                    'public': 'Creating',
                    secret: 'Creating'
                },

                buffer: {
                    facebook: 'Buffering',
                    twitter: 'Buffering',
                    linkedin: 'Buffering'
                }
            },

            published: {
                tumblr: {
                    published: 'Posted',
                    queue: 'Queued',
                    draft: 'Saved'
                },

                wordpress: {
                    publish: 'Posted',
                    draft: 'Saved'
                },

                github: {
                    'public': 'Created',
                    secret: 'Created'
                },

                facebook: {
                    everyone: 'Posted',
                    all_friends: 'Posted',
                    self: 'Posted'
                },

                buffer: {
                    facebook: 'Buffered',
                    twitter: 'Buffered',
                    linkedin: 'Buffered'
                }
            }
        };
    })()

    Client.log = function(err, path) {
        if (!console || !console.log) return;

        if (err) console.log(err)

        if (err && err.status)
            return console.log('error/' + path + '/' + err.status + '/' + (err.statusText || ''));

        console.log(path);
    };

    Client.analytics = function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    };

    Client.track = function(path) {
        var e = ['_trackEvent'].concat(path.split('/'));

        _gaq.push(e);
    };

    Client.trackFailure = function(path, fail) {
        if (!path || !Array.isArray(fail)) return;

        var e = ['_trackEvent'].concat(path.split('/'));

        _gaq.push(e.concat(fail.join('/')));
    };

    Client.uuid = function(cbk) {
        async.auto({
            chrome: function(go_on) {
                if (localStorage.uuid || !window.chrome || !chrome.storage) return go_on();

                chrome.storage.sync.get('uuid', function(res) {
                    if (!res.uuid) return go_on();

                    localStorage.uuid = res.uuid;

                    go_on();
                });
            },

            create: ['chrome', function(go_on) {
                if (localStorage.uuid) return go_on();

                localStorage.uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
                function(c) {
                    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                    return v.toString(16);
                });

                if (window.chrome && chrome.storage)
                    chrome.storage.sync.set({uuid: localStorage.uuid});

                go_on();
            }],

            wait: function(go_on) { setTimeout(go_on, 500); }
        },
        function(err) {
            return err ? cbk(err) : cbk(null, localStorage.uuid);
        });
    };

    Client.profile = function() {
        var profile = {app: 'mn', count: {}};

        profile.version = 'MN_Chrome/' + (App.version || '0');
        profile.count.notes_visible = $('#stacks .stack:not(.notice)').length;

        return profile;
    };

    Client.getAnonNotice = function() {
        if (User.username || Client.wasLoggedIn) return;

        Client.uuid(function(err, uuid) {
            if (err || !uuid) return;

            var url = 'https://adylitica-sync.herokuapp.com/sync/v2/notices/' + uuid;

            var profile = Client.profile();

            if (!profile || !profile.count || !profile.count.notes_visible) return;

            $.ajax({
                url: url,
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('X-User-Profile', JSON.stringify(profile));
                },
                dataType: 'json',
                success: function(notice) {
                    if (!notice || User.email) return;

                    $.ajax({
                        accept: 'application/json',
                        contentType: 'application/json',
                        dataType: 'json',
                        processData: false,
                        statusCode: { 201: function() { Data.addAnonNotice(notice); } },
                        url: url,
                        timeout: 60 * 1000,
                        type: 'POST',
                        data: JSON.stringify({seen: notice.id})
                    });
                }
            });
        });
    };
})();
