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
    var roles,
      permissions;

    /**
     * Loads the list of roles from server.
     *
     * @return {Promise} The Http promise
     * @method loadRoles
     */
    function loadRoles() {
      if (!roles) {

        // Get roles from server
        return $http.get(basePath + 'crud/role').success(function(rolesObj) {
          roles = rolesObj.entities;
        });

      }

      return $q.when({
        data: {
          entities: roles
        }
      });
    }

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
     * Gets roles.
     *
     * @return {Array} The roles
     * @method getRoles
     */
    function getRoles() {
      return roles;
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
      roles = permissions = null;
    }

    /**
     * Clears a user service cache.
     *
     * @param {String} type The cache element to clear
     * @method cacheClear
     */
    function cacheClear(type) {
      if (!type)
        roles = permissions = null;
      else
        switch (type) {
          case 'roles':
            roles = null;
            break;
          case 'permissions':
            permissions = null;
            break;
          default:
            return;
        }
    }

    return {
      loadRoles: loadRoles,
      loadPermissions: loadPermissions,
      getRoles: getRoles,
      getPermissions: getPermissions,
      destroy: destroy,
      cacheClear: cacheClear
    };

  }

  app.factory('userService', UserService);
  UserService.$inject = ['$http', '$q'];

})(angular.module('ov'));
