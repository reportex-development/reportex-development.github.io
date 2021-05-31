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
		.controller( 'PinCtrl', PinCtrl );
		
	PinCtrl.$inject = [ '$scope', '$rootScope', '$uibModalInstance' ];

	function PinCtrl( $scope, $rootScope, $uibModalInstance) {
		var accessControl = $rootScope.Helium.settings.accessControl.pin ? $rootScope.Helium.settings.accessControl.pin.toString( ) : [];

		$scope.pin = '';
		$scope.pinCircles = [ ];
		$scope.disablePinEntry = false;

		function setPinCircles( ) {
			var length = accessControl.length,
				i;

			if ( length ) {
				for ( i = 0; i < length; i++ ) {
					$scope.pinCircles.push( {
						set: false
					} );
				}
			}
		}

		function shakePin ( ) {
			$scope.disablePinEntry = true;
			$( '.pin__container__header__password' ).addClass( 'shake' );
			setTimeout( function( ) {
				deletePin( );
				$( '.pin__container__header__password' ).removeClass( 'shake' );
			}, 400 );
		}

		function deletePin( ) {
			$scope.$evalAsync( function( ) {
				$scope.pin = '';
				$scope.pinCircles.splice( 0, $scope.pinCircles.length );
				setPinCircles( );
				$scope.disablePinEntry = false;
			} );
		}

		setPinCircles( );
		
		$scope.deteleCircle = function( ) {
			$scope.$evalAsync( function( ) {
				$scope.pin = $scope.pin.substr(0, $scope.pin.length - 1);
				$scope.pinCircles[$scope.pin.length].set = false;
			} );
		};

		$scope.$watch( 'pin', function( newValue ) {
			if ( newValue ) {
				if ( newValue.length <= accessControl.length ) {
					$scope.pinCircles[newValue.length - 1].set = true; 
					if ( newValue === accessControl ) {
						//ToDo: (Maybe) Add animation that shows user that PIN was accepted. Something simple, like the circles fade out and a check mark fades in. 250ms animation length.
						setTimeout( function( ) {
							$uibModalInstance.close( true );
						}, 300 );
					} else {
						if ( newValue.length === accessControl.length ) {
							shakePin( );
						}
					}
				}
			}
		}, true );

		$scope.cancel = function () {
			$uibModalInstance.dismiss( 'cancel' );
        };

		$scope.getPinLength = function( ) {
			var length = accessControl.length;

			return new Array( length );
		};


		$scope.onClickKeys = function( number ) {
			var pin = $scope.pin.toString( );
			pin = pin.concat( number );

			$scope.$evalAsync( function( ) {
				$scope.pin = pin;
			} );
		};
	}
} )( );