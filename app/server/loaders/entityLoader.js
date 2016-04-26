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

var path = require('path');
var openVeoAPI = require('@openveo/api');

/**
 * Gets the list of entities from a route configuration object with,
 * for each one, its type and its associated Model Object.
 *
 * @example
 *     var entityLoader= process.require("app/server/loaders/entityLoader.js");
 *     var entities = {
 *       "application": "app/server/models/ClientModel"
 *     };
 *
 *     console.log(entityLoader.decodeEntities("/", entities));
 *     // {
 *     //  "application" : [EntityModel object]
 *     // }
 *
 * @method decodeEntities
 * @static
 * @param {String} pluginPath The root path of the plugin associated to
 * the routes
 * @param {Object} entities An object of routes
 * @return {Object} The list of entities models by types
 */
module.exports.decodeEntities = function(pluginPath, entities) {
  var decodedEntities = {};

  if (entities) {
    for (var type in entities) {

      try {
        var model = require(path.join(pluginPath, entities[type] + '.js'));
        decodedEntities[type] = model;
      } catch (e) {
        process.logger.warn(e.message, {
          action: 'decodeEntities'
        });
      }

    }
  }

  return decodedEntities;
};

/**
 * Builds entities for core and plugins.
 *
 * @method buildEntities
 * @param {Object} coreEntities Core entities configuration
 * @param {Array} plugins The list of plugins
 * @return {Object} The list of entities, for core and plugins, ready to be used
 */
module.exports.buildEntities = function(coreEntities, plugins) {
  var self = this;
  var entities = {};

  // Build core entities
  var decodedEntities = this.decodeEntities(process.root + '/', coreEntities);
  if (decodedEntities)
    openVeoAPI.util.merge(entities, decodedEntities);

  plugins.forEach(function(loadedPlugin) {

    // Found a list of entities for the plugin
    if (loadedPlugin.entities)
      openVeoAPI.util.merge(entities, self.decodeEntities(loadedPlugin.path, loadedPlugin.entities));

  });

  return entities;
};
