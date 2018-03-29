'use strict';

var path = require('path');
var assert = require('chai').assert;
var mock = require('mock-require');
var api = require('@openveo/api');

describe('TaxonomyProvider', function() {
  var EntityProvider;
  var TaxonomyProvider;
  var openVeoApi;
  var storage;
  var provider;
  var expectedTaxonomies;
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
      },
      storages: {
        ResourceFilter: api.storages.ResourceFilter
      },
      errors: {
        NotFoundError: function() {}
      }
    };

    mock('@openveo/api', openVeoApi);
  });

  // Initiates tests
  beforeEach(function() {
    TaxonomyProvider = mock.reRequire(path.join(process.root, 'app/server/providers/TaxonomyProvider.js'));
    provider = new TaxonomyProvider(storage, expectedLocation);
  });

  // Stop mocks
  afterEach(function() {
    mock.stopAll();
  });

  describe('add', function() {

    it('should add a list of taxonomies', function(done) {
      expectedTaxonomies = [
        {
          id: '42',
          name: 'Taxonomy 42',
          tree: [{}]
        },
        {
          id: '43',
          name: 'Taxonomy 43',
          tree: [{}]
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++)
          assert.deepInclude(resources[i], expectedTaxonomies[i], 'Wrong taxonomy "' + i + '"');

        callback(null, expectedTaxonomies.length, expectedTaxonomies);
      };

      provider.add(
        expectedTaxonomies,
        function(error, total, taxonomies) {
          assert.isNull(error, 'Unexpected error');
          assert.equal(total, expectedTaxonomies.length, 'Wrong number of inserted taxonomies');
          assert.strictEqual(taxonomies, expectedTaxonomies, 'Wrong taxonomies');
          done();
        }
      );
    });

    it('should generate an id if not specified', function(done) {
      expectedTaxonomies = [
        {
          name: 'Taxonomy 42',
          tree: [{}]
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++)
          assert.isNotEmpty(resources[i].id, 'Expected an id for taxonomy "' + i + '"');

        callback(null, expectedTaxonomies.length, expectedTaxonomies);
      };

      provider.add(
        expectedTaxonomies,
        function(error, total, taxonomies) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should initialize tree to an empty array if no term specified', function(done) {
      expectedTaxonomies = [
        {
          name: 'Taxonomy 42'
        }
      ];

      EntityProvider.prototype.add = function(resources, callback) {
        for (var i = 0; i < resources.length; i++)
          assert.isArray(resources[i].tree, 'Expected empty tree for taxonomy "' + i + '"');

        callback(null, expectedTaxonomies.length, expectedTaxonomies);
      };

      provider.add(
        expectedTaxonomies,
        function(error, total, taxonomies) {
          assert.isNull(error, 'Unexpected error');
          done();
        }
      );
    });

    it('should execute callback with an error if taxonomy name is not specified', function(done) {
      expectedTaxonomies = [
        {
          id: '42',
          tree: [{}]
        }
      ];

      provider.add(
        expectedTaxonomies,
        function(error, total, taxonomies) {
          assert.instanceOf(error, TypeError, 'Wrong error');
          done();
        }
      );
    });

  });

  describe('updateOne', function() {

    it('should update a taxonomy', function(done) {
      var expectedFilter = {};
      var expectedModifications = {
        name: 'New name',
        tree: [{}]
      };
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

    it('should update only name and tree', function(done) {
      var expectedFilter = {};
      var expectedModifications = {
        name: 'New name',
        tree: [{}],
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

  describe('getTaxonomyTerms', function() {

    it('should get the list of terms of the specified taxonomy', function(done) {
      var expectedName = 'Taxonomy name';
      var expectedTaxonomy = {
        id: '42',
        name: 'Taxonomy 42',
        tree: [{}]
      };

      EntityProvider.prototype.getOne = function(filter, fields, callback) {
        assert.equal(
          filter.getComparisonOperation(api.storages.ResourceFilter.OPERATORS.SEARCH).value,
          expectedName,
          'Wrong filter'
        );
        callback(null, expectedTaxonomy);
      };

      provider.getTaxonomyTerms(
        expectedName,
        function(error, terms) {
          assert.isNull(error, 'Unexpected error');
          assert.deepEqual(terms, expectedTaxonomy.tree, 'Wrong terms');
          done();
        }
      );
    });

  });

});
