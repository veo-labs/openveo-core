'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var mock = require('mock-require');
var api = require('@openveo/api');

var assert = chai.assert;
chai.should();
chai.use(spies);

describe('GroupProvider', function() {
  var EntityProvider;
  var GroupProvider;
  var openVeoApi;
  var storage;
  var provider;
  var coreApi;
  var originalCoreApi;
  var expectedGroups;
  var expectedLocation = 'location';
  var NotFoundError = api.errors.NotFoundError;

  // Initiates mocks
  beforeEach(function() {
    storage = {};
    expectedGroups = [];

    EntityProvider = function() {
      this.storage = storage;
      this.location = expectedLocation;
    };
    EntityProvider.prototype.add = function(resources, callback) {
      callback(null, expectedGroups.length, expectedGroups);
    };
    EntityProvider.prototype.getOne = function(filter, fields, callback) {
      callback(null, expectedGroups[0]);
    };
    EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
      callback(null, expectedGroups);
    };
    EntityProvider.prototype.updateOne = chai.spy(function(filter, modifications, callback) {
      callback(null, 1);
    });
    EntityProvider.prototype.remove = chai.spy(function(filter, callback) {
      callback(null, expectedGroups.length);
    });
    EntityProvider.prototype.executeCallback = function() {
      var args = Array.prototype.slice.call(arguments);
      var callback = args.shift();
      if (callback) return callback.apply(null, args);
    };

    openVeoApi = {
      providers: {
        EntityProvider: EntityProvider
      },
      errors: api.errors
    };

    coreApi = {
      getCoreApi: function() {
        return coreApi;
      },
      getHooks: function() {
        return {
          GROUPS_ADDED: 'groups.added',
          GROUP_UPDATED: 'group.updated'
        };
      },
      executeHook: chai.spy(function(hook, data, callback) {
        callback(null);
      })
    };

    originalCoreApi = process.api;
    process.api = coreApi;
    mock('@openveo/api', openVeoApi);
  });

  // Initiates tests
  beforeEach(function() {
    GroupProvider = mock.reRequire(path.join(process.root, 'app/server/providers/GroupProvider.js'));
    provider = new GroupProvider(storage, expectedLocation);
  });

  // Stop mocks
  afterEach(function() {
    process.api = originalCoreApi;
    mock.stopAll();
  });

  describe('add', function() {

    it('should add a list of groups', function(done) {
      expectedGroups = [
        {
          id: '42',
          name: 'Group 42',
          description: 'Description 42'
        },
        {
          id: '43',
          name: 'Group 43',
          description: 'Description 43'
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++) {
          assert.deepEqual(resources[i], expectedGroups[i], 'Wrong group "' + i + '"');
        }

        callback(null, expectedGroups.length, expectedGroups);
      };

      provider.add(expectedGroups, function(error, total, groups) {
        assert.isNull(error, 'Unexpected error');
        assert.equal(total, expectedGroups.length, 'Wrong number of inserted groups');
        assert.strictEqual(groups, expectedGroups, 'Wrong groups');
        done();
      });
    });

    it('should generate an id if not specified', function(done) {
      expectedGroups = [
        {
          name: 'Group 42',
          description: 'Description 42'
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++) {
          assert.isNotEmpty(resources[i].id, 'Expected an id for group "' + i + '"');
        }

        callback(null, expectedGroups.length, expectedGroups);
      };

      provider.add(expectedGroups, function(error, total, groups) {
        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if name is not specified', function(done) {
      expectedGroups = [
        {
          description: 'Description 42'
        }
      ];

      provider.add(expectedGroups, function(error, total, groups) {
        assert.instanceOf(error, TypeError, 'Wrong error');
        assert.isUndefined(total, 'Unexpected total');
        assert.isUndefined(groups, 'Unexpected groups');
        done();
      });
    });

    it('should execute callback with an error if description is not specified', function(done) {
      expectedGroups = [
        {
          name: 'Group 42'
        }
      ];

      provider.add(expectedGroups, function(error, total, groups) {
        assert.instanceOf(error, TypeError, 'Wrong error');
        assert.isUndefined(total, 'Unexpected total');
        assert.isUndefined(groups, 'Unexpected groups');
        done();
      });
    });

    it('should execute hook GROUPS_ADDED', function(done) {
      expectedGroups = [
        {
          name: 'Client 42',
          description: 'Description 42'
        }
      ];

      coreApi.executeHook = function(hook, data, callback) {
        assert.equal(hook, coreApi.getHooks().GROUPS_ADDED, 'Wrong hook');
        assert.strictEqual(data, expectedGroups, 'Wrong groups');
        callback(null);
      };

      provider.add(expectedGroups, function(error, total, groups) {
        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if adding groups failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedGroups = [
        {
          name: 'Group 42',
          description: 'Description 42'
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        callback(expectedError);
      };

      provider.add(expectedGroups, function(error, total, groups) {
        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

    it('should execute callback with an error if executing hook failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedGroups = [
        {
          name: 'Client 42',
          description: 'Description 42'
        }
      ];

      coreApi.executeHook = function(hook, data, callback) {
        callback(expectedError);
      };

      provider.add(expectedGroups, function(error, total, groups) {
        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

  });

  describe('updateOne', function() {

    it('should update a group', function(done) {
      var expectedFilter = {};
      var expectedModifications = {
        name: 'New name',
        description: 'New description'
      };
      var expectedTotal = 1;
      var expectedId = '42';
      expectedGroups = [
        {
          id: expectedId,
          name: 'Client 42',
          description: 'Description 42'
        }
      ];

      EntityProvider.prototype.updateOne = function(filter, modifications, callback) {
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        assert.deepEqual(modifications, expectedModifications, 'Wrong modifications');
        callback(null, expectedTotal);
      };

      provider.updateOne(
        expectedFilter,
        expectedModifications,
        function(error, total) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(total, expectedTotal, 'Wrong total');
          done();
        }
      );
    });

    it('should update only name and description', function(done) {
      var expectedFilter = {};
      var expectedModifications = {
        name: 'Client 42',
        description: 'Description 42',
        unexpectedProperty: 'Value'
      };
      var expectedTotal = 1;
      expectedGroups = [
        {
          id: '42',
          name: 'Client 42',
          description: 'Description 42'
        }
      ];

      EntityProvider.prototype.updateOne = function(filter, modifications, callback) {
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        assert.notProperty(modifications, 'unexpectedProperty', 'Unexpected property');
        callback(null, expectedTotal);
      };

      provider.updateOne(
        expectedFilter,
        expectedModifications,
        function(error, total) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(total, expectedTotal, 'Wrong total');
          done();
        }
      );
    });

    it('should execute hook GROUP_UPDATED', function(done) {
      var expectedId = '42';
      var expectedModifications = {
        name: 'New name'
      };
      expectedGroups = [
        {
          id: expectedId,
          name: 'Client 42',
          description: 'Description 42'
        }
      ];

      coreApi.executeHook = function(hook, data, callback) {
        assert.equal(hook, coreApi.getHooks().GROUP_UPDATED, 'Wrong hook');
        assert.strictEqual(data.id, expectedId, 'Wrong group');
        assert.deepEqual(data.modifications, expectedModifications, 'Wrong modifications');
        callback(null);
      };

      provider.updateOne({}, expectedModifications, function(error, total, groups) {
        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if group is not found', function(done) {
      EntityProvider.prototype.getOne = function(filter, modifications, callback) {
        callback();
      };

      provider.updateOne({}, {name: 'New name'}, function(error, total, groups) {
        assert.instanceOf(error, NotFoundError, 'Wrong error');
        coreApi.executeHook.should.have.been.called.exactly(0);
        EntityProvider.prototype.updateOne.should.have.been.called.exactly(0);
        done();
      });
    });

    it('should execute callback with an error if getting group failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedGroups = [
        {
          id: '42',
          name: 'Client 42',
          description: 'Description 42'
        }
      ];

      EntityProvider.prototype.getOne = function(filter, modifications, callback) {
        callback(expectedError);
      };

      provider.updateOne(
        {},
        {
          name: 'New name'
        },
        function(error, total, groups) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if executing hook failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedGroups = [
        {
          name: 'Client 42',
          description: 'Description 42'
        }
      ];

      coreApi.executeHook = function(hook, data, callback) {
        callback(expectedError);
      };

      provider.updateOne(
        {},
        {
          name: 'New name'
        },
        function(error, total, groups) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

  });

  describe('remove', function() {

    it('should remove groups', function(done) {
      var expectedFilter = {};
      expectedGroups = [
        {
          id: '42',
          name: 'Client 42',
          description: 'Description 42'
        }
      ];

      EntityProvider.prototype.remove = function(filter, callback) {
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        callback(null, expectedGroups.length);
      };

      provider.remove(expectedFilter, function(error, total) {
        assert.isNull(error, 'Unexpected error');
        assert.equal(total, expectedGroups.length, 'Wrong total');
        done();
      });
    });

    it('should execute hook GROUPS_DELETED', function(done) {
      var expectedIds = ['42', '43'];
      expectedGroups = [];
      expectedIds.forEach(function(id) {
        expectedGroups.push({
          id: id,
          name: 'Client ' + id,
          description: 'Description ' + id
        });
      });

      coreApi.executeHook = function(hook, data, callback) {
        assert.equal(hook, coreApi.getHooks().GROUPS_DELETED, 'Wrong hook');
        assert.deepEqual(data, expectedIds, 'Wrong group ids');
        callback(null);
      };

      provider.remove({}, function(error, total, groups) {
        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if getting groups failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedGroups = [
        {
          id: '42',
          name: 'Client 42',
          description: 'Description 42'
        }
      ];

      EntityProvider.prototype.getAll = function(filter, modifications, sort, callback) {
        callback(expectedError);
      };

      provider.remove({}, function(error, total, groups) {
        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

    it('should execute callback with an error if executing hook failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedGroups = [
        {
          name: 'Client 42',
          description: 'Description 42'
        }
      ];

      coreApi.executeHook = function(hook, data, callback) {
        callback(expectedError);
      };

      provider.remove({}, function(error, total, groups) {
        assert.strictEqual(error, expectedError, 'Wrong error');
        done();
      });
    });

    it('should execute callback without doing anything if no groups found', function(done) {
      provider.remove({}, function(error, total, groups) {
        assert.isUndefined(error, 'Unexpected error');
        coreApi.executeHook.should.have.been.called.exactly(0);
        EntityProvider.prototype.remove.should.have.been.called.exactly(0);
        done();
      });
    });

  });

});
