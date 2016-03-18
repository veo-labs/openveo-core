'use strict';

/**
 * Main OpenVeo module.
 *
 * Loads all AngularJS dependencies and plugins modules. It also initializes formly and define routes exposed
 * by OpenVeo core.
 *
 * @module ov
 * @main ov
 */

(function(angular) {

  var moduleDependencies = [
    'ngRoute',
    'ov.authentication',
    'ov.storage',
    'ov.i18n',
    'ov.entity',
    'ov.alert',
    'ov.tableForm',
    'ui.bootstrap',
    'ui.tree',
    'ngTouch',
    'ngTasty',
    'formly',
    'formlyBootstrap',
    'ngJSONPath',
    'ngAnimate',
    'checklist-model'
  ];

  // Loads all openveo sub plugins as dependencies of the module "ov"
  if (typeof plugins !== 'undefined') {
    angular.forEach(plugins, function(pluginToLoad) {

      // If a module exists for a sub plugin
      // e.g ov.plugin1
      // Load it.
      angular.module('ov.' + pluginToLoad);
      moduleDependencies.push('ov.' + pluginToLoad);

    });
  }

  var app = angular.module('ov', moduleDependencies);
  app.run(['formlyConfig', '$filter', function(formlyConfig, $filter) {

    // Formly wrappers
    formlyConfig.setWrapper({
      name: 'collapse',
      templateUrl: 'ov-core-collapse.html'
    });
    formlyConfig.setWrapper({
      name: 'horizontalBootstrapLabel',
      templateUrl: 'ov-core-horizontal-bootstrap-label.html'
    });
    formlyConfig.setWrapper({
      name: 'horizontalBootstrapLabelOnly',
      templateUrl: 'ov-core-horizontal-bootstrap-label-only.html'
    });
    formlyConfig.setWrapper({
      name: 'editableWrapper',
      templateUrl: 'ov-core-editable-wrapper.html'
    });

    // Formly types
    formlyConfig.setType({
      name: 'tags',
      templateUrl: 'ov-core-formly-tags.html',
      defaultOptions: {
        validation: {
          show: true
        }
      }
    });
    formlyConfig.setType({
      name: 'emptyrow',
      templateUrl: 'ov-core-empty-row.html',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      extends: 'input',
      name: 'editableInput',
      link: function(scope, element, attrs) {
        scope.show = function() {
          scope.isEmpty = scope.model[scope.options.key] ? false : true;
          return scope.model[scope.options.key] || 'UI.EMPTY';
        };
      }
    });
    formlyConfig.setType({
      extends: 'select',
      name: 'editableSelect',
      link: function(scope, element, attrs) {
        scope.show = function() {
          var name = 'UI.EMPTY';

          // Find selected option label
          for (var i = 0; i < scope.to.options.length; i++) {
            var selectOption = scope.to.options[i];
            if (selectOption.value === scope.model[scope.options.key]) {
              name = selectOption.name;
              break;
            }
          }

          scope.isEmpty = scope.model[scope.options.key] ? false : true;
          return name;
        };
      }
    });
    formlyConfig.setType({
      name: 'editableTags',
      extends: 'tags',
      wrapper: ['editableTagsWrapper'],
      link: function(scope, element, attrs) {
        scope.show = function() {
          var tags = scope.model[scope.options.key];
          scope.isEmpty = tags && tags.length ? false : true;
          return tags && tags.join(', ') || 'UI.EMPTY';
        };
      }
    });
    formlyConfig.setType({
      name: 'ovMultiCheckBox',
      templateUrl: 'ov-core-formly-multi-check-box.html'
    });
    formlyConfig.setType({
      name: 'ovEditableMultiCheckBox',
      extends: 'ovMultiCheckBox',
      link: function(scope) {
        scope.show = function() {
          var selected = [];
          angular.forEach(scope.to.options, function(s) {
            if (scope.model[scope.options.key] && scope.model[scope.options.key].indexOf(s.id) >= 0) {
              selected.push(s.name);
            }
          });
          scope.isEmpty = selected.length ? false : true;
          return selected.length ? selected.join(', ') : 'UI.EMPTY';
        };
      }
    });
    formlyConfig.setType({
      name: 'horizontalInput',
      extends: 'input',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableInput',
      extends: 'editableInput',
      wrapper: ['editableWrapper', 'horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalSelect',
      extends: 'select',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableSelect',
      extends: 'editableSelect',
      wrapper: ['editableWrapper', 'horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalMultiCheckbox',
      extends: 'ovMultiCheckBox',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableMultiCheckbox',
      extends: 'ovEditableMultiCheckBox',
      wrapper: ['editableWrapper', 'horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalTags',
      extends: 'tags',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableTags',
      extends: 'editableTags',
      wrapper: ['editableWrapper', 'horizontalBootstrapLabel', 'bootstrapHasError']
    });

  }]);

  /**
   * Configures application main routes and set location mode to HTML5.
   */
  app.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider) {

      // Register / route with authentication
      $routeProvider.when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController',
        title: 'HOME.PAGE_TITLE'
      });

      // Register /login route without authentication
      $routeProvider.when('/login', {
        title: 'LOGIN.PAGE_TITLE',
        templateUrl: 'views/login.html',
        controller: 'LoginController',
        resolve: {
          i18nCommon: ['i18nService', function(i18nService) {
            return i18nService.addDictionary('common');
          }],
          i18nLogin: ['i18nService', function(i18nService) {
            return i18nService.addDictionary('login');
          }]
        }
      }).otherwise('/');

      // Register /applications route with authentication
      // Also retrieve the list of applications
      $routeProvider.when('/applications', {
        templateUrl: 'views/applications.html',
        controller: 'ApplicationController',
        title: 'APPLICATIONS.PAGE_TITLE',
        access: 'access-applications-page',
        resolve: {
          scopes: ['applicationService', function(applicationService) {
            return applicationService.loadScopes();
          }]
        }
      });

      // Register /users route with authentication
      // Also retrieve the list of roles
      $routeProvider.when('/users', {
        templateUrl: 'views/users.html',
        controller: 'UserController',
        title: 'USERS.PAGE_TITLE',
        access: 'access-users-page',
        resolve: {
          roles: ['userService', function(userService) {
            return userService.loadRoles();
          }]
        }
      });

      // Register /profiles route with authentication
      // Also retrieve the user profile
      $routeProvider.when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileController',
        title: 'PROFILES.PAGE_TITLE',
        resolve: {
          user: ['authenticationService', function(authenticationService) {
            return authenticationService.getUserInfo();
          }]
        }
      });

      // Register /roles route with authentication
      // Also retrieve the list of permissions
      $routeProvider.when('/roles', {
        templateUrl: 'views/roles.html',
        controller: 'RoleController',
        title: 'ROLES.PAGE_TITLE',
        access: 'access-roles-page',
        resolve: {
          permissions: ['userService', function(userService) {
            return userService.loadPermissions();
          }]
        }
      });

      $locationProvider.html5Mode(true);
      $httpProvider.interceptors.push('errorInterceptor');

    }]);

  // Replace "classic" spaces with non-breaking-spaces
  app.filter('noBreakSpace', function() {
    return function(value) {
      return value.replace(/ /g, '\u00A0');
    };
  });

})(angular);
