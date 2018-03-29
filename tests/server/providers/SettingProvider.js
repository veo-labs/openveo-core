'use strict';

var path = require('path');
var assert = require('chai').assert;
var mock = require('mock-require');
var api = require('@openveo/api');

describe('SettingProvider', function() {
  var EntityProvider;
  var SettingProvider;
  var openVeoApi;
  var storage;
  var provider;
  var expectedSettings;
  var expectedLocation = 'location';

  // Initiates mocks
  beforeEach(function() {
    storage = {};

    EntityProvider = function() {
      this.storage = storage;
      this.location = expectedLocation;
    };
    EntityProvider.prototype.get = function(filter, fields, limit, page, sort, callback) {
      callback(null, expectedSettings, {
        limit: limit,
        page: page,
        pages: Math.ceil(expectedSettings.length / limit),
        size: expectedSettings.length
      });
    };
    EntityProvider.prototype.executeCallback = function() {
      var args = Array.prototype.slice.call(arguments);
      var callback = args.shift();
      if (callback) return callback.apply(null, args);
    };

    openVeoApi = {
      providers: {
        EntityProvider: EntityProvider
      },
      storages: {
        ResourceFilter: api.storages.ResourceFilter
      }
    };

    mock('@openveo/api', openVeoApi);
  });

  // Initiates tests
  beforeEach(function() {
    SettingProvider = mock.reRequire(path.join(process.root, 'app/server/providers/SettingProvider.js'));
    provider = new SettingProvider(storage, expectedLocation);
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  describe('add', function() {

    it('should add settings and update existing settings', function(done) {
      var expectedId = '42';
      var expectedExistingId = '43';
      var expectedExistingSettings = [];
      var expectedSettings = [];

      expectedSettings.push(
        {
          id: 'id' + expectedId,
          value: 'Value ' + expectedId
        }
      );

      expectedExistingSettings.push(
        {
          id: 'id' + expectedExistingId,
          value: 'Value ' + expectedExistingId
        }
      );

      EntityProvider.prototype.get = function(filter, fields, limit, page, sort, callback) {
        callback(null, expectedExistingSettings);
      };

      EntityProvider.prototype.add = function(resources, callback) {
        assert.deepEqual(resources[0], expectedSettings[0]);
        callback(null, expectedSettings.length, expectedSettings);
      };

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        assert.equal(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.EQUAL, 'id').value,
          expectedExistingSettings[0].id,
          'Wrong id'
        );
        assert.equal(data.value, expectedExistingSettings[0].value, 'Wrong value');
        callback(null, 1);
      };

      provider.add(
        expectedSettings.concat(expectedExistingSettings),
        function(error, total, settings) {
          assert.isNull(error, 'Unexpected error');
          assert.deepEqual(settings, expectedSettings.concat(expectedExistingSettings), 'Wrong settings');
          assert.equal(
            total,
            expectedSettings.length + expectedExistingSettings.length,
            'Wrong number of inserted / updated settings'
          );
          done();
        }
      );
    });

    it('should execute callback with an error if setting id is not specified', function(done) {
      expectedSettings = [
        {
          value: 'Value 42'
        }
      ];

      EntityProvider.prototype.add = function(settings, callback) {
        assert.ok(false, 'Unexpected add');
      };

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        assert.ok(false, 'Unexpected update');
      };

      provider.add(
        expectedSettings,
        function(error, total, settings) {
          assert.instanceOf(error, TypeError, 'Wrong error');
          assert.isUndefined(total, 'Unexpected total');
          assert.isUndefined(settings, 'Unexpected settings');
          done();
        }
      );
    });

    it('should execute callback with an error if getting settings failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedSettings = [
        {
          id: '42',
          value: 'Value 42'
        }
      ];

      EntityProvider.prototype.get = function(filter, fields, limit, page, sort, callback) {
        callback(expectedError);
      };

      EntityProvider.prototype.add = function(settings, callback) {
        assert.ok(false, 'Unexpected add');
      };

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        assert.ok(false, 'Unexpected update');
      };

      provider.add(
        expectedSettings,
        function(error, total, settings) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if adding settings failed', function(done) {
      var expectedError = new Error('Something went wrong');
      expectedSettings = [
        {
          id: '42',
          value: 'Value 42'
        }
      ];

      EntityProvider.prototype.get = function(filter, fields, limit, page, sort, callback) {
        callback(null, []);
      };

      EntityProvider.prototype.add = function(settings, callback) {
        callback(expectedError);
      };

      provider.add(
        expectedSettings,
        function(error, total, settings) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

    it('should execute callback with an error if updating settings failed', function(done) {
      var expectedError = new Error('Something went wrong');
      var expectedId = '42';
      expectedSettings = [
        {
          id: expectedId,
          value: 'Value 42'
        }
      ];

      EntityProvider.prototype.get = function(filter, fields, limit, page, sort, callback) {
        callback(null, [
          {
            id: expectedId
          }
        ]);
      };

      EntityProvider.prototype.updateOne = function(filter, data, callback) {
        callback(expectedError);
      };

      provider.add(
        expectedSettings,
        function(error, total, settings) {
          assert.strictEqual(error, expectedError, 'Wrong error');
          done();
        }
      );
    });

  });

  describe('updateOne', function() {

    it('should update a setting', function(done) {
      var expectedFilter = {};
      var expectedModifications = {value: 'New value'};
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
        value: 'New value',
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
