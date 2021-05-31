/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/*
 * Loading mask directive
 * 
 */

(function () {
  'use strict';

  angular
    .module('helium')
    .directive('hlmLoadingMask', LoadingMaskDirective);

  function LoadingMaskDirective() {
    return {
      restrict: 'A',
      replace: true,
      scope: {
        loading: '=',
        message: '='
      },
      template: '<div class="loading bg__theme-color-6">' +
                  '<div class="loading__mask">' +
                    '<i class="loading__mask__img fa fa-spinner fa-pulse fa-3x fa-fw margin-bottom"></i>' +
                    '<p class="loading__mask__message">{{ message }}</p>' +
                  '</div>' +
                '</div>',
      link: function (scope, element) {
        scope.$watch('loading', function (val) {
          if (val) {
            $(element).show();
          } else {
            $(element).hide();
          }
        });
      }
    };
  }
})();
