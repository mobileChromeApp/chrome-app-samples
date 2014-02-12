/* this file is for product.html in-line script*/
 function disablesuperfish(e){
    	var superfish = JSON.parse(localStorage['superfish']);
		superfish.enable = 0;
		superfish = JSON.stringify(superfish);
		localStorage['superfish'] = superfish;
		document.getElementById('disabletip').setAttribute('style','');
		setTimeout(function() {document.getElementById('disabletip').setAttribute('style','display:none;');}, 1500);
    }
    function enablesuperfish(e){
    	var superfish = JSON.parse(localStorage['superfish']);
		superfish.enable = 1;
		superfish = JSON.stringify(superfish);
		localStorage['superfish'] = superfish;
		document.getElementById('enabletip').setAttribute('style','');
		setTimeout(function() {document.getElementById('enabletip').setAttribute('style','display:none;');}, 1500);
    }
    document.getElementById('disablesuperfish').addEventListener('click',disablesuperfish,false);