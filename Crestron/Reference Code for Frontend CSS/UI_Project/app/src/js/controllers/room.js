/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

(function() {
  'use strict';

  angular.module('helium').controller('RoomCtrl', RoomCtrl);

  RoomCtrl.$inject = ['$scope', '$rootScope', 'AppClockService', 'CommunicationService', 'ThemeService', 'DatetimeFactory'];

  function RoomCtrl($scope, $rootScope, AppClockService, CommunicationService, ThemeService, DatetimeFactory) {
    var refreshCurrentTime = function () {
      $scope.currentTime = Date.now();
    };

  var startCheckInAction = false,
      timeoutFade;

    $scope.currentEvent = $rootScope.Helium.values.mainRoom.currentEvent;
    $scope.nextEvent = $rootScope.Helium.values.mainRoom.nextEvent;

    $scope.loading = { state: false, message: $rootScope.Helium.labels.checkInEvent ? $rootScope.Helium.labels.checkInEvent.loadingMessage : '' };

    // TODO: Move this to  higher level so that it isn't duplicated in screensaver.js
    var refreshMeetingData = function() {
      $scope.currentEvent = $rootScope.Helium.values.mainRoom.currentEvent;
      $scope.nextEvent = $rootScope.Helium.values.mainRoom.nextEvent;
    };

    $rootScope.$watch('Helium.values.mainRoom.currentEvent', function () {
      refreshMeetingData();
    });
    $rootScope.$watch('Helium.values.mainRoom.nextEvent', function () {
      refreshMeetingData();
    });

    $rootScope.Helium.methods.setMenu(true);

    $scope.currentTime = Date.now();

    AppClockService.subscribe(refreshCurrentTime);
    AppClockService.subscribe($rootScope.Helium.state.setRoomReserved);

    $scope.openEventDetails = function(event) {
      $rootScope.Helium.methods.openModal('details', { event: event });
    };

    $scope.checkInEvent = function() {
      var event = $rootScope.Helium.state.checkInEvent,
        callbackFn = function() {
          $scope.checkIn();
        };

      if (!event.checkedIn && $rootScope.Helium.state.needPin) {
        var modal = $rootScope.Helium.methods.openPin();

        if (modal) {
          modal.result.then(function() {
            callbackFn();
          });
        }
      } else {
        callbackFn();
      }
    };

    $scope.checkIn = function() {
      var event = $rootScope.Helium.state.checkInEvent;

      if (!event.checkedIn && !startCheckInAction) {
        $rootScope.Helium.methods.closeMenu();
        startCheckInAction = true;
        $scope.loading.state = true;
        angular.extend($rootScope.Helium.state.loading, $scope.loading);

        CommunicationService.sendCheckInEvent(
          event.id,
          event.instanceId,
          function(success) {
            $rootScope.$evalAsync(function() {
              $scope.loading.state = $rootScope.Helium.state.loading.state = false;
              startCheckInAction = false;
              if (success) {
                event.checkedIn = 1;
              } else {
                $rootScope.Helium.methods.openMsgError();
              }
            });
          }
        );
      }
    };

    $scope.endEvent = function() {
      if (!$rootScope.Helium.state.setDisableEndNow()) $rootScope.Helium.methods.openEndEvent();
    };

    $scope.extendEvent = function() {
      if (!$rootScope.Helium.state.setDisableExtendNow()) {
        $rootScope.Helium.methods.openExtendEvent();
      }
    };

    $scope.isCurrentEventEndingBeforeMidnightToday = function() {
      var currentEvent = $rootScope.Helium.values.mainRoom.currentEvent;

      if (currentEvent.dtEnd < DatetimeFactory.getMidnightTommorrow()) {
        return true;
      }

      return false;
    };

    $scope.setVision = function() {
      $rootScope.Helium.state.vision = !$rootScope.Helium.state.vision;
      ThemeService.updateTheme('impair-theme');
      $rootScope.$evalAsync(function() {
        $rootScope.Helium.methods.closeMenu();
      });
      setVisionButtonClass();
    };

    $scope.clickMenu = function() {
      changeOpenMenuState();
      $rootScope.Helium.methods.openMenu();
      openMenuClickEvent();
    };

    $('.menu__item').css('visibility', 'hidden');

    // Hide Menu Button background when in vertical or portrait mode
    if ($rootScope.Helium.state.layout === 'vertical' || $rootScope.Helium.state.layout === 'portrait') {
      $('.menu__open__button').css('background', 'transparent');
    }
    setVisionButtonClass();

    $('.menu__open').on('click', function() {
      changeOpenMenuState();
    });

    function changeOpenMenuState() {
      var menuOpen = $('.menu__open');

      if (menuOpen[0].checked) {
        menuOpen[0].checked = false;
      } else {
        menuOpen[0].checked = true;
      }
    }

    function setVisionButtonClass() {
      var vision = $('.menu__item--vision');

      if ($rootScope.Helium.state.vision) {
        vision.addClass('bg__theme-color-6');
        vision.removeClass('bg__main-color-7');
      } else {
        vision.addClass('bg__main-color-7');
        vision.removeClass('bg__theme-color-6');
      }
    }

    function openMenuClickEvent() {
      var close = $('.menu-close-label'),
        openButton = $('.menu__open__button');

      if (close.is(':visible')) {
        $('.menu__item').css('visibility', 'visible');
        openButton[0].setAttribute('style', '');
        openButton.css('border', '0px');
      } else {
        openButton[0].setAttribute('style', '');
      }

      timeoutFade = setTimeout(function() {
        var close = $('.menu-close-label'),
          open = $('.menu-open-label');

        if (close.is(':visible')) {
          $('.menu__item').css('visibility', 'visible');
        } else if (open.is(':visible')) {
          $('.menu__item')
            .delay(1)
            .animate({ visibility: 'visible' }, 180, function() {
              var close = $('.menu-close-label');

              if (close.is(':visible')) {
                $('.menu__item').css('visibility', 'visible');
              }
            });
        }
      }, 180);
    }

    $scope.$on('$destroy', function() {
      AppClockService.unsubscribe(refreshCurrentTime);
      AppClockService.unsubscribe($rootScope.Helium.state.setRoomReserved);
      clearTimeout(timeoutFade);
    });
  }
})();
