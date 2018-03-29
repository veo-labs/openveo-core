'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var openVeoApi = require('@openveo/api');
var mock = require('mock-require');
var ResourceFilter = openVeoApi.storages.ResourceFilter;
var databaseErrors = openVeoApi.storages.databaseErrors;

var assert = chai.assert;
chai.should();
chai.use(spies);

describe('Migration 2.0.0', function() {
  var migration;
  var storage;
  var database;
  var RoleProvider;
  var expectedRoles;
  var renameOperations = [
    {
      name: 'clients',
      newName: 'core_clients'
    },
    {
      name: 'roles',
      newName: 'core_roles'
    },
    {
      name: 'taxonomy',
      newName: 'core_taxonomies'
    },
    {
      name: 'tokens',
      newName: 'core_tokens'
    },
    {
      name: 'users',
      newName: 'core_users'
    },
    {
      name: 'sessions',
      newName: 'core_sessions'
    }
  ];

  // Mocks
  beforeEach(function() {
    expectedRoles = [];

    RoleProvider = function() {};
    RoleProvider.prototype.getAll = function(filter, fields, sort, callback) {
      callback(null, expectedRoles);
    };
    RoleProvider.prototype.updateOne = chai.spy(function(filter, modifications, callback) {
      callback(null, 1);
    });

    database = {
      renameCollection: function(name, newName, callback) {
        callback();
      }
    };
    storage = {
      getDatabase: function() {
        return database;
      }
    };

    mock(path.join(process.root, 'app/server/storage.js'), storage);
    mock(path.join(process.root, 'app/server/providers/RoleProvider.js'), RoleProvider);
  });

  // Initializes tests
  beforeEach(function() {
    migration = mock.reRequire(path.join(process.root, 'migrations/2.0.0.js'));
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  renameOperations.forEach(function(operation) {

    describe('rename collection "' + operation.name + '" into "' + operation.newName + '"', function() {

      it('should rename collection "' + operation.name + '" into "' + operation.newName + '"', function(done) {
        var ok = false;

        database.renameCollection = chai.spy(function(name, newName, callback) {
          if (name === operation.name && newName === operation.newName) ok = true;
          callback();
        });

        migration.update(function(error) {
          assert.isUndefined(error, 'Unexpected error');
          database.renameCollection.should.have.been.called.at.least(1);
          assert.ok(ok, 'Expected collection to be renamed');
          done();
        });
      });

      it('should execute callback with an error if renaming collection "' + operation.name + '" failed',
         function(done) {
           var expectedError = new Error('Something went wrong');

           database.renameCollection = function(name, newName, callback) {
             if (name === operation.name && newName === operation.newName) return callback(expectedError);
             callback();
           };

           migration.update(function(error) {
             assert.strictEqual(error, expectedError, 'Wrong error');
             done();
           });
         }
      );

      it('should not execute callback with an error if collection "clients" does not exist', function(done) {
        var ok = false;

        database.renameCollection = chai.spy(function(name, newName, callback) {
          if (name === operation.name && newName === operation.newName) {
            ok = true;
            return callback({code: databaseErrors.RENAME_COLLECTION_NOT_FOUND_ERROR});
          }

          callback();
        });

        migration.update(function(error) {
          assert.isUndefined(error, 'Unexpected error');
          database.renameCollection.should.have.been.called.at.least(1);
          assert.ok(ok, 'Expected collection to be renamed');
          done();
        });
      });

    });

  });

  it('should rename roles permissions', function(done) {
    var renameOperations = [
      {
        name: 'create-application',
        newName: 'core-add-applications'
      },
      {
        name: 'update-application',
        newName: 'core-update-applications'
      },
      {
        name: 'delete-application',
        newName: 'core-delete-applications'
      },
      {
        name: 'create-taxonomy',
        newName: 'core-add-taxonomies'
      },
      {
        name: 'update-taxonomy',
        newName: 'core-update-taxonomies'
      },
      {
        name: 'delete-taxonomy',
        newName: 'core-delete-taxonomies'
      },
      {
        name: 'create-user',
        newName: 'core-add-users'
      },
      {
        name: 'update-user',
        newName: 'core-update-users'
      },
      {
        name: 'delete-user',
        newName: 'core-delete-users'
      },
      {
        name: 'create-role',
        newName: 'core-add-roles'
      },
      {
        name: 'update-role',
        newName: 'core-update-roles'
      },
      {
        name: 'delete-role',
        newName: 'core-delete-roles'
      },
      {
        name: 'access-applications-page',
        newName: 'core-access-applications-page'
      },
      {
        name: 'access-users-page',
        newName: 'core-access-users-page'
      },
      {
        name: 'access-roles-page',
        newName: 'core-access-roles-page'
      }
    ];

    var permissions = [];
    renameOperations.forEach(function(renameOperation) {
      permissions.push(renameOperation.name);
    });

    expectedRoles = [
      {
        id: '42',
        permissions: permissions
      }
    ];

    RoleProvider.prototype.updateOne = chai.spy(function(filter, modifications, callback) {
      for (var i = 0; i < modifications.permissions.length; i++)
        assert.equal(modifications.permissions[i], renameOperations[i].newName);

      assert.equal(
        filter.getComparisonOperation(ResourceFilter.OPERATORS.EQUAL, 'id').value,
        expectedRoles[0].id,
        'Wrong id'
      );

      callback(null, 1);
    });

    migration.update(function(error) {
      assert.isUndefined(error, 'Unexpected error');
      RoleProvider.prototype.updateOne.should.have.been.called.exactly(1);
      done();
    });
  });

  it('should not update permissions if no roles found', function(done) {
    migration.update(function(error) {
      assert.isUndefined(error, 'Wrong error');
      RoleProvider.prototype.updateOne.should.have.been.called.exactly(0);
      done();
    });
  });

  it('should execute callback with an error if getting roles failed while renaming permissions', function(done) {
    var expectedError = new Error('Something went wrong');

    expectedRoles = [
      {
        id: '42',
        permissions: []
      }
    ];

    RoleProvider.prototype.getAll = function(filter, fields, sort, callback) {
      callback(expectedError);
    };

    migration.update(function(error) {
      assert.strictEqual(error, expectedError, 'Wrong error');
      RoleProvider.prototype.updateOne.should.have.been.called.exactly(0);
      done();
    });
  });

  it('should execute callback with an error if updating a role failed while renaming permissions', function(done) {
    var expectedError = new Error('Something went wrong');

    expectedRoles = [
      {
        id: '42',
        permissions: []
      }
    ];

    RoleProvider.prototype.updateOne = chai.spy(function(filter, modifications, callback) {
      callback(expectedError);
    });

    migration.update(function(error) {
      assert.strictEqual(error, expectedError, 'Wrong error');
      RoleProvider.prototype.updateOne.should.have.been.called.exactly(1);
      done();
    });
  });

});
