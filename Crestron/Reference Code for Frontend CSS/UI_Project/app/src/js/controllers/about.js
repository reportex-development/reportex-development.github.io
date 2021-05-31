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
		.controller( 'AboutCtrl', AboutCtrl );

	AboutCtrl.$inject = [ '$scope', '$rootScope', '$uibModalInstance', '$http' ,'CommunicationService', 'AppStateService'];

	function AboutCtrl( $scope, $rootScope, $uibModalInstance, $http, CommunicationService, AppStateService) {
        var initialized = false,
            loading = {
                state: true,
                message: $rootScope.Helium.labels.details.loadingMessage
            };

        $scope.working = false;
        $scope.data = {};

        angular.extend( $rootScope.Helium.state.loading, loading );

        $rootScope.$watch( 'Helium.state.isOnline', function( newValue ) {
            if ( initialized ) {
                $scope.data.helpProviderData.isOnline = newValue;
            }
        });

        $rootScope.$watch( 'Helium.state.refreshingProvider', function( newValue ) {
            $scope.working = newValue;
        });

        CommunicationService.sendAbout (
            function ( success, resp ) {
                $rootScope.$evalAsync( function( ) {
                    if ( success ) {
                        $scope.data = resp.data;
                        initialized = true;
                        $http.get('appInfo.json')
                            .then(function ( res ) {
                                $rootScope.Helium.state.loading.state = false;
                                $scope.data.helpVersionData = $scope.data.helpVersionData || {};
                                $scope.data.helpVersionData.web = res.data.version;
                            }, function ( ) {
                                console.log( 'Invalid appInfo.json file' );
                                $rootScope.Helium.state.loading.state = false;
                            });
                    } else {
                        console.log( 'NO data received' );
                        $uibModalInstance.close( );
                        $rootScope.Helium.state.loading.state = false;
                    }
                } );
            }
        );

        $scope.cancel = function () {
            $uibModalInstance.dismiss( 'cancel' );
        };

        $scope.refresh = function ( ) {
            if( !$scope.working ) {
                $scope.working = true;
                AppStateService.setRefreshProviderTimeout();
                CommunicationService.sendRefreshSchedule( function ( ) {
                    //Do nothing in callback
                });
            }
        };
	}
} )( );
