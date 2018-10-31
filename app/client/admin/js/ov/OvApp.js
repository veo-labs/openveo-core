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
    'ov.util',
    'ov.socket',
    'ui.bootstrap',
    'ui.tree',
    'ngTasty',
    'formly',
    'formlyBootstrap',
    'ngAnimate',
    'ui.tinymce',
    'ngFileUpload'
  ];

  // Loads all openveo sub plugins as dependencies of the module "ov"
  if (typeof openVeoSettings !== 'undefined' && openVeoSettings.plugins) {
    angular.forEach(openVeoSettings.plugins, function(pluginToLoad) {

      // If a module exists for a sub plugin
      // e.g ov.plugin1
      // Load it.
      angular.module('ov.' + pluginToLoad);
      moduleDependencies.push('ov.' + pluginToLoad);

    });
  }

  var app = angular.module('ov', moduleDependencies);
  app.run(['formlyConfig', '$filter', '$sce', function(formlyConfig, $filter, $sce) {

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
      name: 'datepicker',
      templateUrl: 'ov-core-formly-datepicker.html',
      defaultOptions: {
        validation: {
          show: true
        }
      },
      link: function(scope, element, attrs) {
        scope.status = {opened: false};

        scope.open = function() {
          scope.status.opened = true;
        };
      }
    });
    formlyConfig.setType({
      name: 'dateTimePicker',
      templateUrl: 'ov-core-formly-date-time-picker.html'
    });
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
      name: 'match',
      templateUrl: 'ov-core-formly-match.html',
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
      name: 'section',
      templateUrl: 'ov-core-section.html'
    });
    formlyConfig.setType({
      name: 'autoComplete',
      templateUrl: 'ov-core-formly-auto-complete.html',
      defaultOptions: {
        validation: {
          show: true
        }
      }
    });
    formlyConfig.setType({
      extends: 'input',
      name: 'editableInput',
      link: function(scope, element, attrs) {
        scope.show = function() {
          scope.isEmpty = scope.model[scope.options.key] ? false : true;
          return scope.model[scope.options.key] || $filter('translate')('CORE.UI.EMPTY');
        };
      }
    });
    formlyConfig.setType({
      extends: 'select',
      name: 'editableSelect',
      link: function(scope, element, attrs) {
        scope.show = function() {
          var labels = [];
          var values;

          if (Object.prototype.toString.call(scope.model[scope.options.key]) === '[object Array]')
            values = scope.model[scope.options.key];
          else
            values = [scope.model[scope.options.key]];

          // Find selected option label
          scope.to.options.forEach(function(option) {
            values.forEach(function(value) {
              if (option.value === value)
                labels.push(option.name);
            });
          });

          scope.isEmpty = labels.length ? false : true;
          return labels.length ? labels.join(', ') : $filter('translate')('CORE.UI.EMPTY');
        };
      }
    });
    formlyConfig.setType({
      name: 'editableDatepicker',
      extends: 'datepicker',
      link: function(scope, element, attrs) {
        scope.show = function() {
          return $filter('date')(scope.model[scope.options.key], 'shortDate');
        };
      }
    });
    formlyConfig.setType({
      name: 'editableDateTimePicker',
      extends: 'dateTimePicker',
      link: function(scope, element, attrs) {
        scope.show = function() {
          scope.isEmpty = scope.model[scope.options.key] ? false : true;
          return $filter('date')(scope.model[scope.options.key], 'medium') || $filter('translate')('CORE.UI.EMPTY');
        };
      }
    });
    formlyConfig.setType({
      name: 'editableTags',
      extends: 'tags',
      link: function(scope, element, attrs) {
        scope.show = function() {
          var tags = scope.model[scope.options.key];
          scope.isEmpty = tags && tags.length ? false : true;

          if (scope.isEmpty) return $filter('translate')('CORE.UI.EMPTY');

          var tagNames = [];
          if (scope.to.availableOptions) {
            tags.forEach(function(tag) {
              for (var i = 0; i < scope.to.availableOptions.length; i++) {
                var availableTag = scope.to.availableOptions[i];
                if (tag === availableTag.value) {
                  tagNames.push(availableTag.name);
                  break;
                }
              }
            });
          } else
            tagNames = tags;

          return tagNames.join(', ');
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
          return selected.length ? selected.join(', ') : $filter('translate')('CORE.UI.EMPTY');
        };
      }
    });
    formlyConfig.setType({
      extends: 'checkbox',
      name: 'editableCheckbox',
      link: function(scope, element, attrs) {
        scope.show = function() {
          scope.isEmpty = false;
          return scope.model[scope.options.key] &&
            $filter('translate')('CORE.UI.TRUE') || $filter('translate')('CORE.UI.FALSE');
        };
      }
    });
    formlyConfig.setType({
      name: 'ovTinymce',
      templateUrl: 'ov-core-textarea-tinymce.html'
    });
    formlyConfig.setType({
      name: 'ovEditableTinymce',
      extends: 'ovTinymce',
      link: function(scope) {
        scope.show = function() {
          scope.isEmpty = scope.model[scope.options.key] ? false : true;
          return scope.model[scope.options.key] || $filter('translate')('CORE.UI.EMPTY');
        };
      }
    });
    formlyConfig.setType({
      name: 'editableAutoComplete',
      extends: 'autoComplete',
      link: function(scope, element, attrs) {
        scope.show = function() {
          scope.isEmpty = scope.model[scope.options.key] ? false : true;
          return scope.model[scope.options.key] || $filter('translate')('CORE.UI.EMPTY');
        };
      }
    });
    formlyConfig.setType({
      name: 'ovFile',
      templateUrl: 'ov-file.html',
      link: function(scope) {

        // As a File object can't be copied the model of the ovFile type is not
        // the file but the progress of the upload (in percent)
        // File model is stored here
        scope.file = null;

        // Watch for model changes (progress of the upload)
        scope.$watch('model["' + scope.options.key + '"]', function(progress) {
          if (progress === 100) {

            // Done uploading file
            // Reset field
            scope.file = null;
            scope.form.file.$setUntouched();
            scope.form.file.$setPristine();

          }
        });
      }
    });
    formlyConfig.setType({
      name: 'simple',
      templateUrl: 'ov-core-simple.html',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalFile',
      extends: 'ovFile',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableFile',
      extends: 'horizontalFile',
      wrapper: ['editableWrapper', 'horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalTinymce',
      extends: 'ovTinymce',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableTinymce',
      extends: 'ovEditableTinymce',
      wrapper: ['editableWrapper', 'horizontalBootstrapLabel', 'bootstrapHasError']
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
      name: 'horizontalDatepicker',
      extends: 'datepicker',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableDatepicker',
      extends: 'editableDatepicker',
      wrapper: ['editableWrapper', 'horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalDateTimePicker',
      extends: 'dateTimePicker',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableDateTimePicker',
      extends: 'editableDateTimePicker',
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
      name: 'horizontalMatch',
      extends: 'match',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableTags',
      extends: 'editableTags',
      wrapper: ['editableWrapper', 'horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalCheckbox',
      extends: 'checkbox',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableCheckbox',
      extends: 'editableCheckbox',
      wrapper: ['editableWrapper', 'horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalAutoComplete',
      extends: 'autoComplete',
      wrapper: ['horizontalBootstrapLabel', 'bootstrapHasError']
    });
    formlyConfig.setType({
      name: 'horizontalEditableAutoComplete',
      extends: 'editableAutoComplete',
      wrapper: ['editableWrapper', 'horizontalBootstrapLabel', 'bootstrapHasError']
    });

  }]);

  /**
   * Configures application main routes and set location mode to HTML5.
   */
  app.config(['$routeProvider', '$locationProvider', '$httpProvider',
    function($routeProvider, $locationProvider, $httpProvider) {
      var strategies = openVeoSettings.authenticationStrategies;
      var hasLdap = openVeoSettings.authenticationMechanisms.indexOf(strategies.LDAP) >= 0;
      var hasCas = openVeoSettings.authenticationMechanisms.indexOf(strategies.CAS) >= 0;

      // Register / route with authentication
      $routeProvider.when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController',
        title: 'CORE.HOME.PAGE_TITLE'
      });

      // Register /login route without authentication
      $routeProvider.when('/login', {
        title: 'CORE.LOGIN.PAGE_TITLE',
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
      $routeProvider.when('/applications-list', {
        templateUrl: 'views/applications.html',
        controller: 'ApplicationController',
        title: 'CORE.APPLICATIONS.PAGE_TITLE',
        access: 'core-access-applications-page',
        resolve: {
          scopes: ['applicationService', function(applicationService) {
            return applicationService.loadScopes();
          }]
        }
      });

      // Register /users route with authentication
      // Also retrieve the list of roles
      $routeProvider.when('/users-list', {
        templateUrl: 'views/users.html',
        controller: 'UserController',
        title: 'CORE.USERS.PAGE_TITLE',
        access: 'core-access-users-page',
        resolve: {
          roles: ['entityService', function(entityService) {
            return entityService.getAllEntities('roles');
          }]
        }
      });

      // Register /profiles route with authentication
      // Also retrieve the user profile
      $routeProvider.when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileController',
        controllerAs: 'ctrl',
        title: 'CORE.PROFILES.PAGE_TITLE',
        resolve: {
          user: ['authenticationService', function(authenticationService) {
            return authenticationService.getUserInfo();
          }]
        }
      });

      // Register /roles route with authentication
      // Also retrieve the list of permissions
      $routeProvider.when('/roles-list', {
        templateUrl: 'views/roles.html',
        controller: 'RoleController',
        title: 'CORE.ROLES.PAGE_TITLE',
        access: 'core-access-roles-page',
        resolve: {
          permissions: ['userService', function(userService) {
            return userService.loadPermissions();
          }]
        }
      });

      // Register /groups route with authentication
      $routeProvider.when('/groups-list', {
        templateUrl: 'views/groups.html',
        controller: 'GroupController',
        title: 'CORE.GROUPS.PAGE_TITLE',
        access: 'core-access-groups-page'
      });

      // Register /openveo-settings route with authentication
      // Also retrieve OpenVeo settings and roles
      $routeProvider.when('/openveo-settings', {
        templateUrl: 'views/settings.html',
        controller: 'SettingsController',
        controllerAs: 'ctrl',
        title: 'CORE.SETTINGS.PAGE_TITLE',
        access: 'core-access-settings-page',
        resolve: {
          ldapSettings: ['$q', 'entityService', function($q, entityService) {
            if (!hasLdap) return $q.when({data: {}});
            return entityService.getEntity('settings', null, 'core-' + strategies.LDAP);
          }],
          casSettings: ['$q', 'entityService', function($q, entityService) {
            if (!hasCas) return $q.when({data: {}});
            return entityService.getEntity('settings', null, 'core-' + strategies.CAS);
          }],
          roles: ['entityService', function(entityService) {
            return entityService.getAllEntities('roles');
          }]
        }
      });

      $locationProvider.html5Mode(true);
      $httpProvider.interceptors.push('errorInterceptor');

      // Remove the 300ms delay on touch device
      /* global FastClick */
      FastClick.attach(document.body);

      // Configure tinyMCE
      tinyMCE.baseURL = '/tinymce';

    }]);

  // Replace "classic" spaces with non-breaking-spaces
  app.filter('noBreakSpace', function() {
    return function(value) {
      return value.replace(/ /g, '\u00A0');
    };
  });

})(angular);
