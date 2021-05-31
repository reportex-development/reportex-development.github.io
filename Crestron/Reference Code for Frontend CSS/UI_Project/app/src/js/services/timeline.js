/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

(function () {
  'use strict';

  angular
    .module('helium')
    .service('TimelineService', TimelineService);

  TimelineService.$inject = ['$rootScope', 'DatetimeFactory', 'AppClockService', 'UtilFactory', 'BackgroundService'];

  function TimelineService($rootScope, DatetimeFactory, AppClockService, UtilFactory, BackgroundService) {
    var initialized = false,
      me = this;

    this.applyPrivacyLevelEvent = function (event) {
      if (event.privacyLevel !== 'public') {
        event.subject = $rootScope.Helium.labels.private;

        if (event.privacyLevel === 'private') {
          event.organizer = $rootScope.Helium.labels.private;
        }
      }
      return event;
    };

    /**
    * Return an array containing a range of elements.
    * @function TimelineService#generateAvailableExtendTime.
    * @param {Number} startDate - Start date of the sequence.
    * @param {Number} endDate - End date of the sequence.
    * @param {Number} step - The step it will be used as the increment between elements in the sequence (minutes)
    *                        If not specified, step will default to milissecond .
   */
    this.generateAvailableExtendTime = function (startDate, endDate, step) {
      var ret = [],
        value = 0,
        //Todo: Check for proper implementation. Should maxAllowMin be bounded by (maxMeetingLength - duration)?
        maximumAllowMin = $rootScope.Helium.settings.reservation.reserveNowMaxDur || 120,
        originalStartDate = new Date(startDate),
        endDateMaximumAllow = new Date(new Date(startDate).setMinutes(startDate.getMinutes() + maximumAllowMin));

      endDate = new Date(Math.min(
        endDate ? endDate.getTime() : Infinity,
        endDateMaximumAllow.getTime(),
        DatetimeFactory.getMidnightTommorrow().getTime()
      ));

      while (startDate < endDate) {
        startDate = new Date(startDate.getTime() + step * 60000);
        if (startDate <= endDate) {
          value = value + step;
        } else {
          //This creates a final extend time in the list for the "max time" if that time is not a multiple of "step"
          //For example, if there is a next meeting starting 37 minutes after the end of the current meeting...
          //If "step" is 15, the extend times would be 15, 30, 37
          value = DatetimeFactory.getTotalMinutesBetweenDates(originalStartDate.getTime(), endDate.getTime());
        }
        ret.push(value);
      }

      return ret;
    };

    /**
     * Init values object and set room details.
     * @function TimelineService#initValues.
     * @param {object} timeline - The timeline event data sent by the APK.
    */
    this.initValues = function (timeline) {
      var events = timeline.events || [],
        event,
        i;

      $rootScope.Helium.values.roomId = timeline.roomId;
      $rootScope.Helium.values.roomName = timeline.roomName;
      $rootScope.Helium.values.mainRoom = $rootScope.Helium.values.mainRoom || {};
      $rootScope.Helium.values.mainRoom.events = $rootScope.Helium.values.mainRoom.events || [];
      $rootScope.Helium.values.mainRoom.events.splice(0, $rootScope.Helium.values.mainRoom.events.length);
      for (i = 0; i < events.length; i++) {
        event = events[i];
        event.dtStart = new Date(event.dtStart);
        event.dtEnd = new Date(event.dtEnd);
        event.instanceId = UtilFactory.isString(event.instanceId) ? event.instanceId : null;
        $rootScope.Helium.values.mainRoom.events.push(events[i]);

        this.applyPrivacyLevelEvent(event);
      }

      return $rootScope.Helium.values;
    };

    /**
     * Return current event if exists on the timeline
     *
     * @function TimelineService#getCurrentEvent.
     * @param {object} events - The new params send by android.
    */
    this.getCurrentEvent = function (events) {
      var currentEvent = null,
        i,
        event,
        now = new Date();

      if (events && events.length > 0) {
        for (i = 0; i < events.length; i++) {
          event = events[i];

          if (event.dtStart <= now && now < event.dtEnd) {
            currentEvent = event;
            break;
          }
        }
      }

      return currentEvent;
    };

    /**
     * Return next event if exists on timeline
     *
     * @function TimelineService#getNextEvent.
     * @param {object} events - The new events send by android.
    */
    this.getNextEvent = function (events) {
      var nextEvent = null,
        i,
        event,
        now = new Date();

      if (events && events.length > 0) {
        for (i = 0; i < events.length; i++) {
          event = events[i];

          if (now < event.dtStart) {
            nextEvent = event;
            break;
          }
        }
      }

      return nextEvent;
    };


    /**
     * Set current event object.
     * @function TimelineService#setCurrentEvent.
     * @param {object} event - The event
    */
    this.setCurrentEvent = function (event) {
      if (event) {
        $rootScope.Helium.values.mainRoom.currentEvent = {
          id: event.id,
          subject: event.subject,
          organizer: event.organizer,
          dtStart: new Date(event.dtStart),
          dtEnd: new Date(event.dtEnd),
          checkedIn: event.checkedIn,
          state: {
            countdown: DatetimeFactory.getRoundTimeLeftTill(event.dtEnd),
            maxExtend: 0,
            visibleEndNow: false,
            visibleExtendNow: false,
            visibleCheckInNow: false
          },
          instanceId: UtilFactory.isString(event.instanceId) ? event.instanceId : null,
          isRecurring: event.isRecurring,
          privacyLevel: event.privacyLevel || 'public'
        };
      } else {
        $rootScope.Helium.values.mainRoom.currentEvent = null;
        $rootScope.$broadcast('currentEvent', null);
      }

      if ($rootScope.Helium.values.mainRoom.currentEvent) {
        this.applyPrivacyLevelEvent($rootScope.Helium.values.mainRoom.currentEvent);
      }
      BackgroundService.applyBackground();
    };

    /**
     * Set next event object.
     * @function TimelineService#setNextEvent.
     * @param {object} event - The event
    */
    this.setNextEvent = function (event) {
      $rootScope.Helium.values.mainRoom.nextEvent = event ?
        {
          id: event.id,
          subject: event.subject,
          organizer: event.organizer,
          dtStart: new Date(event.dtStart),
          dtEnd: new Date(event.dtEnd),
          checkedIn: event.checkedIn,
          state: {
            countdown: DatetimeFactory.getRoundTimeLeftTill(event.dtStart),
            visibleCheckInNow: false
          },
          isRecurring: event.isRecurring,
          instanceId: UtilFactory.isString(event.instanceId) ? event.instanceId : null,
          privacyLevel: event.privacyLevel || 'public'
        } : null;

      if ($rootScope.Helium.values.mainRoom.nextEvent) {
        this.applyPrivacyLevelEvent($rootScope.Helium.values.mainRoom.nextEvent);
      }
    };

    this.refreshStateOnCurrentMeeting = function () {
      var mainRoom = $rootScope.Helium.values.mainRoom,
        currentEvent = mainRoom.currentEvent,
        nextEvent = mainRoom.nextEvent,
        state;

      if (currentEvent) {
        state = currentEvent.state;

        //Check for Availability Threshold state before setting max Extend
        if (nextEvent && (currentEvent.id === nextEvent.id)) {
          state.maxExtend = 0;
        } else {
          if (!nextEvent) {
            state.maxExtend = 90;
          } else {
            var maxMinutes = Math.min(90, DatetimeFactory.getTotalMinutesBetweenDates(
              currentEvent.dtEnd,
              nextEvent.dtStart
            ));

            state.maxExtend = maxMinutes;
            if (state.maxExtend < 1) {
              state.maxExtend = 0;
            }
          }
        }
      }
    };

    this.createIntervalRefresh = function () {
      initialized = true;
      AppClockService.subscribe(function () {
        var mainRoom = $rootScope.Helium.values.mainRoom,
          mainRoomCurrentEvent = mainRoom.currentEvent || {},
          mainRoomNextEvent = mainRoom.nextEvent || {};

        if (mainRoomCurrentEvent.dtEnd)
          mainRoomCurrentEvent.state.countdown = DatetimeFactory.getRoundTimeLeftTill(mainRoomCurrentEvent.dtEnd.getTime());
        if (mainRoomNextEvent.dtEnd)
          mainRoomNextEvent.state.countdown = DatetimeFactory.getRoundTimeLeftTill(mainRoomNextEvent.dtStart.getTime());
        me.refreshStateOnCurrentMeeting();
      });
    };

    /**
     * Set the main room timeline
     * @function TimelineService#applyRoomTimeline.
     * @param {object} timeline - The new params send by android.
    */
    this.applyRoomTimeline = function (timeline) {
      this.initValues(timeline);

      var currentEvent = this.getCurrentEvent(timeline.events);
      this.setCurrentEvent(currentEvent);
    };

    /**
     * Set the main room events (current and next events)
     * @function TimelineService#setRoomEvents.
     *
     * @param {object} events - The new params send by android.
    */
    this.applyRoomEvents = function (events) {
      this.setNextEvent(events.nextEvent);
      this.setCurrentEvent(events.currentEvent);
      this.refreshStateOnCurrentMeeting();
      if (!initialized) {
        this.createIntervalRefresh();
      }
    };

    this.isReserved = function () {
      var currentEvent = $rootScope.Helium.values.mainRoom.currentEvent;

      return (currentEvent !== null);
    };

    this.isAvailable = function () {
      var currentEvent = $rootScope.Helium.values.mainRoom.currentEvent,
        nextEvent = $rootScope.Helium.values.mainRoom.nextEvent;

      return (currentEvent === null && nextEvent !== null);
    };

    this.isAvailableForTheRestOfTheDay = function () {
      var nextEvent = $rootScope.Helium.values.mainRoom.nextEvent,
        currentEvent = $rootScope.Helium.values.mainRoom.currentEvent;

      return (currentEvent === null && nextEvent === null);
    };
  }
})();
