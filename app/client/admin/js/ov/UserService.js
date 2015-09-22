'use strict';

(function(app) {

  /**
   * Defines service to manage users, roles and permissions.
   */
  function UserService($http, $q) {
    var basePath = '/admin/';
    var users,
      roles,
      permissions;

    /**
     * Loads the list of users from server.
     * @return Promise The promise used to retrieve users
     * from server
     */
    var loadUsers = function() {
      if (!users) {

        // Get users from server
        return $http.get(basePath + 'crud/user').success(function(usersObj) {
          users = usersObj.entities;
        });

      }

      return $q.when({
        data: {
          entities: users
        }
      });
    };

    /**
     * Loads the list of roles from server.
     * @return Promise The promise used to retrieve roles
     * from server
     */
    var loadRoles = function() {
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
    };

    /**
     * Loads the list of permissions from server.
     * @return Promise The promise used to retrieve permissions
     * from server
     */
    var loadPermissions = function() {
      if (!permissions) {

        // Get scopes from server
        return $http.get(basePath + 'permissions').success(function(permissionsObj) {
          permissions = permissionsObj;
        });

      }

      return $q.when({
        data: permissions
      });
    };

    /**
     * Gets users.
     * @param Array The users
     */
    var getUsers = function() {
      return users;
    };

    /**
     * Gets roles.
     * @param Array The roles
     */
    var getRoles = function() {
      return roles;
    };

    /**
     * Gets permissions.
     * @param Array The permissions
     */
    var getPermissions = function() {
      return permissions;
    };

    /**
     * Destroys roles, users and permissions.
     */
    var destroy = function() {
      users = roles = permissions = null;
    };


    var cacheClear = function(type) {
      if (!type)
        users = roles = permissions = null;
      else
        switch (type) {
          case 'users':
            users = null;
            break;
          case 'roles':
            roles = null;
            break;
          case 'permissions':
            permissions = null;
            break;
          default:
            return;
        }
    };

    return {
      loadRoles: loadRoles,
      loadUsers: loadUsers,
      loadPermissions: loadPermissions,
      getRoles: getRoles,
      getUsers: getUsers,
      getPermissions: getPermissions,
      destroy: destroy,
      cacheClear: cacheClear
    };

  }

  app.factory('userService', UserService);
  UserService.$inject = ['$http', '$q'];

})(angular.module('ov'));
