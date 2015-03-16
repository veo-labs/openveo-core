(function(app){

  "use strict"
  
  app.controller("MainController", MainController);
  MainController.$inject = ["$scope", "$location", "$route", "authenticationService"];

  /**
   * Defines the main controller parent of all controllers in the
   * application. All actions not handled in partials are handled
   * by the main controller.
   */
  function MainController($scope, $location, $route, authenticationService){
    $scope.menu = false;
    
    /**
     * Logs out the actual user.
     * This will remove user information and redirect to the login
     * page.
     */
    $scope.logout = function(){
      authenticationService.logout().then(function(){
        authenticationService.setUserInfo();
        $location.path("/login");
        $scope.menu = false;
      }, function(error){
        authenticationService.setUserInfo();
        $location.path("/login");
        $scope.menu = false;
      });
    };

    // Listen to route change success event to 
    // set new page title and offers access to the menu if 
    // user is authenticated
    $scope.$on("$routeChangeSuccess", function(){
      var userInfo = authenticationService.getUserInfo();

      if(userInfo)
        $scope.menu = true;

      // Change page title
      $scope.title = $route.current && $route.current.title || "";
    });

    // Listen to the route change error event
    // If user is not authenticated, redirect to the login page
    // otherwise redirect to the home page
    $scope.$on("$routeChangeError", function(event, current, previous, eventObj){
      if(eventObj && eventObj.authenticated === false)
        $location.path("/login"); 
      else
        $location.path("/admin"); 
    });
    
  }
  
})(angular.module("ov"));