/*
	disqusLoader.js v1.0
	A JavaScript plugin for lazy-loading Disqus comments widget.
	-
	By Osvaldas Valutis, www.osvaldas.info
	Available for use under the MIT License
*/

;( function( window, document, index )
{
	'use strict';

	var extendObj = function( defaults, options )
		{
			var prop, extended = {};
			for( prop in defaults )
				if( Object.prototype.hasOwnProperty.call( defaults, prop ))
					extended[ prop ] = defaults[ prop ];

			for( prop in options )
				if( Object.prototype.hasOwnProperty.call( options, prop ))
					extended[ prop ] = options[ prop ];

			return extended;
		},
		getOffset = function( el )
		{
			var rect = el.getBoundingClientRect();
			return { top: rect.top, bottom: rect.bottom };
		},
		loadScript = function( url, callback )
		{
			var script	 = document.createElement( 'script' );
			script.src	 = url;
			script.async = true;
			script.setAttribute( 'data-timestamp', +new Date());
			script.addEventListener( 'load', function()
			{
				if( typeof callback === 'function' )
					callback();
			});
			( document.head || document.body ).appendChild( script );
		},
		throttle		= function(a,b){var c,d;return function(){var e=this,f=arguments,g=+new Date;c&&g<c+a?(clearTimeout(d),d=setTimeout(function(){c=g,b.apply(e,f)},a)):(c=g,b.apply(e,f))}},

		throttleTO		= false,
		laziness		= false,
		disqusConfig	= false,
		scriptUrl		= false,

		scriptStatus	= 'unloaded',
		instance		= false,

		init = function()
		{
			if( !instance || !document.body.contains( instance ) || instance.disqusLoaderStatus == 'loaded' )
				return true;

			var offset = getOffset( instance );

			// if the element is too far below || too far above
			if( offset.top > window.innerHeight * laziness || offset.bottom < - instance.offsetHeight - ( window.innerHeight * laziness ) )
				return true;

			var tmp = document.getElementById( 'disqus_thread' );
			if( tmp ) tmp.removeAttribute( 'id' );
			instance.setAttribute( 'id', 'disqus_thread' );
			instance.disqusLoaderStatus = 'loaded';

			if( scriptStatus == 'loaded' )
			{
				DISQUS.reset({ reload: true, config: disqusConfig });
			}
			else // unloaded | loading
			{
				window.disqus_config = disqusConfig;
				if( scriptStatus == 'unloaded' )
				{
					scriptStatus = 'loading';
					loadScript( scriptUrl, function()
					{
						scriptStatus = 'loaded';
					});
				}
			}
		};

	window.addEventListener( 'scroll', throttle( throttleTO, init ));
	window.addEventListener( 'resize', throttle( throttleTO, init ));

	window.disqusLoader = function( element, options )
	{
		options = extendObj(
		{
			laziness:		1,
			throttle:		250,
			scriptUrl:		false,
			disqusConfig:	false,

		}, options );

		laziness		= options.laziness + 1;
		throttleTO		= options.throttle;
		disqusConfig	= options.disqusConfig;
		scriptUrl		= scriptUrl === false ? options.scriptUrl : scriptUrl; // set it only once

		if( typeof element === 'string' )				instance = document.querySelector( element );
		else if( typeof element.length === 'number' )	instance = element[ 0 ];
		else											instance = element;

		if (instance) instance.disqusLoaderStatus = 'unloaded';

		init();
	};

}( window, document, 0 ));
