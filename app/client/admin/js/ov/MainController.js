(function(app){

  "use strict"
  
  app.controller("MainController", MainController);
  MainController.$inject = ["$scope", "$location", "$route", "authenticationService", "menuService", "applicationService", "userService", "i18nService", "alertService", "$window"];
  
  /**
   * Defines the main controller parent of all controllers in the
   * application. All actions not handled in partials are handled
   * by the main controller.
   */
  function MainController($scope, $location, $route, authenticationService, menuService, applicationService, userService, i18nService, alertService, $window, jsonPath){
    $scope.displayMainMenu = false;
    $scope.isResponsiveMenuClosed = true;
    $scope.languages = i18nService.getLanguages();
    $scope.language = i18nService.getLanguageName(i18nService.getLanguage());
    $scope.indexOpen = -1;
    $scope.menuDropdownIsOpen = false;

    /**
     * Opens / closes the main menu while displayed in small devices.
     */
    $scope.toggleResponsiveMenu = function(){
      $scope.isResponsiveMenuClosed = !$scope.isResponsiveMenuClosed;
    };
    
    $scope.closeResponsiveMenu = function(){
      if(!$scope.isResponsiveMenuClosed)
        $scope.isResponsiveMenuClosed = true;
    };

    /**
     * Changes the language to the given one.
     * This will reload the page due to the main menu which can't be
     * reloaded.
     * @param String The new language code
     */
    $scope.changeLanguage = function(language){
      i18nService.setLanguage(language);
      $window.location.reload();
    };

    
    $scope.toggleSidebarSubMenu = function (id) {

      if ($scope.indexOpen == -1)
        $scope.indexOpen = id;
      else if ($scope.indexOpen == id)
        $scope.indexOpen = -1;
      else
        $scope.indexOpen = id;
    };
    

    /**
     * Logs out the actual user.
     * This will remove user information and redirect to the login
     * page.
     */
    
    $scope.logout = function(){
      authenticationService.logout().then(logout, logout);
    };
    
    // Listen to alert add
    $scope.$on("setAlert", function(event, type, msg, timeout){
      alertService.add(type, msg, timeout);
    });

    // Listen to logout request event to logout the user
    $scope.$on("logout", function(){
      $scope.logout();
    });

    // Listen to route change success event to 
    // set new page title and offers access to the menu if 
    // user is authenticated
    $scope.$on("$routeChangeSuccess", function(){
      var userInfo = authenticationService.getUserInfo();

      if(userInfo){
        $scope.menu = menuService.getMenu();
        $scope.displayMainMenu = ($scope.menu) ? true : false;
        menuService.setActiveMenuItem();
      }

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
    
    /**
     * Logs out the user. 
     * Remove user information, remove all admin informations
     * and broadcast a loggedOut event to children controllers.
     */
    function logout(error){
      authenticationService.setUserInfo();
      $location.path("/login");
      $scope.menu = false;
      $scope.displayMainMenu = false;
      menuService.destroyMenu();
      applicationService.destroy();
      userService.destroy();
      $scope.$broadcast("loggedOut");
    }

  }
  
})(angular.module("ov"));