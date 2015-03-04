(function(app){

  "use strict"

  app.controller("LoginController", LoginController);
  LoginController.$inject = ["$scope", "$location", "authenticationService"];

  /**
   * Defines the login controller for the login page.
   */
  function LoginController($scope, $location, authenticationService){
    $scope.verticalAlign = true;
    $scope.onError = false;

    /**
     * Signs in using the login form information (userName and password).
     * If user successfully signed in, redirect to the back office 
     * home page. Otherwise, set the form as on error.
     */
    $scope.signIn = function(){
      authenticationService.login($scope.userName, $scope.password).then(function(result){
        authenticationService.setUserInfo(result.data);
        $location.path("/admin");
      }, function(error){
        $scope.onError = true;
        $scope.userName = $scope.password = "";
      });
    };

  }
  
})(angular.module("ov"));