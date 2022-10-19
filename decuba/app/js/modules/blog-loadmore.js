var blogLoadmore = (function($) {
	'use strict';

	var _bind = function() {
		
		var offset = $('[data-loadmore-offset-start]').data('loadmore-offset-start') || 0;
        var exclude = $('[data-loadmore-exclude]').data('loadmore-exclude');
        $('.js-click-loadmore').click(function(e) {
            e.preventDefault();
            $.get("/blog-loadmore/?offset="+offset+"&exclude="+exclude,function(data){
                var elems = $.parseHTML( data );
                if (elems.length < 13) { // (6 nodes plus 7 empty text nodes)
                    $('.js-click-loadmore').remove();
                }
                $(".blog__listing_allposts").append(data);
                Waypoint.refreshAll();
                animWaypoints.blogPostScrollBehaviour();
                offset = offset+6;
            },'html')
            .done(function() {
			})
            .fail(function() {
                alert( "There was an issue connecting to the server. Sorry!" );
            });
            
        });
	};

	function init() {
		_bind();
	}

	return {
		init:init
	};
}(jQuery));

jQuery(document).ready(function($) {
	blogLoadmore.init();
});