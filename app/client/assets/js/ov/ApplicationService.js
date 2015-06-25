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
     * Adds a new Entity.
     * @param String entityType Type of entity
     * @param String data Data object
     */
    var addEntity = function(entityType, data){
      return $http.put(basePath + "crud/" +entityType, data);
    };
    /**
     * Updates Entity.
     * @param String entityType Type of entity
     * @param String id The id of the entity to update
     * @param String data Data object
     * @return HttpPromise The HTTP promise
     */
    var updateEntity = function(entityType, id, data){
      return $http.post(basePath + "crud/" +entityType+'/'+id, data);
    };
        /**
     * Removes an Entity.
     * @param String entityType Type of entity
     * @param String id The id of the entity to update
     * @return HttpPromise The HTTP promise
     */
    var removeEntity = function(entityType, id){
      return $http.delete(basePath + "crud/" +entityType+'/'+id);
    };  

    return{
      loadApplications : loadApplications,
      destroyApplications : destroyApplications,
      getApplications : getApplications,
      
      loadScopes : loadScopes,
      getScopes : getScopes,

      addEntity: addEntity,
      updateEntity: updateEntity,
      removeEntity: removeEntity
    };

  }

})(angular.module("ov"));