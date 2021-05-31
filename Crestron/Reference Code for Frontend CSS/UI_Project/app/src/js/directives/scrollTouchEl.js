/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron's Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that's contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/*
 * TouchStart and TouchEnd directive for scrolling element group
 * Sets CCS styles for element up and down states, and optionally calls a bound function on a press event
 * Able to receive a press cancel event from the parent ctrl if the list starts to scroll
 *
 */

(function () {
    'use strict';

    angular
        .module('helium')
        .directive('hlmScrollTouchEl', hlmScrollTouchEl);

    function hlmScrollTouchEl() {
        return {
            restrict: 'A',
            replace: true,
            scope: {
                scrollDirection: '@',

                addClassName: '@',
                removeClassName: '@',

                childrenClassName: '@',
                childrenAddClassName: '@',
                childrenRemoveClassName: '@',

                disableInteraction: '<',
                enablePressAction: '<',

                callPressFn: '&'
            },
            link: function (scope, element) {
                var domElement = element ? element[0] : null;
                var lastTouchEvent = {};
                var maxDriftPx = 30; // Maximum amount of movement (pixels) in the scroll direction before press is cancelled and it is just considered a scroll action
                var pressCancelled = false;

                // Get list scroll direction for use in the touchMove handler
                scope.scrollDirection = scope.scrollDirection || 'horizontal';

                scope.addClassName = scope.addClassName || '';
                scope.removeClassName = scope.removeClassName || '';

                scope.childrenClassName = scope.childrenClassName || '';
                scope.childrenAddClassName = scope.childrenAddClassName || '';
                scope.childrenRemoveClassName = scope.childrenRemoveClassName || '';

                scope.callPressFn = scope.callPressFn || function () { };

                var setLastTouchEvent = function (event) {
                    lastTouchEvent = {};
                    lastTouchEvent.pageX = event.touches[0].pageX;
                    lastTouchEvent.pageY = event.touches[0].pageY;
                    lastTouchEvent.currentTarget = event.currentTarget;
                    lastTouchEvent.target = event.target;
                };

                var completeListItemPressFn = function () {
                    scope.callPressFn(lastTouchEvent);
                };

                var releaseTriggered;
                /**
                 * This is to allow enough time for a display of the button press
                 */
                var completeListItemRelease = function () {
                    if (releaseTriggered) return;

                    releaseTriggered = true;

                    if (scope.enablePressAction === true && pressCancelled === false) {
                        completeListItemPressFn();
                    }

                    if ($(element).hasClass(scope.addClassName)) {
                        $(element).removeClass(scope.addClassName);
                        $(element).addClass(scope.removeClassName);

                        if (scope.childrenClassName) {
                            var children = $(element).children(),
                                i,
                                child;

                            for (i = 0; i < children.length; i++) {
                                if (children[i].className.indexOf(scope.childrenClassName) !== -1) {
                                    child = $(children[i]);
                                    child.removeClass(scope.childrenAddClassName);
                                    child.addClass(scope.childrenRemoveClassName);
                                    break;
                                }
                            }
                        }
                    }
                };

                var touchMoveHandler = function (event) {
                    if (!scope.disableInteraction) {
                        if (scope.scrollDirection && (scope.scrollDirection === 'vertical' || scope.scrollDirection === 'portrait')) {
                            // Calculate total distance moved in Y direction
                            var distanceY = lastTouchEvent ? Math.abs(lastTouchEvent.pageY - event.changedTouches.item(0).pageY) : 0;
                            // If vertical distance moved is greater than the maxDriftPx property...
                            if (distanceY > maxDriftPx) {
                                pressCancelled = true;
                            }
                        } else {
                            // Calculate total distance moved in Y direction
                            var distanceX = lastTouchEvent ? Math.abs(lastTouchEvent.pageX - event.changedTouches.item(0).pageX) : 0;
                            // If horizontal distance moved is greater than the maxDriftPx property...
                            if (distanceX > maxDriftPx) {
                                pressCancelled = true;
                            }
                        }
                    }

                    if (pressCancelled) {
                        domElement.removeEventListener('touchmove', touchMoveHandler, { passive: true });

                        completeListItemRelease();
                    }
                };

                var touchEndHandler = function (event) {
                    if (!scope.disableInteraction) {
                        domElement.removeEventListener('touchmove', touchMoveHandler, { passive: true });
                        domElement.removeEventListener('touchend', touchEndHandler, { passive: false });

                        completeListItemRelease();

                        if (!pressCancelled) {
                            event.preventDefault();
                        }
                    }
                };

                var touchStartHandler = function (event) {
                    if (!scope.disableInteraction) {
                        //141458 - only handle 1 touch
                        if (event.touches.length > 1) {
                            pressCancelled = true;
                            return;
                        }

                        pressCancelled = false;
                        releaseTriggered = false;

                        setLastTouchEvent(event);

                        domElement.addEventListener('touchmove', touchMoveHandler, { passive: true });
                        domElement.addEventListener('touchend', touchEndHandler, { passive: false });

                        $(element).removeClass(scope.removeClassName);
                        $(element).addClass(scope.addClassName);

                        if (scope.childrenClassName) {
                            var children = $(element).children(),
                                i,
                                child;

                            for (i = 0; i < children.length; i++) {
                                if (children[i].className.indexOf(scope.childrenClassName) !== -1) {
                                    child = $(children[i]);

                                    child.addClass(scope.childrenAddClassName);
                                    child.removeClass(scope.childrenRemoveClassName);
                                    break;
                                }
                            }
                        }
                    } else {
                        pressCancelled = true;
                        event.stopPropagation(); //This is to stop the event from bubbling up the display chain to the parent directive and triggering its listener
                    }
                };

                domElement.addEventListener('touchstart', touchStartHandler, { passive: true });

                scope.$on('destroy', function () {
                    domElement.removeEventListener('touchstart', touchStartHandler, { passive: true });
                    domElement.removeEventListener('touchmove', touchMoveHandler, { passive: true });
                    domElement.removeEventListener('touchend', touchEndHandler, { passive: false });
                });
            }
        };
    }
})();