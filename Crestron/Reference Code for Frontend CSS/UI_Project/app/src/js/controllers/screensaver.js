/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/**
 * Screensaver
 *
 * It supports images, gif and videos.
 * In the appInfo.json the screenSaver options are set.
 *
 * Here are some examples:
 * *****************************
 *  "screenSaver": {
 *            "media": {
 *                "img": "assets/media/media.jpg",
 *                "video":"assets/media/media.mp4",
 *                "type":"mp4"
 *            }
 *        },
 * *****************************
 * "screenSaver": {
 * 		"image": [
 *			"assets/images/screensaver.gif"
 *		]
 * }
 * *****************************
 * "screenSaver": {
 * 		"image": [
 *			"assets/images/screensaver_bg.jpg"
 *		]
 * }
 * *****************************
 */

(function () {
  'use strict';

  angular
    .module('helium')
    .controller('ScreensaverCtrl', ScreensaverCtrl);

  ScreensaverCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'AppClockService'];

  function ScreensaverCtrl($scope, $rootScope, $timeout, AppClockService) {
    var animationTimeout;
    var animationFreqMinutes = 5;

    $scope.swapFields = false;
    $scope.firstSwap = false;
    var updateAnimation = function () {
      $scope.swapFields = !$scope.swapFields;
      $scope.firstSwap = true;
    };

    var tick = function () {
      animationTimeout = $timeout(tick, animationFreqMinutes * 60000); // reset the timeout after every completion
      updateAnimation();
    };

    animationTimeout = $timeout(tick, animationFreqMinutes * 60000);

    var refreshCurrentTime = function () {
      $scope.currentTime = Date.now();
    };

    $scope.currentTime = Date.now();
    AppClockService.subscribe(refreshCurrentTime);

    $scope.goToRoom = function () {
      $rootScope.Helium.methods.openPage('room');
    };

    $scope.getLogo = function () {
      var newValue = $rootScope.Helium.settings.display.projectIconUrl;
      return newValue ? newValue : '';
    };

    var refreshMeetingData = function () {
      $scope.currentEvent = $rootScope.Helium.values.mainRoom.currentEvent || null;
      $scope.nextEvent = $rootScope.Helium.values.mainRoom.nextEvent || null;
    };

    $rootScope.$watch('Helium.values.mainRoom.currentEvent', function () {
      refreshMeetingData();
    });
    $rootScope.$watch('Helium.values.mainRoom.nextEvent', function () {
      refreshMeetingData();
    });

    $scope.$on('$destroy', function () {
      AppClockService.unsubscribe(refreshCurrentTime);
      $timeout.cancel(animationTimeout);
    });
  }
})();
