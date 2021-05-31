/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/**
 * Communication service with SchedulePanel
 */
(function () {
    'use strict';

    angular
        .module('helium')
        .service('CommunicationService', CommunicationService);

    function CommunicationService() {
        var SPC = SchedulingPanel.webUI,
            actionWaitCallback = function (callback) {
                var callbackWait = function () {
                    SPC.unsubscribe.data.timeline(callbackWait);
                    SPC.unsubscribe.data.providerStatus(callbackWait);
                    callback();
                };

                SPC.subscribe.data.timeline(callbackWait, false);
                SPC.subscribe.data.providerStatus(callbackWait, false);
            };

        this.listenForConfig = function (callback) {
            SPC.subscribe.data.config(callback);
        };

        // Not used. The language comes in with the config update
        this.listenForLanguage = function (callback) {
            SPC.subscribe.data.language(callback);
        };

        this.listenForTimeline = function (callback) {
            SPC.subscribe.data.timeline(callback);
        };

        this.listenForProviderStatus = function (callback) {
            SPC.subscribe.data.providerStatus(callback);
        };

        this.listenForEvents = function (callback) {
            SPC.subscribe.data.events(callback);
        };

        this.sendExtendEvent = function (meetingId, instanceId, duration, callback) {
            SPC.send.action.extendEvent(meetingId.toString(), instanceId === null ? null : instanceId.toString(), duration.toString(), function (success, data) {
                if (success) {
                    actionWaitCallback(function () {
                        callback(success, data);
                    });
                } else {
                    callback(success, data);
                }
            });
        };

        this.sendEndEvent = function (meetingId, instanceId, callback) {
            SPC.send.action.endEvent(meetingId.toString(), instanceId === null ? null : instanceId.toString(), function (success, data) {
                if (success) {
                    actionWaitCallback(function () {
                        callback(success, data);
                    });
                } else {
                    callback(success, data);
                }
            });
        };

        this.sendCreateEvent = function (timeline, roomId, subject, organizer, startDate, endDate, callback) {
            SPC.send.action.createEvent(
                timeline,
                roomId === null ? null : roomId.toString(),
                subject.toString(),
                organizer.toString(),
                startDate.getTime(),
                endDate.getTime(),
                function (success, data) {
                    if (success && roomId === null) {
                        actionWaitCallback(function () {
                            callback(success, data);
                        });
                    } else {
                        callback(success, data);
                    }
                });
        };

        this.sendRoomSearch = function (roomId, callback) {
            SPC.send.action.roomSearch(roomId.toString(), callback);
        };

        this.sendDetailsEvent = function (eventId, instanceId, callback) {
            SPC.send.action.detailsEvent(eventId.toString(), instanceId === null ? null : instanceId.toString(), callback);
        };

        this.sendCheckInEvent = function (meetingId, instanceId, callback) {
            SPC.send.action.checkInEvent(meetingId.toString(), instanceId === null ? null : instanceId.toString(), callback);
        };

        this.sendOpenSettings = function () {
            SPC.send.action.openSettings();
        };

        this.sendAbout = function (callback) {
            SPC.send.action.statusScreenInfo(callback);
        };

        this.sendRefreshSchedule = function (callback) {
            SPC.send.action.refreshSchedule(callback);
        };
    }
})();
