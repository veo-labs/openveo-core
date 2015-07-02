(function(app){

  "use strict"

  app.controller("LoginController", LoginController);
  LoginController.$inject = ["$scope", "$location", "authenticationService", "i18nService"];

  /**
   * Defines the login controller for the login page.
   */
  function LoginController($scope, $location, authenticationService, i18nService){
    $scope.verticalAlign = true;
    $scope.onError = false;
    $scope.languages = i18nService.getLanguages();
    $scope.language = i18nService.getLanguage();

    /**
     * Sets language.
     * @param String language The language code
     */
    $scope.changeLanguage = function(language){
      i18nService.setLanguage(language);
    };

    /**
     * Signs in using the login form information (userEmail and password).
     * If user successfully signed in, redirect to the back office 
     * home page. Otherwise, set the form as on error.
     */
    $scope.signIn = function(){
      var loginPromise = authenticationService.login($scope.userEmail, $scope.password);

      if(loginPromise){
        loginPromise.then(function(result){
          authenticationService.setUserInfo(result.data);
          $location.path("/admin");
        }, function(error){
          $scope.onError = true;
          $scope.userEmail = $scope.password = "";
        });
      }

    };

  }
  
})(angular.module("ov"));