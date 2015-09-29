'use strict';

(function(app) {

  /**
   * Defines service to manage the web service applications.
   */
  function ApplicationService($http, $q) {
    var basePath = '/be/';
    var applications;
    var scopes;

    /**
     * Loads the list of applications from server.
     * @return {Promise} The promise used to retrieve applications from server
     */
    function loadApplications() {
      if (!applications) {

        // Get applications from server
        return $http.get(basePath + 'crud/application').success(function(applicationsObj) {
          applications = applicationsObj.entities;
        });

      }

      return $q.when({
        data: {
          entities: applications
        }
      });
    }

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
     * Gets the applications.
     * @param {Array} The applications
     */
    function getApplications() {
      return applications;
    }

    /**
     * Destroys ApplicationService cached datas.
     */
    function destroy() {
      applications = scopes = null;
    }

    return {
      loadApplications: loadApplications,
      destroy: destroy,
      getApplications: getApplications,
      loadScopes: loadScopes,
      getScopes: getScopes
    };

  }

  app.factory('applicationService', ApplicationService);
  ApplicationService.$inject = ['$http', '$q'];

})(angular.module('ov'));
