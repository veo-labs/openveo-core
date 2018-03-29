'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var openVeoApi = require('@openveo/api');
var mock = require('mock-require');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

var assert = chai.assert;
chai.should();
chai.use(spies);

describe('Migration 4.2.0', function() {
  var migration;
  var storage;
  var database;
  var UserProvider;
  var expectedUsers;
  var expectedLocation = 'location';

  // Mocks
  beforeEach(function() {
    expectedUsers = [];

    UserProvider = function() {
      this.location = expectedLocation;
    };
    UserProvider.prototype.getAll = function(filter, fields, sort, callback) {
      callback(null, expectedUsers);
    };

    database = {
      updateOne: chai.spy(function(loaction, filter, modifications, callback) {
        callback(null, 1);
      })
    };
    storage = {
      getDatabase: function() {
        return database;
      }
    };

    mock(path.join(process.root, 'app/server/storage.js'), storage);
    mock(path.join(process.root, 'app/server/providers/UserProvider.js'), UserProvider);
  });

  // Initializes tests
  beforeEach(function() {
    migration = mock.reRequire(path.join(process.root, 'migrations/4.2.0.js'));
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  it('should add "origin" property to all users', function(done) {
    expectedUsers = [
      {
        id: '42'
      }
    ];

    database.updateOne = chai.spy(function(location, filter, modifications, callback) {
      assert.equal(location, expectedLocation, 'Wrong location');
      assert.equal(
        filter.getComparisonOperation(ResourceFilter.OPERATORS.EQUAL, 'id').value,
        expectedUsers[0].id,
        'Wrong id'
      );
      assert.equal(modifications.origin, openVeoApi.passport.STRATEGIES.LOCAL, 'Wrong origin');
      callback(null, 1);
    });

    migration.update(function(error) {
      assert.isUndefined(error, 'Unexpected error');
      database.updateOne.should.have.been.called.exactly(1);
      done();
    });
  });

  it('should not update users if no users found', function(done) {
    migration.update(function(error) {
      assert.isUndefined(error, 'Wrong error');
      database.updateOne.should.have.been.called.exactly(0);
      done();
    });
  });

  it('should execute callback with an error if getting roles failed while adding "origin" property', function(done) {
    var expectedError = new Error('Something went wrong');

    UserProvider.prototype.getAll = chai.spy(function(filter, fields, sort, callback) {
      callback(expectedError);
    });

    migration.update(function(error) {
      assert.strictEqual(error, expectedError, 'Wrong error');
      UserProvider.prototype.getAll.should.have.been.called.exactly(1);
      database.updateOne.should.have.been.called.exactly(0);
      done();
    });
  });

  it('should execute callback with an error if updating a user failed while adding "origin" property', function(done) {
    var expectedError = new Error('Something went wrong');
    expectedUsers = [
      {
        id: '42'
      }
    ];

    database.updateOne = chai.spy(function(location, filter, modifications, callback) {
      callback(expectedError);
    });

    migration.update(function(error) {
      assert.strictEqual(error, expectedError, 'Wrong error');
      database.updateOne.should.have.been.called.exactly(1);
      done();
    });
  });

});
