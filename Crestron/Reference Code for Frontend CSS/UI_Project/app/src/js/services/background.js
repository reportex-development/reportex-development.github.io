/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/**
 * Background service
 */
(function () {
    'use strict';

    angular
        .module('helium')
        .service('BackgroundService', BackgroundService);

    BackgroundService.$inject = ['$rootScope'];

    function BackgroundService($rootScope) {
        var poster = '',
            containerScreensaverImage,
            containerScreensaverVideo,
            containerRoomImage,
            containerRoomVideo,
            initPoster = function() {
                var defaultPoster = 'assets/images/dark-theme.png';

                if ($rootScope.Helium.state.theme) {
                    poster = 'assets/images/' + $rootScope.Helium.state.theme + '.png';
                }
                poster = $rootScope.Helium.state.vision ? defaultPoster : poster;
            },
            initContainerScreensaver = function () {
                if (!$rootScope.Helium.settings.screenSaverBg) {
                    $rootScope.Helium.settings.screenSaverBg = {
                        img: {},
                        media: {}
                    };
                }

                containerScreensaverImage = $rootScope.Helium.settings.screenSaverBg.img;
                containerScreensaverVideo = $rootScope.Helium.settings.screenSaverBg.media;
            },
            initContainerRoom = function () {
                if (!$rootScope.Helium.settings.roomBg) {
                    $rootScope.Helium.settings.roomBg = {
                        img: {},
                        media: {}
                    };
                }

                containerRoomImage = $rootScope.Helium.settings.roomBg.img;
                containerRoomVideo = $rootScope.Helium.settings.roomBg.media;
            },
            setBackgroundScreensaverImage = function (background) {
                initContainerScreensaver();
                angular.extend(containerScreensaverVideo, { 'video': '', 'type': '', 'poster': '' });
                angular.extend(containerScreensaverImage, { 'src': background });
            },
            setBackgroundScreensaverVideo = function (background) {
                var video = document.getElementsByClassName('screensaver__video');

                initContainerScreensaver();
                initPoster();
                angular.extend(containerScreensaverImage, { 'src': '' });
                angular.extend(containerScreensaverVideo, { 'video': background.url, 'type': background.mediaSubType, 'poster': poster });

                if (video.length) {
                    video[0].load();
                }
            },
            setBackgroundRoomImage = function (background) {
                initContainerRoom();
                angular.extend(containerRoomVideo, { 'video': '', 'type': '', 'poster': '' });
                angular.extend(containerRoomImage, { 'src': background });
            },
            setBackgroundRoomVideo = function (background) {
                var video = document.getElementsByClassName('room__video');

                initContainerRoom();
                initPoster();
                $rootScope.Helium.settings.roomBg.img.src = '';
                angular.extend(containerRoomImage, { 'src': '' });
                angular.extend(containerRoomVideo, { 'video': background.url, 'type': background.mediaSubType, 'poster': poster });
                if (video.length) {
                    video[0].load();
                }
			};

        function setBgScreensaver(background) {
            if (background.mediaType.toLowerCase() === 'image') {
                setBackgroundScreensaverImage(background.url);
            } else if (background.mediaType.toLowerCase() === 'video') {
                setBackgroundScreensaverVideo(background);
            }
        }

        function setBgRoom(background) {
            if (background.mediaType.toLowerCase() === 'image') {
                setBackgroundRoomImage(background.url);
            } else if (background.mediaType.toLowerCase() === 'video') {
                setBackgroundRoomVideo(background);
            }
        }

        this.applyBackground = function () {
            this.setBackground();
        };

        this.setBackground = function () {
            var display = $rootScope.Helium.settings.display,
                backgrounds = display ? display.backgrounds : null;

            if (angular.isObject(backgrounds)) {
                setBackgroundScreensaverImage('assets/images/bg.jpg');
                setBackgroundRoomImage('assets/images/bg.jpg');

                if (!$rootScope.Helium.state.isReserved()) {
                    if ($rootScope.Helium.state.roomOccupied) {
                        if (backgrounds.availableActiveOccupied && backgrounds.availableActiveOccupied.enabled) {
                            setBgRoom(backgrounds.availableActiveOccupied);
                        } else if (backgrounds.availableActive && backgrounds.availableActive.enabled) {
                            setBgRoom(backgrounds.availableActive);
                        }

                        if (backgrounds.availableIdleOccupied && backgrounds.availableIdleOccupied.enabled) {
                            setBgScreensaver(backgrounds.availableIdleOccupied);
                        } else if (backgrounds.availableIdle && backgrounds.availableIdle.enabled) {
                            setBgScreensaver(backgrounds.availableIdle);
                        }
                    } else {
                        if (backgrounds.availableActive && backgrounds.availableActive.enabled) {
                            setBgRoom(backgrounds.availableActive);
                        }
                        if (backgrounds.availableIdle && backgrounds.availableIdle.enabled) {
                            setBgScreensaver(backgrounds.availableIdle);
                        }
                    }
                } else {
                    if (backgrounds.reservedActive && backgrounds.reservedActive.enabled) {
                        setBgRoom(backgrounds.reservedActive);
                    }
                    if (backgrounds.reservedIdle && backgrounds.reservedIdle.enabled) {
                        setBgScreensaver(backgrounds.reservedIdle);
                    }
                }
            } else {
                setBackgroundScreensaverImage('assets/images/bg.jpg');
                setBackgroundRoomImage('assets/images/bg.jpg');
            }
        };
    }
})();
