'use strict';

/**
 * @module core-loaders
 */

/**
 * Provides functions to interpret entities definition from core and
 * plugin's configuration.
 *
 * @class entityLoader
 */

/**
 * Builds entities for core and plugins.
 *
 * @example
 *     // List of core entities
 *     {
 *       "applications": "app/server/controllers/ApplicationController"
 *     }
 *
 * @example
 *     // Results
 *     {
 *       core: {
 *         path: "/home/openveo/",
 *         entities: {
 *           applications: "app/server/controllers/ApplicationController"
 *         }
 *       }
 *     }
 *
 * @method buildEntities
 * @param {Object} coreEntities Core entities configuration
 * @param {Array} plugins The list of plugins
 * @return {Object} The list of entities, for core and plugins, ready to be used
 */
module.exports.buildEntities = function(coreEntities, plugins) {
  var entities = {};
  entities['core'] = {
    path: process.root,
    entities: coreEntities
  };

  plugins.forEach(function(loadedPlugin) {

    // Found a list of entities for the plugin
    if (loadedPlugin.entities) {
      entities[loadedPlugin.name] = {
        path: loadedPlugin.path,
        entities: loadedPlugin.entities
      };
    }

  });

  return entities;
};

/**
 * Builds CRUD routes for entities.
 *
 * @example
 *     // List of entities
 *     {
 *       "applications": "/home/openveo/app/server/controllers/ApplicationController"
 *     }
 *
 * @example
 *     // Results
 *     {
 *       "get /applications/:id": "/home/openveo/app/server/controllers/ApplicationController.getEntityAction",
 *       "get /applications": "/home/openveo/app/server/controllers/ApplicationController.getEntitiesAction",
 *       "post /applications/:id": "/home/openveo/app/server/controllers/ApplicationController.updateEntityAction",
 *       "put /applications": "/home/openveo/app/server/controllers/ApplicationController.addEntityAction",
 *       "delete /applications/:id": "/home/openveo/app/server/controllers/ApplicationController.removeEntityAction"
 *     }
 *
 * @param {Object} entities The list of entities
 * @return {Object} The list of routes for all entities
 */
module.exports.buildEntitiesRoutes = function(entities) {
  var entitiesRoutes = {};

  // Create CRUD routes for all plugin's entities
  for (var entityName in entities) {
    var entityControllerPath = entities[entityName];
    entitiesRoutes['get /' + entityName + '/:id'] = entityControllerPath + '.getEntityAction';
    entitiesRoutes['get /' + entityName] = entityControllerPath + '.getEntitiesAction';
    entitiesRoutes['post /' + entityName + '/:id'] = entityControllerPath + '.updateEntityAction';
    entitiesRoutes['put /' + entityName] = entityControllerPath + '.addEntityAction';
    entitiesRoutes['delete /' + entityName + '/:id'] = entityControllerPath + '.removeEntityAction';
  }

  return entitiesRoutes;
};
