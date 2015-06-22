(function(app){

  "use strict"
  
  app.factory("applicationService", ApplicationService);
  ApplicationService.$inject = ["$http", "$q"];
  
  /**
   * Defines service to manage the web service applications.
   */
  function ApplicationService($http, $q){
    var basePath = "/admin/";
    var applications, scopes;
    
    /**
     * Loads the list of applications from server.
     * @return Promise The promise used to retrieve applications
     * from server
     */
    var loadApplications = function(){
      if(!applications){
        
        // Get applications from server
        return $http.get(basePath + "crud/application").success(function(applicationsObj){
          applications = applicationsObj.entities;
        });

      }

      return $q.when({data : {entities : applications}});
    };
    
    /**
     * Loads the list of scopes from server.
     * @return Promise The promise used to retrieve applications
     * from server
     */
    var loadScopes = function(){
      if(!scopes){
        
        // Get scopes from server
        return $http.get(basePath + "ws/scopes").success(function(scopesObj){
          scopes = scopesObj;
        });

      }

      return $q.when({data : scopes});
    };
    
    /**
     * Gets the scopes.
     * @param Array The scopes
     */
    var getScopes = function(){
      return scopes;
    };
    
    /**
     * Gets the applications.
     * @param Array The applications
     */
    var getApplications = function(){
      return applications;
    };    
    
    /**
     * Destroys applications instance.
     */
    var destroyApplications = function(){
      applications = null;
    };
    
    /**
     * Adds a new application.
     * @param String name The name of the application
     * @param Array scopes The list of application's scopes
     */
    var addApplication = function(name, scopes){
      return $http.put(basePath + "crud/application", {
        name : name,
        scopes : scopes
      });
    };

    /**
     * Updates application.
     * @param String id The id of the application to update
     * @param String name The name of the application
     * @param Array scopes The list of application's scopes
     */
    var updateApplication = function(id, name, scopes){
      return $http.post(basePath + "crud/application/" + id, {
        name : name,
        scopes : scopes
      });
    };

    /**
     * Removes an application.
     * @param String id The id of the application to remove
     * @return HttpPromise The HTTP promise
     */
    var removeApplication = function(id){
      return $http.delete(basePath + "crud/application/" + id);
    };    

    return{
      loadApplications : loadApplications,
      removeApplication : removeApplication,
      loadScopes : loadScopes,
      getApplications : getApplications,
      getScopes : getScopes,
      destroyApplications : destroyApplications,
      addApplication : addApplication,
      updateApplication : updateApplication
    };

  }

})(angular.module("ov"));