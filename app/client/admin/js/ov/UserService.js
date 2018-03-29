'use strict';

(function(app) {

  /**
   * Defines service to manage roles and permissions.
   *
   * @module ov
   * @class userService
   */
  function UserService($http, $q) {
    var basePath = '/be/';
    var permissions;

    /**
     * Loads the list of permissions from server.
     *
     * @return {Promise} The Http promise
     * @method loadPermissions
     */
    function loadPermissions() {
      if (!permissions) {

        // Get scopes from server
        return $http.get(basePath + 'permissions').success(function(permissionsObj) {
          permissions = permissionsObj;
        });

      }

      return $q.when({
        data: permissions
      });
    }

    /**
     * Gets permissions.
     *
     * @return {Array} The permissions
     * @method getRoles
     */
    function getPermissions() {
      return permissions;
    }

    /**
     * Destroys UserService cached data.
     *
     * @method destroy
     */
    function destroy() {
      permissions = null;
    }

    /**
     * Clears a user service cache.
     *
     * @param {String} [type] The cache element to clear or null to remove all caches
     * @method cacheClear
     */
    function cacheClear(type) {
      if (!type)
        permissions = null;
      else
        switch (type) {
          case 'permissions':
            permissions = null;
            break;
          default:
            return;
        }
    }

    return {
      loadPermissions: loadPermissions,
      getPermissions: getPermissions,
      destroy: destroy,
      cacheClear: cacheClear
    };

  }

  app.factory('userService', UserService);
  UserService.$inject = ['$http', '$q'];

})(angular.module('ov'));
