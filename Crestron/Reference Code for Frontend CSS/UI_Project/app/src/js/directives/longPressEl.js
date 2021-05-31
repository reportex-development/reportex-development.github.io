/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

 
/*
 * Long press element.
 *
 * If long press is done do a action else do another action
 */

(function() {
    'use strict';
	
	angular
		.module('helium')
		.directive('helLongPressEl', LongPressElDirective);

	function LongPressElDirective( ) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                duration: '@',
                callFnShort: '&',
                callFnLong: '&'
            },
            link: function ( scope, element ) {
                var timeout,
                    longPress = true;

                scope.duration = scope.duration || 5000;
                scope.callFnShort = scope.callFnShort || function ( ) { };
                scope.callFnLong = scope.callFnLong || function ( ) { };

                element[0].addEventListener('touchstart', function ( ) {
                    longPress = false;
                    timeout = setTimeout( function  () {
                        longPress = true;
                        scope.callFnLong( );
                        }, scope.duration
                    );
                }, {passive: true});

                element[0].addEventListener( 'touchend', function ( event ) {
                    if ( !longPress ) {
                        clearTimeout( timeout );
                        event.preventDefault();
                        scope.callFnShort( event );
                    }
                });
            }
        };
	}
})();
