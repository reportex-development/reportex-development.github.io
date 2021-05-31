/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/**
 * Communication service with SchedulePanel
 */
(function () {
    'use strict';

    angular
        .module('helium')
        .service('ModalService', ModalService);

    ModalService.$inject = ['$uibModalStack'];

    function ModalService($uibModalStack) {
        this.closeAll = function () {
            $uibModalStack.dismissAll();
        };
    }
})();