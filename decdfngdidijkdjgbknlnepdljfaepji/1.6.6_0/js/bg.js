var DB,TAB;
//var updateTheItem = false;
var getI18nMsg = chrome.i18n.getMessage;
var util={
	page:function(info,tab){
		if (tab.url.match(/https?:\/\/*\/*/gi)==null) {
			alert('Can\'t save local  page!');
			return;
		}
		TAB=tab;
		var title = tab.title;
		
		//util.gethtml(tab.url);
		var regex = /.*\:\/\/([^\/]*).*/;
		var match = tab.url.match(regex);
		if(typeof match != "undefined" && null != match)  var host= match[1];
		
		switch(host){
			case 'lifehacker.com':
			case 'www.lifehacker.com':
			case 'kotaku.com':
			case 'www.kotaku.com':
			case 'gizmodo.com':
			case 'www.gizmodo.com':
			case 'facebook.com':
			case 'www.facebook.com':
			case 'gawker.com':
			case 'www.gawker.com':
				sendRequest('tab', TAB.id, {action:'get_item'});
				break;
			default:
				var regex_GR = /google.com\/reader/;
				var match_GR = tab.url.match(regex_GR);
				if(typeof match_GR != "undefined" && null != match_GR)
				googleReader(tab);
				else
				util.savetitle(tab.url,tab.url,'page');
		}
		
		
		
		//util.savetitle(tab.url,tab.url,'page');
	},
	link:function(info,tab){
		if (info.linkUrl.match(/https?:\/\/*\/*/gi)==null) {
			alert('Can\'t save local  page!');
			return;
		}
		TAB=tab;
		var title = info.linkUrl;  //for test

		//util.gethtml(info.linkUrl);
		
		util.savetitle(info.linkUrl,title,'link');
	},
	
	savetitle:function(url,title,type){
		
		//chrome.tabs.executeScript(TAB.id, {file: 'js/contentScript.js'});
		
		var updateTheItem = false;
		
		DB.transaction(function(tx){
			tx.executeSql(
				'SELECT id FROM items WHERE url=?',[url],
				function(tx,ds){
					if(ds.rows.length){
						if (confirm(getI18nMsg('updatepage'))){
                            var itemId = ds.rows.item(0).id;
                            //update item set the sync_s =0
                            tx.executeSql("UPDATE diigo SET sync_s = 0 WHERE local_id=?",
                                [itemId],
                                function(tx,ds){
                                    util.gethtml(url,1);
                                    sendRequest('tab', TAB.id, {action:'saved_'+type});
                                    if(JSON.parse(localStorage['saveclosetab']).enable ==1 && type=='page'){
                                        chrome.tabs.remove(TAB.id);
                                    }
                                }
                            );
						}else{
							return;
						}
					}else{
						
						tx.executeSql(
							'INSERT INTO items (url, title, clean, full, state, favicon, desc, list) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', 
							[ url, title, '', '', '',getFavicon(url), '', 'inbox' ],
							function(tx,ds){
								//console.log(ds);
								//add new items id into diigo table.
								if(localStorage['diigo']){
									tx.executeSql('INSERT INTO diigo (local_id,user_id) VALUES (?,?);', [ds.insertId,JSON.parse(localStorage['diigo']).user_id]);
								}else{
									tx.executeSql('INSERT INTO diigo (local_id) VALUES (?);', [ds.insertId]);
								}
								
								
								var tabViews = chrome.extension.getViews({type: 'tab'});
								for (var i=0, len=tabViews.length; i<len; i++) {
									var win = tabViews[i];
									if(win.$('body').attr('class')=='inbox'){
										win.$('#top').html('<div id="toppanel"><span class="check" ><input type="checkbox" name="checkall" /><!--<div><ul><li>all</li><li>none</li><li>read</li><li>unread</li></ul></div>--></span><span class="archive">'+getI18nMsg('archive')+'</span><span class="restore">'+getI18nMsg('unread')+'</span><span class="delete">'+getI18nMsg('delete')+'</span><!--<span class="markread">mark as read</span><span class="markunread">mark as unread</span>--><cite class="errormessage">'+getI18nMsg('noselected')+'</cite><cite id="headerMiddle"></cite></div>');
									}
									win.loadItem(ds.insertId, win.buildItem);
									//win.initApp();
									win.toppanelController.init();
									win.initListsBadge();
								}
								sendRequest('tab', TAB.id, {action:'saved_'+type});
								
								if(JSON.parse(localStorage['saveclosetab']).enable ==1 && type=='page'){
									chrome.tabs.remove(TAB.id);
								}
								
								util.gethtml(url,1);
							}
						);
						
					}
				}
			)
		},error);
	},
	
	
	gethtml:function(url,ct){
		var urlexpand = 'http://api.longurl.org/v2/expand';
		
		$.ajax({
			url:url,
			type:'GET',
			dataType:'html',
			//timeout:7000,
			success:function(data){
				if(data.length<10){
					geterror();
				}else{
					if(url.length<30){
						$.ajax({
							url:urlexpand,
							datatype:'json',
							data:{url:url,format:'json'},
							success:function(expandurl){
								var baseurl = expandurl["long-url"];
								var html = data.replace('<head>','<head><base href='+baseurl+' target="_blank">');   //replace the URL base for assets.
								storeItem(html,url,true,ct);
							},
							error:function(e){
								var html = data.replace('<head>','<head><base href='+url+' target="_blank">');
								storeItem(html,url,true,ct);
							}
						});
					}else{
						var html = data.replace('<head>','<head><base href='+url+' target="_blank">');
						storeItem(html,url,true,ct);
					}
					
					
					
				}
				},	
			error:function(e){geterror();}
		});
		
		function geterror(){
			//sendRequest('tab', TAB.id, {action:'save_error'});
			//console.log('ajax get error');
			var html='</p>The web page can\'t be downloaded. Please open it in the new tab</p><a target="_blank" href="'+url+'">'+url+'</a>';
			storeItem(html,url,true);
		}
		
		
	}
	
	
}


function getFavicon(url){
    var regex = /.*\:\/\/([^\/]*).*/;
    var match = url.match(regex);
    if(typeof match != "undefined" && null != match) host = match[1];
    var favicon = 'https://www.google.com/s2/favicons?domain='+host;  //use google api get favicon //please use https;
    if (host){
        try{
            requestFile(favicon, function(r) { favicon = makeDataUrl(r.contentType, r.data); }, true);
        }catch(e){
            favicon = '';
        }

    }else{
        favicon = '';
    }
    return favicon;
}

function updateIconBadge() {
	DB.transaction(function(tx) {
		tx.executeSql(
			'SELECT COUNT(*) FROM items WHERE state<>? ', 
			['reading'], 
			//function(tx, ds) { setIconBadge(ds.rows.item(0)['COUNT(*)']); }
			function(tx,ds){ sendBadageText(ds.rows.item(0)['COUNT(*)']);}
		);
	}, error);
}

function sendBadageText(text){
	if (text==0) text= '';
	//send message to Reader Later Extension .
	//chrome.extension.sendRequest(RLExtensionId, {RLauth:'readlaterAPP',text:text});
}

function sendRequest(type, where, request) {
	switch(type) {
	case 'tab':
		chrome.tabs.sendRequest(where, request);
		break;
	}
}

function storeItem(html,url,updateTheItem,ct){

    //ct means to update the title , beacuse we save a link will save the url for title first that can shwo in app,
    // then get the full html by aysnc. so if ct==1 we can know the bookmark is create by client (diff with the server);
	DB.transaction(
		function(tx){
			

			function gettitle(html){
				var regex = /<title>([\s\S]*?)<\/title>/i;
				match = html.match(regex);
				if(match){
					title = match[1];
				}else{
					title = url;
				}
				return title;
			}
			
			function callback(tx,ds){
				return;
			}
			
			if(updateTheItem){
				updateTheItem = false;
				tx.executeSql('SELECT id,list,title FROM items WHERE url=?',[url],function(tx,ds){
					var item = ds.rows.item(0);
					var itemId = item.id;
					var list = item.list;
					var state = item.state;
					if(ct==1){
						var title = gettitle(html);
					}else{
						var title = ds.rows.item(0)['title'];
					}
					tx.executeSql(
						'UPDATE items SET full=?, state=?,title=? WHERE url=?',
						[html,'',title,url],
						function(tx,ds){
							if(localStorage['diigo'] && ct==1){
								Diigo.syncBegin(1);
							}
							var tabViews = chrome.extension.getViews({type:'tab'});
							for (var i=0, len=tabViews.length; i<len; i++) {
								var win = tabViews[i];

								//check if the updated item is showing in current focused list
								if (win.$('body').hasClass(list)) {
									var $item = win.$('li.item[itemID='+itemId+']');
									$item.removeClass('reading');
									win.updateItem(itemId,title,url);
									//if (list!='inbox') $item.remove();
								} else {
									//if (win.$('body').hasClass('inbox')) win.loadItem(itemId, win.buildItem);
								}

								//if (state=='reading') win.numberController.badge(win.$(list), win.$('#inbox'));
								win.numberController.header();
								//win.$('#top').html('<div id="toppanel"><span class="check" ><input type="checkbox" name="checkall" /><div><ul><li>all</li><li>none</li><li>read</li><li>unread</li></ul></div></span><span class="archive">archive</span><span class="restore">restore</span><span class="delete">delete</span><span class="markread">mark as read</span><span class="markunread">mark as unread</span><cite class="errormessage">No conversations selected.</cite><cite id="headerMiddle">1 unread of 99</cite></div>');
								//win.initApp();
								win.toppanelController.init();
								//win.initListsBadge();
								win.adjustUI();
							}

						},error
					);
				},function(e){console.log(e);});
			}
			
			
			/*else{
				updateTheItem = false;
				tx.executeSql(
					'INSERT INTO items (url, title, clean, full, state, favicon, desc, list) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', 
					[ url, gettitle(html), '', html, '',getFavicon(url), '', 'inbox' ],
					function(tx,ds){
						var tabViews = chrome.extension.getViews({type: 'tab'});
						for (var i=0, len=tabViews.length; i<len; i++) {
							var win = tabViews[i];
							win.$('#top').html('<div id="toppanel"><span class="check" ><input type="checkbox" name="checkall" /><div><ul><li>all</li><li>none</li><li>read</li><li>unread</li></ul></div></span><span class="archive">archive</span><span class="restore">restore</span><span class="delete">delete</span><span class="markread">mark as read</span><span class="markunread">mark as unread</span><cite class="errormessage">No conversations selected.</cite><cite id="headerMiddle">1 unread of 99</cite></div>');
							win.loadItem(ds.insertId, win.buildItem);
							//win.initApp();
							win.toppanelController.init();
							win.initListsBadge();
							
						}
						
							sendRequest('tab', TAB.id, {action:'saved_item'});

					}
				);
			}*/
		}
		,error
	);
}




function error(e) { console.log('DRL error: '+e.message); }

//data storage
DB = openDatabase('readlater', '', 'Diigo Read Later', 5*1024*1024, 
	function(d) {
		d.transaction(function(tx) {
			tx.executeSql('CREATE TABLE items ('
				+'id INTEGER PRIMARY KEY,'
				+'url TEXT NOT NULL,'
				+'title TEXT NOT NULL,'
				+'clean BLOB NOT NULL,'
				+'full BLOB,'
				+'state TEXT,'
				+'favicon BLOB,'
				+'desc TEXT,'
				+'list TEXT,'
				+'created DATETIME DEFAULT CURRENT_TIMESTAMP);'
			);
		}, 
		error);
	});

//setting storage
if (!localStorage['settings']) localStorage['settings'] = JSON.stringify({'defaultList':'inbox'});
if (!localStorage['insertIds']) localStorage['insertIds'] = JSON.stringify([]);


//create Diigo Table
DB.transaction(function(tx){
	tx.executeSql(
		'SELECT name FROM sqlite_master WHERE type="table" AND name="diigo"',[],
		function(tx,ds){
            console.log(ds.rows.length);
			if (!ds.rows.length){
                Diigo.DBcreate();
            }else{
                //insert a sync_s filed in diigo table for very old version to update the database;
                tx.executeSql(
                    "SELECT sql FROM sqlite_master WHERE tbl_name = 'diigo' AND type='table'",[],
                    function(tx,ds){
                        var sql = ds.rows.item(0).sql;
                        if(sql.indexOf("sync_s")<0){
                            tx.executeSql(
                                'alter table diigo add sync_s SMALLINT(2) DEFAULT 0',[],
                                function(tx,ds){
                                    Diigo.DataUpgrade();
                                }
                            );
                        }
                    }
                )
            }
		}
	);	
},error);



chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	switch(request.action) {
	case 'get_shortcuts':
		sendResponse({shortcuts:localStorage['shortcuts']});
		break;
	case 'shortcuts_savepage':
		util.page(null,sender.tab);
		break;
	case 'save_item':
		
		specialsite(request.source);
		break;
	case 'save_item_link':
		util.savetitle(request.source,request.source,'link');
		break;
	case 'get_superfish':
		sendResponse({superfish:localStorage['superfish'],userid:localStorage['userID']});
		break;
	case 'enablesuperfish':
		localStorage['superfish'] = '{"enable":1}';
		break;
	case 'disblesuperfish':
		localStorage['superfish'] = '{"enable":0}';
		break;
	}	
});

function specialsite(source){
	function getFavicon() {
		var favicon = TAB.favIconUrl;
		if (favicon) 
			requestFile(favicon, function(r) { favicon = makeDataUrl(r.contentType, r.data); }, true);
		else 
			favicon = '';
		return favicon;
	}
	DB.transaction(function(tx){
		tx.executeSql(
			'INSERT INTO items (url, title, clean, full, state, favicon, desc, list) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', 
			[TAB.url,TAB.title, '',source, '',getFavicon(), '', 'inbox' ],function(tx,ds){
				if(localStorage['diigo']){
					tx.executeSql('INSERT INTO diigo (local_id,user_id) VALUES (?,?);', [ds.insertId,JSON.parse(localStorage['diigo']).user_id]);
				}else{
					tx.executeSql('INSERT INTO diigo (local_id) VALUES (?);', [ds.insertId]);
				}
				var tabViews = chrome.extension.getViews({type: 'tab'});
				for (var i=0, len=tabViews.length; i<len; i++) {
					var win = tabViews[i];
					if(win.$('body').attr('class')=='inbox'){
						win.$('#top').html('<div id="toppanel"><span class="check" ><input type="checkbox" name="checkall" /><!--<div><ul><li>all</li><li>none</li><li>read</li><li>unread</li></ul></div>--></span><span class="archive">'+getI18nMsg('archive')+'</span><span class="restore">'+getI18nMsg('unread')+'</span><span class="delete">'+getI18nMsg('delete')+'</span><!--<span class="markread">mark as read</span><span class="markunread">mark as unread</span>--><cite class="errormessage">'+getI18nMsg('noselected')+'</cite><cite id="headerMiddle"></cite></div>');
					}
					win.loadItem(ds.insertId, win.buildItem);
					//win.initApp();
					win.toppanelController.init();
					win.initListsBadge();
				}
				sendRequest('tab', TAB.id, {action:'saved_page'});
				if(JSON.parse(localStorage['saveclosetab']).enable ==1 && type=='page'){
					chrome.tabs.remove(TAB.id);
				}
				
				
				
				
			}
		);
	},error);
}

function googleReader(tab){
	//console.log($('.expanded').find('entry-title-link'));
	//console.log($('#entries'));
	//console.log(document.getElementById('entries'));
	
	sendRequest('tab', TAB.id, {action:'get_gr_url'},function(response){
	});
}


/*this code is for mainfest2 from the background page */
var ID_1 = chrome.contextMenus.create({
	title:'Read later',
	onclick:util.page,
	contexts:['page']
});

var ID_2 = chrome.contextMenus.create({
	title:'Read this link later',
	onclick:util.link,
	contexts:['link']
});


if(!localStorage['searcho'] || localStorage['searcho']<2){
	// window.open(chrome.extension.getURL('ad.html'));
	window.open("https://www.diigo.com/promotion/read_later_fast.html")
	localStorage['searcho'] =2;
}

localStorage['version'] = '1.3.8';

if(!localStorage['userID']){
 	var u1 = getTime.getUTCInt();
    var u2 = parseInt(Math.random()*10+1);
    var u3 = ''+u1+u2;
    var userid = hex_md5(u3);
    console.log(userid);
    localStorage['userID']=userid;
}
if(!localStorage['shortcuts']){
	var shortcuts = '{"enable":0,"value":"L"}';
	localStorage['shortcuts']=shortcuts;
}

if(!localStorage['saveclosetab']){
	var saveclosetab = '{"enable":0}';
	localStorage['saveclosetab'] = saveclosetab;
}

if(!localStorage['superfish']){
	var superfish = '{"enable":-1}';
	localStorage['superfish'] = superfish;
}