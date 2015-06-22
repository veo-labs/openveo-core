(function (angular) {

  "use strict"

  var moduleDependencies = [
    "ngRoute",
    "ov.authentication",
    "ov.storage",
    "ov.route",
    "ov.i18n",
    "ui.bootstrap",
    "ui.tree",
    "datatables",
    "ngTouch"
  ];

  // Loads all openveo sub plugins as dependencies of the module "ov"
  if (typeof plugins !== "undefined") {
    angular.forEach(plugins, function (pluginToLoad) {

      try {

        // If a module exists for a sub plugin 
        // e.g ov.plugin1
        // Load it.
        angular.module("ov." + pluginToLoad);
        moduleDependencies.push("ov." + pluginToLoad);
      }
      catch (e) {
        if (typeof console !== "undefined")
          console.error(e.message);
      }

    });
  }

  var app = angular.module("ov", moduleDependencies, ["$interpolateProvider", App]);

  /**
   * Changes the delimiter to avoid conflict with server
   * template rendering engine.
   */
  function App($interpolateProvider) {
    $interpolateProvider.startSymbol("[[");
    $interpolateProvider.endSymbol("]]");
  }

  /**
   * Configures application main routes and set location mode to HTML5.
   * Routes which require authentication are registered using 
   * the ovRouteProvider which is a wrapper to the $routeProvider.
   */
  app.config(["ovRouteProvider", "$routeProvider", "$locationProvider", function (ovRouteProvider, $routeProvider, $locationProvider) {

      // Register /admin route with authentication
      ovRouteProvider.when("/admin", {
        templateUrl: "views/home.html",
        controller: "HomeController",
        title: "HOME.PAGE_TITLE"
      });

      // Register /login route without authentication
      $routeProvider.when("/login", {
        title: "PAGE_TITLE",
        templateUrl: "views/login.html",
        controller: "LoginController",
        resolve: {
          i18n: ["i18nService", function (i18nService) {
              return i18nService.addDictionary("login");
            }],
          auth: ["$q", "authenticationService", function ($q, authenticationService) {
              var userInfo = authenticationService.getUserInfo();

              if (userInfo)
                return $q.reject();
              else
                return $q.when();
            }]
        }
      }).otherwise("/admin");

      // Register /admin/ws/applications route with authentication
      // Also retrieve the list of applications
      ovRouteProvider.when("/admin/ws/be/applications", {
        templateUrl: "views/applications.html",
        controller: "ApplicationController",
        title: "APPLICATIONS.PAGE_TITLE",
        resolve: {
          applications: ["applicationService", function (applicationService) {
              return applicationService.loadApplications();
            }],
          scopes: ["applicationService", function (applicationService) {
              return applicationService.loadScopes();
            }]
        }
      });

      $locationProvider.html5Mode(true);

    }]);

})(angular);