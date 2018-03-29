'use strict';

var path = require('path');
var assert = require('chai').assert;
var mock = require('mock-require');

describe('ClientProvider', function() {
  var EntityProvider;
  var ClientProvider;
  var openVeoApi;
  var storage;
  var provider;
  var expectedClients;
  var expectedLocation = 'location';

  // Initiates mocks
  beforeEach(function() {
    storage = {};

    EntityProvider = function() {
      this.storage = storage;
      this.location = expectedLocation;
    };
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

    mock('@openveo/api', openVeoApi);
  });

  // Initiates tests
  beforeEach(function() {
    ClientProvider = mock.reRequire(path.join(process.root, 'app/server/providers/ClientProvider.js'));
    provider = new ClientProvider(storage, expectedLocation);
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  describe('add', function() {

    it('should add a list of clients and generate secrets', function(done) {
      expectedClients = [
        {
          id: '42',
          name: 'Client 42',
          scopes: ['scope42']
        },
        {
          id: '43',
          name: 'Client 43',
          scopes: ['scope43']
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++) {
          assert.deepInclude(resources[i], expectedClients[i], 'Wrong client "' + i + '"');
          assert.isNotEmpty(resources[i].secret, 'Expected a secret for client "' + i + '"');
        }

        callback(null, expectedClients.length, expectedClients);
      };

      provider.add(
        expectedClients,
        function(error, total, clients) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(total, expectedClients.length, 'Wrong number of inserted clients');
          assert.strictEqual(clients, expectedClients, 'Wrong clients');
          done();
        }
      );
    });

    it('should generate an id if not specified', function(done) {
      expectedClients = [
        {
          name: 'Client 42',
          scopes: ['scope42']
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++) {
          assert.isNotEmpty(resources[i].id, 'Expected an id for client "' + i + '"');
        }

        callback(null, expectedClients.length, expectedClients);
      };

      provider.add(
        expectedClients,
        function(error, total, clients) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should initialize scopes to an empty array if no scope specified', function(done) {
      expectedClients = [
        {
          name: 'Client 42'
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++) {
          assert.isArray(resources[i].scopes, 'Expected empty scopes for client "' + i + '"');
        }

        callback(null, expectedClients.length, expectedClients);
      };

      provider.add(
        expectedClients,
        function(error, total, clients) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should execute callback with an error if client name is not specified', function(done) {
      expectedClients = [
        {
          id: '42',
          scopes: ['scope42']
        }
      ];

      provider.add(
        expectedClients,
        function(error, total, clients) {
          assert.instanceOf(error, TypeError, 'Wrong error');
          done();
        }
      );
    });

  });

  describe('updateOne', function() {

    it('should update a client', function(done) {
      var expectedFilter = {};
      var expectedModifications = {name: 'New name'};
      var expectedTotal = 1;

      EntityProvider.prototype.updateOne = function(filter, modifications, callback) {
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

    it('should update only name and scopes', function(done) {
      var expectedFilter = {};
      var expectedModifications = {
        name: 'Client 42',
        scopes: ['scope42'],
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

});
