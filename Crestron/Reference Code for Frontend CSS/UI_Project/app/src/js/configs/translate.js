/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */


/**
 * Application localization
 */

(function () {
  'use strict';

  angular
    .module('helium')
    .config(translateProvider)
    .config(translateDynamicLocale);

  translateProvider.$inject = ['$translateProvider'];
  translateDynamicLocale.$inject = ['tmhDynamicLocaleProvider'];

  function translateProvider($translateProvider) {
    $translateProvider.preferredLanguage('en');
    $translateProvider.useSanitizeValueStrategy('escape');
  }

  function translateDynamicLocale(tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.defaultLocale('en');
    tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js');
  }

})();
