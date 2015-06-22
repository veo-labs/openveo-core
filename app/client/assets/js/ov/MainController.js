(function(app){

  "use strict"
  
  app.controller("MainController", MainController);
  MainController.$inject = ["$scope", "$location", "$route", "authenticationService", "menuService", "applicationService", "i18nService", "$window"];

  /**
   * Defines the main controller parent of all controllers in the
   * application. All actions not handled in partials are handled
   * by the main controller.
   */
  function MainController($scope, $location, $route, authenticationService, menuService, applicationService, i18nService, $window){
    $scope.displayMainMenu = false;
    $scope.isResponsiveMenuOpened = false;
    $scope.languages = i18nService.getLanguages();
    $scope.language = i18nService.getLanguageName(i18nService.getLanguage());

    /**
     * Opens / closes the main menu while displayed in small devices.
     */
    $scope.toggleResponsiveMenu = function(){
      $scope.isResponsiveMenuOpened = !$scope.isResponsiveMenuOpened;
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

    /**
     * Toggles the sub menu associated to the event.
     * @param Event event Click event on the sub menu
     */
    $scope.toggleSubMenu = function(event){
      var element = angular.element(event.target);

      // Retrieve bootstrap dropdown menu to toggle it
      while(!element.hasClass("dropdown"))
        element = element.parent();

      if(element.hasClass("open"))
        element.removeClass("open");
      else
        element.addClass("open");
    };

    /**
     * Logs out the actual user.
     * This will remove user information and redirect to the login
     * page.
     */
    $scope.logout = function(){
      authenticationService.logout().then(logout, logout);
    };

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

      $scope.isResponsiveMenuOpened = false;

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
      applicationService.destroyApplications();
      $scope.$broadcast("loggedOut");
    }

  }
  
})(angular.module("ov"));