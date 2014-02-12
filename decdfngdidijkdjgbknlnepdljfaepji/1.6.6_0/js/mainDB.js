//(id), url, title, clean, (full), state, favicon, (desc), list, created
var BG = chrome.extension.getBackgroundPage(),
	DB = BG.DB;

function loadItems(list, callback) {
	if(list=='archive'){
		limit = 'LIMIT 0,10'
	}else{
		limit = '';
	}
	DB.transaction(function(tx) {
		if(!localStorage['diigo']){
			tx.executeSql(	
				'SELECT items.id, url, title, state, favicon, desc, created,user_id FROM items,diigo WHERE list=? AND items.id = diigo.local_id AND (diigo.user_id=? OR diigo.user_id=-1) ORDER by created DESC;', [list,localStorage['lastdiigo']], 
				/* SELECT * should work */
				function(tx, ds) { callback(tx, ds); } 
			);
		}else{
			tx.executeSql(	
				'SELECT items.id, url, title, state, favicon, desc,server_created_at,user_id FROM items,diigo WHERE list=? AND items.id = diigo.local_id AND (diigo.user_id=? OR diigo.user_id=-1) ORDER by server_created_at DESC '+limit+';', [list,JSON.parse(localStorage['diigo']).user_id], 
				/* SELECT * should work */
				function(tx, ds) { callback(tx, ds); } 
			);
		}
		
	}, error);
}

function getItemsNum(list, callback) {
	DB.readTransaction(function(tx) {
		tx.executeSql(	
			'SELECT id FROM items WHERE state=? AND list=?', 
			['', list], function(tx, ds) { callback(tx, ds); } 
		);
	}, error);
}
/* get all and unread number 
function getItemsNum(list, callback) {
	DB.readTransaction(function(tx) {
		tx.executeSql(	
			'SELECT COUNT(state) FROM items WHERE state=? AND list=? UNION ALL SELECT COUNT(*) FROM items WHERE list=?', 
			['reading', list, list], function(tx, ds) { callback(tx, ds); } 
		);
	}, error);
} */
function getReadingItems(list, callback) {
	DB.readTransaction(function(tx) {
		tx.executeSql(	
			'SELECT id FROM items WHERE list=? AND state=?;', [list, 'reading'], 
			function(tx, ds) { callback(tx, ds); } 
		);
	}, error);
}

function loadItem(itemid, callback) {
	DB.readTransaction(function(tx) {
		tx.executeSql(	
			'SELECT id, url, title, state, favicon, desc, created FROM items WHERE id=?;', [itemid], 
			function(tx, ds) { callback(tx, ds); } 
		);
	}, error);
}
function loadOriginalContent(itemid, callback) {
	DB.transaction(function(tx) {
		tx.executeSql(
			'SELECT url, full FROM items WHERE id=?', [itemid], 
			function(tx, ds) { 
				callback(tx, ds); 
				tx.executeSql('UPDATE items SET state="reading" WHERE id=?', [itemid]);
			} 
		);
	}, error);
}
/* function loadCleanContent(itemid, callback) {
	DB.transaction(function(tx) {
		tx.executeSql(
			'SELECT url, clean FROM items WHERE id=?', [itemid], 
			function(tx, ds) { 
				callback(tx, ds); 
				tx.executeSql('UPDATE items SET state="reading" WHERE id=?', [itemid]);
			} 
		);
	}, error);
}
 */
function deleteItem(itemid, callback) {
	DB.transaction(function(tx) {
		if(!localStorage['diigo']){
			tx.executeSql(
				'DELETE FROM items WHERE id=?', [itemid], 
				function(tx, ds) {
				//callback(tx, ds); }
					tx.executeSql('DELETE FROM diigo WHERE local_id = ?',[itemid],
					function(tx_t,ds_d){callback(tx_t,ds_d);}	      
					);
				}
			);
		}else{
			tx.executeSql(
				'UPDATE items SET list=?,created=? WHERE id=?',['delete',BG.getTime.getUTCString('now'),itemid],
				function(tx,ds){
                    tx.executeSql(
                        "UPDATE diigo SET sync_s = 0 WHERE local_id=?",[itemid],
                        function(t,d){
                            callback(tx,ds);
                        }
                    );
                }
			);
		}
	}, error);
}

function moveItem(itemid, list, callback) {
	DB.transaction(function(tx) {
		tx.executeSql(
			'UPDATE items SET list=?,created=? WHERE id=?', [list,BG.getTime.getUTCString('now'), itemid], 
			function(tx, ds) {
                tx.executeSql(
                    "UPDATE diigo SET sync_s = 0 WHERE local_id=?",[itemid],
                    function(t,d){
                        callback(tx,ds);
                    }
                );
            }
		);
	}, error);
}
// these funcion for app's toppanelController
function deleteAll(ids,callback){
	DB.transaction(function(tx) {
		if(!localStorage['diigo']){
			tx.executeSql(
				'DELETE FROM items WHERE id IN ('+ids+')',null,function(tx,ds){
					tx.executeSql('DELETE FROM diigo WHERE local_id IN ('+ids+')',null,
						function(tx,ds){
							callback(tx,ds);
						}
					)
				}
				
			);
		}else{
			tx.executeSql(
				'UPDATE items SET list=?,created=? WHERE id IN ('+ids+')',['delete',BG.getTime.getUTCString('now')],
				function(tx,ds){
                    tx.executeSql(
                        'UPDATE diigo SET sync_s = 0 WHERE local_id IN ('+ids+')',[],
                        function(t,d){
                            callback(tx,ds);
                        }
                    );
                }
			);
		}
	})
}

function moveAll(ids,list,callback){
	DB.transaction(function(tx) {
		tx.executeSql(
			'UPDATE items SET list=?,created=? WHERE id IN ('+ids+')',
			[list,BG.getTime.getUTCString('now')],
			function(tx,ds){
                tx.executeSql(
                    'UPDATE diigo SET sync_s = 0 WHERE local_id IN ('+ids+')',[],
                    function(t,d){
                        callback(tx,ds);
                    }
                );
            }
		);
	})
}


function markreadAll(ids,state,callback){
	DB.transaction(function(tx) {
		tx.executeSql(
			'UPDATE items SET state=? WHERE id IN ('+ids+')',[state],
			function(tx,ds){callback(tx,ds);}	
		);
	})
}

function getAllUreadNum(callback){
	DB.transaction(function(tx){
		tx.executeSql(
			'SELECT COUNT(id) FROM items WHERE list=?',['inbox'],
			function(tx,ds){callback(tx,ds);}
		);
	},error);
}
function deleteArchiveMAX(){
	if(localStorage['diigo_upload_stamp']<1) return;
	DB.transaction(function(tx){
		tx.executeSql(
			'SELECT local_id FROM diigo,items WHERE user_id=? AND items.id = diigo.local_id AND list="archive" AND server_id >0 AND server_created_at > 0 ORDER by server_created_at desc LIMIT 10,200',[JSON.parse(localStorage['diigo']).user_id],
			function(tx,ds){
				//console.log(ds.rows.item(0).server_created_at);
				//console.log(ds.rows);
				ids = '';
				for(i=0;i<ds.rows.length;i++){
					//console.log(ds.rows.item(i).local_id);
					ids = ids+ds.rows.item(i).local_id+',';
				}
				ids = ids.slice(0,-1);
				tx.executeSql(
					'DELETE FROM diigo WHERE local_id IN ('+ids+')',[],
					function(tx,ds){
						tx.executeSql(
							'DELETE FROM items WHERE id IN ('+ids+')',[],
							function(tx,ds){
							}
						);
					}
				);
				
				
				
			}
		);
	});
}