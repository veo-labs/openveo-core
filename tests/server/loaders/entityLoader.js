'use strict';

var assert = require('chai').assert;
var Plugin = require('@openveo/api').plugin.Plugin;
var entityLoader = process.require('app/server/loaders/entityLoader.js');

// entityLoader.js
describe('entityLoader', function() {
  var plugins;

  before(function() {
    plugins = [];

    for (var i = 0; i < 4; i++) {
      var plugin = new Plugin();
      plugin.name = 'plugin' + i;
      plugin.path = '/home/openveo/node_modules/@openveo/' + plugin.name;
      plugin.mountPath = '/' + plugin.name;
      plugin.entities = {
        entity: 'app/server/controllers/EntityController'
      };
      plugins.push(plugin);
    }

  });

  // buildEntities method
  describe('buildEntities', function() {

    it('should be able to extract entities from each plugin', function() {
      var pluginEntities = entityLoader.buildEntities(plugins);
      assert.equal(Object.keys(pluginEntities).length, plugins.length, 'Expected the entities for all plugins');

      for (var pluginName in pluginEntities) {
        var plugin = pluginEntities[pluginName];
        assert.property(plugin, 'path', 'Expected ' + pluginName + ' to have a path');
        assert.property(plugin, 'mountPath', 'Expected ' + pluginName + ' to have a mount path');
        assert.property(plugin, 'entities', 'Expected ' + pluginName + ' to have a list of entities');
      }
    });

    it('should throw an exception if no plugin is specified', function() {
      assert.throws(entityLoader.buildEntities, TypeError, null, 'Expected exception');
    });

  });

  // buildEntitiesRoutes method
  describe('buildEntitiesRoutes', function() {

    it('should be able to extract entities from each plugin', function() {
      var entityName = 'entity';
      var controller = 'app/server/controllers/EntityController';
      var entities = {};
      entities[entityName] = controller;

      var routes = entityLoader.buildEntitiesRoutes(entities);
      assert.propertyVal(routes, 'get /' + entityName + '/:id', controller + '.getEntityAction');
      assert.propertyVal(routes, 'get /' + entityName, controller + '.getEntitiesAction');
      assert.propertyVal(routes, 'post /' + entityName + '/:id', controller + '.updateEntityAction');
      assert.propertyVal(routes, 'put /' + entityName, controller + '.addEntitiesAction');
      assert.propertyVal(routes, 'delete /' + entityName + '/:id', controller + '.removeEntitiesAction');
    });

    it('should return an empty object if no entity is specified', function() {
      var routes = entityLoader.buildEntitiesRoutes();
      assert.equal(Object.keys(routes).length, 0);
    });

  });

});
