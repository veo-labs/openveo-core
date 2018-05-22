'use strict';

(function(app) {

  /**
   * Defines service to manage the web service applications.
   *
   * @module ov
   * @class applicationService
   */
  function ApplicationService($http, $q) {
    var basePath = '/be/';
    var scopes;

    /**
     * Loads the list of scopes available for client applications.
     *
     * @return {Promise} The Http promise
     * @method loadScopes
     */
    function loadScopes() {
      if (!scopes) {

        // Get scopes from server
        return $http.get(basePath + 'ws/scopes').then(function(response) {
          scopes = response.data;
          return $q.when(response);
        });

      }

      return $q.when({
        data: scopes
      });
    }

    /**
     * Gets the available list of scopes for client applications.
     *
     * @param {Array} The scopes
     * @method getScopes
     */
    function getScopes() {
      return scopes;
    }

    /**
     * Destroys applicationService cached datas.
     *
     * @method destroy
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
