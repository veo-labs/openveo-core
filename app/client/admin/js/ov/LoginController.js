'use strict';

(function(app) {

  /**
   * Defines the login controller for the login page.
   */
  function LoginController($scope, $location, $window, authenticationService, i18nService, $timeout) {
    var strategies = openVeoSettings.authenticationStrategies;
    $scope.verticalAlign = true;
    $scope.onError = false;
    $scope.languages = i18nService.getLanguages();
    $scope.language = i18nService.getLanguage();
    $scope.isPending = false;
    $scope.hasCas = openVeoSettings.authenticationMechanisms.indexOf(strategies.CAS) >= 0;

    /**
     * Sets language.
     *
     * @param {String} language The language code (e.g fr_FR)
     */
    $scope.changeLanguage = function(language) {
      i18nService.setLanguage(language);
      $window.location.reload();
    };

    /**
     * Signs in using the login form information (userLogin and password).
     * If user successfully signed in, redirect to the back office
     * home page. Otherwise, set the form as on error.
     */
    $scope.signIn = function() {
      $scope.isPending = true;
      authenticationService.login($scope.userLogin, $scope.password).then(function(result) {
        $scope.isPending = false;
        authenticationService.setUserInfo(result.data);

        // This is a hack to let enough time to the database to replicate the session to secondary hosts
        $timeout(function() {
          $location.path('/');
        }, 100);
      }, function() {
        $scope.isPending = false;
        $scope.onError = true;
        $scope.userLogin = $scope.password = '';
      });
    };

  }

  app.controller('LoginController', LoginController);
  LoginController.$inject = ['$scope', '$location', '$window', 'authenticationService', 'i18nService', '$timeout'];

})(angular.module('ov'));
