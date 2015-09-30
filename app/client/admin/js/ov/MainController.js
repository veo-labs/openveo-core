'use strict';

(function(app) {

  /**
   * Defines the main controller parent of all controllers in the
   * application. All actions not handled in partials are handled
   * by the main controller.
   */
  function MainController($rootScope,
     $scope,
     $location,
     $route,
     authenticationService,
     menuService,
     applicationService,
     userService,
     i18nService,
     alertService,
     entityService,
     $window) {

    $scope.displayMainMenu = false;
    $scope.isResponsiveMenuClosed = true;
    $scope.languages = i18nService.getLanguages();
    $scope.language = i18nService.getLanguageName(i18nService.getLanguage());
    $scope.indexOpen = -1;
    $scope.menuDropdownIsOpen = false;
    $scope.newAnimation = '';

    /**
     * Logs out the user.
     * Remove user information, remove all admin informations
     * and broadcast a loggedOut event to children controllers.
     */
    function logout() {
      authenticationService.setUserInfo();
      $location.path('/login');
      $scope.menu = false;
      $scope.displayMainMenu = false;
      menuService.destroyMenu();
      applicationService.destroy();
      userService.destroy();
      entityService.deleteCache();
      $scope.$broadcast('loggedOut');
    }

    $scope.toggleResponsiveMenu = function() {
      $scope.isResponsiveMenuClosed = !$scope.isResponsiveMenuClosed;
    };

    $scope.closeResponsiveMenu = function() {
      if (!$scope.isResponsiveMenuClosed && $scope.displayMainMenu)
        $scope.isResponsiveMenuClosed = true;
    };

    $scope.openResponsiveMenu = function() {
      if ($scope.isResponsiveMenuClosed && $scope.displayMainMenu)
        $scope.isResponsiveMenuClosed = false;
    };

    /**
     * Changes the language to the given one.
     * This will reload the page due to the main menu which can't be
     * reloaded.
     * @param {String} The new language code (e.g. fr_FR)
     */
    $scope.changeLanguage = function(language) {
      i18nService.setLanguage(language);
      $window.location.reload();
    };

    $scope.toggleSidebarSubMenu = function(id) {

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
    $scope.logout = function() {
      authenticationService.logout().then(logout, logout);
    };

    // Listen to alert add
    $scope.$on('setAlert', function(event, type, msg, timeout) {
      alertService.add(type, msg, timeout);
    });

    // Listen to logout request event to logout the user
    $scope.$on('logout', function() {
      $scope.logout();
    });

    $scope.$on('$routeChangeStart', function(event, route) {
      $scope.userInfo = authenticationService.getUserInfo();
      if ($scope.userInfo) {
        if (route.access && !$scope.checkAccess(route.access)) {
          $location.path('/');
          return false;
        }
      }

      if (event.targetScope.newAnimation == 'LR')
        event.currentScope.newAnimation = 'RL';
      else if (event.targetScope.newAnimation == 'RL')
        event.currentScope.newAnimation = 'LR';
      else
        event.currentScope.newAnimation = '';
    });

    // Listen to route change success event to
    // set new page title and offers access to the menu if
    // user is authenticated
    $scope.$on('$routeChangeSuccess', function(event, route) {
      entityService.deleteCache();
      $scope.userInfo = authenticationService.getUserInfo();
      if ($scope.userInfo) {
        $scope.menu = menuService.getMenu();
        $scope.displayMainMenu = ($scope.menu) ? true : false;
        menuService.setActiveMenuItem();
      } else
        $scope.displayMainMenu = false;

      // Change page title
      $scope.title = $route.current && $route.current.title || '';
      $scope.newAnimation = $rootScope.newAnimation;
    });

    // Listen to the route change error event
    // If user is not authenticated, redirect to the login page
    // otherwise redirect to the home page
    $scope.$on('$routeChangeError', function(event, current, previous, eventObj) {
      if (eventObj && eventObj.authenticated === false)
        $location.path('/login');
      else
        $location.path('/');
    });

    $scope.checkAccess = function(perm) {
      if ($scope.userInfo) {
        if ($scope.userInfo.id != 0 && $scope.userInfo.permissions && $scope.userInfo.permissions.length != 0)
          return $scope.userInfo.permissions.indexOf(perm) >= 0;
        else
          return true;
      } else
        return false;
    };

  }

  app.controller('MainController', MainController);
  MainController.$inject = [
    '$rootScope',
    '$scope',
    '$location',
    '$route',
    'authenticationService',
    'menuService',
    'applicationService',
    'userService',
    'i18nService',
    'alertService',
    'entityService',
    '$window'
  ];

})(angular.module('ov'));
