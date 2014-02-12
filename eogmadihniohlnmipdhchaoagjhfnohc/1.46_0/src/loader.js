;(function(document, window, namespace, undefined) {

function loadAjax(url, name, context) {
    $.ajax({
        url: url,
        success: function(data) { context[name] = data; }
    });
}

/* Carga imagen */
function loadImage(src) {
    var image = window.Image ? new Image() : document.createElement("img");
        image.src = src;

    return image;
}

// verifica que se han cargado los datos
function checkLoad(resources, callback) {
var ajax, image;
setTimeout(function(){
    var context = resources.context;

        var complete = true;

        /* Verificar imagenes */
        for (image in resources.images) {
            if (!context[image].complete) {
                complete = false;
                break;
            }
        }
        
        for (ajax in resources.ajax) {
            if (!context[ajax]) {
                complete = false;
                break;
            }
        }

        if (complete) {
            callback.call(context);
        } else {
            setTimeout(arguments.callee, 500);
        }
    }, 500);
} 

/* Carga recursos del juego */
function loadResources(resources, callback) {
    var image, ajax;

    for (image in resources.images) {
        resources.context[image] = loadImage(resources.images[image]);
    }
    
    for (ajax in resources.ajax) {
        loadAjax(resources.ajax[ajax], ajax, resources.context);
    }
    
    checkLoad(resources, callback);
}

namespace.loadResources = loadResources;
}(document, window, game));
