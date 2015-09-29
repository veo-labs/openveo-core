'use strict';

(function(angular) {
  var app = angular.module('ov.entity', []);

  /**
   * Defines an entity service to create / update or remove an entity.
   */
  function EntityService($http, $q) {
    var basePath = '/be/';
    var entityCache = {};

    /**
     * Deletes cache of the given entity type.
     * @param {String} entity The entity type
     */
    function deleteCache(entity) {
      if (entity) {
        if (entityCache[entity])
          delete entityCache[entity];
      } else {
        entityCache = {};
      }
    }

    /**
     * Adds a new Entity.
     * @param {String} entityType Type of entity
     * @param {String} data Data description object of the entity
     * @return {Promise} The HTTP promise
     */
    function addEntity(entityType, data) {
      deleteCache(entityType);
      return $http.put(basePath + 'crud/' + entityType, data);
    }

    /**
     * Updates an entity.
     * @param {String} entityType Type of entity
     * @param {String} id The id of the entity to update
     * @param {String} data Data description object of the entity
     * @return {Promise} The HTTP promise
     */
    function updateEntity(entityType, id, data) {
      deleteCache(entityType);
      return $http.post(basePath + 'crud/' + entityType + '/' + id, data);
    }

    /**
     * Removes an entity.
     * @param {String} entityType Type of entity
     * @param {String} id The id of the entity to remove
     * @return {Promise} The HTTP promise
     */
    function removeEntity(entityType, id) {
      deleteCache(entityType);
      return $http.delete(basePath + 'crud/' + entityType + '/' + id);
    }

    /**
     * Get one Entity by Id
     * @param {String} entityType Type of entity
     * @param {String} id The id of the entity to remove
     * @return {Promise} The HTTP promise
     */
    function getEntity(entityType, id) {
      return $http.get(basePath + 'crud/' + entityType + '/' + id);
    }

    /**
     * Get all entities filtered by param.
     *
     * @param {String} entityType Type of entity
     * @param {Object} param Request parameters with a property "filter" with a MongoDB criteria as value, a
     * property "count" with a MongoDB count as value, a property "page" with the expected page as value and a
     * property "sort" with a MongoDB sort object as value
     * @return {Promise} The HTTP promise
     */
    function getEntities(entityType, param) {
      var deferred = $q.defer();

      var cacheId = JSON.stringify(param);

      // Return the data if we already have it
      if (entityCache[entityType] && entityCache[entityType][cacheId]) {
        deferred.resolve(angular.copy(entityCache[entityType][cacheId]));
      } else {
        $http.post(basePath + 'search/' + entityType, param).success(function(data) {
          if (!entityCache[entityType])
            entityCache[entityType] = {};
          entityCache[entityType][cacheId] = angular.copy({
            data: data
          });
          deferred.resolve({
            data: data
          });
        });
      }
      return deferred.promise;
    }

    /**
     * Gets all entities of a specific type.
     * @param {String} entityType Type of entity
     * @return {Promise} The HTTP promise
     */
    function getAllEntities(entityType) {
      return $http.get(basePath + 'crud/' + entityType);
    }

    return {
      addEntity: addEntity,
      updateEntity: updateEntity,
      removeEntity: removeEntity,
      getEntity: getEntity,
      getEntities: getEntities,
      getAllEntities: getAllEntities,
      deleteCache: deleteCache
    };

  }

  app.factory('entityService', EntityService);
  EntityService.$inject = ['$http', '$q'];

})(angular);
