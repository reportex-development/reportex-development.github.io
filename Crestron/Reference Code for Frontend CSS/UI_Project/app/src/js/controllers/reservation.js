/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

 
( function( ) {
	'use strict';

	angular
		.module( 'helium' )
		.controller( 'ReservationCtrl', ReservationCtrl );

	ReservationCtrl.$inject = [ '$scope', '$rootScope', '$uibModalInstance', 'TimelineService', 'CommunicationService', 'ModalService', 'DatetimeFactory',  'setNow', 'room', 'AppConfig' ];

	function ReservationCtrl( $scope, $rootScope, $uibModalInstance, TimelineService, CommunicationService, ModalService, DatetimeFactory, setNow, room, AppConfig) {
        var endOfTheDay = DatetimeFactory.getMidnightTommorrow( ),
            startReservationAction = false,
            scrollBottom = 0,
            reservationContainer = null,
            heliumSettings = $rootScope.Helium.settings;

        function getNextEventFromEventsAfterSetNow( ) {
            var nextMeeting,
                min;

            if ( setNow ) {
                angular.forEach( $rootScope.Helium.values.mainRoom.events, function ( event ) {
                    var diff = event.dtStart - setNow;

                    min = min ? min : ( ( diff > 0 ) ? diff : min );
                    if ( diff > 0 && diff <= min ) {
                        min = diff;
                        nextMeeting = event;
                    }
                } );
            }

            return nextMeeting;
        }

        function getMaximumDuration( ) {
            var duration,
                maxDurationProperty;

            if ( setNow ) {
                //Reserve timeline
              var nextEvent = getNextEventFromEventsAfterSetNow();
                if(heliumSettings.reservation && heliumSettings.reservation.reserveNowMaxDur) {
                    maxDurationProperty = heliumSettings.reservation.reserveNowMaxDur;
                }

                if ( nextEvent ) {
                    duration = DatetimeFactory.getTotalMinutesBetweenDates( $scope.reservation.now, nextEvent.dtStart );
                } else {
                    duration = DatetimeFactory.getTotalMinutesBetweenDates( $scope.reservation.now, endOfTheDay );
                }

                //Should never exceed maxReserveLength property value
                if(duration > maxDurationProperty) {
                    duration = maxDurationProperty;
                }
            } else {
                //Reserve now && Find room - Reserve now
                duration = heliumSettings.reservation &&  heliumSettings.reservation.reserveNowMaxDur ? heliumSettings.reservation.reserveNowMaxDur : 120;
            }

            return duration;
        }

        function getContainerHeight( ) {
            var height = 0,
                container = $( '.reservation__container' );

            if ( container.length ) {
                reservationContainer = reservationContainer ? reservationContainer : container[0];
                height = reservationContainer.scrollHeight - reservationContainer.clientHeight - 10;
            }

            return height;
        }

        function generateArray ( length ) {
            var ret = [];

            for(var i = 0; i < length; i++)
                ret.push(undefined);
            ret = ret.length ? ret : [undefined];

            return ret;
        }

        function getPreviousMeetingEndDatefromDate( date ) {
            var ret;
            if ($scope.reservations && $scope.reservations.length) {
                for( var i = $scope.reservations.length - 1; i >= 0; i-- ) {
                    if ($scope.reservations[i].dtEnd <= date) {
                        ret = $scope.reservations[i].dtEnd;
                        break;
                    }
                }
            }
            return ret || DatetimeFactory.getMidnightToday( );
        }

        function roundTimeQuarterHour(time, max, inc) {
            var timeToReturn = new Date(time);
            var roundedMinutes = Math.round(timeToReturn.getMinutes() / inc) * inc;

            //timeToReturn.setMilliseconds(Math.round(time.getMilliseconds() / 1000) * 1000);
            //timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
            timeToReturn.setMilliseconds(0);
            timeToReturn.setSeconds(0);
            timeToReturn.setMinutes(roundedMinutes);

            if (timeToReturn > max) {
                // reduce back to last avalilable time within max
                timeToReturn.setMinutes(timeToReturn.getMinutes() - inc);
            }

            return timeToReturn;
        }

        function getNextMeetingStartDatefromDateOrMax( date ) {
            var ret;
            var maxDate = DatetimeFactory.addMinutesToDate( date > $scope.reservation.now ? date : $scope.reservation.now, $scope.cfg.maximumDuration );
            var i = 0;
            for (i = 0; i < $scope.reservations.length; i++) {
                // console.log('$scope.reservations[i].dtStart = ' + $scope.reservations[i].dtStart);
                if ($scope.reservations[i].dtStart >= date) {
                    ret = $scope.reservations[i].dtStart;
                    break;
                }
            }
            if ( !ret ) {
                ret = DatetimeFactory.getMidnightTommorrow( );
            }

            ret = new Date(Math.min(ret.getTime( ), maxDate.getTime( )));
            //console.log('ret = ' + ret);

            return ret;
        }

        //setup the date on the $scope.reservation.now
        //this is date is rounded
        function getCalculatedReservationNow ( date ) {
            var step = $scope.cfg.step,
                roundedMinutes = setNow ? date.getMinutes( ) % step : 0,
                roundedDate = new Date( date.getTime( ) - (roundedMinutes === step ? 0 : ( roundedMinutes * 60 * 1000 ) ) ),
                previosMeetingEndDate = getPreviousMeetingEndDatefromDate ( date ),
                ret = new Date( Math.max( new Date( ).getTime( ), roundedDate.getTime( ) , previosMeetingEndDate.getTime( ) ) );

            ret.setMilliseconds(0);
            ret.setSeconds(0);

            return ret;            
        }

        $scope.focusEl = function( selected, up ) {
            var height;

            $rootScope.$evalAsync( function( ) {
                $scope.activeTimeRoll.selected = selected;
            } );

            setTimeout( function( ) {
                height = getContainerHeight( );
                scrollBottom = height > scrollBottom ? height : scrollBottom;
                scrollBottom =  up ? 0 : scrollBottom;
                $( reservationContainer ).animate( {
                    scrollTop: scrollBottom
                }, 350 );
             }, 250 );
        };

        $scope.loading = {
            state: false,
            message: $rootScope.Helium.labels.reservation.loadingMessage,
            showErrorMessageTimeout: false,
            responseReceived: false
        };
        $scope.room = room;
        $scope.setNow = setNow;
        $scope.reservations = room !== undefined ? [] : $rootScope.Helium.values.mainRoom.events;
        $scope.disableOrganizerEntry =
          (heliumSettings.schedule.source !== 'Fusion' && heliumSettings.schedule.source !== 'fusion' ) &&
          (heliumSettings.schedule.source !== 'DEMO' && heliumSettings.schedule.source !== 'Demo' && heliumSettings.schedule.source !== 'demo' );

        $scope.model = {
            subject: '',
            organizer: '',
            startDate: null,
            endDate: null
        };

        $scope.cfg = {
            step: 30,
            customTime: setNow ? heliumSettings.schedule.reserveCustomEn : false
        };
        $scope.reservation = {
            now: getCalculatedReservationNow(setNow || new Date()),
            lockedStart: setNow === undefined,
            startRange: { options: null, value: 0 },
            endRange: { options: null, value: 0 },
            roomId: room !== undefined ? room.id : null,
        };
        $scope.cfg.maximumDuration = getMaximumDuration ( );

        $scope.onKeypress = function( e ) {
            if ( e.which === 13 ) {
                e.preventDefault( );
                var inputs = Array.prototype.slice.call( $( 'input[type=text]' ) ),
                    index = inputs.indexOf( document.activeElement ),
                    nextInput = inputs[index + 1];

                if ( nextInput && !$scope.disableOrganizerEntry ) {
                    nextInput.focus( );
                } else if ( inputs[index] ) {
					//141413 - Behavior may change in the future, but this was an easy change and makes UX better
                    //Remove focus from current imput if there are no more to traverse
                    inputs[index].blur();
                }
            }
        };

        $scope.generateStartRange = function ( ) {
            var step = $scope.cfg.step,
                now = $scope.reservation.now,
                lastDateStart = getNextMeetingStartDatefromDateOrMax ( now ),
                maximumDuration = DatetimeFactory.getTotalMinutesBetweenDates ( now, lastDateStart ),
                generateRange = function ( ) {
                    var ret;

                    ret = generateArray (Math.min( $scope.cfg.maximumDuration, maximumDuration ) / step )
                        .map(function( c, i ) {
                            return new Date( + now + ( i * step * 60 * 1000 ) );
                        })
                        .filter(function( date ) {
                            return !$scope.reservations.some( function ( reservation ) {
                                return ( ( date >= reservation.dtStart ) && ( date < reservation.dtEnd ) ) || ( date > endOfTheDay );
                            });
                        });

                    return ret;
                },
                range = generateRange( );

            if ( $scope.cfg.customTime ) {
                $scope.reservation.startRange.options = null;
                $scope.reservation.startRange.startDate = $scope.reservation.now;
                $scope.reservation.startRange.endDate = DatetimeFactory.addMinutesToDate( lastDateStart, -1 );
                $scope.model.startDate = now;
            } else {
                $scope.reservation.startRange.options = range;
                $scope.reservation.startRange.value = $scope.reservation.startRange.options[0];
            }
        };

        $scope.generateEndRange = function () {
            if (!$scope.model.startDate) return;

            var step = $scope.cfg.step;
            var reserveNowEvenEndTime = heliumSettings.reservation.reserveNowEvenEndTime;
            var roundedMinutes = !setNow && reserveNowEvenEndTime ? step - ($scope.reservation.now.getMinutes() % step) : 0;
            var now = new Date($scope.model.startDate.getTime() + (roundedMinutes * 60 * 1000));
            var lastDateEnd = getNextMeetingStartDatefromDateOrMax(reserveNowEvenEndTime ? now : $scope.reservation.now);
            var maximumDuration = DatetimeFactory.getTotalMinutesBetweenDates(now, lastDateEnd);
            var generateRange = function () {
                var ret;
                // console.log('now = ' + now + ', lastDateEnd = ' + lastDateEnd);

                var arrayLength = Math.min($scope.cfg.maximumDuration, maximumDuration) / step;
                ret = generateArray(arrayLength)
                    .map(function (c, i) {
                        var endDate;
                        if (reserveNowEvenEndTime) {
                            endDate = new Date(+roundTimeQuarterHour(now, now, step) + ((i) * step * 60 * 1000));
                            return endDate;
                        }

                        endDate = new Date(+now + ((i) * step * 60 * 1000));
                        return endDate;
                    })
                    .filter(function (date) {
                        if (date <= $scope.model.startDate) {
                            return false;
                        }
                        return !$scope.reservations.some(function (reservation) {
                            return ((date > reservation.dtStart) && (now < reservation.dtEnd)) || (date > endOfTheDay);
                        });
                    });

                if (maximumDuration <= $scope.cfg.maximumDuration && ret.indexOf(lastDateEnd) === -1) {
                    if (reserveNowEvenEndTime) {
                        // needs to be even number of step
                        var prevLastDateEnd = lastDateEnd;
                        lastDateEnd = roundTimeQuarterHour(lastDateEnd, prevLastDateEnd, step);
                    }

                    if (ret.length > 0 && lastDateEnd > ret[ret.length - 1]) {
                        //avoid duplicate of the last?
                        ret.push(lastDateEnd);
                    }
                    else {
                        // only one entry apparently, this one.
                        if (ret.length === 0) {
                            ret.push(lastDateEnd);
                        }
                    }
                }

                return ret;
            };

            var options = generateRange();
            if ($scope.cfg.customTime && !reserveNowEvenEndTime) {
                var totalMinutes = DatetimeFactory.getTotalMinutesBetweenDates(now, options[0]);

                $scope.reservation.endRange.options = null;
                $scope.reservation.endRange.startDate = DatetimeFactory.addMinutesToDate(now, totalMinutes);
                $scope.reservation.endRange.endDate = lastDateEnd;
                $scope.reservation.endRange.value = $scope.reservation.endRange.startDate;
                $scope.model.endDate = $scope.reservation.endRange.startDate;
            } else {
                $scope.reservation.endRange.options = options;
                $scope.reservation.endRange.value = options[0];
            }
        };

        $scope.$watch('model.startDate', function( ) {
            $scope.generateEndRange( );
        });

        $scope.generateStartRange();

        $scope.activeTimeRoll = {
            selected: null,
            setSelected: function(who) {
                if (who === $rootScope.Helium.labels.reservation.starts && $scope.reservation.lockedStart) {
                    return;
                }

                $scope.activeTimeRoll.selected = who;
            },
            isSelected: function(who) {


                return $scope.activeTimeRoll.selected === who;
            }
        };

        $scope.cancel = function () {
            if ( $scope.room ) {
                $uibModalInstance.dismiss('cancel');
                ModalService.closeAll( );
            } else {
		        $uibModalInstance.dismiss('cancel');
            }
        };

        $scope.back = function ( ) {
            var callbackFn = function( ) {
                    $uibModalInstance.dismiss( 'cancel' );
                };

            if ( $scope.reservation.roomId ) {
                $( '.modal-reservation.slide-right' ).removeClass( 'modal-show' );
                setTimeout( callbackFn , 350 );
            } else {
                callbackFn( );
            }
        };

        $scope.add = function() {
            if ( !startReservationAction ) {
                $rootScope.$evalAsync( function( ) {
                    startReservationAction = false;
                    $scope.loading.state = true;
                    angular.extend( $rootScope.Helium.state.loading, $scope.loading );
                } );
                var timeoutPendingRoom = setTimeout( function(){
                    $rootScope.pendingReservation.prevRoomID = 0;
                }, AppConfig.timeoutPendingRoom);

                var timeoutErrorMessage = setTimeout( function( ) {
                    $rootScope.$evalAsync( function( ) {
                        if ( !$scope.loading.responseReceived ) {
                            ModalService.closeAll( );
                            $scope.loading.showErrorMessageTimeout = true;
                            $scope.loading.state = $rootScope.Helium.state.loading.state = false;
                            $rootScope.Helium.methods.openMsgError( true );
                            clearTimeout( timeoutPendingRoom );
                            $rootScope.pendingReservation.prevRoomID = 0;
                        }
					} );
                }, AppConfig.timeoutLoadingMask );

                $rootScope.pendingReservation.prevRoomID = $scope.reservation.roomId;

                CommunicationService.sendCreateEvent(
                    $scope.setNow ? true : false,
                    $scope.reservation.roomId,
                    $scope.model.subject ? $scope.model.subject : $rootScope.Helium.labels.reservation.defaultSubject,
                    $scope.model.organizer ? $scope.model.organizer : $rootScope.Helium.labels.reservation.defaultOrganizer,
                    $scope.model.startDate,
                    $scope.model.endDate,
                    function( success ) {
                        if ( !$scope.loading.showErrorMessageTimeout ) {
                            $scope.loading.responseReceived = true;
                            clearTimeout( timeoutErrorMessage );
                            $rootScope.$evalAsync( function( ) {
                                $scope.loading.state = $rootScope.Helium.state.loading.state = false;
                                startReservationAction = false;
                                ModalService.closeAll( );
                                if ( !success ) {
                                    $rootScope.Helium.methods.openMsgError( true );
                                    $rootScope.pendingReservation.prevRoomID = 0;
                                } else {
                                    if ( !$scope.setNow && $scope.room && $scope.room.name ) {
                                        $rootScope.Helium.methods.openMsgSuccess( true );
                                    }
                                }
                            } );
                        }
                    }
                );
            }
        };

        $scope.validReservation = function( ) {
            return  $scope.model.startDate < $scope.model.endDate;
        };

        $scope.isValidDate = function(date) {
            return date && date.getTime() === date.getTime();
        };
	}
} )( );
