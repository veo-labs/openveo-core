'use strict';

var path = require('path');
var assert = require('chai').assert;
var mock = require('mock-require');

describe('TokenProvider', function() {
  var EntityProvider;
  var TokenProvider;
  var openVeoApi;
  var storage;
  var provider;
  var expectedTokens;
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
    TokenProvider = mock.reRequire(path.join(process.root, 'app/server/providers/TokenProvider.js'));
    provider = new TokenProvider(storage, expectedLocation);
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  describe('add', function() {

    it('should add a list of tokens and generate token if not specified', function(done) {
      expectedTokens = [
        {
          clientId: 'Client 42',
          scopes: ['scope42'],
          ttl: 42
        },
        {
          clientId: 'Client 43',
          scopes: ['scope43'],
          ttl: 43
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++) {
          assert.deepInclude(resources[i], expectedTokens[i], 'Wrong token "' + i + '"');
          assert.isNotEmpty(resources[i].token, 'Expected a token for token "' + i + '"');
        }

        callback(null, expectedTokens.length, expectedTokens);
      };

      provider.add(
        expectedTokens,
        function(error, total, tokens) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(total, expectedTokens.length, 'Wrong number of inserted tokens');
          assert.strictEqual(tokens, expectedTokens, 'Wrong tokens');
          done();
        }
      );
    });

    it('should initialize scopes to an empty array if no scope specified', function(done) {
      expectedTokens = [
        {
          clientId: 'Client 42',
          ttl: 42
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++)
          assert.isArray(resources[i].scopes, 'Expected empty scopes for token "' + i + '"');

        callback(null, expectedTokens.length, expectedTokens);
      };

      provider.add(
        expectedTokens,
        function(error, total, tokens) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should execute callback with an error if clientId is not specified', function(done) {
      expectedTokens = [
        {
          scopes: ['scope42'],
          ttl: 42
        }
      ];

      provider.add(
        expectedTokens,
        function(error, total, tokens) {
          assert.instanceOf(error, TypeError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if ttl is not specified', function(done) {
      expectedTokens = [
        {
          clientId: 'Client 42'
        }
      ];

      provider.add(
        expectedTokens,
        function(error, total, tokens) {
          assert.instanceOf(error, TypeError, 'Wrong error');
          done();
        }
      );
    });

  });

  describe('updateOne', function() {

    it('should update a token', function(done) {
      var expectedFilter = {};
      var expectedModifications = {ttl: 42};
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

    it('should update only ttl', function(done) {
      var expectedFilter = {};
      var expectedModifications = {
        token: 'New token',
        name: 'Client 42',
        scopes: ['scope42'],
        ttl: 42,
        unexpectedProperty: 'Value'
      };
      var expectedTotal = 1;

      EntityProvider.prototype.updateOne = function(filter, modifications, callback) {
        assert.strictEqual(filter, expectedFilter, 'Wrong filter');
        assert.notProperty(modifications, 'unexpectedProperty', 'Unexpected property');
        assert.notProperty(modifications, 'name', 'Unexpected name');
        assert.notProperty(modifications, 'scopes', 'Unexpected scopes');
        assert.notProperty(modifications, 'token', 'Unexpected token');
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
