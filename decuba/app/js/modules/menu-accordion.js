var menuPackage = (function($) {
    var init = function() {
		_initAccordion();
	};
var _initAccordion = function() {
    $(".view-menu").click(function () {
        var menu = $(this).parent().parent().parent().parent().parent().find(".packages-item-menu");
        menu.addClass("show");
        menu.parent().addClass("opened-section");

    })

    $(".close-menu").click(function () {
        var menu = $(this).parent().parent();
        menu.parent().removeClass("opened-section");
        menu.removeClass("show");
    })

    // ----------------Tabs-----------------

    $('.tab-label').click(function () {
        var tabId = $(this).attr('data-tab');
        $(this).parent().find(".tab-label").removeClass('active');
        $(this).addClass('active');
        $(this).parent().parent().parent().find(".menu-list").removeClass("active");
        $(this).parent().parent().parent().find("." + tabId).addClass('active');
    })
}
return {
    init: init,
};
})(jQuery);

jQuery(document).ready(function($) {
    menuPackage.init();
});