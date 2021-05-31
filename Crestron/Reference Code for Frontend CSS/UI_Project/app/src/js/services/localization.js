/**
 * This software development kit (SDK) consisting of HTML and JavaScript sample code is licensed under the general terms of Crestron’s Software Development Tools
 * License Agreement, with the exception that you are granted permission to redistribute derivative works of the provided sample code in source code format.
 * This license is located at http://www.crestron.com/legal/software-license-agreement.  This SDK can be used to customize the user experience with Crestron scheduling panels.
 * If edited in a way that’s contrary to our instructions, this SDK could result in unexpected behavior and a diminished user experience.
 */

(function () {
  'use strict';

  angular
    .module('helium')
    .service('LocalizationService', LocalizationService);

  LocalizationService.$inject = ['$rootScope', 'tmhDynamicLocale', '$http', 'AppConfig', '$route'];

  function LocalizationService($rootScope, tmhDynamicLocale, $http, AppConfig, $route) {
    var _lang;
    function setLabels(labels) {
      $rootScope.Helium.labels = labels;
    }

    function getLabels(language) {
      return $http.get('assets/translations/' + language + '.json');
    }

    this.changeLanguage = function (settings, callback) {
      var lang = settings.language,
        rtl = settings.rtl,
        setLanguage = function () {
          tmhDynamicLocale.set(lang);
          AppConfig.arabicLanguage = (lang === 'iw' || lang === 'he' || lang === 'ar');
          $rootScope.Helium.state.isArabic = AppConfig.arabicLanguage;
          $rootScope.isRtl = rtl;
        };

      lang = lang || 'en-us';
      lang = lang.toLowerCase().split('_').join('-');

      getLabels(lang).then(function (response) {
        _lang = lang;
        setLanguage();
        setLabels(response.data);
        $route.reload();
        callback();
      }, function () {
        getLabels(_lang || 'en-us').then(function (response) {
          setLanguage();
          setLabels(response.data);
          $route.reload();
          callback();
        }, function () {
          callback();
        });
      });
    };
  }
})();
