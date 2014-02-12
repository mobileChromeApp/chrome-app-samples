;(function(document, window, namespace, undefined) {
var $modal   = $("#modal"),
    $msg     = $("#modal-msg"),
    $close   = $("#close-modal"),
    $overlay = $("#overlay");  

$overlay.click(closeModal);

function showModal(id, tmpl) {
    
    $msg.html($.tmpl(id, tmpl));

    // Centrar Ventana
    var width = $modal.width() +
                 (parseInt($modal.css("padding-left"), 10) || 0) * 2 +
                 (parseInt($modal.css("border-width"), 10) || 0) * 2;

    $modal.css("margin-left", -width / 2);
    
    // Mostrar
    $modal.removeClass("hide");
    $overlay.show();
}

function closeModal() {
    $modal.addClass("hide");
    $overlay.hide();
}

$close.click(function() {
    closeModal();
    return false;
});

namespace.Modal = {
    open: showModal,
    close: closeModal
}

}(document, window, game));
