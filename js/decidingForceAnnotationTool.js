$(document).ready(function () {
    // Setup click-to-hide on the question panels
    $('[data-toggle=divpanel]').click(function (clickEvent) {
        $($(clickEvent.target).data("target")).toggleClass("hidden");
    });

    // Start the colorpicker.
    $('#highlightColorpicker').colorpicker();
});