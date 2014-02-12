var settings;
var itemsList, currentItemid, 
	currentContent = {view:'full'};
var BG, DB;
var getI18nMsg = chrome.i18n.getMessage;
/*
 * Utility
 *----------------------------------------------------------------*/
function error(e) { console.log('DRL error: '+e.message); }
function notification(header, title, callback) {
	var n = webkitNotifications.createNotification('icon48.png', header, title);
	n.show();
	callback(n);
}
function getItemTitle(target) {
	return target.firstChild.textContent;
}
function checkPagination(parent) {
	$(parent).prev().length 
		? $('#readerPrevItem').removeClass('noItem').html('<span title="'+getItemTitle($(parent).prev().find('h3.itemTitle')[0])+'"></span>') 
		: $('#readerPrevItem').addClass('noItem').html('<span></span>');
	$(parent).next().length
		? $('#readerNextItem').removeClass('noItem').html('<span title="'+getItemTitle($(parent).next().find('h3.itemTitle')[0])+'"></span>') 
		: $('#readerNextItem').addClass('noItem').html('<span></span>');		
}

function getListBadge($list) {
	var text = $('.unreadItemNum', $list).text();
	return text ? parseInt(text) : 0;
}		
function setListBadge(num, $list) {
	$('.unreadItemNum', $list).text(num);
	BG.updateIconBadge();  //send a message to Reader Later Extension to update icon badge.
}
function setIconBadge(num) {
	//BG.setIconBadge(num);
}

/*
 * Items Number
 *----------------------------------------------------------------*/
function updateNum(list, unread, all) {
	var a = unread ? '' : 'zero';
	$('.itemNum', $('#'+list)).removeClass('zero').addClass(a).find('span:first').text(unread).end()
		.find('span:last').text(all);
	//$('.itemNum:not(.zero)', $('#'+list)).addClass('show');
	$('.itemNum:not(.zero))').show();
}
function getNum(list) {
	return {
		unread: $('.itemNum', $('#'+list)).find('span:first').text(),
		all: $('.itemNum', $('#'+list)).find('span:last').text()
	}
}



//show items num by actions
function itemActionNum(action, isRead, targetList) {
	var list = $('body')[0].className,
		nums = getNum(list),
		unread = parseInt(nums.unread),
		all = parseInt(nums.all);
		
	switch(action) {
	case 'reading':
		if (!isRead) {
			updateNum(list, unread-1, all);
			showHeaderNum(unread-1, all);
		}
		break;
	case 'move': 
		if (!isRead) --unread;
		updateNum(list, unread, all-1);
		showHeaderNum(unread, all-1);
		//update target list
		nums = getNum(targetList);
		unread = parseInt(nums.unread);
		all = parseInt(nums.all);
		if (!isRead) ++unread;
		updateNum(targetList, unread, all+1);
		break;
	case 'delete': 
		if (!isRead) --unread;
		updateNum(list, unread, all-1);
		showHeaderNum(unread, all-1);
		break;
	case 'add':
		nums = getNum('inbox');
		unread = parseInt(nums.unread);
		all = parseInt(nums.all);
		updateNum('inbox', unread+1, all+1);
		showHeaderNum(unread+1, all+1);
		break;
	}
}

function showHeaderNum(unread, all) {
	var itemNum;
	if ($('body').hasClass('archive')) 
		itemNum = all+' items archived';
	else 
		itemNum = unread +' unread of '+all;
	$('#headerMiddle').html(itemNum);
}


/*
 * Init Lists Badge Number
 *----------------------------------------------------------------*/
function initListsBadge() {
	var lists = document.getElementsByClassName('list'),
		len = lists.length,
		i = 0;
	
	function oneListNum() {
		if (i>len-1) return;
		var list = lists[i];
		
		loadItems(list.id, function(tx, ds) {
			var unread = ds.rows.length;
			if (unread && list.id=='inbox') {
				setListBadge(unread, $(list).find('.unreadItemNum').addClass('show').end());
			} else {
				$(list).find('.unreadItemNum').text('0').removeClass('show');
			}
			
			++i;
			oneListNum();
		});
	}
	
	oneListNum();
}
/*
 * Toppanel Controller
 *----------------------------------------------------------------*/
(function(){
	var ToppanelController = function(){
		return new ToppanelController.fn.init();
	};
	
	ToppanelController.fn = ToppanelController.prototype = {
		init: function(){
			this.enalbePanelClickable();
			return this;
		},
		enalbePanelClickable: function(){
			$('#toppanel').unbind().click(function(e){
				var target = e.target;
				if(target.tagName=='SPAN'){
					toppanelController.panelAction(target);	
				}else if(target.tagName=='INPUT'){
					$('[name=item]:checkbox').attr('checked',target.checked);
					
				}else if(target.tagName=="LI"){
					toppanelController.checkAction(target);
					$('#toppanel span.check div').hide();
				}
			});
			
			
			
		},
		panelAction: function(target){
			var action = target.className;
			var $ids = '';
			var $list = $('body').attr('class');
			
			$('[name=item]:checked').each(function(){
				$ids+=$(this).val()+',';
				});
			$ids = $ids.slice(0,-1);
			if(action != 'check' && $ids.length<1){
				$('.errormessage').html(getI18nMsg('noselected')).show().delay(3000).fadeOut("slow");
				return;
			}
			function callback(tx,ds) {
				loadItems($list,function(tx,ds){
					buildItems(tx,ds,$list);
					initListsBadge();
					numberController.header();
					BG.updateIconBadge();  //send a message to Reader Later Extension to update icon badge.
					toppanelController.init();
					itemController.init();
					adjustUI();
					
					if(localStorage['diigo']){
                        BG.Diigo.syncBegin(1);
					}
				});
			}
			
			switch(action){
				case 'delete':
					deleteAll($ids,callback);
					break;					
				case 'archive':
					moveAll($ids,'archive',callback);
					break;
				case 'markread':
					markreadAll($ids,'reading',callback);
					break;
				case 'restore':
					moveAll($ids,'inbox',callback);
					break;
				case 'markunread':
					markreadAll($ids,'',callback);
					break;
				case 'check':				
					$(target).find('div').toggle();
						$('body').click(function(e){
							if(e.target.className != 'check'){
								$(target).find('div').hide();
							}
						});
					break;	
			}
		},
		
		checkAction: function(target){
			var action = target.textContent;
	
			
			$('#toppanel span.check input:checkbox').attr('checked',false);
			switch(action){
				case 'all':
					$('[name=item]:checkbox').attr('checked',true);
					$('#toppanel span.check input:checkbox').attr('checked',true);
					break;
				case 'none':
					$('[name=item]:checkbox').attr('checked',false);
					break;
				case 'read':
					$('#items ul li').each(function(){
						if( $(this).hasClass('reading')){
							$(this).find(':checkbox').attr('checked',true);
						}else{
							$(this).find(':checkbox').attr('checked',false);
						}
					});
					break;
				case 'unread':
					$('#items ul li').each(function(){
						if( $(this).hasClass('reading')){
							$(this).find(':checkbox').attr('checked',false);
						}else{
							$(this).find(':checkbox').attr('checked',true);
						}
					});
					break;
			}
		}
		
	};
	
	ToppanelController.fn.init.prototype = ToppanelController.fn;
	window.ToppanelController = ToppanelController;
	
	
})();











/*
 * Number Controller
 *----------------------------------------------------------------*/
(function(){
	var NumberController = function() {
		return new NumberController.fn.init();
	};
	
	NumberController.fn = NumberController.prototype = {
		init: function() {
			this.header();
			this.badge();
			return this;
		},
		
		header: function() {
			var all = $('#items>ul>li').length,
				headerText;
				
						
			if ($('body').hasClass('archive')) {
				if(all==1){
					headerText = all+getI18nMsg('itemarchive');
				}else{
					headerText = all+getI18nMsg('itemsarchive');
				}
			}
			else{ 
				//headerText = (all-$('#items>ul>li.reading').length)+' unread of '+all;
				/*if(all==1){
					headerText = 'Total '+all+' item';
				}else{
					headerText = 'Total '+all+' items';
				}*/
			}
			$('#headerMiddle').html(headerText);
		},
		
		badge: function($oli, $tli) {
			if ($oli) {
				var onum = getListBadge($oli)-1;
				setListBadge(onum, $oli);
				if ($oli.attr('id')=='inbox') setIconBadge(onum);
				if (onum==0) $oli.find('.unreadItemNum').removeClass('show');
			}
			
			if ($tli) {
				var tnum = getListBadge($tli)+1;
				setListBadge(tnum, $tli);
				if ($tli.attr('id')=='inbox') setIconBadge(tnum);
				$tli.find('.unreadItemNum').addClass('show');
			}
		}
	};
	
	NumberController.fn.init.prototype = NumberController.fn;
	window.NumberController = NumberController;	
})();


/*
 * Reader Controller
 *----------------------------------------------------------------*/
(function(){
	var ReaderController = function() {
		return new ReaderController.fn.init();
	};
 
	ReaderController.fn = ReaderController.prototype = {
		init: function() {
			this.buildReaderHeader();
			this.bindReader();
			return this;
		},
		
		buildReaderHeader: function() {
			var headerHTML = '<div id="readerHeader"><table><tbody><tr><td id="readerPagination" width="180"> <span class="segmentButtons"><span class="first button current" id="full">'+getI18nMsg('original')+'</span><span class="divider"></span><span class="last button" id="text">'+getI18nMsg('textview')+'</span></span><span id="readerPrevItem"></span><span id="readerNextItem"></span></td><td id="readerTitle" width="540"><h2><a href="#" target="_blank"></a></h2></td><td id="readerAction" width="180"><span id="readerClose"></span><span id="similar"><a href="#" target="_blank" title="similar sites"><span></span></a></span><span id="newtab"><a href="#" target="_blank" title="'+getI18nMsg('newtab')+'"><span></span></a></span><span id="delete" title="'+getI18nMsg('delete')+'"></span><span id="archive" title="'+getI18nMsg('archive')+'"></span><span id="unread" title="'+getI18nMsg('unread')+'"></span></td></tr></tbody></table></div>';
			$(headerHTML).insertBefore($('#fancybox-inner'));
		},
		
		bindReader: function() {
			$('#readerHeader').click(function(e) {
				if ($(e.target).parent('span').hasClass('noItem')) return;
				var target = e.target;	
				var action = $(target).parent('span').attr('id');
				if(action!='readerPrevItem' && action!='readerNextItem'){
					var action = target.id;
				}
				var $currentItem = $('li[itemid='+currentItemid+']', $('#items'));
				readerController.readerAction(action, $currentItem);
			});
			
			$('body').keyup(function(e) {
				if (!$('#fancybox-frame').length) return;
				switch(e.keyCode) {
				case 37:
					if ($('#readerPrevItem').hasClass('noItem')) return;
					readerController.readerAction('readerPrevItem', $('li[itemid='+currentItemid+']', $('#items')));
					break;
				case 39:
					if ($('#readerNextItem').hasClass('noItem')) return;
					readerController.readerAction('readerNextItem', $('li[itemid='+currentItemid+']', $('#items')));
					break;
				}
			});
		},
		
		readerAction: function(action, $currentItem) {
			switch(action) {
			case 'readerPrevItem':
				itemController.readContent(currentContent.view, $currentItem.prev().find('h3.itemTitle')[0]);
/* 				if (!$currentItem.prev().hasClass('reading')) {
					itemActionNum('reading', false, null);
					if ($('body.inbox').length) BG.updateIcon('deleteIcon');
				}
				itemController.readCleanContent($currentItem.prev().find('h3.itemTitle')[0]);
 */				break;
			case 'readerNextItem':
				itemController.readContent(currentContent.view, $currentItem.next().find('h3.itemTitle')[0]);
/* 				if (!$currentItem.next().hasClass('reading')) {
					itemActionNum('reading', false, null);
					if ($('body.inbox').length) BG.updateIcon('deleteIcon');
				}
				itemController.readCleanContent($currentItem.next().find('h3.itemTitle')[0]);
 */				break;
			case 'full':
			case 'text':
				var v = currentContent.view,
					t = 'Text',
					w = 960,
					l = parseInt($('#fancybox-wrap').css('left'));
				if (v=='full') {
					t = 'Full';
					currentContent.view = v = 'clean';
					w = 960;
				} else 
					currentContent.view = v = 'full';
				
				//$('#viewToggle').text(t);
				$('.segmentButtons .button.current').removeClass('current').siblings('.button').addClass('current');
				itemController.readContent(v, $currentItem.find('h3.itemTitle')[0]);
				//$('#fancybox-wrap').css({width:(w+20)+'px'/* , left:(l+(855-w))+'px' */});
				//$('#fancybox-inner').css({width:w+'px'});
				break;
			case 'readerClose':
				$.fancybox.close();
				break;
			case 'archive':
				moveAll(currentItemid,'archive',callback);
				if ($('#readerNextItem').hasClass('noItem'))
					$.fancybox.close();
				else
					itemController.readContent(currentContent.view, $currentItem.next().find('h3.itemTitle')[0]);
				
				break;
			case 'unread':
				moveAll(currentItemid,'inbox',callback);
				if ($('#readerNextItem').hasClass('noItem'))
					$.fancybox.close();
				else
					itemController.readContent(currentContent.view, $currentItem.next().find('h3.itemTitle')[0]);
				break;
			case 'delete':
				deleteAll(currentItemid,callback);
				if ($('#readerNextItem').hasClass('noItem'))
					$.fancybox.close();
				else
					itemController.readContent(currentContent.view, $currentItem.next().find('h3.itemTitle')[0]);
				break;
			}
			
			function callback(tx,ds){
				$list = $('body').attr('class');
					loadItems($list,function(tx,ds){
						buildItems(tx,ds,$list);
						initListsBadge();
						numberController.header();
						BG.updateIconBadge();  //send a message to Reader Later Extension to update icon badge.
						toppanelController.init();
						itemController.init();
						adjustUI();
						if(localStorage['diigo']){
						BG.Diigo.syncBegin(1);
						}
					});
			}
		},
		
		updateDimension: function() {
			var winH = window.innerHeight;
			$('#fancybox-wrap').css({height:(winH-10)+'px'});
			$('#fancybox-inner').css({height:(winH-20-10-32+12)+'px'});
			$('#items_f').css({height:(winH-50-10+4)+'px'});
			adjustUI();
		}
	};
	
	ReaderController.fn.init.prototype = ReaderController.fn;
	window.ReaderController = ReaderController;	
})();


/*
 * Item Controller
 *----------------------------------------------------------------*/
(function(){
	var ItemController = function() {
		return new ItemController.fn.init();
	};
	
	ItemController.fn = ItemController.prototype = {
		
		init: function() {
			
			this.enableItemsDraggable();
			//this.enableItemsDroppable();
			this.enableItemsClickable();
			return this;
		},
		
		enableItemsDraggable: function() {
			$("#items > ul > li.item").draggable({ cursor: 'default', 
				revert: 'invalid', 
				revertDuration: 100,
				
				helper: 'clone',
				opacity: 0.6,
				zIndex:9,
				/* start: function(event, ui) {
				      console.log(event.target);
				      //console.log(ui.helper);
				      //console.log($(this).hasClass('itemActions') || $(this).parent().hasClass('itemActions'));
				      if ($(this).hasClass('itemActions') || $(this).parent().hasClass('itemActions'))
				      $(this).draggable( "disable" );
				}, */
			       /* disable item action draggable  
			       start: function(event, ui) {
				      return false;
				      console.log($(event.target).hasClass('item'));
				      if (!$(event.target).hasClass('item')) return false;
				}, */
				drag: function(event, ui) {
				      $(this).css({zIndex:9});
				},
				stop: function(event, ui) {
				      $(this).css({zIndex:''});
				},
				cancel: '.itemTitle .itemActions'
			      });
		},
		
		enableItemsDroppable: function() {
			$("#items > ul > li.item").droppable({hoverClass:'dragHover',
						tolerance: 'pointer',
						accept: '.item',
						drop: function(event, ui) {
							ui.draggable.css({opacity:'', left:'', top:''});
							$(this).after(ui.draggable)
						}
					});
		},
		
		enableItemsClickable: function() {
			$('#items').unbind().click(function(e) {
				var target = e.target;
				if (target.tagName=='SPAN' && $(target).parent().hasClass('itemActions')) {
					itemController.itemAction(target);
				} else if(target.tagName=='INPUT'){
					
				} else if(target.tagName=='A'){
					if($(target).attr('class')=='normalLink') return;
					var url = $(target).attr('data-href');
					URLopen(url);
				}
				else{
					if ($(target).hasClass('desc')) target = target.parentElement;
					itemController.readContent(currentContent.view, target);
				}
			}); 
		},
		
		readContent: function(view, target) { //target: h3
			var parent = target.parentElement;
			var itemid = currentItemid = parseInt($(parent).attr('itemid'));
			
			function buildContent(tx, ds) {
                if(ds.rows.length<1) return;
				var row = ds.rows.item(0);
				currentContent = {view:view, content:row['full']};
				
				//reader header
				var itemTitle = getItemTitle(target);
				$('#readerTitle').find('h2>a').html(itemTitle).attr({href:row['url'], title:itemTitle});
				$('#readerAction').find('#newtab>a').attr({href:row['url']});
				$('#readerAction').find('#similar>a').attr({href:'http://www.similarsites.com/search?searchURL='+encodeURIComponent(row['url'])+'&ref=dg'});
				checkPagination(parent);
				$('#readerOriginLink').attr({href:row['url']});
				//$('.segmentButtons .button.current').removeClass('current').siblings('.button').addClass('current');
				//$('#viewToggle').text((view=='full') ? 'Text' : 'Full');
				
				if (!$(parent).hasClass('reading')) {
					$(parent).addClass('reading');
					//numberController.badge($('.list.current'), null);
					//numberController.header();
				}
				
				//nav item
				var iframe=$('#fancybox-frame')[0];
				if (iframe) {
					iframe.src = iframe.src;
					return;
				} 
				
				//reader content
				var winW = window.innerWidth;
				if(winW<1030){
					$('#readerTitle h2').css('width','520px');
					var fancywidth = 900;
				}else{
					$('#readerTitle h2').css('width','620px');
					var fancywidth = 1100;
				}
				$(target)
					.fancybox({	
						'width': view=='full' ? fancywidth : fancywidth,
						/* 'height': x, */ //setting not work
						'type': 'iframe',
						'hideOnContentClick': false,
						'href': 'blank.html',
						'speedIn': 300,
						'speedOut': 100,
						'overlayOpacity': 0.8,
						'overlayColor': '#000',
						'showCloseButton': false,
						'onClosed': function() {
							$('li.item.highlightItem').removeClass('highlightItem');
							$('li.item[itemid='+currentItemid+']').addClass('highlightItem');
							/* $(parent).addClass('highlightItem');
							setTimeout(function() {$(parent).removeClass('highlightItem')}, 1000); */
						}
					})
					.trigger('click')
					.unbind(); //unbind fancybox
				
				//reader dimension
				readerController.updateDimension();
			}
			
			loadOriginalContent(itemid, buildContent);
		},
		
		itemAction: function(target) {
			var action = target.className;
			var $parent = $(target).parents('li.item');
			var itemid = parseInt($parent.attr('itemid'));
			var $oli = $tli = null;
			
			function callback(tx, ds) {
				$parent.remove();
				if (!$parent.hasClass('reading')) numberController.badge($oli, $tli);
				numberController.header();
				/* notification(
					'Item '+action, $parent[0].firstChild.firstChild.textContent, //FIXME - may have bug
					function(n) { setTimeout(function() {n.cancel();}, 3*1000); }
				); */
			}
			
			$oli = $('.list.current');
			switch(action) {
			case 'text':
				itemController.readContent('clean', $(target).parents('h3.itemTitle')[0]);
				return;
			case 'archive':
				$tli = $('#archive');
				moveItem(itemid, 'archive', callback);
				break;
			case 'delete':
				deleteItem(itemid, callback);
				break;
			case 'restore':
				$tli = $('#inbox');
				moveItem(itemid, 'inbox', callback);
				break;
			}
			
		}
	};
	
	ItemController.fn.init.prototype = ItemController.fn;
	window.ItemController = ItemController;	
})();


/*
 * List Controller
 *----------------------------------------------------------------*/
(function(){
	var ListController = function() {
		return new ListController.fn.init();
	};
	ListController.fn = ListController.prototype = {
		init: function() {
			//this.enableListsDraggable();
			this.enableListsDroppable();
			this.enableListsClickable();
			return this;
		},
		
		enableListsDraggable: function() {
			$("#lists > ul > li").draggable({ cursor: 'default', 
				revert: 'invalid', 
				revertDuration: 100,
				opacity: 0.6,
				containment: 'parent',
				drag: function(event, ui) {
				      $(this).css({zIndex:6});
				},
				stop: function(event, ui) {
				      $(this).css({zIndex:''});
				}
				});
		},
		
		enableListsDroppable: function() {
			$('ul>li', $('#systemLists, #customLists')).droppable('destroy');
			$('ul > li:not(.current)', $('#systemLists, #customLists')).droppable({
						tolerance: 'pointer',
						over: function(event, ui) {
							if(ui.draggable.hasClass('item')) {
								$(this).addClass('droppableha');
							}else if(ui.draggable.hasClass('list')) {
								$(this).addClass('dragHover');
							}
						},
						out: function(event, ui) {
							if(ui.draggable.hasClass('item')) {
								$(this).removeClass('droppableha');
							}else if(ui.draggable.hasClass('list')) {
								$(this).removeClass('dragHover');
							}
						},
						drop: function(event, ui) {
							if(ui.draggable.hasClass('item')) {
								$(this).removeClass('droppableha');
								moveItem(ui.draggable.attr('itemid'), this.id, callback);
								
								function callback(tx, ds){
									ui.draggable.remove();
									//if (!ui.draggable.hasClass('reading')) {
									//	numberController.badge($('.list.current'), $(event.target));
									//}
									initListsBadge();
									numberController.header();
									//numberController.list(ui.draggable, $('.list.current'), this);
									/* if (!ui.draggable.hasClass('reading')) {
										if(this.id=='inbox') BG.updateIcon('addItemIcon');
										else if($('body.inbox')) BG.updateIcon('deleteIcon');
									} */
									BG.Diigo.syncBegin(1);
								}
								
								
								
								//itemActionNum('move', ui.draggable.hasClass('reading'), this.id);
								
								
								
							}else if(ui.draggable.hasClass('list')) {
								$(this).removeClass('dragHover');
								ui.draggable.css({opacity:'', left:'', top:''});
								$(this).after(ui.draggable)
							}
						}
					});
		},
		
		enableListsClickable: function() {
			$('#leftColumn>nav').click(function(e) {
				var target = e.target;
				var $parent = $(target).parents('li.list');
				if ($parent.length) {
					$('li.current').removeClass('current');
					$parent.addClass('current');
					$('body').removeClass().addClass(list);
					itemsList.innerHTML = '';   //switch current then clear box
					$('#top').html('');
					var list = $parent.attr('id');
					loadItems(list, function(tx, ds) {
						buildItems(tx, ds, list);
						numberController.header();
						itemController.init();
						toppanelController.init();
						var $v = $('#toppanel').width();		
						$('#items ul li.item').css({width:($v-10)+'px'});
						listController.enableListsDroppable();
					});
				}
			});
		}
	};
	ListController.fn.init.prototype = ListController.fn;
	window.ListController = ListController;
})();


/*
 * Option Controller
 *----------------------------------------------------------------*/
(function(){
	var OptionController = function(){
		return new OptionController.fn.init();
	};
	
	OptionController.fn = OptionController.prototype = {
		init:function(){
			this.buildoption();
			this.enableOption();
			return this;
		},
		
		enableOption:function(){
			$('#options').unbind().click(function(e){
				var target = e.target;
				//console.log(target);
				if(target.tagName=='SPAN'){
					optionController.optionAction(target);
				}else if(target.type=='checkbox'){
					if(target.name=='shortcuts'){
						optionController.shortcutsAction(target);
					}else if(target.name == 'saveclosetab'){
						optionController.saveCloseTab(target);
					}else if(target.name == 'superfish'){
						optionController.SuperFish(target);
					}
				}
				
			});
			
			
			$('#navOptions').unbind().click(function(e){
				var target = e.target;
				//console.log(target);
				if(target.tagName=='SPAN'){
					optionController.optionAction(target);
				}
			});
				
			$('#options').find('.shortcuts').find('select').change(function(){
				var shortcuts = JSON.parse(localStorage['shortcuts']);
				shortcuts.value = $('#options').find('.shortcuts').find('select option:selected').val();;
				shortcuts = JSON.stringify(shortcuts);
				localStorage['shortcuts']=shortcuts;
			});
			
			var shortcuts = JSON.parse(localStorage['shortcuts']);
			if(shortcuts.enable==1) {
				$('#shortcuts').attr('checked',true);
				$('#options').find('.shortcuts').find('select').attr('disabled',false);
			}
			$('#options').find('.shortcuts').find('option[value='+shortcuts.value+']').attr('selected',true);
			
			var saveclosetab = JSON.parse(localStorage['saveclosetab']);
			if(saveclosetab.enable==1){
				$('#saveclosetab').attr('checked',true);
			}

			var superfish = JSON.parse(localStorage['superfish']);
			if(superfish.enable==1){
				$('#superfish').attr('checked',true);
			}
		},
		
		optionAction:function(target){
			var action = target.textContent;
			switch(action){
				case getI18nMsg('sonline'):
				case 'Settings':  //for open option setting action.
					if($('#options').is(":visible")){
						$('#cover').hide();
						$('#options').animate({top: '-320px'},300).animate({ opacity: 'hide'},10);
							
						
						//$(target).removeClass('optionhover');
					}else{
						$('#options').animate({ opacity: 'show'},10).animate({top: '0px'},300);
						$('#cover').show();
						$('#cover').click(function(e){
							$('#cover').hide();
							$('#options').animate({top: '-320px'},300).animate({ opacity: 'hide'},10);
						});
						
						
						$('body').keyup(function(e) {
							if (e.keyCode === 13 && $('#option_2 .unauth').is(":visible")){
								var t_a={
									textContent:getI18nMsg('signin')
								};
								optionController.optionAction(t_a);
							}
						});
						
						
						//$(target).addClass('optionhover');
					}
					break;
				case getI18nMsg('close'):
					$('#cover').hide();
					$('#options').animate({top: '-320px'},300).animate({ opacity: 'hide'},10);
					break;
				case getI18nMsg('signin'):
					$username = $('input[name="diigo_user"]').val();
					$password = $('input[name="diigo_pwd"]').val();				
					$('#option_2 #sync_1 .error').html(getI18nMsg('sigining'));
					$('#option_2 #sync_1 .error').css('color','black');
					$('#option_2 #sync_1 .error').show();
					
					if(BG.Diigo.signing!=true){
						console.log('signin');
						BG.Diigo.signin($username,$password);
					}
					
					
					break;
				case getI18nMsg('stop'):
					$('#cover_2').show();
					$('#StopSyncdialog').dialog({
						resizable:false,
						position:'top',
						height:80,
						width:400,
						modal:true,
						buttons:{
							'Yes':function(){
								localStorage['lastdiigo'] = JSON.parse(localStorage['diigo']).user_id;
								delete localStorage['diigo'];
								$('.normalLink').hide();
								$('#option_2 .auth').hide();
								$('#option_2 .unauth').show();
								$(this).dialog("close");
								$('#cover_2').hide();
								
								rebuildAPP();
							},
							Cancel:function(){
								$(this).dialog("close");
								$('#cover_2').hide();
							}
						}
						
					});
					$('.ui-dialog').css('top','150px');
					break;
				case 'Sync':
					BG.Diigo.networkerror = false;
					BG.Diigo.syncBegin();
					getAllUreadNum(function(tx,ds){
						if(ds.rows.item(0)['COUNT(id)']<15){
							BG.Diigo.loadMoreUnread();	
						}
					});
					
					break;
				case 'Google account':
					
					//chrome.tabs.create({url:google_signin_url});
					break;
			}
		},
		
		shortcutsAction:function(target){
			if(target.checked){
				$('#options').find('.shortcuts').find('select').attr('disabled',false);
				var shortcuts = JSON.parse(localStorage['shortcuts']);
				shortcuts.enable = 1;
				shortcuts = JSON.stringify(shortcuts);
				localStorage['shortcuts']=shortcuts;
			}else{
				$('#options').find('.shortcuts').find('select').attr('disabled','disalbed');
				var shortcuts = JSON.parse(localStorage['shortcuts']);
				shortcuts.enable = 0;
				shortcuts = JSON.stringify(shortcuts);
				localStorage['shortcuts']=shortcuts;
			}
		},
		
		saveCloseTab:function(target){
			if(target.checked){
				var saveclosetab = JSON.parse(localStorage['saveclosetab']);
				saveclosetab.enable = 1;
				saveclosetab = JSON.stringify(saveclosetab);
				localStorage['saveclosetab'] = saveclosetab;
			}else{
				var saveclosetab = JSON.parse(localStorage['saveclosetab']);
				saveclosetab.enable = 0;
				saveclosetab = JSON.stringify(saveclosetab);
				localStorage['saveclosetab'] = saveclosetab;
			}
		},

		SuperFish:function(target) {
			if(target.checked){
				var superfish = JSON.parse(localStorage['superfish']);
				superfish.enable = 1;
				superfish = JSON.stringify(superfish);
				localStorage['superfish'] = superfish;
			}else{
				var superfish = JSON.parse(localStorage['superfish']);
				superfish.enable = 0;
				superfish = JSON.stringify(superfish);
				localStorage['superfish'] = superfish;
			}
		},
		
		buildoption:function(){
			//build shortcuts select;
			var slecthtml='<select disabled="disabled">';
			for(i=48;i<91;i++){
				if(! (i > 57 && i < 65)){
					var d = String.fromCharCode(i);
					slecthtml+='<option value="'+d+'">'+d+'</option>';
				}
			}
			slecthtml+='</select>';
			$('#options').find('.shortcuts').html('Ctrl+Shift+'+slecthtml);
			if(!localStorage['shortcuts']){
				var shortcuts = '{"enable":0,"value":"L"}';
				localStorage['shortcuts']=shortcuts;
			}
			
			if(!localStorage['saveclosetab']){
				var saveclosetab = '{"enable":0}';
				localStorage['saveclosetab'] = saveclosetab;
			}

			if(!localStorage['superfish']){
				var superfish = '{"enable":0}';
				localStorage['superfish'] = superfish;
			}
			
			//$('').removeAttr('style');
			
			
			if(getQueryString('opensetting')==1){
				$('#options').tabs();
				$('#options').tabs("select",1);
			}else{
				$('#options').tabs();
			}
			if(localStorage['diigo']){
				//var auth_html='<table><tr><td>Diigo.com('+JSON.parse(localStorage['diigo']).user+')</td><td><span>Stop sync</span></td></tr><tr><td colspan="2">Last sync at 2011-1-21</td></tr></table>'
				var auth_html='<div class="Services"><span></span><a href="https://www.diigo.com/user/'+JSON.parse(localStorage['diigo']).user+'?type=bookmark" target="_blank">Diigo.com('+JSON.parse(localStorage['diigo']).user+')</a></div><span class="optionbutton">'+getI18nMsg('stop')+'</span><div class="time">'+getI18nMsg('lastsync')+BG.getTime.localTimeFromUTC(localStorage['diigo_upload_stamp'])+'</div>';
				$('#option_2 .unauth').hide();
				$('#option_2 .auth').html(auth_html).show();
				$('#navOptions ul li:nth-child(2)').show();
				$('#navOptions ul li:nth-child(2)').html('<span title="'+getI18nMsg('lastsync')+BG.getTime.localTimeFromUTC(localStorage['diigo_upload_stamp'])+'">Sync</span>');
			}else{
				$('#option_2 .auth').hide();
				$('#option_2 .unauth').show();
				$('#navOptions ul li:nth-child(2)').hide();
			}
			
			
			var redirect_url= "https://www.diigo.com/readlaterfastsigndone";
			var google_signin_url = 'https://secure.diigo.com/account/thirdparty/openid?openid_url=https://www.google.com/accounts/o8/id&redirect_url='+redirect_url+'&request_from=chrome_read_later_fast';
			
			$('.googleaccount a').attr('href',google_signin_url);
			



		}
	};
	
	
	OptionController.fn.init.prototype = OptionController.fn;
	window.OptionController = OptionController;
})();

/*
 * Init Split View
 *----------------------------------------------------------------*/
function initSplitView() {
	try{$('#column').splitter({type: 'v', initA: true});}catch(e){}
	$(window).bind("resize", function(){
			$("#leftColumn").css({height:'100%'});
			$(".vsplitbar").css({height:'100%'});
			var rightColumnWidth = $('#column').width() - $('#leftColumn').width() - 2;
			$("#rightColumn").css({height:'100%', width:rightColumnWidth+'px'});
	 });	
}


/*
 * Build Items
 *----------------------------------------------------------------*/
function buildItems(tx, ds, list) {
	var rows = ds.rows;
	var len = rows.length;
	itemsList.innerHTML = '';
	var itemscontent ='';
	//for (var i=len-1; i>-1; --i) {
	for(var i=0;i<len;i++){
		var row = rows.item(i);
		//itemsList.innerHTML += getItemHTML(row);
		itemscontent += getItemHTML(row);
		
	}
	
	itemsList.innerHTML = itemscontent;
	
	$('body').removeClass().addClass(list); //after item loaded, change state
	
	if(itemsList.innerHTML.length >5){
		$('#top').html('<div id="toppanel"><span class="check" ><input type="checkbox" name="checkall" /><!--<div><ul><li>all</li><li>none</li><li>read</li><li>unread</li></ul></div>--></span><span class="archive">'+getI18nMsg('archive')+'</span><span class="restore">'+getI18nMsg('unread')+'</span><span class="delete">'+getI18nMsg('delete')+'</span><!--<span class="markread">mark as read</span><span class="markunread">mark as unread</span>--><cite class="errormessage">'+getI18nMsg('noselected')+'</cite><cite id="headerMiddle"></cite></div>');
			if(localStorage['diigo']){
				if($('body').attr('class')=='inbox'){
					$('.normalLink').attr('href','https://www.diigo.com/user/'+JSON.parse(localStorage['diigo']).user+'?type=bookmark&read=no');
				    }else{
					$('.normalLink').attr('href','https://www.diigo.com/user/'+JSON.parse(localStorage['diigo']).user+'?type=bookmark');
				    }
				$('.normalLink').show();
			}else{
				$('.normalLink').hide();
			}
		}else{
		$('#top').html('');
		$('.normalLink').hide();
	}
	
	
	
}

function buildItem(tx, ds) {
	if ($('body').hasClass('inbox')) {
		$(itemsList).prepend(getItemHTML(ds.rows.item(0)));
		itemController.init();
	}
	numberController.badge(null, $('#inbox'));
	numberController.header();
	adjustUI();
}

function updateItem(itemId,title,url){
	
	var html = title + '<span class="desc"></span>'
		+ '<div class="itemActions"><a data-href="'+ url +'" title="'+getI18nMsg('newtab')+'"></a>';
	
	$('li.item[itemID='+itemId+']').find('h3').html(html);
}

function getItemHTML(row) {
/* 		return '<li class="item'+ (row['state'] ? ' '+row['state'] : '') + '" itemid="' + row['id'] + '"><h3 class="itemTitle"' + (row['favicon'] ? (' style="background-image:url('+row['favicon']+')">') : '>') + '<a href="'+ row['url'] +'" target="_blank">' + row['title'] + '<span class="desc">' + row['desc'] + '</span></a>'
			+ '<div class="itemActions"><span class="delete">delete</span><span class="archive">archive</span><span class="restore">restore</span><span class="text">text view</span></div></h3><div class="itemContent"></div></li>';
 */

    if(row['favicon']){
        var favicon = row['favicon'].replace(/^.*?;base64/,"data:image/png;base64");
    }


	return '<li class="item'+ (row['state'] ? ' '+row['state'] : '') + '" itemid="' + row['id'] + '">'+'<input type="checkbox" name="item" value="'+row['id']+'"/>' +'<h3 class="itemTitle"' + (row['favicon'] ? (' style="background-image:url('+favicon+')">') : '>')+ row['title'] + '<span class="desc">' + row['desc'] + '</span>'
		+ '<div class="itemActions"><span class="delete">delete</span><span class="archive">archive</span><span class="restore">restore</span><span class="text">text view</span><a data-href="'+row['url']+'" title="'+getI18nMsg('newtab')+'"></a></div></h3><div class="itemContent"></div></li>';
}

/*
 * Init Application
 *----------------------------------------------------------------*/
function initApp(){
	BG = chrome.extension.getBackgroundPage();
	DB = BG.DB;
	settings = JSON.parse(localStorage['settings']);
	itemsList = $('#items>ul')[0];
	
	var list = settings.defaultList;
	loadItems(list, function(tx, ds) { //Load Article List
		buildItems(tx, ds, list);
		initUI();
	});
	
	
	function initUI() {
		initSplitView();
		$('#StopSyncdialog,#autherrordialog,#neterrordialog,#options').removeAttr('style');
		listController = new ListController();
		itemController = new ItemController();
		readerController = new ReaderController();
		numberController = new NumberController();
		optionController = new OptionController();
		toppanelController = new ToppanelController();
		initListsBadge();
		var winH = window.innerHeight;
		$('#items_f').css({height:(winH-50-10+4)+'px'});
		

		
		adjustUI();
		$(window).resize(readerController.updateDimension);
	}
}

function adjustUI(){
	var $v = $('#toppanel').width();
	$('#items ul li.item').css({width:($v-10)+'px'});
	if($('#items ul:empty')){
		$('#items').css('-webkit-box-shadow','none');
	}
	
	/*open setting auto*/
	if(getQueryString('opensetting')==1){
		var t_a={
			textContent:'Settings'
		};
		optionController.optionAction(t_a);
		// $('#options').tabs( "select" , 1);
		window.location.hash='';
	}
	
	
}

function rebuildAPP(){
	$list = $('body').attr('class');
	loadItems($list,function(tx,ds){
		buildItems(tx,ds,$list);
		initListsBadge();
		numberController.header();
		BG.updateIconBadge();  //send a message to Reader Later Extension to update icon badge.
		toppanelController.init();
		itemController.init();
		optionController.init();
		adjustUI();
		
	});
}

/*=======For Ads====*/

var ADs = {
	SearchO: function(){
		var adlisthtml = '';
		var html = '';
		html +='<div id="promotions" style="display:none">';
		html +='<span id="closeAdsMsg"></span>';
		html +='<h4 class="promoHeader">Tip</h4>';
		html +='<div id="SuperFish" class="msgItem">';
		html +='<a target="_blank" href="product.html">Read Later Fast now offers some additional features to improve your search and shopping experience online.  »</a>'
		html +='</div></div>';
		if(!localStorage['ads']){
			$('nav').append(html);
		}
		$('head').append('<link rel="stylesheet" href="css/ads.css" />');
		$('#closeAdsMsg').click(function(e){
			$('link[href="css/ads.css"]').remove();
			localStorage['ads'] = 1;
		});
	}
};

function URLopen(url){
	console.log(url);
	window.open('http://go.redirectingat.com?id=18202x753938&xs=1&url='+encodeURIComponent(url));
	//return false;

}	
function URLads(url){
	return 'http://go.redirectingat.com?id=18202x753938&xs=1&url='+encodeURIComponent(url);
}

function getQueryString(name) {
    // var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    // var r = window.location.search.substr(1).match(reg);
    // if (r != null) return unescape(r[2]); return null;
    var reg = new RegExp(name);
    var r = window.location.href.match(reg);
    if (r!=null) return 1;return null;
}


chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	switch(request.name){
		case 'auth_failure':
			$('#option_2 #sync_1 .error').html(getI18nMsg('signerror'));
			$('#option_2 #sync_1 .error').css('color','red');
			$('#option_2 #sync_1 .error').show();
			setTimeout(function(){
				$('#option_2 #sync_1 .error').hide();	
			},3000);
			break;
		case 'auth_success':
			$('#cover').hide();
			$('#options').animate({top: '-320px'},300).animate({ opacity: 'hide'},10);
			$('.setupsync').hide();
			$('#navOptions ul li:nth-child(2)').show();
			$('#option_2 #sync_1 .error').hide();
			BG.Diigo.syncBegin();
			break;
		case 'sync_begin':
			$('#navOptions ul li:nth-child(2)').html('<span title="'+getI18nMsg('syncing')+'">'+getI18nMsg('syncing')+'</span>');
			$('#navOptions ul li:nth-child(2) span').addClass('syncing');
			break;
		case 'sync_finish':
			$('#navOptions ul li:nth-child(2)').html('<span title="'+getI18nMsg('lastsync')+BG.getTime.localTimeFromUTC(localStorage['diigo_upload_stamp'])+'">Sync</span>');
			$('#navOptions ul li:nth-child(2) span').removeClass('syncing');
			optionController.init();
			break;
		case 'sync_auth_error':
			$('#navOptions ul li:nth-child(2)').html('<span title="'+getI18nMsg('lastsync')+BG.getTime.localTimeFromUTC(localStorage['diigo_upload_stamp'])+'">Sync</span>');
			$('#navOptions ul li:nth-child(2) span').removeClass('syncing');
			$('#cover').show();
			$('#autherrordialog').dialog({
				resizable:false,
				position:'top',
				height:80,
				width:400,
				modal:true,
				buttons:{
					'OK':function(){
						$(this).dialog("close");
						$('#cover').hide();
					}
				}
				
			});
			$('.ui-dialog').css('top','150px');
			break;
		case 'net_error':
			BG.Diigo.networkerror = true;
			$('#navOptions ul li:nth-child(2)').html('<span>Sync</span>');
			$('#navOptions ul li:nth-child(2) span').removeClass('syncing');
			$('#cover').show();
			$('#neterrordialog').dialog({
				resizable:false,
				position:'top',
				height:80,
				width:400,
				modal:true,
				buttons:{
					OK:function(){
						$(this).dialog("close");
						$('#cover').hide();
					}
				}
				
			});
			$('.ui-dialog').css('top','150px');
			break;
			break;
	}
});



  $(document).ready(function(){
		initApp();
		$('.extension span').click(function(){$('.extension').fadeOut('slow')})
		if(localStorage['extension'] == 'true'){
		    $('.extension').hide();
		}
		
		// $('<script><\/script>')
		// .attr({src: 'js/settext.js'})
		// .appendTo($('head'));
		settext();
		
		// $('<script><\/script>')
		// .attr({src: 'http://readict.com/promotion/script-for-RLF.js'})
		// .appendTo($('head'));
		
		ADs.SearchO();
	
		if(localStorage['diigo']){
		    
		    
		    $('.setupsync').hide();
		    BG.Diigo.networkerror = false;
		    BG.Diigo.syncBegin();
		    getAllUreadNum(function(tx,ds){
			    if(ds.rows.item(0)['COUNT(id)']<15){
				    BG.Diigo.loadMoreUnread();	
			    }
		    });
		    deleteArchiveMAX();
		    
		}
		if(getI18nMsg('local')=='zh_CN'){
		    $('.aboutdiigo ul li:eq(0)').hide();
		    $('.aboutdiigo ul li:eq(1)').hide();
		    $('.aboutdiigo ul li:eq(2)').hide();
		    $('.aboutdiigo ul li:eq(3)').hide();
		}

		
		
		
});
