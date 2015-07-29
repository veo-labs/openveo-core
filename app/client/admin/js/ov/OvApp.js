(function (angular) {

  "use strict"

  var moduleDependencies = [
    "ngRoute",
    "ov.authentication",
    "ov.storage",
    "ov.route",
    "ov.i18n",
    "ov.entity",
    "ov.alert",
    "ov.tableForm",
    "ui.bootstrap",
    "ui.tree",
    "ngTouch",
    "ngTasty",
    "formly",
    "formlyBootstrap",
    "xeditable",
    "vds.multirange",
    "ngJSONPath",
    "ngAnimate"
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
  
  app.run(["editableOptions", "formlyConfig",function (editableOptions, formlyConfig) {

    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
    formlyConfig.setWrapper({
      name: 'horizontalBootstrapLabel',
      template: [
        '<label for="[[::id]]" class="col-md-4 control-label">',
        '[[to.label]] [[to.required ? "*" : ""]]',
        '</label>',
        '<div class="col-md-8">',
        '<formly-transclude></formly-transclude>',
        '</div>'
      ].join(' ')
    });
    //input type
    formlyConfig.setType({
      extends: 'input',
      template: '<div class="editable"><span editable-text="model[options.key]" e-name="[[::id]]">[[ model[options.key] || "empty" ]]</span></div>',
      name: 'editableInput'
    });
    formlyConfig.setType({
      extends: 'select',
      template: '<div class="editable">\n\
<span editable-select="model[options.key]" e-name="[[::id]]" e-ng-options="s.value as s.name for s in to.options">\n\
[[ (to.options | filter:{value: model[options.key]})[0].name || "Not set" ]]\n\
</div>',
      name: 'editableSelect'
    });
    //horizontal-inputType
    formlyConfig.setType({
      name: 'horizontalInput',
      extends: 'input',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalExtendInput',
      extends: 'editableInput',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalSelect',
      extends: 'select',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalExtendSelect',
      extends: 'editableSelect',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
  }]);
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
    
      // Register /admin/be/users route with authentication
      // Also retrieve the list of users and roles
      ovRouteProvider.when("/admin/be/users", {
        templateUrl: "views/users.html",
        controller: "UserController",
        title: "USERS.PAGE_TITLE",
        resolve: {
          users : ["userService", function(userService){
            return userService.loadUsers();
          }],
          roles : ["userService", function(userService){
            return userService.loadRoles();
          }]
        }
      });

      // Register /admin/be/roles route with authentication
      // Also retrieve the list of roles and permissions
      ovRouteProvider.when("/admin/be/roles", {
        templateUrl: "views/roles.html",
        controller: "RoleController",
        title: "ROLES.PAGE_TITLE",
        resolve: {
          roles : ["userService", function(userService){
            return userService.loadRoles();
          }],
          permissions : ["userService", function(userService){
            return userService.loadPermissions();
          }]
        }
      });    

      $locationProvider.html5Mode(true);

    }]);

})(angular);