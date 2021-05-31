/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

/*
 * Timeline component.
 *
 */

(function() {
  'use strict';

  angular.module('helium').component('hlmTimeline', {
    templateUrl: function() {
      //TODO Add arguments ( $element, $attrs ) if needed
      return 'views/components/timeline.html';
    },
    controller: 'TimelineCtrl',
    transclude: true,
    bindings: {
      timelinePlacement: '@',
      // timelineViewport sets the width or height of the timeline, based on the layout. Defaults to full width or height of panel
      timelineViewport: '@',
      // timelineBlockSize sets the width of each hour in the timeline
      timelineBlockSize: '@',
      timelineBlockHorizontalSize: '@',
      timelineBlockVerticalSize: '@',
      timelineNrHours: '@',
      timelineStartHour: '@',
      timelineMinutesScale: '@',
      timelineEvents: '<',
      timelineDisableInteraction: '<',
      timelinePauseAutoScroll: '<',

      timelineOpenNewEvent: '&',
      timelineOpenEvent: '&',

      timelineDisableClick: '<',
      timelineDisableDetailsClick: '<',
      timelineDisableAutoScroll: '<',

      timelineDialog: '@',
      timelineLabelTop: '@',
      timelineLabelRight: '@',
      timelineArabic: '@',
      timelineDateHourMarker: '<',
      timelineDateHourFormat: '<',
      timelineDateTimeFormat: '<',

      timelineIntervalAutoScroll: '@',

      timelineEvent: '<',
      timelineEventTitle: '<',
      timelineLabelNoon: '<',
    },
  });
})();

/**
 * Timeline components controller
 *
 * Business login for the timeline
 */
(function() {
  'use strict';

  angular.module('helium').controller('TimelineCtrl', TimelineCtrl);

  TimelineCtrl.$inject = ['$rootScope', '$scope', '$interval', 'SmoothScrollService'];

  function TimelineCtrl($rootScope, $scope, $interval, SmoothScrollService) {
    var ctrl = this,
      timelineDefault = {
        blockHorizontalSize: 322,
        blockVerticalSize: 113,
        dialogWidthPercent: 0.43,
        dialogBlockPercent: 3.5,
        nrHours: 24,
        lastHour: 24,
        startHour: 0,
        scale: 2,
        placement: 'horizontal',
        disableClick: false,
        disableDetailsClick: false,
        disableAutoScroll: false,
        pauseAutoScroll: false,
        labelTop: true,
        labelRight: true,
        verticalVisibleBlocks: 6,
        horizontalVisibleBlocks: 10,
        dateHourFormat: 'h',
        dateHourMarker: 'a',
        dateTimeFormat: 'h:mm a',
        intervalScrollToNow: 1000 * 60,
        intervalScrollToCurrentHour: 1000 * 60 * 60,
        intervalAutoScroll: 1000 * 10,
        //
      },
      smoothScrollCfg = {
        stopScrolling: false,
      },
      timelineTouchListenersAdded = false,
      fingerDown = false,
      timeoutAutoScrollToCurrentHour,
      intervalCurrentMinute,
      timeoutCurrentMinute,
      timelineElement;

    SmoothScrollService.setConfig(smoothScrollCfg);

    /**
     * Remove auto scroll event from tineline.
     * @function TimelineController#removeAutoScrollEvents
     */
    function removeAutoScrollEvents() {
      if (timelineElement) {
        timelineElement.removeEventListener('touchstart', touchStartHandler, { passive: true });
        timelineElement.removeEventListener('touchend', touchEndHandler, { passive: false });
      }

      timelineTouchListenersAdded = false;

      clearTimeout(timeoutAutoScrollToCurrentHour);
    }

    /**
     * Add auto scroll event to tineline.
     * @function TimelineController#addAutoScrollEvents
     */
    function addAutoScrollEvents() {
      if (timelineElement && timelineTouchListenersAdded === false) {
        timelineTouchListenersAdded = true;
        timelineElement.addEventListener('touchstart', touchStartHandler, { passive: true });
        timelineElement.addEventListener('touchend', touchEndHandler, { passive: false });
      }
    }

    /**
     * Handle Touch Start Event on timeline.
     * @function TimelineController#touchStartHandler
     */
    function touchStartHandler(event) {
      //Only handle single touch events
      if (event.touches.length > 1) {
        return;
      }

      fingerDown = true;
      smoothScrollCfg.stopScrolling = true;

      if (!ctrl.disableAutoScroll && !ctrl.pauseAutoScroll) {
        deactivateAutoScroll();
        return;
      }
    }

    /**
     * Handle Touch End Event on timeline.
     * @function TimelineController#touchEndHandler
     */
    function touchEndHandler(event) {
      if (event.touches.length > 0) {
        return;
      }

      fingerDown = false;
      smoothScrollCfg.stopScrolling = false;

      if (!ctrl.disableAutoScroll && !ctrl.pauseAutoScroll) {
        activateAutoScroll();
        return;
      }
    }

    /**
     * Start/reset auto-scroll timeout. Call when user is finished interacting with timeline.
     * @function TimelineController#activateAutoScroll
     * @param {object} event - The event.
     */
    function activateAutoScroll() {
      if (ctrl.disableAutoScroll || ctrl.pauseAutoScroll || fingerDown) {
        return;
      }

      var milliseconds = ctrl.intervalAutoScroll;

      clearTimeout(timeoutAutoScrollToCurrentHour);

      timeoutAutoScrollToCurrentHour = setTimeout(function() {
        if (fingerDown) {
          //Do not allow the list to auto-scroll while it is being pressed
          activateAutoScroll(); //to reset the timeout
          return;
        }

        if (timelineElement !== null && timelineElement !== undefined) {
          scrollToCurrentPosition(timelineElement);
        } else {
          setPositionCurrentTime();
        }
      }, milliseconds);
    }

    /**
     * Clear auto-scroll timeout. Call when user is interacting with timeline.
     * @function TimelineController#deactivateAutoScroll.
     */
    function deactivateAutoScroll() {
      clearTimeout(timeoutAutoScrollToCurrentHour);
    }

    /**
     * Scroll timeline to current time position.
     * @function TimelineController#scrollToCurrentPosition.
     * @param {object} element - The timeline element.
     */
    function scrollToCurrentPosition(element) {
      var position = getHourPositionCurrentTime();

      if (ctrl.placement === 'vertical' || ctrl.placement === 'portrait') {
        SmoothScrollService.scroll(element, position, 2000, 'vertical');
      } else {
        SmoothScrollService.scroll(element, position, 2000);
      }
    }

    /**
     * Returns an object with the hours and minutes based on the position given.
     * @function TimelineController#getTimeByPosition.
     * @param {number} position - The position.
     * @returns {Object} The hours and the minutes calculated based on the position.
     */
    function getTimeByPosition(position) {
      var hours, minutes;

      if (position && !isNaN(position)) {
        hours = Math.floor(position / ctrl.blockSize) + ctrl.startHour;
        minutes = Math.floor(((position % ctrl.blockSize) * 60) / ctrl.blockSize);
      }

      return {
        hours: hours,
        minutes: minutes,
      };
    }

    /**
     * Returns a position based on current time.
     * @function TimelineController#getHourPositionCurrentTime.
     * @returns {number} The position based on the current time.
     */
    function getHourPositionCurrentTime() {
      var currentTime = getTimeByPosition(ctrl.currentTimePosition),
        position,
        result;

      currentTime.minutes = 0;
      position = getPositionByTime(currentTime);

      if (!isNaN(position)) {
        if (ctrl.isArabic) {
          position = ctrl.timelineSize - position - ctrl.timelineViewport;
        }
        result = !isNaN(position) ? position : 0;
      } else {
        result = 0;
      }

      return result;
    }

    /**
     * Returns a position based on time given.
     * @function TimelineController#getPositionByTime.
     * @param {object} time - An object with the hours and minutes.
     * @returns {number} The position based on the time given.
     */
    function getPositionByTime(time) {
      var position;

      if (time && !isNaN(time.hours) && !isNaN(time.minutes)) {
        position = ctrl.blockSize * (time.hours - ctrl.startHour);
        position += (ctrl.blockSize / 60) * time.minutes;
      }

      return position;
    }

    /**
     * Calculate the offset of the element relative to window.
     * @function TimelineController#offsetXY.
     * @param {object} element - An element.
     * @returns {object} The offset left and top of the element given.
     */
    function offsetXY(element) {
      var el = element,
        left = 0,
        top = 0;

      while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        left += el.offsetLeft - el.scrollLeft;
        top += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
      }

      return {
        left: left,
        top: top,
      };
    }

    /**
     * Limit the nr of hours with available ones.
     * @function TimelineController#adjustNrHours.
     */
    function adjustNrHours() {
      var availableNrOfHours = timelineDefault.lastHour - ctrl.startHour;

      if (availableNrOfHours < ctrl.nrHours) {
        ctrl.nrHours = availableNrOfHours;
      }
    }

    /**
     * Checking if now is between given dates.
     * @function TimelineController#isNowBetweenDates.
     * @param {Datetime} startDate - start event.
     * @param {Datetime} endDate - end event.
     */
    function isNowBetweenDates(startDate, endDate) {
      var now = new Date();

      return startDate < now && now <= endDate;
    }

    /**
     * Checking if now is between given dates.
     * @function TimelineController#isNowAfterDate.
     * @param {Datetime} date - date.
     */
    function isNowAfterDate(date) {
      var now = new Date();

      return date < now;
    }

    /**
     * Sets the position and the size of the timeline events.
     * If there is an event, the size and the position will be set for this event.
     * @function TimelineController#setSizeAndPositionForEachEvent.
     */
    function setSizeAndPositionForEachEvent() {
      ctrl.timelineEvents = ctrl.timelineEvents || [];

      angular.forEach(ctrl.timelineEvents, function(event) {
        var sizeAndPosition = getSizeAndPositionForEvent(event);

        event.finished = isNowAfterDate(event.dtEnd) ? true : false;
        event.active = isNowBetweenDates(event.dtStart, event.dtEnd) ? true : false;
        event.startPosition = sizeAndPosition.startPosition;
        event.size = sizeAndPosition.size;
      });

      if (ctrl.timelineEvent) {
        var event = ctrl.timelineEvent;
        var evSizePos = getSizeAndPositionForEvent(event);

        event.startPosition = evSizePos.startPosition;
        event.size = evSizePos.size;
      }
    }

    /**
     * Return object time with hours/ minutes and seconds left between dow dates given.
     * @function TimelineController#getTimeLeftBetweenDates.
     * @param {String} date1 - Format '2017-01-10T09:00:00Z
     * @param {String} date2 - Format '2017-01-10T09:00:00Z
     */
    function getTimeLeftBetweenDates(date1, date2) {
      var diff = Math.abs(date1 - date2) / 1000,
        hours,
        minutes;
      // seconds;

      hours = Math.floor(diff / 3600);
      diff -= hours * 3600;

      minutes = Math.floor(diff / 60) % 60;
      diff -= minutes * 60;

      // seconds = diff % 60;

      return {
        hours: hours,
        minutes: minutes,
        // seconds: seconds,
      };
    }

    /**
     * Returns the position and the size of the timeline event.
     * @function TimelineController#getSizeAndPositionForEvent.
     * @param {object} event - The event.
     * @returns {object} The position and the size of event.
     */
    function getSizeAndPositionForEvent(event) {
      var dtStart = event.dtStart;
      var dtEnd = event.dtEnd;
      var timeStart = {
        hours: dtStart.getHours(),
        minutes: dtStart.getMinutes(),
      };
      var timeBetweenDates = getTimeLeftBetweenDates(dtEnd, dtStart);
      var ret = {
        startPosition: getPositionByTime(timeStart),
        size: getPositionByTime(timeBetweenDates),
      };

      return ret;
    }

    /**
     * Set interval for position of current time.
     * @function TimelineController#setIntervalPositionCurrentTime.
     */
    function setIntervalPositionCurrentTime() {
      timeoutCurrentMinute = setTimeout(function() {
        setPositionCurrentTime();

        intervalCurrentMinute = $interval(function() {
          setPositionCurrentTime();
        }, timelineDefault.intervalScrollToNow);
      }, 60020 - (new Date().getTime() % 60000));
    }

    /**
     * Set the position of current time indicator, and scrolls the timeline to .
     * @function TimelineController#setPositionCurrentTime.
     */
    function setPositionCurrentTime() {
      var now = new Date(),
        time = {
          hours: now.getHours(),
          minutes: now.getMinutes(),
        };

      ctrl.now = now;

      // This sets the current time indicator position with the ctrl.currentTimePosition binding
      ctrl.currentTimePosition = getPositionByTime(time);

      if (timelineElement && (!ctrl.disableAutoScroll && !ctrl.pauseAutoScroll && !fingerDown)) {
        scrollToCurrentPosition(timelineElement);
      }
    }

    /**
     * Generate list of hours for timeline.
     * @function TimelineController#generateHours.
     * @param {object} nr - Number of hours.
     * @param {object} start - The starting point of hours array.
     * @returns {array} The timeline array.
     */
    function generateHours(nr, start) {
      var timeArray = [],
        i = start,
        customEnd = nr + start,
        end = customEnd > timelineDefault.lastHour ? timelineDefault.lastHour : customEnd,
        today,
        sub1Start,
        sub2Start;

      for (i; i < end; i++) {
        today = new Date();
        today.setHours(i);
        today.setMinutes(0);
        today.setSeconds(0);

        sub1Start = new Date();
        sub1Start.setHours(i);
        sub1Start.setMinutes(0);
        sub1Start.setSeconds(0);

        sub2Start = new Date();
        sub2Start.setHours(i);
        sub2Start.setMinutes(30);
        sub2Start.setSeconds(0);

        var hourObj = {
          date: today,
          subHours: [
            {
              start: sub1Start,
            },
            {
              start: sub2Start,
            },
          ],
        };

        timeArray.push(hourObj);
      }

      return timeArray;
    }

    /**
     * Set jumpScrollToPosition property.
     * If there is an event the scroll position will be the event position
     * or it will be the position of current time hour.
     * @function TimelineController#jumpScrollToPosition.
     */
    function jumpScrollToPosition() {
      var position, eventDetails;

      if (ctrl.timelineEvent) {
        eventDetails = getSizeAndPositionForEvent(ctrl.timelineEvent);
        position = eventDetails.startPosition;
      } else {
        position = getHourPositionCurrentTime();
      }

      ctrl.jumpScrollToPosition = position;
    }

    /**
     * Set setLabelPosition property.
     * @function TimelineController#setLabelPosition.
     */
    function setLabelPosition() {
      if (ctrl.placement === 'vertical' || ctrl.placement === 'portrait') {
        ctrl.labelTop =
          ctrl.timelineLabelRight && ctrl.timelineLabelRight === 'true'
            ? false
            : timelineDefault.labelTop;
      } else {
        ctrl.labelTop =
          ctrl.timelineLabelTop && ctrl.timelineLabelTop === 'false'
            ? false
            : timelineDefault.labelTop;
      }
    }

    function setSizeVisibleTimeline(timeline) {
      if (timeline) {
        if (ctrl.placement === 'vertical' || ctrl.placement === 'portrait') {
          timeline.style.setProperty('height', ctrl.timelineViewport + 'px');
        } else {
          timeline.style.setProperty('width', ctrl.timelineViewport + 'px');
        }
      }
    }

    function setTimelineViewport() {
      if (ctrl.placement === 'portrait') {
        ctrl.timelineViewport = window.innerHeight * 0.375;
      } else if (ctrl.placement === 'vertical') {
        ctrl.timelineViewport = ctrl.timelineViewport
          ? parseInt(ctrl.timelineViewport)
          : window.innerHeight;
      } else {
        ctrl.timelineViewport = ctrl.timelineViewport
          ? parseInt(ctrl.timelineViewport)
          : window.innerWidth;
      }
    }

    function setStaticEvents() {
      var cloneEvents = ctrl.timelineEvents;

      angular.forEach(ctrl.timelineEvents, function(event) {
        event.selected = false;
      });

      ctrl.timelineEvents = [];
      angular.extend(ctrl.timelineEvents, cloneEvents);
    }

    function disableInteractionTimeline() {
      ctrl.disableClick = true;
      ctrl.disableDetailsClick = true;
      ctrl.disableAutoScroll = true;
      ctrl.centerEvent = true;
      setStaticEvents();
      $interval.cancel(intervalCurrentMinute);
    }

    function isString(param) {
      return typeof param === 'string' || param instanceof String;
    }

    /**
     * Calculate style height/width/position for event block
     * @function TimelineController#getStyle.
     * @param {object} event - The event.
     * @returns {string} The style of an event.
     */
    ctrl.getStyle = function(event) {
      var sizeAndPosition = getSizeAndPositionForEvent(event);
      var ret = {};

      if (ctrl.placement === 'vertical' || ctrl.placement === 'portrait') {
        ret = { height: sizeAndPosition.size + 'px', top: sizeAndPosition.startPosition + 'px' };
      } else {
        ret = { width: sizeAndPosition.size + 'px', left: sizeAndPosition.startPosition + 'px' };
      }

      return ret;
    };

    ctrl.isEventActive = function(event) {
      var isActive = false;

      if (!ctrl.timelineDisableInteraction) {
        if (isNowBetweenDates(event.dtStart, event.dtEnd)) {
          isActive = true;
        }
      }

      return isActive;
    };

    ctrl.isEventFinished = function(event) {
      var isFinished = false;

      if (!ctrl.timelineDisableInteraction) {
        if (isNowAfterDate(event.dtEnd)) {
          isFinished = true;
        }
      }

      return isFinished;
    };

    ctrl.isEventSelected = function(event) {
      var isSelected = false;

      if (ctrl.timelineDisableInteraction && event.selected) {
        isSelected = true;
      }

      return isSelected;
    };

    ctrl.isRoomReserved = function() {
      var isReserved = false;

      angular.forEach(ctrl.timelineEvents, function(event) {
        if (isNowBetweenDates(event.dtStart, event.dtEnd)) {
          isReserved = true;
        }
      });

      return isReserved;
    };

    ctrl.isSubBlockFinished = function(hour, n) {
      var currentPosition = ctrl.currentTimePosition,
        currentTime = getTimeByPosition(currentPosition),
        scale = ctrl.scale,
        oneHourInMinutes = 60,
        subBlockMinutes = oneHourInMinutes / scale,
        currentSubBlockTime = {
          hours: hour.subHours[n].start.getHours(),
          minutes: hour.subHours[n].start.getMinutes(),
        };

      if (currentTime.hours > currentSubBlockTime.hours) {
        return true;
      } else if (currentTime.hours === currentSubBlockTime.hours) {
        if (currentTime.minutes - currentSubBlockTime.minutes > subBlockMinutes) {
          return true;
        }
      }

      if ($rootScope.Helium.settings.reservation.reserveNowEvenEndTime) {
        if ($rootScope.Helium.values.mainRoom.events !== undefined) {
          var i = 0;
          for (i = 0; i < $rootScope.Helium.values.mainRoom.events.length; i++) {
            var event = $rootScope.Helium.values.mainRoom.events[i];

            if (
              event.dtStart.getHours() === currentSubBlockTime.hours &&
              event.dtStart.getMinutes() > currentSubBlockTime.minutes
            ) {
              if (currentSubBlockTime.minutes === 0) {
                if (event.dtStart.getMinutes() < 30) {
                  return true;
                }
                return false;
              } else {
                return true;
              }
            }
          }
        }
      }

      return false;
    };

    /**
     * On Click block calculate time and call callback parent function.
     * @function TimelineController#onClickBlock.
     * @param {object} eventData - The click event data that is required.
     */
    ctrl.onClickBlock = function(eventData) {
      if (ctrl.disableClick) {
        return;
      }

      var elPageX = eventData.pageX,
        elPageY = eventData.pageY,
        timeline = eventData.currentTarget.parentElement, //Should return "timeline__content", the scrolling portion of the timeline
        timelineScroll = timeline.parentElement, //Should return "timeline". It's the container for the scrolling list
        offsetTimeline = offsetXY(timeline), //Returns an object with the top and left scroll offsets
        position,
        time,
        now = new Date(),
        today = new Date();

      if (
        eventData.target.className.indexOf('timeline__content__block__subBlocks__subBlock') >= 0
      ) {
        if (ctrl.placement === 'vertical' || ctrl.placement === 'portrait') {
          position = elPageY - offsetTimeline.top + timelineScroll.scrollTop;
        } else {
          position = elPageX - offsetTimeline.left + timelineScroll.scrollLeft;
        }

        if (ctrl.isArabic) {
          position = !isNaN(position) ? ctrl.timelineSize - position : 0;
        }

        time = getTimeByPosition(position);
        today.setHours(time.hours, time.minutes, 0, 0);
        if (now <= today) {
          ctrl.timelineOpenNewEvent()(today);
        } else {
          var clickPosition = offsetXY(eventData.target),
            rightSubBlockPosition = ctrl.subBlockSize + clickPosition.left,
            bottomSubBlockPosition = ctrl.subBlockSize + clickPosition.top,
            currentTimePosition = ctrl.currentTimePosition;

            if (ctrl.placement === 'vertical' || ctrl.placement === 'portrait') {
              if (currentTimePosition > clickPosition.top && currentTimePosition < bottomSubBlockPosition) {
                ctrl.timelineOpenNewEvent()(now);
              }
            } else {
              if (currentTimePosition > clickPosition.left && currentTimePosition < rightSubBlockPosition) {
                ctrl.timelineOpenNewEvent()(now);
              }
            }
        }
      }
    };

    /**
     * On Click event block call callback parent function.
     * @function TimelineController#onClickEventBlock.
     * @param {object} event - The event that you clicked.
     */
    ctrl.onClickEventBlock = function(event) {
      if (ctrl.disableDetailsClick) {
        return;
      }

      event.selected = true;
      ctrl.timelineOpenEvent()(event);
    };

    ctrl.$onInit = function() {
      var countSubBlockBorders;

      //set timeout and intervals milliseconds for scroll to current position
      ctrl.intervalAutoScroll = ctrl.timelineIntervalAutoScroll
        ? parseInt(ctrl.timelineIntervalAutoScroll)
        : timelineDefault.intervalAutoScroll;

      // Set the time format
      ctrl.timelineDateHourFormat = isString(ctrl.timelineDateHourFormat)
        ? ctrl.timelineDateHourFormat
        : timelineDefault.dateHourFormat;
      ctrl.timelineDateHourMarker = isString(ctrl.timelineDateHourMarker)
        ? ctrl.timelineDateHourMarker
        : timelineDefault.dateHourMarker;
      ctrl.timelineDateTimeFormat = isString(ctrl.timelineDateTimeFormat)
        ? ctrl.timelineDateTimeFormat
        : timelineDefault.dateTimeFormat;

      // Set the timeline position - horizontal or vertical
      ctrl.placement = ctrl.timelinePlacement || timelineDefault.placement;
      ctrl.scale = ctrl.timelineMinutesScale
        ? parseInt(ctrl.timelineMinutesScale) + 1
        : timelineDefault.scale;

      ctrl.timelineArabic =
        ctrl.timelineArabic === 'true'
          ? true
          : ctrl.timelineArabic === 'false'
            ? false
            : ctrl.timelineArabic === true
              ? true
              : false;
      ctrl.showNoon = ctrl.timelineArabic ? false : true;
      ctrl.isArabic = ctrl.timelineArabic && ctrl.placement === 'horizontal' ? true : false;
      setTimelineViewport();

      if (ctrl.placement === 'vertical' || ctrl.placement === 'portrait') {
        ctrl.blockSize = ctrl.timelineBlockVerticalSize
          ? parseInt(ctrl.timelineBlockVerticalSize)
          : timelineDefault.blockVerticalSize;
      } else {
        ctrl.blockSize = ctrl.timelineBlockHorizontalSize
          ? parseInt(ctrl.timelineBlockHorizontalSize)
          : timelineDefault.blockHorizontalSize;
      }

      // Calculate numbers of subBlock of a block.
      ctrl.subBlockSize = Math.round(ctrl.blockSize / ctrl.scale);

      //Count of 1px border for each subBlock. Remove 1px border for first element.
      countSubBlockBorders = ctrl.scale; // - borderFirstElement;

      // Add to block size the 1px border from each subBlock.
      ctrl.blockSize = ctrl.blockSize + countSubBlockBorders / 2;

      // Calculate timeline size depending on number of hours set.
      ctrl.startHour = parseInt(ctrl.timelineStartHour) || timelineDefault.startHour;
      ctrl.nrHours = parseInt(ctrl.timelineNrHours) || timelineDefault.nrHours;
      adjustNrHours();

      ctrl.timelineSize = ctrl.blockSize * ctrl.nrHours;

      //Genrate array of hours
      ctrl.arrayHours = generateHours(ctrl.nrHours, ctrl.startHour);

      setSizeAndPositionForEachEvent();

      setPositionCurrentTime();
      setIntervalPositionCurrentTime();

      ctrl.disableClick =
        ctrl.timelineDisableClick !== undefined && ctrl.timelineDisableClick === true
          ? true
          : timelineDefault.disableClick;

      ctrl.disableAutoScroll =
        ctrl.timelineDisableAutoScroll !== undefined && ctrl.timelineDisableAutoScroll === true
          ? true
          : timelineDefault.disableAutoScroll;

      ctrl.pauseAutoScroll =
        ctrl.timelinePauseAutoScroll !== undefined && ctrl.timelinePauseAutoScroll === true
          ? true
          : false;

      ctrl.timelineEventTitle =
        ctrl.timelineEventTitle !== undefined && ctrl.timelineEventTitle === true ? true : false;

      ctrl.disableDetailsClick =
        ctrl.timelineDisableDetailsClick !== undefined && ctrl.timelineDisableDetailsClick === true
          ? true
          : timelineDefault.disableDetailsClick;

      //Set the component not to be interactive
      if (ctrl.timelineDisableInteraction) {
        disableInteractionTimeline();
      }

      jumpScrollToPosition();
      setLabelPosition();
    };

    function setTimelineElementReference() {
      setTimeout(function() {
        removeAutoScrollEvents();

        var timeline = document.getElementsByClassName('timeline--' + ctrl.placement);

        if (timeline.length && !timelineTouchListenersAdded) {
          timelineElement = timeline[0];

          setTimelineViewport();
          setSizeVisibleTimeline(timelineElement);

          addAutoScrollEvents();
        }
      }, 0);
    }

    ctrl.$onChanges = function(changesObj) {
      if (angular.isDefined(changesObj.timelinePlacement)) {
        ctrl.placement = changesObj.timelinePlacement.currentValue;
        setTimelineElementReference();
      }

      if (angular.isDefined(changesObj.timelineColorTheme)) {
        setTimelineElementReference();
      }

      if (angular.isDefined(changesObj.timelineDisableClick)) {
        ctrl.disableClick = changesObj.timelineDisableClick.currentValue;
      }

      if (angular.isDefined(changesObj.timelineDisableDetailsClick)) {
        ctrl.disableDetailsClick = changesObj.timelineDisableDetailsClick.currentValue;
      }

      if (changesObj.timelinePauseAutoScroll) {
        ctrl.pauseAutoScroll = changesObj.timelinePauseAutoScroll.currentValue;
        if (ctrl.pauseAutoScroll) {
          deactivateAutoScroll();
        } else {
          activateAutoScroll();
        }
      }

      if (changesObj.timelineDisableAutoScroll) {
        ctrl.disableAutoScroll = changesObj.timelineDisableAutoScroll.currentValue;
        if (ctrl.disableAutoScroll) {
          removeAutoScrollEvents();
        } else {
          addAutoScrollEvents();
        }
      }
    };

    ctrl.$postLink = function() {
      setTimelineElementReference();
    };

    ctrl.$onDestroy = function() {
      removeAutoScrollEvents();
      $interval.cancel(intervalCurrentMinute);
      clearTimeout(timeoutAutoScrollToCurrentHour);
      clearTimeout(timeoutCurrentMinute);
      timelineElement = null;
    };
  }
})();

/**
	Smoothly scroll element for the given duration
	Returns a promise that's fulfilled when done
*/
(function() {
  'use strict';

  angular.module('helium').service('SmoothScrollService', SmoothScrollService);

  SmoothScrollService.$inject = [];

  function SmoothScrollService() {
    var svc = this;

    /**
     * Smoothly interpolates between 0 and 1, based on
     * http://en.wikipedia.org/wiki/Smoothstep
     * @function SmoothScrollService#smoothStep.
     * @param {number} edge0 - The left edge.
     * @param {number} edge1 - The right edge.
     * @param {number} x - Value between edge0 and edge1.
     */
    function smoothStep(edge0, edge1, point) {
      var x;
      x = clamp((point - edge0) / (edge1 - edge0), 0.0, 1.0);

      return x * x * x * (x * (x * 6 - 15) + 10);
    }

    function clamp(x, lowerlimit, upperlimit) {
      if (x < lowerlimit) x = lowerlimit;
      if (x > upperlimit) x = upperlimit;
      return x;
    }

    /**
     * Set config
     * @function SmoothScrollService#setConfig.
     * @param {object} cfg - Config object.
     */
    this.setConfig = function(cfg) {
      svc.config = cfg;
    };

    /**
     * Scroll element position to target with specified duration.
     * @function SmoothScrollService#scroll.
     * @param {object} element - The element being scrolled.
     * @param {object} target - The final position of the scroll.
     * @param {object} duration - The duration of the scroll.
     * @param {object} placement - The direction of the scroll. Default 'horizontal'.
     */
    this.scroll = function(element, target, duration, placement) {
      var scrollPlacement = placement === 'vertical' ? 'scrollTop' : 'scrollLeft';
      var start_position = element[scrollPlacement];
      var start_time = Date.now();
      var end_time;
      var distance;

      svc.config.stopScrolling = false;

      var iTarget = parseInt(target),
        iDuration = parseInt(duration);

      if (iDuration === 0) {
        element[scrollPlacement] = iTarget;
        return Promise.resolve();
      }

      end_time = start_time + iDuration;
      distance = iTarget - start_position;

      if (Math.round(distance) === 0) {
        return Promise.resolve();
      }

      return new Promise(function(resolve) {
        var previous_position;
        var scrollFrame = function() {
          var now = Date.now();
          var point, nextPosition, currentPosition;

          // Force stop the smooth scrolling
          if (svc.config.stopScrolling === true) {
            resolve();
            return;
          }

          // Set the scrollPosition for this frame
          point = smoothStep(start_time, end_time, now);
          // nextPosition = Math.round( start_position + ( distance * point ) );
          nextPosition = parseFloat(start_position + distance * point).toFixed(2);
          // Get current position of element
          currentPosition = element[scrollPlacement];

          // Where it reached the end of limit, done.
          if (
            now >= end_time ||
            (currentPosition === previous_position && currentPosition !== nextPosition)
          ) {
            resolve();
            return;
          }

          // Set the scroll position for this frame of the animation
          element[scrollPlacement] = nextPosition;
          // Store position for use in next frame
          previous_position = nextPosition;

          window.requestAnimationFrame(scrollFrame);
        };

        // Kick off scroll animation
        window.requestAnimationFrame(scrollFrame);
      });
    };
  }
})();

/*
 * Scroll Init Directive
 * Scroll timeline to current position on init component.
 */

(function() {
  'use strict';

  angular.module('helium').directive('hlmScrollInit', ScrollInitDirective);

  ScrollInitDirective.$inject = ['$rootScope'];

  function ScrollInitDirective($rootScope) {
    return {
      restrict: 'A',
      scope: {
        jumpTo: '=',
        // placement - horizontal, vertical, portrait
        placement: '=',
        event: '<',
        // timelineSize is the total width or height of the timeline, including off-screen portions
        timelineSize: '<',
        // timelineViewport is the total width or height of the viewable area of the timeline
        timelineViewport: '<',
        // isArabic - RTL language mode
        isArabic: '<',
        // is this timeline on details dialog? If so we will offset the margin
        timelineDialog: '<',
      },
      replace: false,
      link: function(scope, element) {
        var unbindWatcher = scope.$watch('jumpTo', function(newValue) {
          var parent = element.parent().parent();

          var parentSize =
            scope.placement === 'vertical' || scope.placement === 'portrait'
              ? parent.height()
              : parent.width();

          var availableSize;
          var val = newValue;

          if (scope.placement === 'portrait') {
            parentSize = parent.height() * 0.375;
          }

          if (scope.event) {
            if (scope.isArabic) {
              availableSize = parentSize - scope.event.size;
              val =
                scope.timelineSize - scope.event.startPosition - scope.event.size - availableSize;
            }

            if (parentSize) {
              setTimeout(function() {
                element[0].style.width = parentSize + 'px';

                if (scope.placement === 'vertical' || scope.placement === 'portrait') {
                  element[0].scrollTop = val;
                } else {
                    if (scope.timelineDialog && $rootScope.isRtl) {
                      var offsetNum = 0.016;
                      var devicePixelRatio = window.devicePixelRatio;
                      if( devicePixelRatio > 1) {
                        if(scope.timelineViewport > 500) {
                          offsetNum = 0.018;
                        } else {
                          offsetNum = 0.028;
                        }

                      } else if (devicePixelRatio < 1) {
                        offsetNum = 0.014;
                      }
                      element[0].scrollLeft = val - (scope.timelineViewport * offsetNum);
                    } else {
                      element[0].scrollLeft = val;
                    }
                }
              }, 500);
            }
          }

          if (scope.placement === 'vertical' || scope.placement === 'portrait') {
            element[0].scrollTop = val;
          } else {
            element[0].scrollLeft = val;
          }

          unbindWatcher();
        });
      },
    };
  }
})();
