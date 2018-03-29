'use strict';

var path = require('path');
var chai = require('chai');
var spies = require('chai-spies');
var mock = require('mock-require');

var assert = chai.assert;
chai.should();
chai.use(spies);

describe('RoleProvider', function() {
  var EntityProvider;
  var RoleProvider;
  var openVeoApi;
  var storage;
  var provider;
  var coreApi;
  var originalCoreApi;
  var expectedRoles;
  var expectedLocation = 'location';

  // Initiates mocks
  beforeEach(function() {
    storage = {};
    expectedRoles = [];

    EntityProvider = function() {
      this.storage = storage;
      this.location = expectedLocation;
    };
    EntityProvider.prototype.add = function(resources, callback) {
      callback(null, expectedRoles.length, expectedRoles);
    };
    EntityProvider.prototype.getOne = function(filter, fields, callback) {
      callback(null, expectedRoles[0]);
    };
    EntityProvider.prototype.getAll = function(filter, fields, sort, callback) {
      callback(null, expectedRoles);
    };
    EntityProvider.prototype.updateOne = function(filter, modifications, callback) {
      callback(null, 1);
    };
    EntityProvider.prototype.remove = chai.spy(function(filter, callback) {
      callback(null, expectedRoles.length);
    });
    EntityProvider.prototype.executeCallback = function() {
      var args = Array.prototype.slice.call(arguments);
      var callback = args.shift();
      if (callback) return callback.apply(null, args);
    };

    openVeoApi = {
      providers: {
        EntityProvider: EntityProvider
      }
    };

    coreApi = {
      getCoreApi: function() {
        return coreApi;
      },
      getHooks: function() {
        return {

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
    RoleProvider = mock.reRequire(path.join(process.root, 'app/server/providers/RoleProvider.js'));
    provider = new RoleProvider(storage, expectedLocation);
  });

  // Stop mocks
  afterEach(function() {
    process.api = originalCoreApi;
    mock.stopAll();
  });

  describe('add', function() {

    it('should add a list of roles', function(done) {
      expectedRoles = [
        {
          id: '42',
          name: 'Group 42',
          permissions: ['permission42']
        },
        {
          id: '43',
          name: 'Group 43',
          permissions: ['permission43']
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++) {
          assert.deepEqual(resources[i], expectedRoles[i], 'Wrong role "' + i + '"');
        }

        callback(null, expectedRoles.length, expectedRoles);
      };

      provider.add(expectedRoles, function(error, total, roles) {
        assert.isNull(error, 'Unexpected error');
        assert.equal(total, expectedRoles.length, 'Wrong number of inserted roles');
        assert.strictEqual(roles, expectedRoles, 'Wrong roles');
        done();
      });
    });

    it('should generate an id if not specified', function(done) {
      expectedRoles = [
        {
          name: 'Group 42',
          permissions: ['permission42']
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++) {
          assert.isNotEmpty(resources[i].id, 'Expected an id for role "' + i + '"');
        }

        callback(null, expectedRoles.length, expectedRoles);
      };

      provider.add(expectedRoles, function(error, total, roles) {
        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if name is not specified', function(done) {
      expectedRoles = [
        {
          permissions: ['permission42']
        }
      ];

      provider.add(expectedRoles, function(error, total, roles) {
        assert.instanceOf(error, TypeError, 'Wrong error');
        assert.isUndefined(total, 'Unexpected total');
        assert.isUndefined(roles, 'Unexpected roles');
        done();
      });
    });

    it('should execute callback with an error if permissions are not specified', function(done) {
      expectedRoles = [
        {
          name: 'Group 42'
        }
      ];

      provider.add(expectedRoles, function(error, total, roles) {
        assert.instanceOf(error, TypeError, 'Wrong error');
        assert.isUndefined(total, 'Unexpected total');
        assert.isUndefined(roles, 'Unexpected roles');
        done();
      });
    });

  });

  describe('updateOne', function() {

    it('should update a role', function(done) {
      var expectedFilter = {};
      var expectedModifications = {
        name: 'New name',
        permissions: ['new-permission']
      };
      var expectedTotal = 1;
      var expectedId = '42';
      expectedRoles = [
        {
          id: expectedId,
          name: 'Client 42',
          permissions: ['permission42']
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

    it('should update only name and permissions', function(done) {
      var expectedFilter = {};
      var expectedModifications = {
        name: 'Client 42',
        permissions: ['permission42'],
        unexpectedProperty: 'Value'
      };
      var expectedTotal = 1;

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

  });

  describe('remove', function() {

    it('should remove roles', function(done) {
      var expectedFilter = {};
      expectedRoles = [
        {
          id: '42',
          name: 'Client 42',
          permissions: ['permission42']
        }
      ];

      EntityProvider.prototype.remove = function(filter, callback) {
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        callback(null, expectedRoles.length);
      };

      provider.remove(expectedFilter, function(error, total) {
        assert.isNull(error, 'Unexpected error');
        assert.equal(total, expectedRoles.length, 'Wrong total');
        done();
      });
    });

    it('should execute hook ROLES_DELETED', function(done) {
      var expectedIds = ['42', '43'];
      expectedRoles = [];
      expectedIds.forEach(function(id) {
        expectedRoles.push({
          id: id,
          name: 'Client ' + id,
          permissions: ['permission' + id]
        });
      });

      coreApi.executeHook = function(hook, data, callback) {
        assert.equal(hook, coreApi.getHooks().ROLES_DELETED, 'Wrong hook');
        assert.deepEqual(data, expectedIds, 'Wrong group ids');
        callback(null);
      };

      provider.remove(expectedRoles, function(error, total, roles) {
        assert.isNull(error, 'Unexpected error');
        done();
      });
    });

    it('should execute callback with an error if getting roles failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedRoles = [
        {
          id: '42',
          name: 'Client 42',
          permissions: ['permission42']
        }
      ];

      EntityProvider.prototype.getAll = function(filter, modifications, sort, callback) {
        callback(expectedError);
      };

      provider.remove(
        {},
        function(error, total, roles) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if executing hook failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedRoles = [
        {
          id: '42',
          name: 'Client 42',
          permissions: ['permission42']
        }
      ];

      coreApi.executeHook = function(hook, data, callback) {
        callback(expectedError);
      };

      provider.remove(
        {},
        function(error, total, roles) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback without doing anything if no role found', function(done) {
      provider.remove({}, function(error, total, roles) {
        assert.isUndefined(error, 'Unexpected error');
        coreApi.executeHook.should.have.been.called.exactly(0);
        EntityProvider.prototype.remove.should.have.been.called.exactly(0);
        done();
      });
    });

  });

});
