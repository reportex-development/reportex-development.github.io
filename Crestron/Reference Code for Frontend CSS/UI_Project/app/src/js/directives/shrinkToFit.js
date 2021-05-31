/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

 
/*
 * Shrink to fit directive.
 */

(function() {
	'use strict';
	
	angular
		.module( 'helium' )
		.directive( 'hlmShrinkToFit', ShrinkToFitDirective );
	
	function ShrinkToFitDirective( ) {
        return {
            restrict: 'A',
            replace: false,
            scope: {
                string: '<',
                minSize: '<'
            },
            link : function(scope, element ) {
                var resizeNameToFit = function ( el, minSize ) {
                    var element = $( el ),
                        parent = element.parent( ),
                        fontsize = parseFloat( element.css( 'font-size' ) );

                    if ( fontsize > minSize ) {
                        if ( element.get(0).scrollWidth > Math.ceil( parent.width( ) ) ) {
                            element.css( 'fontSize', fontsize - 1 );
                            resizeNameToFit( el, minSize );
                        }
                    } else {
                        element.addClass( 'ellipsis' );
                    }
                };

                scope.minSize = scope.minSize || 24;

                scope.$watch( 'string', function( newValue ) { 
                    if ( newValue ) {
                        resizeNameToFit( element, scope.minSize );
                    }
                } );     
            }
        };
	}
})();