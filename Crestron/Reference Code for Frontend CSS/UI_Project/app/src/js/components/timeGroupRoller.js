/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/*
 * Time-group-roller directive.
 *
 */
(function () {
    'use strict';

    angular
        .module('helium')
        .component('hlmTimeGroupRoller', {
            templateUrl: 'views/components/time-group-roller.html',
            controller: 'TimeRollerGroupCtrl',
            transclude: true,
            bindings: {
                formatTime: '<',
                hoursFormat: '<',
                minutesFormat: '<',
                ampmFormat: '<',
                langArabic: '<',
                startDate: '<',
                endDate: '<',
                step: '<',
                label: '=',
                data: '<',
                value: '=',
                hoursRange: '<',
                minutesRange: '<',
                ampmRange: '<',
                isSelected: '<'
            }
        });
})();

/*
 * Time-group-roller directive controller.
 *
 */
(function () {
    'use strict';

    angular
        .module('helium')
        .controller('TimeRollerGroupCtrl', TimeRollerGroupCtrl);

    TimeRollerGroupCtrl.$inject = [];

    function TimeRollerGroupCtrl() {
        var ctrl = this,
            old = {
                value: null,
                hour: null
            };

        function addMinutesToDate(date, mins) {
            return new Date(date.getTime() + mins * 60000);
        }

        function getCustomHours(startHour, endHour) {
            var generateHours = function () {
                    var ret = [],
                        hour = new Date(startHour);

                    while (hour < endHour) {
                        hour.setMinutes(0);
                        hour.setSeconds(0);
                        hour.setMilliseconds(0);
                        ret.push(hour);
                        hour = addMinutesToDate(hour, 60);
                    }
                    if (!ret.length || (endHour.getHours() !== ret[ret.length - 1].getHours())) {
                        ret.push(endHour);
                    }

                    return ret;
                },
                hours = generateHours();

            return {
                options: hours,
                value: hours[0]
            };
        }

        function getCustomMinutes(startMin, endMin) {
            var generateMinutes = function () {
                    var ret = [],
                        minute = startMin;
                    if (endMin.getHours() === 0) { //nextday
                        endMin = new Date(endMin);
                        endMin.setMinutes(0);
                    } else if (startMin.getHours() < endMin.getHours()) {
                        endMin = new Date(startMin);
                        endMin.setMinutes(59);
                    }
                    while (minute < endMin) {
                        ret.push(minute);
                        minute = addMinutesToDate(minute, 1);
                    }
                    if (!ret.length || (endMin.getMinutes() !== ret[ret.length - 1].getMinutes())) {
                        ret.push(endMin);
                    }

                    return ret;
                },
                mins = generateMinutes();

            return {
                options: mins,
                value: mins[0]
            };
        }

        function getCustomAmpm(startDate, endDate) {
            var startHour = startDate.getHours(),
                endHour = endDate.getDay() !== startDate.getDay() ? 24 : startDate.getHours();

            if (startHour < 12 && endHour < 12) {
                return {
                    options: [startDate],
                    value: startDate
                };
            }
            if (startHour < 12 && endHour >= 12) {
                return {
                    options: [startDate, endDate],
                    value: startDate
                };
            }
            if (startHour >= 12 && endHour >= 12) {
                if (endHour < 24) {
                    return {
                        options: [endDate],
                        value: endDate
                    };
                } else {
                    return {
                        options: [startDate],
                        value: startDate
                    };
                }
            }
        }

        function setCustomHour(startDate, endDate) {
            ctrl.hoursRange = getCustomHours(startDate, endDate);
        }

        function setCustomMinute(startDate, endDate) {
            ctrl.minutesRange = getCustomMinutes(startDate, endDate);
        }

        function setCustomAmpm(startDate, endDate) {
            if (ctrl.ampmFormat)
                ctrl.ampmRange = getCustomAmpm(startDate, endDate);
        }

        function setCustomTime() {
            if (!ctrl.startDate || !ctrl.endDate) return;
            ctrl.ampmFormat = ctrl.ampmFormat || false;
            setCustomHour(ctrl.startDate, ctrl.endDate);
            setCustomMinute(ctrl.startDate, ctrl.endDate);
            setCustomAmpm(ctrl.startDate, ctrl.endDate);
        }

        ctrl.$onInit = function () {
            if (!ctrl.data || !ctrl.data.options) {
                setCustomTime();
            }
        };

        ctrl.$onChanges = function (changes) {
            if (!ctrl.data || !ctrl.data.options) {
                if (changes.startDate || changes.endDate) {
                    setCustomTime();
                }
            }
        };

        ctrl.$doCheck = function () {
            if (!ctrl.data || !ctrl.data.options) {
                if (ctrl.hoursRange && ctrl.minutesRange) {
                    var value = new Date(),
                        dayNow = value.getDate(),
                        hoursRangeValue = new Date(ctrl.hoursRange.value);

                    value.setDate(hoursRangeValue.getDate());
                    value.setHours(hoursRangeValue.getHours());
                    value.setMinutes(dayNow !== hoursRangeValue.getDate() ? 0 : new Date(ctrl.minutesRange.value).getMinutes());
                    value.setSeconds(0);
                    value.setMilliseconds(0);
                    if (value.getTime() && (!old.value || old.value.getTime() !== value.getTime())) {
                        ctrl.value = old.value = value;
                    }
                    if (hoursRangeValue.getTime() && (!old.hour || hoursRangeValue.getTime() !== old.hour.getTime())) {
                        old.hour = hoursRangeValue;
                        if (ctrl.startDate) {
                            setCustomMinute(new Date(Math.max(hoursRangeValue.getTime(), ctrl.startDate.getTime())), ctrl.endDate);
                            setCustomAmpm(new Date(Math.max(hoursRangeValue.getTime(), ctrl.startDate.getTime())), ctrl.endDate);
                        }
                    }
                    if (hoursRangeValue.getTime() && (!old.hour || hoursRangeValue.getTime() !== old.hour.getTime())) {
                        old.hour = hoursRangeValue;
                        if (ctrl.startDate) {
                            setCustomMinute(new Date(Math.max(hoursRangeValue.getTime(), ctrl.startDate.getTime())), ctrl.endDate);
                            setCustomAmpm(new Date(Math.max(hoursRangeValue.getTime(), ctrl.startDate.getTime())), ctrl.endDate);
                        }
                    }
                }
            } else {
                if (ctrl.data.value && (!old.value || old.value.getTime() !== ctrl.data.value.getTime())) {
                    ctrl.value = old.value = ctrl.data.value;
                }
            }
        };
    }
}());
