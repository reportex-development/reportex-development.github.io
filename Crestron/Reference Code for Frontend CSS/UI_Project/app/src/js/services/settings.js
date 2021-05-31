/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

(function() {
    'use strict';

    angular
        .module('helium')
        .service('SettingsService', SettingsService);

    SettingsService.$inject = ['$rootScope', 'AppConfig', 'LayoutService', 'ThemeService'];

    function SettingsService($rootScope, AppConfig, LayoutService, ThemeService) {
        var _settings,
            _settingsExtra,
            initialization = 0; //0 not setup, 1-init first time 2- not first init

        function overwriteSettings() {
            $rootScope.Helium.settings = angular.extend(
                {},
                _settings.settings,
                {
                    countDownScreenSaver: _settings.settings && _settings.settings.room && _settings.settings.room.idleTimeoutMinutes ? _settings.settings.room.idleTimeoutMinutes * 60 * 1000 : AppConfig.screenSaverDelay
                });

            //Set the {values.roomName} variable to the value of {settings.room.name}. UI elements are bound to the former
            if(_settings.settings && _settings.settings.room && _settings.settings.room.name) {
                $rootScope.Helium.values.roomName = _settings.settings.room.name;
            }
        }

        this.isFirstInitialization = function () {
            return initialization === 1;
        };

        this.applySettings = function (config) {
            if (config) {
                var room = config.settings.room;

                // TimeFormat === false is 24hr format - ex. 13:45:00
                if (room.timeFormat) {
                    room.timeFormat = 'h:mm a';
                    room.hoursFormat = 'h';
                    room.hoursAmpmFormat = 'h a';
                    room.ampmFormat = 'a';
                } else {
                    room.timeFormat = 'HH:mm';
                    room.hoursFormat = 'HH';
                    room.hoursAmpmFormat = 'HH';
                    room.ampmFormat = '';
                }

                room.minutesFormat = 'mm';

                switch (room.dateFormat) {
                    case ('WMDY'):
                        room.dateFormat = $rootScope.Helium.state.isArabic ? ' y, EEEE, dd MMMM' : 'EEEE, MMMM dd, y';
                        break;
                    case ('WDMY'):
                        room.dateFormat = $rootScope.Helium.state.isArabic ? 'EEEE, y-MMMM-dd' : 'EEEE, dd-MMMM-y';
                        break;
                    case ('WYMD'):
                        room.dateFormat = $rootScope.Helium.state.isArabic ? 'EEEE, dd-MMMM-y' : 'EEEE, y-MMMM-dd';
                        break;
                    case ('WMD'):
                        room.dateFormat = $rootScope.Helium.state.isArabic ? 'EEEE, dd MMMM' : 'EEEE, MMMM dd';
                        break;
                    case ('WDM'):
                        room.dateFormat = $rootScope.Helium.state.isArabic ? 'EEEE, MMMM-dd' : 'EEEE, dd-MMMM';
                        break;
                    case ('MDY'):
                        room.dateFormat = $rootScope.Helium.state.isArabic ? 'y, dd MMMM' : 'MMMM dd, y';
                        break;
                    case ('DMY'):
                        room.dateFormat = $rootScope.Helium.state.isArabic ? 'y-MMMM-dd' : 'dd-MMMM-y';
                        break;
                    case ('YMD'):
                        room.dateFormat = $rootScope.Helium.state.isArabic ? 'dd-MMMM-y' : 'y-MMMM-dd';
                        break;
                    case ('M.DY'):
                        room.dateFormat = $rootScope.Helium.state.isArabic ? 'y dd MMMM' : 'MMMM.dd y';
                        break;
                    case ('D.MY'):
                        room.dateFormat = $rootScope.Helium.state.isArabic ? 'y MMMM.dd' : 'dd.MMMM y';
                        break;
                    default:
                        room.dateFormat = $rootScope.Helium.state.isArabic ? 'EEEE, y, dd MMMM' : 'fullDate';
                        break;
                }

                _settings = config;
                overwriteSettings();
                this.applySettingsExtras($rootScope.Helium.settings.extras);

                ThemeService.loadTheme(room.theme);
                LayoutService.updateLayout(room.verticalOrientation);
                this.applyCustomCss(room.styleOverrideUrl);
                if (initialization < 2)
                    initialization++;
            }
        };

        this.applySettingsExtras = function (obj) {
            _settingsExtra = obj;
            $rootScope.Helium.settingsExtra = angular.extend({}, _settingsExtra);
        };

        this.applyCustomCss = function (url) {
            if (url) {
                $rootScope.Helium.state.customCss = url + '?v=' + new Date().getTime();
            } else {
                $rootScope.Helium.state.customCss = 'custom.css';
            }
        };

        this.setNeedsPin = function (config) {
            var accessControl = config.settings.accessControl;

            if (accessControl &&
                accessControl.securityLevel &&
                accessControl.securityLevel.toLowerCase() === 'anonymous') {
                $rootScope.Helium.state.needPin = false;
            } else {
                $rootScope.Helium.state.needPin = true;
            }
        };

        this.applyProviderState = function (obj) {
            var data = obj.data;

            $rootScope.Helium.state.isOnline = data.isOnline;
            $rootScope.Helium.state.needsAuthorization = data.needsAuthorization;
            $rootScope.Helium.state.offlineLimit = data.offlineLimit;
            $rootScope.Helium.state.roomOccupied = data.roomOccupied;

            if ($rootScope.Helium.state.offlineLimit) {
                $rootScope.$evalAsync(function () {
                    $rootScope.Helium.methods.openPage('room');
                });
            }
        };
    }
})();
