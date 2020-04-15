'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var mock = require('mock-require');

var assert = chai.assert;
chai.should();
chai.use(spies);

describe('Migration 9.0.0', function() {
  var migration;
  var storage;
  var database;
  var ClientProvider = function() {};
  var GroupProvider = function() {};
  var RoleProvider = function() {};
  var TaxonomyProvider = function() {};
  var UserProvider = function() {};

  // Mocks
  beforeEach(function() {
    ClientProvider.prototype.dropIndex = chai.spy(function(indexName, callback) {
      callback();
    });
    ClientProvider.prototype.createIndexes = chai.spy(function(callback) {
      callback();
    });

    GroupProvider.prototype.dropIndex = chai.spy(function(indexName, callback) {
      callback();
    });
    GroupProvider.prototype.createIndexes = chai.spy(function(callback) {
      callback();
    });

    RoleProvider.prototype.dropIndex = chai.spy(function(indexName, callback) {
      callback();
    });
    RoleProvider.prototype.createIndexes = chai.spy(function(callback) {
      callback();
    });

    TaxonomyProvider.prototype.dropIndex = chai.spy(function(indexName, callback) {
      callback();
    });
    TaxonomyProvider.prototype.createIndexes = chai.spy(function(callback) {
      callback();
    });

    UserProvider.prototype.dropIndex = chai.spy(function(indexName, callback) {
      callback();
    });
    UserProvider.prototype.createIndexes = chai.spy(function(callback) {
      callback();
    });

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
    mock(path.join(process.root, 'app/server/providers/ClientProvider.js'), ClientProvider);
    mock(path.join(process.root, 'app/server/providers/GroupProvider.js'), GroupProvider);
    mock(path.join(process.root, 'app/server/providers/RoleProvider.js'), RoleProvider);
    mock(path.join(process.root, 'app/server/providers/TaxonomyProvider.js'), TaxonomyProvider);
    mock(path.join(process.root, 'app/server/providers/UserProvider.js'), UserProvider);
  });

  // Initializes tests
  beforeEach(function() {
    migration = mock.reRequire(path.join(process.root, 'migrations/9.0.0.js'));
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  it('should drop all querySearch indexes', function(done) {
    migration.update(function(error) {
      assert.isUndefined(error, 'Unexpected error');
      ClientProvider.prototype.dropIndex.should.have.been.called.exactly(1);
      ClientProvider.prototype.dropIndex.should.have.been.called.with('querySearch');
      GroupProvider.prototype.dropIndex.should.have.been.called.exactly(1);
      GroupProvider.prototype.dropIndex.should.have.been.called.with('querySearch');
      RoleProvider.prototype.dropIndex.should.have.been.called.exactly(1);
      RoleProvider.prototype.dropIndex.should.have.been.called.with('querySearch');
      TaxonomyProvider.prototype.dropIndex.should.have.been.called.exactly(1);
      TaxonomyProvider.prototype.dropIndex.should.have.been.called.with('querySearch');
      UserProvider.prototype.dropIndex.should.have.been.called.exactly(1);
      UserProvider.prototype.dropIndex.should.have.been.called.with('querySearch');
      done();
    });
  });

  it('should re-create all indexes', function(done) {
    migration.update(function(error) {
      assert.isUndefined(error, 'Unexpected error');
      ClientProvider.prototype.createIndexes.should.have.been.called.exactly(1);
      GroupProvider.prototype.createIndexes.should.have.been.called.exactly(1);
      RoleProvider.prototype.createIndexes.should.have.been.called.exactly(1);
      TaxonomyProvider.prototype.createIndexes.should.have.been.called.exactly(1);
      UserProvider.prototype.createIndexes.should.have.been.called.exactly(1);
      done();
    });
  });

  [ClientProvider, GroupProvider, RoleProvider, TaxonomyProvider, UserProvider].forEach(function(provider) {

    it('should not execute callback with an error if dropping ' + provider.name + ' index failed', function(done) {
      provider.prototype.dropIndex = chai.spy(function(indexName, callback) {
        callback(new Error('Something went wrong'));
      });

      migration.update(function(error) {
        assert.isUndefined(error, 'Unexpected error');

        ClientProvider.prototype.dropIndex.should.have.been.called.exactly(1);
        GroupProvider.prototype.dropIndex.should.have.been.called.exactly(1);
        RoleProvider.prototype.dropIndex.should.have.been.called.exactly(1);
        TaxonomyProvider.prototype.dropIndex.should.have.been.called.exactly(1);
        UserProvider.prototype.dropIndex.should.have.been.called.exactly(1);

        ClientProvider.prototype.createIndexes.should.have.been.called.exactly(1);
        GroupProvider.prototype.createIndexes.should.have.been.called.exactly(1);
        RoleProvider.prototype.createIndexes.should.have.been.called.exactly(1);
        TaxonomyProvider.prototype.createIndexes.should.have.been.called.exactly(1);
        UserProvider.prototype.createIndexes.should.have.been.called.exactly(1);
        done();
      });
    });

    it('should execute callback with an error if re-creating ' + provider.name + ' indexes failed', function(done) {
      var expectedError = new Error('Something went wrong');

      provider.prototype.createIndexes = chai.spy(function(callback) {
        callback(expectedError);
      });

      migration.update(function(error) {
        assert.strictEqual(error, expectedError);
        ClientProvider.prototype.dropIndex.should.have.been.called.exactly(1);
        GroupProvider.prototype.dropIndex.should.have.been.called.exactly(1);
        RoleProvider.prototype.dropIndex.should.have.been.called.exactly(1);
        TaxonomyProvider.prototype.dropIndex.should.have.been.called.exactly(1);
        UserProvider.prototype.dropIndex.should.have.been.called.exactly(1);
        done();
      });
    });

  });

});
