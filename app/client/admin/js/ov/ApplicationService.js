'use strict';

(function(app) {

  /**
   * Defines service to manage the web service applications.
   *
   * @example
   * MyAngularObject.$inject = ['applicationService'];
   *
   * @class ApplicationService
   * @memberof module:ov
   * @inner
   */
  function ApplicationService($http, $q) {
    var basePath = '/be/';
    var scopes;

    /**
     * Loads the list of scopes available for client applications.
     *
     * @memberof module:ov~ApplicationService
     * @instance
     * @async
     * @return {Promise} The Http promise
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
     * @memberof module:ov~ApplicationService
     * @instance
     * @param {Array} The scopes
     */
    function getScopes() {
      return scopes;
    }

    /**
     * Destroys applicationService cached datas.
     *
     * @memberof module:ov~ApplicationService
     * @instance
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
