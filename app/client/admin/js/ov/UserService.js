'use strict';

(function(app) {

  /**
   * Defines service to manage roles and permissions.
   *
   * @example
   * MyAngularObject.$inject = ['userService'];
   *
   * @class userService
   * @memberof module:ov
   * @inner
   */
  function UserService($http, $q) {
    var basePath = '/be/';
    var permissions;

    /**
     * Loads the list of permissions from server.
     *
     * @memberof module:ov~userService
     * @instance
     * @async
     * @return {Promise} The Http promise
     */
    function loadPermissions() {
      if (!permissions) {

        // Get scopes from server
        return $http.get(basePath + 'permissions').then(function(response) {
          permissions = response.data;
          return $q.when(response);
        });

      }

      return $q.when({
        data: permissions
      });
    }

    /**
     * Gets permissions.
     *
     * @memberof module:ov~userService
     * @instance
     * @return {Array} The permissions
     */
    function getPermissions() {
      return permissions;
    }

    /**
     * Destroys UserService cached data.
     *
     * @memberof module:ov~userService
     * @instance
     */
    function destroy() {
      permissions = null;
    }

    /**
     * Clears a user service cache.
     *
     * @memberof module:ov~userService
     * @instance
     * @param {String} [type] The cache element to clear or null to remove all caches
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
