//for contentscript to collect keywords

var get_kw = function(){
    var googlekeywords = new RegExp("^http://www.google.(?:com|ca|co.uk|com.au|co.in|co.id|com.ph)/(?:search\\?|#)(?:.*&)?q=([^&=]*)(.*)$");
    var googleUrlRegExp = new RegExp("^http://www.google.(?:com|ca|de|fr|co.uk|com.au|co.in|co.id|com.ph|com.hk|co.jp)/.*$");
    match = googleUrlRegExp.exec(document.location.href);
    if(match){
        //for google search page
        function getkw(){
            if($('#res ol li').length>0 && !$("#res ol").data("qn_amzn")){
                var kw = $('#lst-ib').val();
                if(kw==undefined || kw.length<2) return;
                save_kw(kw,'google','#res ol li h3 a');
            }
        }
        document.addEventListener("DOMNodeInserted", function(){getkw();}, false);
    }
}


var save_kw = function(kw,se,element){
    //keywords ,search_engine_name ,element
    function save(){
        if($('#res ol').data("qn_amzn")) return;
        $('#res ol').data("qn_amzn_google_2",true);
        $('#res ol').data("qn_amzn",true);
        
        chrome.extension.sendRequest({name:'save_kw',keywords:kw},function(data){});
    }
    
    if(is_kw(kw,element)){
        save();
    }else{
        if(!$('#res ol').data("qn_amzn_google_2")){
            $('#res ol').data("qn_amzn_google_2",true);
            is_kw2(kw,function(r){
                if(r){
                    save();
                }
            });
        }
    }
}


var is_kw = function(keywords,element){
    var test_url = function(reg){
    var has_good = false;
    $(element).each(function(){
      if(reg.test($(this).attr('href'))){
        has_good = true;
        return false;
      }
    });
    return has_good;
    }
    var test_text = function(reg){
      var has_good = false;
      $(element).each(function(){
        if(reg.test($(this).text())){
          has_good = true;
          return false;
        }
      });
      return has_good;
    }
    
    var has_amazon = test_url(/www\.amazon\..*/);
    var has_ebay = test_url(/www\.ebay\..*/);
    var has_google_books = test_url(/books\.google\.com/);
    var has_buy = test_url(/www\.buy\.com/);
    var has_bestbuy = test_url(/www\.bestbuy\..*/);
    var has_shoppings = test_text(/Shopping results for /);
    
    var has_ecomm_verbs = /(^(B|b)uy |^(S|s)hop for|.* dvd.*|.*dvd .*|^(D|d)vd|^(C|c)heap)/.test(keywords);
    
    return has_amazon || has_bestbuy || has_buy || has_ebay ||has_ecomm_verbs || has_google_books || has_shoppings;
}

var is_kw2 = function(kw,callback){
    chrome.extension.sendRequest({name:'get_google_search',keywords:kw},function(data){
        //console.log(typeof data);
        data = JSON.parse(data);
        for(var i in data["responseData"]["results"])
      {
          var url = data["responseData"]["results"][i]["unescapedUrl"];
          if(/www\.amazon\.com/.test(url) || /www\.ebay\.com/.test(url) || 
              /www\.buy\.com/.test(url) || /www\.bestbuy\.com/.test(url))
          {
              callback(true);
          }
      }
      callback(false);
    });
}

get_kw();