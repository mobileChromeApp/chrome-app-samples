
var _gaq = _gaq || []; _gaq.push(['_setAccount', 'UA-52361-15']); _gaq.push(['_trackPageview']);

head.js(
    "/scripts/init.js",
    "/scripts/modules/async-0.2.8.js",
    "/scripts/modules/jquery-2.0.0.min.js",
    "/scripts/modules/bootstrap-2.3.2.min.js",
    "/scripts/modules/jquery.animate-colors.js",
    "/scripts/modules/jquery.indexeddb.js",
    "/scripts/modules/moment.lang.all-1.7.2.min.js",
    "/scripts/modules/moment-1.7.2.js",
    "/scripts/modules/prefixfree-1.0.7.min.js",
    "/scripts/app/client.js",
    "/scripts/app/data.js",
    "/scripts/app/events.js",
    "/scripts/app/sync.js",
    "/scripts/app/page.js"
);

head(function() { // Start
    Data.start(function(err) {
        if (err) return;

        if (!User.username) return Page.start();

        Page.authorized();
        Page.noteStacks(function() { Sync.start(); });
    });

    $('body').addClass('loaded');

    Client.analytics();

    if (window.chrome && chrome.storage) chrome.storage.sync.get('style', function(res) {
        if (res.style) Page.setStyle(res.style);
    });

    $.getJSON('/manifest.json', function(manifest) {
        try { App.version = manifest.version; }
        catch(e) { console.log('Bad manifest'); }
    });

    document.addEventListener('webkitvisibilitychange', Events.visibleDocument, false);

    $('#account .email').val(localStorage.username || '');

    Events.bind({
        paper_style: '#paper_type .paper',
        lock_note_checkbox: '#paper_type .lock_note',
        use_paper_button: '#paper_type .use_paper_set.btn',
        register_button: '#account #account_register',
        notes_section: '#notes',
        search_section: '#search',
        search_action: '#action_search',
        new_action: '#action_new',
        trash_action: '#action_trash',
        share_action: '#action_share',
        type_action: '#action_type',
        share_section: '#share',
        share_copy_button: '#share .copy',
        share_message_section: '#share .message',
        auth_section: '#account',
        logout_button: '#account .logout',
        account_button: '#email',
        font_style: '#style li',
        reset_password_button: '.reset_password',
        metadata_button: '#metadata .date.section',
        publish_button: '#metadata .publish .choose',
        mailing_list_checkbox: '#emailing .list',
        emailto_checkbox: '#emailing .email_to',
        info_button: '#account .info',
        error_message: '#account .error_message'
    });

$('#metadata .special .choose').change(Events.selectSpecial);

    ['tumblr', 'wordpress', 'github', 'facebook', 'buffer'].forEach(function(service) {
        $('#metadata .'+service+' .actions a').click(Events.clickPublishPost(service));
    });

    $('#emailing .purchase').click(Events.clickPurchase({service: ['emailIntegration']}));

    [['google', 'drive'], ['dropbox']].forEach(function(service) {
        var clickSync = Events.clickRemoteSyncCheckbox({
            service: service,
            priv: service.join(' ') === 'google drive' ? 'gdrive' : null
        });

        var clickPurchase = Events.clickPurchase({service: service});

        $('#sync .' + service.join('_')).click(clickSync);
        $('#sync .' + service.join('_') + ' .purchase').click(clickPurchase);
    });
});