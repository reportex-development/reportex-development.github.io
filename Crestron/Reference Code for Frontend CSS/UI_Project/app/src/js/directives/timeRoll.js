/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/*
 * timeRoll directive.
 *
 */

(function() {
	'use strict';

	angular
		.module('helium')
        .directive('hlmTimeRoll', TimeRollDirective);

    function TimeRollDirective( ) {
        return {
            scope: {
                data: '=',
                label: '=',
                langArabic: '<',
                formatTime: '<',
                isSelected: '<'
            },
            restrict: 'E',
            replace: true,
            template: [
                '<div class="time-roll border__theme-color-4"> ' +
                    '<div style="display:none">{{data.value | date: formatTime}}</div>'+
                    '<div class="time-roll__center border__theme-color-9"></div>' +
                    '<div class="time-roll__top"></div>' +
                    '<div class="time-roll__bottom"></div>' +
                    '<div class="time-roll__viewport">' +
                        '<ul>' +
                        '<li class="color__theme-color-6"><span></span></li>' +
                        '<li class="color__theme-color-6" data-ng-repeat="value in data.options track by $index">' +
                            '<span data-ng-if="!langArabic" data-value="{{$index}}">{{formatTime ? (value | date: formatTime) : value}} {{label}}</span>' +
                            '<span data-ng-if="langArabic" data-value="{{$index}}">{{label}} {{formatTime ? (value | date: formatTime) : value}} </span>' +
                        '</li>' +
                        '<li class="color__theme-color-6"><span></span></li>' +
                    '</ul>' +
                    '</div>' +
                '</div>'
            ].join(''),
            link: function ( scope, timeRoll ) {
                var tapDown = 0,
                    timer,
                    element = timeRoll.find( '.time-roll__viewport' ),
                    domElement = element ? element[0] : null,
                    firstItem = element.find( 'li' ).first( ),
                    itemHeight = firstItem.height( ),
                    halfThresholdHeight = itemHeight / 2,
                    selectClassName = 'time-roll__viewport__selected';

                 function getItems ( ) {
                    return timeRoll.find( '.time-roll__viewport > ul li' );
                }

                scope.$watch('data.options', function ( ) {
                    removeClassSelectedForAllItems( );
                    selectItem( 0 );
                    addClassSelectedForItem(timeRoll.find( '.time-roll__viewport > ul li:nth-child(' + 2 + ')' ));
                });

                scope.$watch('isSelected', function ( ) {
                    setTimeout(function() {
                        var parent = timeRoll.parent(),

                        sel = parent.find('.time-roll__viewport ul');

                        if(sel) {
                            sel.css('display', 'none');
                            sel.offset();
                            sel.css('display', '');

                        }
                    }, 100);
                });

                addListeners( );

                function getScrollHeight( ) {
                    return element.get( 0 ).scrollTop;
                }

                function addClassSelectedForItem ( el ) {
                    $( el ).addClass( selectClassName );
                }

                function removeClassSelectedForAllItems ( ) {
                    var el = getItems();

                    $( el ).removeClass( selectClassName );
                }

                function selectItem( item ) {
                    var newScroll = item * itemHeight;

                    element.animate( {
                        scrollTop: newScroll
                    }, 300 );
                }

                function scrollFinish( event ) {
                    clearTimeout( timer );

                    timer = setTimeout( refresh, 700, event );
                }

                function refresh( ) {
                    var scrollHeight = getScrollHeight( );

                    if ( tapDown === 0) {
                        if (scrollHeight % itemHeight > halfThresholdHeight ) {
                            element.animate( {
                                scrollTop: scrollHeight + itemHeight - ( scrollHeight % itemHeight )
                            }, 100 );
                        } else {
                            element.animate( {
                                scrollTop: scrollHeight - ( scrollHeight % itemHeight )
                            }, 100 );
                        }
                    }
                }

                function onScroll( ) {
                    var scrollHeight = getScrollHeight( ),
                        item,
                        blank_item = 1,
                        index_first_child = 1,
                        add = blank_item + index_first_child;

                    if ( scrollHeight % itemHeight > halfThresholdHeight ) {
                        item = ( scrollHeight + itemHeight - ( scrollHeight % itemHeight ) ) / itemHeight + add;
                    } else {
                        item = ( scrollHeight - ( scrollHeight % itemHeight ) ) / itemHeight + add;
                    }

                    removeClassSelectedForAllItems( );
                    addClassSelectedForItem(timeRoll.find( '.time-roll__viewport > ul li:nth-child(' + Math.round(item) + ')' ));
                    if ( scope.data.value !== scope.data.options[Math.round(item)-1-blank_item] ) {
                        scope.data.value = scope.data.options[Math.round(item)-1-blank_item];
                        scope.$apply();
                    }
                }

                function touchStartHandler () {
                    ++tapDown;
                    clearTimeout( timer );
                }

                function addListeners () {
                    element.bind( 'scroll', onScroll);

                    if(domElement) {
                        domElement.addEventListener('touchstart', touchStartHandler, { passive: true } );
                    }

                    element.bind( 'touchend', function ( ) {
                        tapDown = 0;
                        scrollFinish( );
                    } );
                }
            }
        };
	}
})();