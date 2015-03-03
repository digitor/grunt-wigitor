define(["jquery","lodash241","apputils"], function($, _, utils) {

	var NS = "ejswgt"
		,events = {
			INITED: "inited_"+NS
		}

	// attach API to window, accessible via 'window.dm.ejswgt'
	window.dm = window.dm || {};
	window.dm[NS] = window.dm[NS] || {};
	$.extend( window.dm[NS], {

		init: function() {


			// you will want to remove this if widget will have multiple instances on same page
			if( $("."+NS).length > 1 ) {
				apputils.warn( NS, "init()", "This module only supports a single instance." +
								" Multiple instances will probably break functionality." );
			}

			var $wgt = $("."+NS).eq(0);

			$(document).trigger( events.INITED );

		}

	});

	// if using AMD modules, you can use the returned result
	return window.dm[NS];
});