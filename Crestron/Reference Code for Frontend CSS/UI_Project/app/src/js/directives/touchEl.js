/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

 
/*
 * TouchStart and TouchEnd directive for stationary elements
 * Sets CCS styles for element up and down states, and optionally calls a bound function on a press event and/or a long press
 *
 */

( function( ) {
	'use strict';

	angular
		.module( 'helium' )
		.directive( 'hlmTouchEl', hlmTouchEl );

	function hlmTouchEl( ) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                addClassName: '@',
                removeClassName: '@',

                childrenClassName: '@',
                childrenAddClassName: '@',
                childrenRemoveClassName: '@',

                disableInteraction: '<',
                enablePressAction: '<',
                enableLongPressAction: '<',

                duration: '@',
                callFnShort: '&',
                callFnLong: '&'
            },
            link: function ( scope, element ) {
                var timeout,
                    longPress = true;
                var domElement = element ? element[0] : null;

                scope.addClassName = scope.addClassName || '';
                scope.removeClassName = scope.removeClassName || '';

                scope.childrenClassName = scope.childrenClassName || '';
                scope.childrenAddClassName = scope.childrenAddClassName || '';
                scope.childrenRemoveClassName = scope.childrenRemoveClassName || '';

                scope.duration = scope.duration || 2000;
                scope.enableLongPressAction = scope.enableLongPressAction || false;
                scope.callFnShort = scope.callFnShort || function ( ) { };
                scope.callFnLong = scope.callFnLong || function ( ) { };

                var touchEndHandler = function ( event ) {
                    domElement.removeEventListener('touchend', touchEndHandler, { passive: false } );

                    if ( scope.disableInteraction !== true ) {
                        window.requestAnimationFrame( function( ) {
                            $( element ).removeClass( scope.addClassName );
                            $( element ).addClass( scope.removeClassName );

                            if ( scope.childrenClassName ) {
                                var children = $( element ).children(),
                                    i,
                                    child;

                                for ( i = 0; i < children.length; i++ ) {
                                    if ( children[i].className.indexOf( scope.childrenClassName ) !== -1 ) {
                                        child = $( children[i] );
                                        child.removeClass( scope.childrenAddClassName );
                                        child.addClass( scope.childrenRemoveClassName );
                                        break;
                                    }
                                }
                            }

                            if ( scope.enablePressAction === true ) {
                                if ( !longPress ) {
                                    clearTimeout( timeout );
                                    scope.callFnShort( event );
                                }
                            }
                        });
                    }
                };

                var touchStartHandler = function ( ) {
                    domElement.addEventListener('touchend', touchEndHandler, { passive: false } );

                    if ( scope.disableInteraction !== true ) {
                        window.requestAnimationFrame( function( ) {
                            $( element ).removeClass( scope.removeClassName );
                            $( element ).addClass( scope.addClassName );

                            if ( scope.childrenClassName ) {
                                var children = $( element ).children(),
                                    i,
                                    child;

                                for ( i = 0; i < children.length; i++ ) {
                                    if ( children[i].className.indexOf( scope.childrenClassName ) !== -1 ) {
                                        child = $( children[i] );
                                        child.addClass( scope.childrenAddClassName );
                                        child.removeClass( scope.childrenRemoveClassName );
                                        break;
                                    }
                                }
                            }

                            if ( scope.enablePressAction === true ) {
                                longPress = false;
                                timeout = setTimeout(
                                    function ( ) {
                                        if(scope.enableLongPressAction === true) {
                                            longPress = true;
                                            scope.callFnLong( );
                                        }
                                    }, scope.duration
                                );
                            }
                        });
                    }
                };

                domElement.addEventListener('touchstart', touchStartHandler, { passive: true } );
            },
        };
    }
})();
