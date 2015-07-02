(function(angular){

  "use strict"

  var app = angular.module("ov.entity", []);

  app.factory("entityService", EntityService);
  EntityService.$inject = ["$http", "$q"];
  
  /**
   * Defines an entity service to create / update or remove an entity.
   */
  function EntityService($http, $q){
    var basePath = "/admin/";
     
    /**
     * Adds a new Entity.
     * @param String entityType Type of entity
     * @param String data Data object
     */
    var addEntity = function(entityType, data){
      return $http.put(basePath + "crud/" + entityType, data);
    };
    
    /**
     * Updates Entity.
     * @param String entityType Type of entity
     * @param String id The id of the entity to update
     * @param String data Data object
     * @return HttpPromise The HTTP promise
     */
    var updateEntity = function(entityType, id, data){
      return $http.post(basePath + "crud/" + entityType + "/" + id, data);
    };
    
    /**
     * Removes an Entity.
     * @param String entityType Type of entity
     * @param String id The id of the entity to update
     * @return HttpPromise The HTTP promise
     */
    var removeEntity = function(entityType, id){
      return $http.delete(basePath + "crud/" + entityType + "/" + id);
    };  

    return{
      addEntity: addEntity,
      updateEntity: updateEntity,
      removeEntity: removeEntity
    };

  }
  
})(angular);