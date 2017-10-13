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
     $window,
     $q) {

    $scope.displayMainMenu = false;
    $scope.isResponsiveMenuClosed = true;
    $scope.languages = i18nService.getLanguages();
    $scope.language = i18nService.getLanguageName(i18nService.getLanguage());
    $scope.indexOpen = -1;
    $scope.menuDropdownIsOpen = false;
    $scope.newAnimation = '';

    /**
     * Logs out the user.
     *
     * Remove user information, remove all admin informations
     * and broadcast a loggedOut event to children controllers.
     */
    function logout() {
      $scope.closeResponsiveMenu();
      authenticationService.setUserInfo();
      $scope.menu = false;
      $scope.displayMainMenu = false;
      menuService.destroyMenu();
      i18nService.removeDictionary('back-office');
      applicationService.destroy();
      userService.destroy();
      entityService.deleteCache();
      alertService.closeAll();
      $location.path('/login');
    }

    /**
     * Replaces placeholders by corresponding values in the given string.
     * Function copied from AngularJS ngRoute.
     *
     * @param {string} string A string containing placeholders
     * @param {string} params An array of parameters
     * @return {string} interpolation of the redirect path with the parameters
     */
    function interpolate(string, params) {
      var result = [];
      angular.forEach((string || '').split(':'), function(segment, i) {
        if (i === 0) {
          result.push(segment);
        } else {
          var segmentMatch = segment.match(/(\w+)(?:[?*])?(.*)/);
          var key = segmentMatch[1];
          result.push(params[key]);
          result.push(segmentMatch[2] || '');
          delete params[key];
        }
      });
      return result.join('');
    }

    /**
     * Replaces placeholders by corresponding values in the given string.
     *
     * @param {string} string A string containing placeholders
     * @param {string} params An array of parameters
     * @return {string} The compiled string
     */
    function resolvePath(string, params) {
      params = angular.copy(params);

      if (params && Object.keys(params).length)
        return interpolate(string, params);
      else
        return string;
    }

    /**
     * Gets permissions from groups for the given operation.
     *
     * @param {Array} groupIds A list of group ids
     * @param {String} operation "get", "update" or "delete"
     * @return {Array} The list of permissions
     */
    function getPermissionsFromGroups(groupIds, operation) {
      var permissions = [];

      if (groupIds && groupIds.length) {
        groupIds.forEach(function(groupId) {
          permissions.push(operation + '-group-' + groupId);
        });
      }

      return permissions;
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

    $scope.navigate = function(event) {
      if (event) {
        $scope.closeResponsiveMenu();
        $location.path(angular.element(event.currentTarget).attr('href'));
      }
    };

    /**
     * Changes the language to the given one.
     *
     * This will reload the page due to the main menu which can't be
     * reloaded.
     *
     * @param {String} language The new language code (e.g. fr_FR)
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
     *
     * If authentication was made on an external service such as CAS, user is redirected to
     * the external service page.
     * If authentication was made using an internal service such as LDAP (or local),
     * logout is performed without reloading the page.
     */
    $scope.logout = function() {
      if ($scope.userInfo && $scope.userInfo.origin === openVeoSettings.authenticationStrategies.CAS)
        $window.location.href = 'logout';
      else
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

    // Listen to forceLogout request event to logout the user
    // without making a call to the server
    $scope.$on('forceLogout', function() {
      logout();
    });

    // Listen to angular router change start event
    // Some promises, like translations and back end menu must be retrieved
    // before routing to an authenticated page
    // Also check if the user is authenticated to grant him access to an authenticated page.
    $scope.$on('$routeChangeStart', function(event, route) {
      var expectedParams = route.params;
      var expectedPath = resolvePath(route.originalPath, expectedParams);

      // No destination route, nothing to do
      if (!expectedPath)
        return false;

      // Retrieve user information and back end translations
      var userInfo = authenticationService.getUserInfo();
      var translations = i18nService.getDictionary('back-office', i18nService.getLanguage());

      if ($location.path() !== '/login' && userInfo && (!menuService.getMenu() || !translations)) {

        // User has access to the back end
        // Some promises are required to access the back end
        // Prevent router from routing to the specified destination and retrieve promises first

        event.preventDefault();

        // List of promises required to access an authenticated page
        var initPromises = {
          i18nCommon: i18nService.addDictionary('common'),
          i18nBE: i18nService.addDictionary('back-office', true),
          menu: menuService.loadMenu()
        };

        $q.all(initPromises).then(
          function(values) {

            // Got enough information to display the back end
            // Just resume the route
            if (expectedPath === resolvePath($location.path(), expectedParams))
              $route.reload();
            else
              $location.path(expectedPath);

          },
          function(error) {

            // User is not authorized to access the back end page
            // It means that its session has expired
            // Cleanly logout the user
            if (error.status === 401) {
              logout();
              $route.reload();
            }

          }
        );

        return false;
      } else if ($location.path() !== '/login' && !userInfo) {

        // User is not authenticated and tries to access the back end
        // Redirect to login page

        event.preventDefault();
        $location.path('/login');
        return false;
      } else if ($location.path() !== '/login' && userInfo) {

        // User is authenticated and tries to access a back end page

        // Check if user has access to the expected page
        $scope.userInfo = userInfo;
        if (route.access && !$scope.checkAccess(route.access)) {
          event.preventDefault();
          $location.path('/');
          return false;
        }

        if (event.targetScope.newAnimation == 'LR')
          event.currentScope.newAnimation = 'RL';
        else if (event.targetScope.newAnimation == 'RL')
          event.currentScope.newAnimation = 'LR';
        else
          event.currentScope.newAnimation = '';
      } else if ($location.path() === '/login' && userInfo) {
        event.preventDefault();
        $location.path('/');
        return false;
      }

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
      if (!$scope.userInfo)
        $location.path('/login');
      else if (eventObj && eventObj.redirect)
        $location.path(eventObj.redirect);
      else $location.path('/');
    });

    /**
     * Checks that authenticated user has a permission.
     *
     * @param {Array|String} permissions One or several permissions
     * @return {Boolean} true if user has one of the permissions, false otherwise
     */
    $scope.checkAccess = function(permissions) {
      if ($scope.userInfo) {

        // Access granted to admin
        if ($scope.userInfo.id == 0) return true;

        if (typeof permissions === 'string')
          permissions = [permissions];

        // Access granted to user with roles and with the right permissions
        if ($scope.userInfo.roles && $scope.userInfo.roles.length != 0 &&
                $scope.userInfo.permissions && $scope.userInfo.permissions.length != 0) {
          return permissions.filter(function(permission) {
            return $scope.userInfo.permissions.indexOf(permission) >= 0;
          }).length > 0;
        }

      }

      return false;
    };

    /**
     * Checks that user has permission to access a content.
     *
     * @param {Object} content The content entity to try to access
     * @param {String} operation The operation that will be performed on the content
     * @return {Boolean} true if user has sufficient permission to perform the operation on the content
     */
    $scope.checkContentAccess = function(content, operation) {
      if ($scope.userInfo && content && operation) {

        // Access granted to super administrator and owner
        // Access is also granted for contents belonging to the anonymous user
        if ($scope.userInfo.id === '0' ||
            content.metadata.user === '1' ||
            $scope.userInfo.id === content.metadata.user
        ) return true;

        // Access granted to users belonging to, at least, one of the groups associated to the content
        // User must have group permission on the operation
        if (content.metadata.groups && content.metadata.groups.length) {
          var contentPermissions = getPermissionsFromGroups(content.metadata.groups, operation);

          for (var i = 0; i < contentPermissions.length; i++) {
            if ($scope.userInfo.permissions.indexOf(contentPermissions[i]) >= 0)
              return true;
          }

        }
      }

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
    '$window',
    '$q'
  ];

})(angular.module('ov'));
