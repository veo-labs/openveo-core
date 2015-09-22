'use strict';

(function(angular) {

  var app = angular.module('ov.route', ['ngRoute', 'ov.authentication', 'ov.i18n']);

  /**
   * Defines a $routeProvider wrapper to be able to automatically add
   * authentication to routes as resolve property.
   * All routes registered using the OvRouteProvider will be prefixed
   * by /admin (except if /admin is already present as a prefix).
   */
  function OvRouteProvider($routeProvider) {
    var auth = ['$q', 'authenticationService', function($q, authenticationService) {
        var userInfoPromise = authenticationService.getUserInfo();

        if (userInfoPromise)
          return $q.when(userInfoPromise);
        else
          return $q.reject({
            authenticated: false
          });
      }];

    var i18n = ['i18nService', function(i18nService) {
        return i18nService.addDictionary('back-office', true);
      }];

    var menu = ['menuService', function(menuService) {
        return menuService.loadMenu();
      }];

    // Wrap $routeProvider when method
    this.when = function(path, route) {
      if (angular.isObject(route)) {

        if (!angular.isObject(route.resolve))
          route.resolve = {};

        if (!route.resolve['auth'])
          route.resolve['auth'] = auth;

        if (!route.resolve['i18nCommon'])
          route.resolve['i18nCommon'] = i18n;

        if (!route.resolve['menuCommon'])
          route.resolve['menuCommon'] = menu;

        if (path.indexOf('/admin') != 0)
          path = '/admin' + path;

        $routeProvider.when(path, route);
      }

      return this;
    };

    this.$get = function() {
    };

  }

  app.provider('ovRoute', OvRouteProvider);
  OvRouteProvider.$inject = ['$routeProvider'];

})(angular);
