'use strict';

/**
 * Manage OpenVeo entities described in conf.js.
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
     * @param {String} [entityType] The entity type or null to remove all cache
     * @param {String} [pluginName] Plugin name the entity belongs to, null for core
     * @method deleteCache
     */
    function deleteCache(entityType, pluginName) {
      if (!entityType && !pluginName) {
        entityCache[pluginName] = {};
        return;
      }

      if (!pluginName) pluginName = 'core';

      if (entityType) {
        if (entityCache[pluginName] && entityCache[pluginName][entityType])
          delete entityCache[pluginName][entityType];
      } else
        entityCache[pluginName] = {};
    }

    /**
     * Adds a new Entity.
     *
     * @param {String} entityType Type of entity
     * @param {String} [pluginName] Plugin name the entity belongs to, null for core
     * @param {String} data Data description object of the entity
     * @return {Promise} The HTTP promise
     * @method addEntity
     */
    function addEntity(entityType, pluginName, data) {
      var pluginPath = (!pluginName) ? '' : pluginName + '/';
      deleteCache(entityType, pluginName);
      return $http.put(basePath + pluginPath + entityType, data);
    }

    /**
     * Updates an entity.
     *
     * @param {String} entityType Type of entity
     * @param {String} [pluginName] Plugin name the entity belongs to, null for core
     * @param {String} id The id of the entity to update
     * @param {String} data Data description object of the entity
     * @return {Promise} The HTTP promise
     * @method updateEntity
     */
    function updateEntity(entityType, pluginName, id, data) {
      var pluginPath = (!pluginName) ? '' : pluginName + '/';
      deleteCache(entityType, pluginName);
      return $http.post(basePath + pluginPath + entityType + '/' + id, data);
    }

    /**
     * Removes an entity.
     *
     * @param {String} entityType Type of entity
     * @param {String} [pluginName] Plugin name the entity belongs to, null for core
     * @param {String} id The id of the entity to remove
     * @return {Promise} The HTTP promise
     * @method removeEntity
     */
    function removeEntity(entityType, pluginName, id) {
      var pluginPath = (!pluginName) ? '' : pluginName + '/';
      deleteCache(entityType, pluginName);
      return $http.delete(basePath + pluginPath + entityType + '/' + id);
    }

    /**
     * Fetch an entity by Id.
     *
     * @param {String} entityType Type of entity
     * @param {String} [pluginName] Plugin name the entity belongs to, null for core
     * @param {String} id The Id of the entity to fetch
     * @return {Promise} The HTTP promise
     * @method getEntity
     */
    function getEntity(entityType, pluginName, id) {
      var pluginPath = (!pluginName) ? '' : pluginName + '/';
      return $http.get(basePath + pluginPath + entityType + '/' + id);
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
     * @param {String} [pluginName] Plugin name the entity belongs to, null for core
     * @param {Object} param Request parameters with a property "filter" with a MongoDB criteria as value, a
     * property "count" with a MongoDB count as value, a property "page" with the expected page as value and a
     * property "sort" with a MongoDB sort object as value
     * @param {Promise} [canceller] The HTTP promise to cancel request if needed, reject the promise to cancel the
     * request
     * @return {Promise} The HTTP promise
     * @method getEntities
     */
    function getEntities(entityType, pluginName, param, canceller) {
      var deferred = $q.defer();
      var options = {};
      if (canceller) options = {timeout: canceller};
      if (!pluginName) pluginName = 'core';
      var pluginCache = entityCache[pluginName];

      var cacheId = JSON.stringify(param);

      // Return the data if we already have it
      if (pluginCache && pluginCache[entityType] && pluginCache[entityType][cacheId]) {
        deferred.resolve(angular.copy(pluginCache[entityType][cacheId]));
      } else {
        $http.post(basePath + 'search/' + entityType, param, options).success(function(data) {
          if (!pluginCache) pluginCache = entityCache[pluginName] = {};
          if (!pluginCache[entityType]) pluginCache[entityType] = {};

          pluginCache[entityType][cacheId] = angular.copy({
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
     * @param {String} [pluginName] Plugin name the entity belongs to, null for core
     * @return {Promise} The HTTP promise
     * @method getAllEntities
     */
    function getAllEntities(entityType, pluginName) {
      var pluginPath = (!pluginName) ? '' : pluginName + '/';
      return $http.get(basePath + pluginPath + entityType);
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
