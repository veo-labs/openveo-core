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
        entityCache = [];
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
     * Adds new entities.
     *
     * @param {String} entityType The type of the entities
     * @param {String} [pluginName="core"] Plugin name the entities belong to
     * @param {Array} data The list of entities
     * @return {HttpPromise} The HTTP promise
     * @method addEntities
     */
    function addEntities(entityType, pluginName, data) {
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
     * Removes entities.
     *
     * @param {String} entityType Type of the entities
     * @param {String} [pluginName="core"] Plugin name the entity belongs to
     * @param {String} ids The comma separated list of entity ids to remove
     * @return {HttpPromise} The HTTP promise
     * @method removeEntities
     */
    function removeEntities(entityType, pluginName, ids) {
      var pluginPath = (!pluginName) ? '' : pluginName + '/';
      deleteCache(entityType, pluginName);
      return $http.delete(basePath + pluginPath + entityType + '/' + ids);
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
     * Gets entities.
     *
     * @example
     *
     *     // Get the first page of Web Service applications containing string "Search string" sorted by name with 10
     *     // applications per page. Field "name" won't be returned.
     *
     *     var params = {
     *       query: 'Search string',
     *       limit: 10,
     *       page: 0,
     *       sortBy: 'name',
     *       sortOrder: 'desc',
     *       exclude: ['name']
     *     };
     *     getEntities('applications', 'core', params);
     *
     * @param {String} entityType Type of entity
     * @param {String} [pluginName] Plugin name the entity belongs to, null for core
     * @param {Object} param Request parameters
     * @param {String|Array} [param.include] The list of fields to include from returned entities
     * @param {String|Array} [param.exclude] The list of fields to exclude from returned entities. Ignored if
     * include is also specified.
     * @param {String} [param.query] Search query to search on entities searchable fields
     * @param {Number} [param.page=0] The expected page in pagination system
     * @param {Number} [param.limit=10] The maximum number of expected results
     * @param {String} [param.sortBy] The field to sort by
     * @param {String} [param.sortOrder="desc"] The sort order (either "asc" or "desc")
     * @param {Promise} [canceller] The HTTP promise to cancel request if needed, resolve the promise to cancel the
     * request
     * @return {HttpPromise} The HTTP promise
     * @method getEntities
     */
    function getEntities(entityType, pluginName, param, canceller) {
      var deferred = $q.defer();
      var options = {};
      if (canceller) {
        options = {timeout: canceller};
      }
      if (!pluginName) pluginName = 'core';
      var pluginCache = entityCache[pluginName];

      var cacheId = JSON.stringify(param);
      options.params = param;

      // Return the data if we already have it
      if (pluginCache && pluginCache[entityType] && pluginCache[entityType][cacheId]) {
        deferred.resolve(angular.copy(pluginCache[entityType][cacheId]));
      } else {
        var path = basePath + ((pluginName !== 'core') ? pluginName + '/' : '') + entityType;
        $http.get(path, options).then(function(response) {
          if (!pluginCache) pluginCache = entityCache[pluginName] = {};
          if (!pluginCache[entityType]) pluginCache[entityType] = {};

          pluginCache[entityType][cacheId] = angular.copy({
            data: response.data
          });

          deferred.resolve({
            data: response.data
          });
        });
      }
      return deferred.promise;
    }

    /**
     * Gets all entities of a specific type.
     *
     * This should be used wisely as it may launch several requests to get all entities which could lead
     * to real performance issues. Use it when you are sure about the total number of entities.
     *
     * @param {String} entityType Type of entity
     * @param {String} [pluginName="core"] Plugin name the entity belongs to
     * @param {Object} param Request parameters
     * @param {String|Array} [param.include] The list of fields to include from returned entities
     * @param {String|Array} [param.exclude] The list of fields to exclude from returned entities. Ignored if
     * include is also specified.
     * @param {String} [param.query] Search query to search on entities searchable fields
     * @param {String} [param.sortBy] The field to sort by
     * @param {String} [param.sortOrder="desc"] The sort order (either "asc" or "desc")
     * @param {Promise} [canceller] The HTTP promise to cancel request if needed, resolve the promise to cancel the
     * request
     * @return {HttpPromise} The HTTP promise
     * @method getAllEntities
     */
    function getAllEntities(entityType, pluginName, param, canceller) {
      var page = 0;
      var allEntities = [];
      var deferred = $q.defer();
      param = param || {};

      /**
       * Gets the next page of entities.
       */
      function getNextPages() {
        param.page = page;
        param.limit = undefined;

        getEntities(
          entityType,
          pluginName,
          param,
          canceller
        ).then(function(response) {
          allEntities = allEntities.concat(response.data.entities);

          if (page < response.data.pagination.pages - 1) {

            // There is an other page
            // Get next page
            page++;
            getNextPages();

          } else {

            // No more page
            // End it
            deferred.resolve({
              data: {
                entities: allEntities
              }
            });
          }
        });
      }

      getNextPages();
      return deferred.promise;
    }

    return {
      addEntities: addEntities,
      updateEntity: updateEntity,
      removeEntities: removeEntities,
      getEntity: getEntity,
      getEntities: getEntities,
      getAllEntities: getAllEntities,
      deleteCache: deleteCache
    };

  }

  app.factory('entityService', EntityService);
  EntityService.$inject = ['$http', '$q'];

})(angular);
