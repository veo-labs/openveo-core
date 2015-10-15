'use strict';

(function(app) {

  /**
   * Defines service to manage roles and permissions.
   */
  function UserService($http, $q) {
    var basePath = '/be/';
    var roles,
      permissions;

    /**
     * Loads the list of roles from server.
     * @return {Promise} The promise used to retrieve roles from server
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
     * @return {Promise} The promise used to retrieve permissions from server
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
     * @param {Array} The roles
     */
    function getRoles() {
      return roles;
    }

    /**
     * Gets permissions.
     * @param {Array} The permissions
     */
    function getPermissions() {
      return permissions;
    }

    /**
     * Destroys UserService cached data.
     */
    function destroy() {
      roles = permissions = null;
    }

    /**
     * Deletes cache for the given entity type.
     * @param {String} type The entity type
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
