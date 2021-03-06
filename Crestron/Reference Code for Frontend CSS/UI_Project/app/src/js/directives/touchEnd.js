/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron's Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that's contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/**
 * Simple directive to call a function bound to the scope, when a touch-end event occurs on the element
 */

( function ( ) {
	'use strict';

	/* Simple directive to call a function bound to the scope, when a touch-end event occurs on the element */

	angular
		.module('helium')
		.directive('elTouchEnd', elTouchEnd);

		function elTouchEnd ( ) {
			return {
				restrict: 'A',
				replace: false,
				scope: {
					touchEndFn: '&'
				},
				link: function ( scope, element ) {
					var domElement = element ? element[0] : null;

					scope.touchEndFn = scope.touchEndFn || function ( ) { };

					var touchEndHandler = function () {
						scope.$apply(function() {
                            scope.$eval(scope.touchEndFn);
						});
					};

					domElement.addEventListener('touchend', touchEndHandler, {passive: false});
				},
			};
		}
} ) ( );
