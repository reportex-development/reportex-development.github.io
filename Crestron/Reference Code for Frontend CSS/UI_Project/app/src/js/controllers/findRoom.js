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
    .controller('FindRoomCtrl', FindRoomCtrl);

  FindRoomCtrl.$inject = ['$scope', '$rootScope', '$uibModalInstance', 'CommunicationService'];

  function FindRoomCtrl($scope, $rootScope, $uibModalInstance, CommunicationService) {
    var roomId = $rootScope.Helium.values.roomId;

    //RWP - Changed to 'OR' comparison. Can't be null 'AND' undefined at the same time
    roomId = (roomId === null || roomId === undefined) ? '' : roomId;
    $scope.model = {
      rooms: [],
      isLoading: true
    };

    CommunicationService.sendRoomSearch(roomId, function (success, resp) {
      $scope.$evalAsync(function () {
        $scope.model.isLoading = false;
        if (success) {
          var eventDate,
            model = $scope.model;

          model.rooms = resp.data && resp.data.rooms ? resp.data.rooms : [];
          model.noRooms = !(resp.data && resp.data.rooms && resp.data.rooms.length);

          // if a room was just saved without errors
          // the pending reservation will be used to not show
          // the room until after a minute has expired.
          if (model.rooms.length > 0) {
            for (var i = 0; i < model.rooms.length; i++) {
              if (model.rooms[i].id === $rootScope.pendingReservation.prevRoomID) {
                model.rooms.splice(i, 1);
              }
            }
          }

          angular.forEach($scope.model.rooms, function (room) {
            if (room.freeUntil) {
              eventDate = room.freeUntil;
            } else {
              eventDate = false;
            }
            room.availableForDuration = $rootScope.Helium.state.getRemainingTimeString({ dtEnd: eventDate });
          });
        }
      });
    });

    $scope.openReservation = function (room) {
      if ($rootScope.Helium.settings.reservation.reservationEnable) {
        $rootScope.Helium.methods.openReservation(false, room);
      }
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
