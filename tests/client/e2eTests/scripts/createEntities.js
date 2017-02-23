'use strict';

/**
 * Creates the list of entities for end to end tests.
 *
 * @example
 *
 *     // Usage (from projet's root directory)
 *     node -r ./processRequire.js ./tests/client/e2eTests/scripts/createEntities.js
 */

var fs = require('fs');
var path = require('path');
var openVeoApi = require('@openveo/api');
var pluginLoader = process.require('app/server/loaders/pluginLoader.js');
var entities = process.require('tests/client/e2eTests/resources/entities.json').entities;

// Path to the entities files to load
var entitiesFilePath = 'tests/client/e2eTests/resources/entities.json';
var aggregatedEntitiesFilePath = path.join(process.root, 'tests/client/e2eTests/build/entities.json');

/**
 * Transforms all entities model and helper relative path to absolute path.
 *
 * By default all entities model and helper are relative to plugin's root path.
 *
 * @param {Array} entities The list of entities
 * @param {String} basePath Base absolute path for these entities
 */
function setEntitiesAbsolutePath(entities, basePath) {
  entities.forEach(function(entity) {
    if (entity.model)
      entity.model = path.join(basePath, entity.model);

    if (entity.modelParameters) {
      var modelParameters = [];
      entity.modelParameters.forEach(function(parameter) {
        if (parameter)
          modelParameters.push(path.join(basePath, parameter));
        else
          modelParameters.push(parameter);
      });
      entity.modelParameters = modelParameters;
    }

    if (entity.helper)
      entity.helper = path.join(basePath, entity.helper);
  });
}

setEntitiesAbsolutePath(entities, process.root);

// Get plugins paths
pluginLoader.getPluginPaths(process.root, function(error, pluginPaths) {
  if (pluginPaths) {
    for (var i = 0; i < pluginPaths.length; i++) {
      var pluginPath = pluginPaths[i];

      try {
        var pluginEntities = require(path.join(pluginPath, entitiesFilePath)).entities;
        setEntitiesAbsolutePath(pluginEntities, pluginPath);
        entities = entities.concat(pluginEntities);
      } catch (e) {
        process.stdout.write('Can\'t load file ' + path.join(pluginPath, entitiesFilePath) + '\n');
      }
    }
    openVeoApi.fileSystem.mkdir(path.dirname(aggregatedEntitiesFilePath), function(error) {
      if (!error)
        fs.writeFile(aggregatedEntitiesFilePath, JSON.stringify({entities: entities}), {encoding: 'utf8'});
    });
  }
});
