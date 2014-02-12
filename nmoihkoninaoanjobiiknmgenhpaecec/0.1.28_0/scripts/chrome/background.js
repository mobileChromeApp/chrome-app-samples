// EVENT PAGE

function contextMenuClickEvent(info) {
    if (info.menuItemId !== 'mn_chromeCreateNote') return;

    Data.addNote({}, function(err, row) {
        var text = '';

        if (info.linkUrl && /^http/.test(info.linkUrl))
            text+= info.selectionText + ' - ' + info.linkUrl + '';
        else
            text+= info.selectionText;

        if (info.pageUrl && /^http/.test(info.pageUrl))
            text+= '\n\n' + info.pageUrl + '';

        Data.editNote({text: text + '\n', id: row.id});
    });
}

chrome.contextMenus.onClicked.addListener(contextMenuClickEvent);

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: 'mn_chromeCreateNote',
        title: 'Note: %s',
        contexts: ['selection']
    });
});