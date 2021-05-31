/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron's Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that's contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/*
 * Simple press event directive for scrolling elements
 * Will call bound function on press event
 * Able to receive a press cancel event from the parent ctrl if the list starts to scroll
 *
 */

( function( ) {
	'use strict';

	angular
		.module( 'helium' )
        .directive( 'scrollingPressEvent', scrollingPressEvent );

	function scrollingPressEvent( ) {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                scrollDirection: '@',
                scrollingPressEvent: '&',
                disablePress: '<'
            },
            link: function ( scope, element ) {
                // Need to extract the DOM element from the jqlite object that Angular provides, so that an addEventListener call can be made
                // Need to use addEventListener for touchStart and touchMove, so that the passive option can be turned on
                var domElement = element ? element[0] : null;

                var lastTouchEvent = {};
                var maxDriftPx = 30; // Maximum amount of movement (pixels) in the scroll direction before press is cancelled and it is just considered a scroll action
                var pressCancelled = false;

                // Get list scroll direction for use in the touchMove handler
                scope.scrollDirection = scope.scrollDirection || 'horizontal';
                scope.scrollingPressEvent = scope.scrollingPressEvent || function() {};

                var setLastTouchEvent = function ( event ) {
                    lastTouchEvent = {};
                    lastTouchEvent.pageX = event.touches[0].pageX;
                    lastTouchEvent.pageY = event.touches[0].pageY;
                    lastTouchEvent.currentTarget = event.currentTarget;
                    lastTouchEvent.target = event.target;
                };

                var callPress = function() {
                    if (!pressCancelled) {
                      scope.scrollingPressEvent()(lastTouchEvent);
                    }
                };

                var touchMoveHandler = function (event) {
                    if (!scope.disablePress && !pressCancelled) {
                        if (event.touches.length > 1) {
                            pressCancelled = true;
                            return;
                        }

                        if (scope.scrollDirection && (scope.scrollDirection === 'vertical' || scope.scrollDirection === 'portrait')) {
                            // Calculate total distance moved in Y direction
                            var distanceY = lastTouchEvent ? Math.abs(lastTouchEvent.pageY - event.changedTouches.item(0).pageY) : 0;
                            // If vertical distance moved is greater than the maxDriftPx property...
                            if (distanceY > maxDriftPx) {
                                pressCancelled = true;
                            }
                        } else {
                            // Calculate total distance moved in X direction
                            var distanceX = lastTouchEvent ? Math.abs(lastTouchEvent.pageX - event.changedTouches.item(0).pageX) : 0;
                            // If horizontal distance moved is greater than the maxDriftPx property...
                            if (distanceX > maxDriftPx) {
                                pressCancelled = true;
                            }
                        }

                        if(pressCancelled) {
                            domElement.removeEventListener('touchmove', touchMoveHandler, { passive: true });
                        }
                    }
                };

                var touchEndHandler = function ( event ) {
                    if(!scope.disablePress) {
                        //141458 - only handle 1 touch
                        if (event.touches.length > 0) {
                            return;
                        }

                        domElement.removeEventListener('touchmove', touchMoveHandler, { passive: true });
                        domElement.removeEventListener('touchend', touchEndHandler, { passive: false });

                        if ( !pressCancelled ) {
                            //Wrap in scope.$apply if it seems like timing is an issue here
                            callPress();
                        }
                    }
                };

                var touchStartHandler = function ( event ) {
                    if(!scope.disablePress) {
                        //141458 - only handle 1 touch
                        if (event.touches.length > 1) {
                            pressCancelled = true;
                            return;
                        }

                        pressCancelled = false;
                        setLastTouchEvent(event);

                        domElement.addEventListener('touchmove', touchMoveHandler, { passive: true });
                        domElement.addEventListener('touchend', touchEndHandler, { passive: false });
                    }
                };

                domElement.addEventListener('touchstart', touchStartHandler, { passive: true } );

                scope.$on('destroy', function() {
                    domElement.removeEventListener('touchstart', touchStartHandler, { passive: true } );
                    domElement.removeEventListener('touchmove', touchMoveHandler, { passive: true });
                    domElement.removeEventListener('touchend', touchEndHandler, { passive: false });
                });
            }
        };
	}
})();