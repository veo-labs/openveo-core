'use strict';

(function(app) {

  /**
   * Defines service to manage the web service applications.
   */
  function ApplicationService($http, $q) {
    var basePath = '/be/';
    var scopes;

    /**
     * Loads the list of scopes available for client applications.
     * @return {Promise} The promise used to retrieve applications from server
     */
    function loadScopes() {
      if (!scopes) {

        // Get scopes from server
        return $http.get(basePath + 'ws/scopes').success(function(scopesObj) {
          scopes = scopesObj;
        });

      }

      return $q.when({
        data: scopes
      });
    }

    /**
     * Gets the available list of scopes for client applications.
     * @param {Array} The scopes
     */
    function getScopes() {
      return scopes;
    }

    /**
     * Destroys ApplicationService cached datas.
     */
    function destroy() {
      scopes = null;
    }

    return {
      destroy: destroy,
      loadScopes: loadScopes,
      getScopes: getScopes
    };

  }

  app.factory('applicationService', ApplicationService);
  ApplicationService.$inject = ['$http', '$q'];

})(angular.module('ov'));
