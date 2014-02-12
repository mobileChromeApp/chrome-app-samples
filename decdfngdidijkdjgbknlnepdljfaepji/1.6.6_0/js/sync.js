/*
 *  Sync with diigo js in background page.
 *  
 */
var RLF_V = '1.6.3';
var Diigo ={
    apiurl:'https://www.diigo.com/kree/pv=1/ct=chrome_read_later_fast',
    authurl:'https://secure.diigo.com/kree/pv=1/ct=chrome_read_later_fast',
    status:'',
    postbody:{
        pv:1,
        ct:'chrome_read_later_fast',
        cv:RLF_V,
        v:1,
        cmd:'',
        json:'',
        s:''
    },
    syncStatus:false,
    networkerror:false,
    signing:false,
    MaxSyncItem:50,
    //firstTime:'',
    
    init:function(){
        
    },
    
    DBcreate:function(){
        DB.transaction(function(tx) {
            tx.executeSql('CREATE TABLE diigo ('
                        +'id INTEGER PRIMARY KEY,'
                        +'local_id INTEGER,'
                        +'server_id INTEGER DEFAULT -1,'
                        +'server_created_at DATETIME DEFAULT -1,'
                        +'server_updated_at DATETIME DEFAULT -1,'
                        +'user_id INTEGER DEFAULT -1,'
                        +'mode INTEGER DEFAULT 2,'
                        +'sync_s SMALLINT(2) DEFAULT 0,'
                        +'FOREIGN KEY(local_id) REFERENCES items(id));',[],
                        function(tx,ds){
                            tx.executeSql('SELECT id FROM items', [], function(tx, ds) {
                                for (var i = 0, len = ds.rows.length; i<len; ++i) {
                                    tx.executeSql('INSERT INTO diigo (local_id) VALUES (?);', [ds.rows.item(i).id]);
                                }
                            });
//                            localStorage['diigo_upload_stamp'] ='0 0';

                            //patch on version 1.6.0 , --> DataUpgrade = 1;

                            localStorage["DataUpgrade"] = 1;


                        }
                );
        }, error);
    },

    DataUpgrade:function(){
        /*DataUpgrade = 1
            patch on 2012-8-12 in version >= 1.6.0
            when app upgrade frome <1.6.0 will run .
            now sync data use the "sync_s" flag in database table "diigo". because of previously used data
            so need use the upload timestamp to know which bookmark is already synced.
        */

        if(!localStorage['DataUpgrade']){
            localStorage["DataUpgrade"] = 1;
            if(localStorage['diigo_upload_stamp']){
                DB.transaction(function(tx){
                    tx.executeSql("SELECT * FROM items WHERE created>?",[localStorage['diigo_upload_stamp']],
                    function(tx,ds){
                        var ids = [];
                        for(var i= 0,len= ds.rows.length;i<len;i++){
                            ids.push(parseInt(ds.rows.item(i).id));
                        }
                        tx.executeSql("UPDATE diigo SET sync_s = 1 WHERE local_id IN ("+ids.join()+")",[],function(ds,tx){});

                    });
                });
            }
        }
    },

    getItem:function(item){
        if(item.url == undefined){
            //sync itmes
            return {
                local_id:item.id,
                server_id:item.server_id,
                type:3
            };
        }else if(item.list=='delete' && item.server_id!=-1){
            //app delete item
            return {
                local_id:item.id,
                server_id:item.server_id,
                type:3,
                cmd:4,
                folder_server_id:0
            };
            
        }else{
            if(item.url.length<5 && item.server_id==-1){
                return null;
            }else{
                if(item.server_id==-1){
                    return{
                        local_id:item.id,
                        server_id:item.server_id,
                        cmd:1,
                        type:3,
                        title:item.title,
                        url:item.url,
                        local_created_at:getTime.getUTCInt(item.created),
                        local_updated_at:getTime.getUTCInt(item.created),
                        unread:item.list=='archive'?0:1,
                        mode:item.mode
                    };
                }else{
                    return{
                        local_id:item.id,
                        server_id:item.server_id,
                        cmd:2,
                        type:3,
                        title:item.title,
                        url:item.url,
                        local_updated_at:getTime.getUTCInt(item.created),
                        unread:item.list=='archive'?0:1,
                        mode:item.mode
                    };
                }
            }
        }
    },
    
    getItems:function(rows){
        var items = [];
        for (var i=0,len=rows.length;i<len;i++){
            var item = Diigo.getItem(rows.item(i));
            if(item){
                items.push(item);
            }
        }
        
        return items;
    },
    
    signin:function(user,pwd){
        Diigo.signing=true;
        var json={
            user:user,
            password:pwd
        };
        Diigo.request('signin',json,function(data){
            if(data=="") data='{"code":-5}';
            data = JSON.parse(data);
            if(data.code == 1){
                var userinfo = {
                    user:data.user,
                    user_id:data.user_id
                };
                
                localStorage['diigo']=JSON.stringify(userinfo);
                DB.transaction(function(tx){
                    tx.executeSql(
                        'UPDATE diigo SET user_id=? WHERE user_id=-1',[data.user_id],
                        function(tx,ds){
                           // tx.executeSql(
                            //    'SELECT COUNT(local_id) FROM items,diigo WHERE list=? AND items.id = diigo.local_id AND diigo.user_id=?',['inbox',data.user_id],
                             //   function(tx,ds){
                                    //console.log(ds.rows.item(0)['COUNT(local_id)']);
                              //      if(ds.rows.item(0)['COUNT(local_id)']<15){
                                        Diigo.firstTime=true;
                               //     }
                                    Diigo.signing=false;
                                    chrome.extension.sendRequest({name: 'auth_success'});  
                                //}
                            //);
                        }
                    );    
                },error);
            }else{
                Diigo.signing=false;
                chrome.extension.sendRequest({name: 'auth_failure'});   
            }
        });
    },


    syncBegin:function(isOnlyUpload){
        if(Diigo.networkerror || !localStorage["diigo"] || Diigo.syncStatus) return;
        Diigo.syncStatus = true;

        // Begin Sync.
        // when finish sync must call function Diigo.syncFinish;
        chrome.extension.sendRequest({name:"sync_begin"});
        try{
            Diigo.uploadItems(isOnlyUpload);
        }catch(e) {
            Diigo.Ajaxerror('{"code":-5}');   //network error
        }
    },
    syncFinish:function(){
        //Finish Sync.

        Diigo.syncStatus = false;
        chrome.extension.sendRequest({name: 'sync_finish'});
    },

    Ajaxerror:function(e){
        //Sync Error.

        Diigo.syncStatus = false;
        e = JSON.parse(e);
        if(e.code==-1){
            //auth error

            chrome.extension.sendRequest({name: 'sync_auth_error'});
        }else{
            //*network error
            chrome.extension.sendRequest({name: 'net_error'});
        }


    },


    uploadItems: function(key){

        DB.transaction(function(tx){
            tx.executeSql('SELECT * FROM items, diigo '
                + 'WHERE diigo.sync_s = 0 AND items.id = diigo.local_id '
                + 'AND (diigo.user_id=? OR diigo.user_id=-1)',
                [JSON.parse(localStorage['diigo']).user_id],
                function(tx,ds){
                    var rows = ds.rows;
                    Diigo.status = 'upload';
                    var items = Diigo.getItems(rows);

                    if(items.length<1){
                        if(!key){
                            Diigo.status='';
                            Diigo.syncItems();
                        }else{
                            Diigo.syncFinish();
                        }
                    }else{

                        function upload(){
                            var json = {
                                items:items.splice(0,Diigo.MaxSyncItem)   //a sync request max 50 items
                            }
                            if(json.items.length>0){
                                Diigo.request('uploadItems',json,function(){
                                    upload();
                                });
                            }else{
                                if(!key){
                                    Diigo.status='';
                                    Diigo.syncItems();
                                }else{
                                    Diigo.syncFinish();
                                }
                            }
                        }

                        upload();
                    }
                }
            );    
        },error);
    },
    
    syncItems:function(){
        DB.transaction(function(tx){
            tx.executeSql('SELECT items.id,server_id FROM items,diigo WHERE items.id = diigo.local_id AND (diigo.user_id=? OR diigo.user_id=-1) AND diigo.sync_s = 1',
                [JSON.parse(localStorage['diigo']).user_id],
                function(tx,ds){
                    
                    var items = Diigo.getItems(ds.rows);

                    if(items.length<1){
                        Diigo.loadItems();
                    }else{

                        function sync(){
                            var json = {
                                items:items.splice(0,Diigo.MaxSyncItem) //a sync request max 50 items
                            }
                            if(json.items.length>0){
                                Diigo.request('syncItems',json,function(){
                                    sync();
                                });
                            }else{
                                Diigo.loadItems();
                            }

                        }      
                        sync();

                    }
                }
            );
        },error);
    },
    
    loadItems :function(){
        var timenow = getTime.getUTCString('now');
        var json={
            more:'new',
            time:getTime.getUTCInt(localStorage['diigo_load_stamp']),
            order:'create',
            count:50,
            item_type:'bookmark'
        };
        
        Diigo.request('loadItems',json,function(){
            
            if(Diigo.firstTime){
                Diigo.firstTime=false;
                Diigo.loadOldItems();
            }else{
                Diigo.syncFinish();
                var tabViews = chrome.extension.getViews({type: 'tab'});
                for (var i=0, len=tabViews.length; i<len; i++) {
                    var win = tabViews[i];
                    win.rebuildAPP();
                    Diigo.getFullHtml();
                }
            }
            
        });
    },
    
    loadOldItems:function(){
        DB.transaction(function(tx){
            tx.executeSql(
                'SELECT min(server_created_at) FROM diigo',[],
                function(tx,ds){
                    //var old_time = ds.rows.item(0)['min(server_created_at)'];
                    //if(!old_time || old_time == -1){
                     var   old_time = getTime.getUTCString('now');
                    //}
                    
                    var json_u={
                        more:'old',
                        time:getTime.getUTCInt(old_time),
                        order:'create',
                        count:15,
                        item_type:'bookmark',
                        unread:1
                    };
                    
                    var json_a={
                        more:'old',
                        time:getTime.getUTCInt(old_time),
                        order:'create',
                        count:10,
                        item_type:'bookmark',
                        unread:0
                    };
                    Diigo.load_old_item = true;
                    Diigo.request('loadItems',json_u,function(){
                        Diigo.request('loadItems',json_a,function(){
                            DB.transaction(function(tx){
                                tx.executeSql('SELECT min(server_created_at) FROM diigo,items WHERE items.id = diigo.local_id AND list=?',['inbox'],
                                    function(tx,ds){
                                        Diigo.load_old_item = false;
                                        var load_old = ds.rows.item(0)['min(server_created_at)'];
                                        if(!load_old){
                                            load_old = getTime.getUTCString('now');
                                        }
                                        localStorage['load_old'] = load_old;
                                        var tabViews = chrome.extension.getViews({type: 'tab'});
                                        for (var i=0, len=tabViews.length; i<len; i++) {
                                            var win = tabViews[i];
                                            win.rebuildAPP();
                                            Diigo.getFullHtml();
                                        }
                                        Diigo.syncFinish();
                                    }
                                );
                            },error);
                        });
                    });
                }
            )
        },error);
    },
    
    loadMoreUnread:function(){
        var json_u={
            more:'old',
            time:getTime.getUTCInt(localStorage['load_old']),
            order:'create',
            count:15,
            item_type:'bookmark',
            unread:1
        };
        Diigo.load_old_item = true;
        Diigo.request('loadItems',json_u,function(){
            chrome.extension.sendRequest({name: 'sync_begin'});
            DB.transaction(function(tx){
                tx.executeSql('SELECT min(server_created_at) FROM diigo,items WHERE items.id = diigo.local_id AND list=?',['inbox'],
                    function(tx,ds){
                        Diigo.load_old_item = false;
                        var load_old = ds.rows.item(0)['min(server_created_at)'];
                        if(!load_old){
                            load_old = getTime.getUTCString('now');
                        }
                        localStorage['load_old'] = load_old;
                        var tabViews = chrome.extension.getViews({type: 'tab'});
                        for (var i=0, len=tabViews.length; i<len; i++) {
                            var win = tabViews[i];
                            win.rebuildAPP();
                            Diigo.getFullHtml();
                        }
                        chrome.extension.sendRequest({name: 'sync_finish'});
                    }
                );
            },error);
        })
    },
    
    
    
    serverNew:function(bookmarks, user_id, callback){
        var i=0,len=bookmarks.length,bookmark;
        
        store();
        
        function getFavicon(url) {
                var regex = /.*\:\/\/([^\/]*).*/;
                var match = url.match(regex);
                if(typeof match != "undefined" && null != match) host = match[1];
                var favicon = 'https://www.google.com/s2/favicons?domain='+host;  //use google api get favicon
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
        
        function store(){
            bookmark = bookmarks[i];
            if(Diigo.load_old_item){
                
            }else{
                if (getTime.getUTCString(bookmark.server_created_at)>localStorage['diigo_load_stamp']){
                    localStorage['diigo_load_stamp'] = getTime.getUTCString(bookmark.server_created_at);
                }
            }
            DB.transaction(function(tx){
                tx.executeSql(
                    'SELECT id FROM diigo WHERE server_id = ?',
                    [bookmark.server_id],
                    function(tx,ds){
                        if(ds.rows.length){
                            storeNext();
                        }else{
                            var list;
                            if(bookmark.unread==0) {
                                list='archive';
                            }else {
                                list = 'inbox';
                            }
                            tx.executeSql(
                                'INSERT INTO items (url,title,created,list,desc,clean, full, state, favicon) VALUES (?, ?, ?, ?, ?,?,?,?,?);',
                                [bookmark.url,bookmark.title,getTime.getUTCString(bookmark.server_created_at),list,bookmark.desc,'','Getting html','reading',getFavicon(bookmark.url)],
                                function(tx,ds){
                                    tx.executeSql(
                                        'INSERT INTO diigo (local_id, server_id, server_created_at, server_updated_at,user_id,mode,sync_s) VALUES (?, ?, ?, ?, ?,?,1)',
                                        [ds.insertId,bookmark.server_id,getTime.getUTCString(bookmark.server_created_at),getTime.getUTCString(bookmark.server_updated_at),user_id,bookmark.mode],
                                        function(tx,ds){
                                            storeNext();
                                            //util.gethtml(bookmark.url,0);
                                        }
                                    );
                                }
                            );
                        }
                    }
                ); 
            },error);
            
            
            
        }
        
        function storeNext(){
            if(++i<len) store();
            else callback();
        }
        
    },
    
    getFullHtml:function(){
        DB.transaction(function(tx){
            tx.executeSql(
                'SELECT url FROM items WHERE full="Getting html"',[],
                function(tx,ds){
                    //console.log(ds.rows.item(1).url);
                    var len = ds.rows.length;
                   // console.log(len);
                    for(i=0;i<len;i++){
                        util.gethtml(ds.rows.item(i).url,0);
                        //console.log(i);
                    }
                    
                }
            );
        },error);
    },
    
    request:function(cmd,json,callback){
        var post = Diigo.postbody;
        var pjson = JSON.stringify(json);
        var s = hex_md5(post.ct+post.cv+pjson+post.v+cmd);
        var url = Diigo.apiurl;
        
        if(cmd =='signin'){
            url = Diigo.authurl;
        }
        
        $.ajax({
            url:url,
            type:'POST',
            timeout:10000,
            data:{
                cv:RLF_V,
                v:1,
                ct:'chrome_read_later_fast',
                cmd:cmd,
                json:pjson,
                s:s
            },
            success:function(data){
                //should add some code for signin to do thing
                    if(data.length<5){
                        Diigo.Ajaxerror('{"code":-5}');   //network error
                    }else{
                        if(cmd=='signin'){
                            callback(data);
                        }else{
                            Diigo.response(JSON.parse(data),json,callback);
                        }
                    }
                },
            error:function(e){
                if(cmd=='signin'){
                    callback(e.responseText);
                }else{
                    Diigo.Ajaxerror(e.responseText);
                }
            }
        });
    },
    
    response: function(res, req, callback) {
        var bookmarks = res.result.items;
        if(!bookmarks) return callback();
        
        //for (var i=0,len = bookmarks.length;i<len;i++)
        var newBookmarks = [], bookmark = {};
        var i=0,len =bookmarks.length;
        if(len<1){
            if(Diigo.status=='upload'){
                localStorage['diigo_upload_stamp'] = getTime.getUTCString('now');
                if(!localStorage['diigo_load_stamp']) localStorage['diigo_load_stamp']=localStorage['diigo_upload_stamp'];
            }
            
            callback();
        }else{
            bm();
        }
        //console.log(res);
        function bm(){
            bookmark = bookmarks[i];
            switch(bookmark.cmd){
                case 1:
                    if(Diigo.status == 'upload'){
                        //created by RLF
                        
                        DB.transaction(function(tx){
                            tx.executeSql(
                                'UPDATE diigo SET server_id=?,server_created_at=?,server_updated_at=?,user_id=?,mode=?,sync_s=1 WHERE local_id=?',
                                [bookmark.server_id,getTime.getUTCString(bookmark.server_created_at),getTime.getUTCString(bookmark.server_updated_at),res.user_id,bookmark.mode,bookmark.local_id],
                                function(tx,ds){
                                    i++;
                                    if(i<len){
                                        bm();
                                    }else{
                                        tx.executeSql('SELECT max(created),min(created) FROM diigo,items WHERE user_id=? AND items.id = diigo.local_id AND server_id >0 AND server_created_at > 0',[JSON.parse(localStorage['diigo']).user_id],
                                            function(tx,ds){
                                                localStorage['diigo_upload_stamp'] = ds.rows.item(0)['max(created)'] ;
                                                if(!localStorage['diigo_load_stamp']) localStorage['diigo_load_stamp']=ds.rows.item(0)['min(created)'];
                                                callback();
                                            }
                                        );
                                    }
                                }
                                
                            );
                        },error)
                    }else{
                        // created by server or other clients
                        newBookmarks.push(bookmark);
                        i++;
                        if(i<len){
                            bm();
                        }else{
                            if(newBookmarks.length){
                                Diigo.serverNew(newBookmarks,res.user_id,callback);
                            }
                        }
                    }
                    break;
                case 2:
                    DB.transaction(function(tx){
                        if (bookmark.unread==0){
                            var list = 'archive';
                        }else{
                            var list = 'inbox';
                        }
                        tx.executeSql(
                            'UPDATE items SET title=?,url=?,desc=?,list=? WHERE id=?',
                            [bookmark.title,bookmark.url,bookmark.desc,list,bookmark.local_id],
                            function(tx,ds){
                                tx.executeSql(
                                    'UPDATE diigo SET server_updated_at=? ,mode=?,sync_s=1 WHERE local_id=?',
                                    [getTime.getUTCString(bookmark.server_updated_at),bookmark.mode,bookmark.local_id],
                                    function(tx,ds){
                                        i++;
                                        if(i<len){
                                            bm();
                                        }else{
                                            tx.executeSql('SELECT max(created),min(created) FROM diigo,items WHERE user_id=? AND items.id = diigo.local_id',[JSON.parse(localStorage['diigo']).user_id],
                                                function(tx,ds){
                                                    localStorage['diigo_upload_stamp'] = ds.rows.item(0)['max(created)'] ;
                                                    if(!localStorage['diigo_load_stamp']) localStorage['diigo_load_stamp']=ds.rows.item(0)['min(created)'];
                                                    callback();
                                                }
                                            );
                                        }
                                    }
                                );
                            }
                        );
                    },error);
                    break;
                case 3:
                    break;
                case 4:
                    //for delete item
                    DB.transaction(function(tx){
                        
                        tx.executeSql(
                            'DELETE FROM items WHERE id = ?',[bookmark.local_id],
                            function(tx,ds){
                                tx.executeSql(
                                    'DELETE FROM diigo WHERE id=?',[bookmark.local_id],
                                    function(tx,ds){
                                        i++;
                                        if(i<len){
                                            bm();
                                        }else{
                                            callback();
                                        }
                                    }
                                );
                            }
                        );
                    },error);
                    break;
            }
        }
    }
    

};

var getTime={
    
    getUTCString: function(time) {
        if (time == 'now' || !time) {
            var d = new Date();
            d = Date.parse(d) / 1000;
            return getTime.getUTCString(d);
        }
        var y, m, d, h, M, s; 
        time = new Date(time * 1000);
        y = time.getUTCFullYear();
        m = time.getUTCMonth()+1;
        d = time.getUTCDate();
        h = time.getUTCHours();
        M = time.getUTCMinutes();
        s = time.getUTCSeconds();
        if (m < 10) m = '0' + m;
        if (d < 10) d = '0' + d;
        if (h < 10) h = '0' + h;
        if (M < 10) M = '0' + M;
        if (s < 10) s = '0' + s;
        return  y + '-' + m + '-' + d + ' ' + h + ':' + M + ':' + s;
    },

    getUTCInt: function(time) {
        if (time == 'now' || !time) {
            time = new Date(); // local
            return Date.parse(time) / 1000;
        } else {
            time = time.split(' ');
            t0 = time[0].split('-');
            t1 = time[1].split(':');
            // month
            t0[1] -= 1; 
            if (t0[1] < 10) t0[1] = '0' + t0[1];
            return Date.UTC(t0[0], t0[1], t0[2], t1[0], t1[1], t1[2]) / 1000; 
        }
    },
    
    localTimeFromUTC: function(time) {                  // http://stackoverflow.com/questions/3830418
        // get time offset from browser
        var currentDate = new Date();
        var offset = -(currentDate.getTimezoneOffset() / 60);
        // get provided date
        var timeArray = time.split(' ');
        var t0 = timeArray[0].split('-');
        var t1 = timeArray[1].split(':');
        var givenDate = new Date(t0[0], t0[1]-1, t0[2], t1[0], t1[1]);
        // apply offset
        var hours = givenDate.getHours();
        hours += offset;
        givenDate.setHours(hours);
        // format the date
        //var format = 'yyyy/MM/dd/ hh:mm a';
        var format = 'yyyy/MM/dd/HH:mm';                // this format made easy for manipulating, not for displaying
        var localDateString = $.format.date(givenDate, format);
        return localDateString;
    }

};


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { 
    // listen for user register to diigo
    if (changeInfo.url == "https://www.diigo.com/readlaterfastsigndone") {
        chrome.tabs.remove(tab.id); 
        //diigo.init();
        var json={
            items:''
        };
        var post = Diigo.postbody;
        var pjson = JSON.stringify(json);
        var s = hex_md5(post.ct+post.cv+pjson+post.v+'uploadItems');
        var url = Diigo.apiurl;
        
        $.ajax({
            url:url,
            type:'POST',
            data:{
                cv:RLF_V,
                v:1,
                ct:'chrome_read_later_fast',
                cmd:'uploadItems',
                json:pjson,
                s:s
            },
            success:function(data){
                //should add some code for signin to do thing
                    if(data.length<5){
                        Diigo.Ajaxerror('{"code":-5}');   //network error
                    }else{
                        data = JSON.parse(data);
                        var userinfo = {
                            user:data.user,
                            user_id:data.user_id
                        };
                        
                        localStorage['diigo']=JSON.stringify(userinfo);
                        Diigo.firstTime=true;
                        chrome.extension.sendRequest({name: 'auth_success'});  
                        DB.transaction(function(tx){
                            tx.executeSql(
                                'UPDATE diigo SET user_id=? WHERE user_id=-1',[data.user_id],
                                function(){
                                    Diigo.syncBegin();
                                }
                            );    
                        },error);
                    }
                },
            error:function(e){
                var emessage = JSON.parse(e.responseText);
                Diigo.Ajaxerror(e.responseText);
            }
        });
    }   
});

