'use strict';

/**
 * Manage OpenVeo entities described in conf.json.
 *
 * @module ov.entity
 * @main ov.entity
 */

(function(angular) {
  var app = angular.module('ov.entity', []);

  /**
   * Defines an entity service to create / update or remove an entity.
   *
   * @class entityService
   */
  function EntityService($http, $q) {
    var basePath = '/be/';
    var entityCache = {};

    /**
     * Deletes cache of the given entity type.
     *
     * @param {String} [entity] The entity type or null to remove all cache
     * @method deleteCache
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
     *
     * @param {String} entityType Type of entity
     * @param {String} data Data description object of the entity
     * @return {Promise} The HTTP promise
     * @method addEntity
     */
    function addEntity(entityType, data) {
      deleteCache(entityType);
      return $http.put(basePath + 'crud/' + entityType, data);
    }

    /**
     * Updates an entity.
     *
     * @param {String} entityType Type of entity
     * @param {String} id The id of the entity to update
     * @param {String} data Data description object of the entity
     * @return {Promise} The HTTP promise
     * @method updateEntity
     */
    function updateEntity(entityType, id, data) {
      deleteCache(entityType);
      return $http.post(basePath + 'crud/' + entityType + '/' + id, data);
    }

    /**
     * Removes an entity.
     *
     * @param {String} entityType Type of entity
     * @param {String} id The id of the entity to remove
     * @return {Promise} The HTTP promise
     * @method removeEntity
     */
    function removeEntity(entityType, id) {
      deleteCache(entityType);
      return $http.delete(basePath + 'crud/' + entityType + '/' + id);
    }

    /**
     * Fetch an entity by Id.
     *
     * @param {String} entityType Type of entity
     * @param {String} id The Id of the entity to fetch
     * @return {Promise} The HTTP promise
     * @method getEntity
     */
    function getEntity(entityType, id) {
      return $http.get(basePath + 'crud/' + entityType + '/' + id);
    }

    /**
     * Get all entities filtered by param.
     *
     * @example
     *
     *     // Get the first page of Web Service applications sorted by name with 10 applications per page
     *     var params = {
     *       count: 10,
     *       page: 1,
     *       sort: {
     *         name: 1
     *       }
     *     };
     *     getEntities('applications', params);
     *
     * @param {String} entityType Type of entity
     * @param {Object} param Request parameters with a property "filter" with a MongoDB criteria as value, a
     * property "count" with a MongoDB count as value, a property "page" with the expected page as value and a
     * property "sort" with a MongoDB sort object as value
     * @param {Promise} [canceller] The HTTP promise to cancel request if needed, reject the promise to cancel the
     * request
     * @return {Promise} The HTTP promise
     * @method getEntities
     */
    function getEntities(entityType, param, canceller) {
      var deferred = $q.defer();
      var options = {};
      if (canceller) options = {timeout: canceller};

      var cacheId = JSON.stringify(param);

      // Return the data if we already have it
      if (entityCache[entityType] && entityCache[entityType][cacheId]) {
        deferred.resolve(angular.copy(entityCache[entityType][cacheId]));
      } else {
        $http.post(basePath + 'search/' + entityType, param, options).success(function(data) {
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
     *
     * @param {String} entityType Type of entity
     * @return {Promise} The HTTP promise
     * @method getAllEntities
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
