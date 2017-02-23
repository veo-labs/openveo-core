'use strict';

var assert = require('chai').assert;
var permissionLoader = process.require('app/server/loaders/permissionLoader.js');

// permissionLoader.js
describe('permissionLoader', function() {
  var plugins;

  // Prepare tests
  beforeEach(function() {
    plugins = {
      example: {
        mountPath: '/',
        path: __dirname,
        entities: {
          entity: 'resources/controllers/TestEntityController',
          contentEntity: 'resources/controllers/TestContentController'
        }
      }
    };
  });

  // generateEntityPermissions method
  describe('generateEntityPermissions', function() {

    it('should generate permissions for entities of each plugin', function() {
      var permissionGroups = permissionLoader.generateEntityPermissions(plugins);
      assert.equal(permissionGroups.length, Object.keys(plugins).length);
    });

    it('should return an empty list of permissions if no plugins', function() {
      var permissions;
      var invalidValues = [undefined, null, 42, 'string', ['string']];

      invalidValues.forEach(function(invalidValue) {
        permissions = permissionLoader.generateEntityPermissions(invalidValue);
        assert.equal(permissions.length, 0, 'Unexpected permissions for ' + invalidValue);
      });
    });

  });

  // generateEntityScopes method
  describe('generateEntityScopes', function() {

    it('should be able to generate scopes for entities of each plugin', function() {
      var scopes = permissionLoader.generateEntityScopes(plugins);
      var entitiesNumber = 0;

      // Retrieve the number of entities for all plugins
      for (var pluginName in plugins)
        entitiesNumber += Object.keys(plugins[pluginName].entities).length;

      assert.equal(scopes.length, entitiesNumber * 4, 'Expected 4 scopes for each entity');
    });

    it('should return an empty list of scopes if no plugins', function() {
      var scopes;
      var invalidValues = [undefined, null, 42, 'string', ['string']];

      invalidValues.forEach(function(invalidValue) {
        scopes = permissionLoader.generateEntityScopes(invalidValue);
        assert.equal(scopes.length, 0, 'Unexpected scopes for ' + invalidValue);
      });
    });

  });

  // createGroupPermissions method
  describe('createGroupPermissions', function() {

    it('should be able to generate permissions for a group', function() {
      var permissions = permissionLoader.createGroupPermissions('id', 'name');
      assert.equal(permissions.permissions.length, 3, 'Expected 3 permissions for a group');
    });

    it('should throw an exception if id or name are not valid String', function() {
      var invalidValues = [undefined, null, 42, {}, []];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          permissionLoader.createGroupPermissions(invalidValue, 'name');
        }, TypeError, null, 'Expected exception when id is ' + typeof invalidValue);

        assert.throws(function() {
          permissionLoader.createGroupPermissions('id', invalidValue);
        }, TypeError, null, 'Expected exception when name is ' + typeof invalidValue);

        assert.throws(function() {
          permissionLoader.createGroupPermissions(invalidValue, invalidValue);
        }, TypeError, null, 'Expected exception when both id and name are ' + typeof invalidValue);
      });
    });

  });

  // groupOrphanedPermissions method
  describe('groupOrphanedPermissions', function() {

    it('should be able to group orphaned permissions into antoher group', function() {
      var orphanedPermission = {id: '42'};
      var permissions = permissionLoader.groupOrphanedPermissions([orphanedPermission]);
      assert.equal(permissions.length, 1, 'Expected 1 group of permissions');
    });

    it('should not touch actual groups', function() {
      var group = {
        label: 'label',
        permissions: [{}]
      };
      var permissions = permissionLoader.groupOrphanedPermissions([group]);
      assert.equal(permissions.length, 1, 'Expected 1 group of permissions');
    });

    it('should throw an exception if permissions is not a valid array', function() {
      var invalidValues = [undefined, null, 42, {}, 'string'];

      invalidValues.forEach(function(invalidValue) {
        assert.throws(function() {
          permissionLoader.groupOrphanedPermissions(invalidValue);
        }, TypeError, null, 'Expected exception when permissions is ' + typeof invalidValue);
      });
    });

  });

});
