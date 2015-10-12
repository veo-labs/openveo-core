'use strict';

(function(app) {

  /**
   * Defines the login controller for the login page.
   */
  function LoginController($scope, $location, $window, authenticationService, i18nService) {
    $scope.verticalAlign = true;
    $scope.onError = false;
    $scope.languages = i18nService.getLanguages();
    $scope.language = i18nService.getLanguage();

    /**
     * Sets language.
     * @param {String} language The language code (e.g fr_FR)
     */
    $scope.changeLanguage = function(language) {
      i18nService.setLanguage(language);
      $window.location.reload();
    };

    /**
     * Signs in using the login form information (userEmail and password).
     * If user successfully signed in, redirect to the back office
     * home page. Otherwise, set the form as on error.
     */
    $scope.signIn = function() {
      var loginPromise = authenticationService.login($scope.userEmail, $scope.password);

      if (loginPromise) {
        loginPromise.then(function(result) {
          authenticationService.setUserInfo(result.data);
          $location.path('/');
        }, function() {
          $scope.onError = true;
          $scope.userEmail = $scope.password = '';
        });
      }

    };

  }

  app.controller('LoginController', LoginController);
  LoginController.$inject = ['$scope', '$location', '$window', 'authenticationService', 'i18nService'];

})(angular.module('ov'));
