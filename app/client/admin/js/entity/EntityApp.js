(function(angular){

  "use strict"

  var app = angular.module("ov.entity", []);

  app.factory("entityService", EntityService);
  EntityService.$inject = ["$http", "$q", "$cacheFactory"];
  
  /**
   * Defines an entity service to create / update or remove an entity.
   */
  function EntityService($http, $q, $cacheFactory){
    var basePath = "/admin/";
    var entityCache = {};
        
    var deleteCache = function(entity){
      delete entityCache[entity];
    }

    /**
     * Adds a new Entity.
     * @param String entityType Type of entity
     * @param String data Data object
     */
    var addEntity = function(entityType, data){
      deleteCache(entityType);
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
      deleteCache(entityType);
      return $http.post(basePath + "crud/" + entityType + "/" + id, data);
    };
    
    /**
     * Removes an Entity.
     * @param String entityType Type of entity
     * @param String id The id of the entity to update
     * @return HttpPromise The HTTP promise
     */
    var removeEntity = function(entityType, id){
      deleteCache(entityType);
      return $http.delete(basePath + "crud/" + entityType + "/" + id);
    };  
    
    /**
     * Get one Entity by Id
     * @param {type} entityType
     * @param {type} id
     * @returns {unresolved}
     */
    var getEntity = function(entityType, id){
       return $http.get(basePath + "crud/" + entityType+ "/" + id);
    }
    
    /**
     * Get all entities filter by param
     * @param {type} entityType
     * @param {type} param
     * @returns {unresolved}
     */    
    var getEntities = function (entityType, param) {
      var deferred = $q.defer();
     
      var cacheId = JSON.stringify(param);
      // Return the data if we already have it
      if (entityCache[entityType] && entityCache[entityType][cacheId]) {
        deferred.resolve(entityCache[entityType][cacheId]);
      } else {
        $http.post(basePath + "search/" + entityType, param).success(function (data) {
          if(!entityCache[entityType]) entityCache[entityType] = {};
          entityCache[entityType][cacheId] = {'data': data};
          deferred.resolve({'data': data});
        });
      }
      return deferred.promise;
    }
    
    /**
     * Get all entities
     * @param {type} entityType
     * @returns {unresolved}
     */ 
    var getAllEntities = function(entityType){
       return $http.get(basePath + "crud/" + entityType);
    }

    return{
      addEntity: addEntity,
      updateEntity: updateEntity,
      removeEntity: removeEntity,
      getEntity: getEntity,
      getEntities: getEntities,
      getAllEntities: getAllEntities,
      deleteCache: deleteCache
    };

  }
  
})(angular);