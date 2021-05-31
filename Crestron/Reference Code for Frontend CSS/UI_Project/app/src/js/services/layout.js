/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/**
 * Layout service
 *
 * Updates the layout of the application
 */
(function () {
    'use strict';

    angular
        .module('helium')
        .service('LayoutService', LayoutService);

    LayoutService.$inject = ['$rootScope'];

    function LayoutService($rootScope) {
        this.updateLayout = function (verticalLayout) {
            var newLayout = verticalLayout ? 'vertical' : 'horizontal';

            /* Forcing layout to 'portrait here if state.portraitPanel (set in appState.js setTimelineBlockDimensions) is true.  */
            if ($rootScope.Helium.state.portraitPanel) {
                newLayout = 'portrait';
            }

            $rootScope.Helium.state.layout = newLayout;
            localStorage.setItem('layout', newLayout);
        };

        this.loadLayout = function () {
            $rootScope.Helium.state.layout = localStorage.getItem('layout') || 'horizontal';
        };
    }
})();
