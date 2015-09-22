'use strict';

(function(app) {

  /**
   * Defines service to manage the web service applications.
   */
  function ApplicationService($http, $q) {
    var basePath = '/admin/';
    var applications,
      scopes;

    /**
     * Loads the list of applications from server.
     * @return Promise The promise used to retrieve applications
     * from server
     */
    var loadApplications = function() {
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
    };

    /**
     * Loads the list of scopes from server.
     * @return Promise The promise used to retrieve applications
     * from server
     */
    var loadScopes = function() {
      if (!scopes) {

        // Get scopes from server
        return $http.get(basePath + 'ws/scopes').success(function(scopesObj) {
          scopes = scopesObj;
        });

      }

      return $q.when({
        data: scopes
      });
    };

    /**
     * Gets the scopes.
     * @param Array The scopes
     */
    var getScopes = function() {
      return scopes;
    };

    /**
     * Gets the applications.
     * @param Array The applications
     */
    var getApplications = function() {
      return applications;
    };

    /**
     * Destroys applications instance.
     */
    var destroy = function() {
      applications = scopes = null;
    };

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
