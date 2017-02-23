'use strict';

/**
 * @module core-loaders
 */

/**
 * Provides functions to interpret entities definition from plugin's configuration.
 *
 * @class entityLoader
 * @static
 */

/**
 * Builds entities for plugins.
 *
 * @example
 *     // Results
 *     {
 *       core: {
 *         mountPath: '/',
 *         path: '/home/openveo/',
 *         entities: {
 *           applications: 'app/server/controllers/ApplicationController'
 *         }
 *       },
 *       publish: {
 *         mountPath: '/publish',
 *         path: '/home/openveo/node_modules/@openveo/publish',
 *         entities: {
 *           videos: 'app/server/controllers/VideoController'
 *         }
 *       }
 *     }
 *
 * @method buildEntities
 * @static
 * @param {Array} plugins The list of plugins
 * @return {Object} The list of entities, for plugins, ordered by plugin name
 * @throws {TypeError} A TypeError if plugins is not an array
 */
module.exports.buildEntities = function(plugins) {
  var entities = {};

  plugins.forEach(function(loadedPlugin) {

    // Found a list of entities for the plugin
    if (loadedPlugin.entities) {
      entities[loadedPlugin.name] = {
        path: loadedPlugin.path,
        mountPath: loadedPlugin.mountPath,
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
 *     // List of entities as described in configuration file
 *     {
 *       'applications': '/home/openveo/app/server/controllers/ApplicationController'
 *     }
 *
 * @example
 *     // Results
 *     {
 *       'get /applications/:id': '/home/openveo/app/server/controllers/ApplicationController.getEntityAction',
 *       'get /applications': '/home/openveo/app/server/controllers/ApplicationController.getEntitiesAction',
 *       'post /applications/:id': '/home/openveo/app/server/controllers/ApplicationController.updateEntityAction',
 *       'put /applications': '/home/openveo/app/server/controllers/ApplicationController.addEntityAction',
 *       'delete /applications/:id': '/home/openveo/app/server/controllers/ApplicationController.removeEntityAction'
 *     }
 *
 * @method buildEntitiesRoutes
 * @static
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
