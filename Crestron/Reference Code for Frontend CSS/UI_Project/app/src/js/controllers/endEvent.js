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
		.controller( 'EndEventCtrl', EndEventCtrl );

	EndEventCtrl.$inject = [ '$scope', '$rootScope', '$uibModalInstance', 'CommunicationService', 'AppConfig'];

	function EndEventCtrl( $scope, $rootScope, $uibModalInstance, CommunicationService, AppConfig ) {
		var startEndEventAction = false;

		$scope.loading = {
            state: false,
			message: $rootScope.Helium.labels.endEvent.loadingMessage,
			showErrorMessageTimeout: false,
			responseReceived: false
		};

		$scope.event = $rootScope.Helium.values.mainRoom.currentEvent;

		$rootScope.$on( 'currentEvent', $uibModalInstance.close );

		$scope.end = function ( ) {
			if ( !startEndEventAction ) {
				var currentEvent = $rootScope.Helium.values.mainRoom.currentEvent;

				$rootScope.$evalAsync( function( ) {
					startEndEventAction = true;
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

				CommunicationService.sendEndEvent(currentEvent.id, currentEvent.instanceId, function ( success ) {
					if ( !$scope.loading.showErrorMessageTimeout ) {
						$scope.loading.responseReceived = true;
						clearTimeout( timeoutErrorMessage );
						$rootScope.$evalAsync( function( ) {
							$scope.loading.state = $rootScope.Helium.state.loading.state = false;
							startEndEventAction = false;
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
