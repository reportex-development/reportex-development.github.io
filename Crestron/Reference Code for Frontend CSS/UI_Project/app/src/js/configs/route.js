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
		.config(routeConfig);

	routeConfig.$inject = ['$routeProvider'];

	function routeConfig($routeProvider) {
		var url = null,
			defaultURL = 'views/partials/room.html';

		$routeProvider
			.when('/page/:page', {
				resolve: {
					checkTemplate: ['$rootScope', '$route', 'templateService', '$q', function ($rootScope, $route, templateService, $q) {
						var deferred = $q.defer();

						url = templateService.getPageTemplateUrl($route.current.params.page);
						if ($rootScope.Helium.state.offlineLimit) {
							if (url === defaultURL) {
								deferred.resolve();
							} else {
								deferred.reject();
								url = defaultURL;
							}
						} else {
							deferred.resolve();
						}

						return deferred.promise;
					}]
				},
				templateUrl: function() {
					return url ? url : defaultURL;
				}
			})
			.otherwise({
				redirectTo: defaultURL
			});
	}
})();
