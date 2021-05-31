/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

 
/**
 * Application Config
 *
 * Configuration for application
 */

(function() {
    'use strict';

    angular
        .module('helium')
        .constant('AppConfig', {
            delayTime: 10 * 1000,// Number of milliseconds between each function call.
            hourInMin: 60,
            arabicLanguage: false,
            template: {
                arabicTemplateSuffix: '_arabic',
                modalFolderPath: 'views/modals/',
                pageFolderPath: 'views/partials/'
            },
            screenSaverDelay:  5 * 60 * 1000,
            errorMsgCloseDelay: 10 * 1000,
            successMsgCloseDelay: 10 * 1000,
            timeoutLoadingMask: 60 * 1000,
            timeoutPendingRoom: 60 * 1000,
        });
})();
