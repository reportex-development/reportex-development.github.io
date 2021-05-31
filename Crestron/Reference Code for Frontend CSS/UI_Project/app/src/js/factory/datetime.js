/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

(function() {
  'use strict';

  angular.module('helium').factory('DatetimeFactory', function() {
    this.getMidnightToday = function() {
      var ret = new Date();
      ret.setHours(0, 0, 0, 0);

      return ret;
    };

    this.getMidnightTommorrow = function() {
      var ret = new Date();
      ret.setHours(24, 0, 0, 0);

      return ret;
    };

    /**
     * Checking if now is between given dates.
     * @function DatetimeFactory#isNowBetweenDates.
     * @param {Datetime} startDate
     * @param {Datetime} endDate
     */
    this.isNowBetweenDates = function(startDate, endDate) {
      var now = new Date();
      return startDate < now && now <= endDate;
    };

    /**
     * Return round time left between now and a given date
     * By round we mean that between minute 01:00 + 20 milisecond ( our interval ) and 01:01
     * we need to show 1 minut difference
     * @function DatetimeFactory#getRoundTimeLeft.
     * @param {Datetime} date
     */
    this.getRoundTimeLeftTill = function(date) {
      var now = new Date().getTime();

      return this.getTimeLeftBetweenDates(date, now - 60000);
    };

    /**
     * Return time left between now and given date.
     * @function DatetimeFactory#getTimeLeft.
     * @param {Datetime} date
     */
    this.getTimeLeftTill = function(date) {
      var now = new Date().getTime();

      return this.getTimeLeftBetweenDates(date, now);
    };

    /**
     * Return total minutes left between the two dates given.
     * @function DatetimeFactory#getTimeLeftBetweenDates.
     * @param {Number} date1 - timestamp
     * @param {Number} date2 - timestamp
     */
    this.getTotalMinutesBetweenDates = function(date1, date2) {
      // Need "Whole" minutes for calculation. Ex: 13:45:00.000 - 13:15:00.000
      // Figure out how many seconds need to be subtracted from each date before doing calculation
      var date1ExtraMillis = date1 % 60000;
      var date2ExtraMillis = date2 % 60000;

      if (date1ExtraMillis && date1ExtraMillis !== undefined && date1ExtraMillis !== 0) {
        date1 -= date1ExtraMillis;
      }

      if (date2ExtraMillis && date2ExtraMillis !== undefined && date2ExtraMillis !== 0) {
        date2 -= date2ExtraMillis;
      }

      var secondsDiff = Math.abs(date2 - date1) / 1000;
      return Math.floor(secondsDiff / 60);
    };

    /**
     * Return object time with hours/ minutes and seconds left between dow dates given.
     * @function DatetimeFactory#getTimeLeftBetweenDates.
     * @param {Number} date1 - timestamp
     * @param {Number} date2 - timestamp
     */
    this.getTimeLeftBetweenDates = function(date1, date2) {
      var diff = Math.abs(date1 - date2) / 1000;

      var hours = Math.floor(diff / 3600) % 24;
      diff -= hours * 3600;

      var minutes = Math.floor(diff / 60) % 60;
      diff -= minutes * 60;

      var seconds = diff % 60;

      return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
      };
    };

    /**
     * Add minutes to date
     * @function DatetimeFactory#Add Minutes to date.
     * @param {Date} date - date
     * @param {Number} mins - number
     */
    this.addMinutesToDate = function(date, mins) {
      return new Date(date.getTime() + mins * 60000);
    };

    /**
     * Checking if date is before second date.
     * @function DatetimeFactory#isDateBeforeDate.
     * @param {Datetime} date
     * @param {Datetime} startDate
     * @param {Datetime} endDate
     */
    this.isDateBeforeDate = function(date1, date2) {
      return date1 <= date2;
    };

    return this;
  });
})();
