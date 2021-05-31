/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

 
( function( ) {
	'use strict';

	angular
		.module( 'helium' )
		.controller( 'ExtendEventCtrl', ExtendEventCtrl );

    ExtendEventCtrl.$inject = [ '$scope', '$rootScope', '$uibModalInstance', 'TimelineService', 'CommunicationService', 'AppConfig' ];

	function ExtendEventCtrl( $scope, $rootScope, $uibModalInstance, TimelineService, CommunicationService, AppConfig ) {
		var mainRoom = $scope.Helium.values.mainRoom,
			currentEvent = mainRoom.currentEvent,
			nextEvent = mainRoom.nextEvent,
			startExtendEventAction = false;

		$rootScope.$on( 'currentEvent', $uibModalInstance.close );

		$scope.loading = {
			state: false,
			message: $rootScope.Helium.labels.extendEvent.loadingMessage,
			showErrorMessageTimeout: false,
			responseReceived: false
		};

		$scope.event = $rootScope.Helium.values.mainRoom.currentEvent;

		$scope.duration = { };

		$scope.duration.options = TimelineService.generateAvailableExtendTime (
			currentEvent.dtEnd,
			nextEvent && nextEvent.dtStart ? nextEvent.dtStart : null,
			15
		);

		$scope.duration.value = $scope.duration.options[0];

        $scope.extend = function ( ) {
			if ( !startExtendEventAction ) {
				$rootScope.$evalAsync( function( ) {
					startExtendEventAction = true;
					$scope.loading.state = true;
					angular.extend( $rootScope.Helium.state.loading, $scope.loading );
				} );

				var timeoutErrorMessage = setTimeout( function( ) {
					$rootScope.$evalAsync( function( ) {
						if ( !$scope.loading.responseReceived ) {
							$scope.loading.showErrorMessageTimeout = true;
							$scope.loading.state = $rootScope.Helium.state.loading.state = false;
							$uibModalInstance.close( );
							$rootScope.Helium.methods.openMsgError( true );
						}
					} );
				}, AppConfig.timeoutLoadingMask );

				CommunicationService.sendExtendEvent(currentEvent.id, currentEvent.instanceId, $scope.duration.value, function ( success ) {
					if ( !$scope.loading.showErrorMessageTimeout ) {
						$scope.loading.responseReceived = true;
						clearTimeout( timeoutErrorMessage );
						$rootScope.$evalAsync( function( ) {
							$scope.loading.state = $rootScope.Helium.state.loading.state = false;
							startExtendEventAction = false;
							if ( !success ) {
								$rootScope.Helium.methods.openMsgError( );
							}
							$uibModalInstance.close( );
						} );
					}
				});
			}
		};

        $scope.cancel = function ( ) {
		    $uibModalInstance.dismiss( 'cancel' );
        };
	}
} )( );
