'use strict';

var chai = require('chai');
var spies = require('chai-spies');
var openVeoApi = require('@openveo/api');
var TaxonomyController = process.require('app/server/controllers/TaxonomyController.js');
var errors = process.require('app/server/httpErrors.js');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

var assert = chai.assert;
chai.should();
chai.use(spies);

// TaxonomyController.js
describe('TaxonomyController', function() {
  var request;
  var response;
  var taxonomyController;
  var provider;

  beforeEach(function() {
    provider = {};
    request = {params: {}, query: {}};
    response = {};
    taxonomyController = new TaxonomyController();
    taxonomyController.getProvider = function() {
      return provider;
    };
  });

  // getEntitiesAction method
  describe('getEntitiesAction', function() {

    it('should send response with the paginated list of taxonomies', function(done) {
      var expectedEntities = [{id: '42'}];
      var expectedPagination = {page: 42, total: 60};

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.strictEqual(page, 0, 'Wrong default page');
        assert.strictEqual(sort['name'], 'desc', 'Wrong default sort');
        callback(null, expectedEntities, expectedPagination);
      };

      response.send = function(data) {
        assert.deepEqual(data.entities, expectedEntities, 'Wrong entities');
        assert.strictEqual(data.pagination, expectedPagination, 'Wrong pagination');
        done();
      };

      taxonomyController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to search by query', function(done) {
      var expectedQuery = '42';

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.equal(
          filter.getComparisonOperation(ResourceFilter.OPERATORS.SEARCH).value,
          '"' + expectedQuery + '"',
          'Wrong query'
        );
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {query: expectedQuery};
      taxonomyController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to ask for a specific page', function(done) {
      var expectedPage = 42;

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.strictEqual(page, expectedPage, 'Wrong page');
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {page: expectedPage};
      taxonomyController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to limit the number of results per page', function(done) {
      var expectedLimit = 42;

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.strictEqual(limit, expectedLimit, 'Wrong limit');
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {limit: expectedLimit};
      taxonomyController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should be able to sort results by name in ascending order', function(done) {
      var expectedSort = 'asc';

      provider.get = function(filter, fields, limit, page, sort, callback) {
        assert.strictEqual(sort['name'], 'asc', 'Wrong sort order');
        callback();
      };

      response.send = function(data) {
        done();
      };

      request.query = {sortOrder: expectedSort};
      taxonomyController.getEntitiesAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should call next middleware with an error if limit parameter is under or equal to 0', function(done) {
      request.query = {limit: 0};
      taxonomyController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_TAXONOMIES_WRONG_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if page parameter is under 0', function(done) {
      request.query = {page: -1};
      taxonomyController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_TAXONOMIES_WRONG_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if sortBy parameter is not "name"', function(done) {
      request.query = {sortBy: 'wrong sort property'};
      taxonomyController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_TAXONOMIES_WRONG_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if sortOrder parameter is not "asc" or "desc"', function(done) {
      request.query = {sortOrder: 'wrong sort order'};
      taxonomyController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_TAXONOMIES_WRONG_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if getting the list of entities failed', function(done) {
      provider.get = function(filter, fields, limit, page, sort, callback) {
        callback(new Error('message'));
      };

      taxonomyController.getEntitiesAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_TAXONOMIES_ERROR, 'Wrong error');
        done();
      });
    });
  });

  // getTaxonomyTermsAction method
  describe('getTaxonomyTermsAction', function() {

    it('should send response with specified taxonomy terms', function(done) {
      var expectedId = '42';
      var expectedTaxonomy = {id: expectedId, tree: [{id: '420'}]};
      provider.getOne = function(filter, fields, callback) {
        assert.equal(
          filter.getComparisonOperation(ResourceFilter.OPERATORS.EQUAL, 'id').value,
          expectedId,
          'Wrong id'
        );
        callback(null, expectedTaxonomy);
      };

      response.send = function(data) {
        assert.strictEqual(data.terms, expectedTaxonomy.tree, 'Wrong terms');
        done();
      };

      request.params.id = expectedId;
      taxonomyController.getTaxonomyTermsAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should send response with an empty array if taxonomy does not have terms', function(done) {
      var expectedId = '42';
      var expectedTaxonomy = {id: expectedId};
      provider.getOne = function(filter, fields, callback) {
        callback(null, expectedTaxonomy);
      };

      response.send = function(data) {
        assert.deepEqual(data.terms, [], 'Wrong terms');
        done();
      };

      request.params.id = expectedId;
      taxonomyController.getTaxonomyTermsAction(request, response, function(error) {
        assert.ok(false, 'Unexpected call to next middleware');
      });
    });

    it('should call next middleware with an error if taxonomy id is not defined', function(done) {
      response.send = function(data) {
        assert.ok(false, 'Unexpected response');
      };

      taxonomyController.getTaxonomyTermsAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_TAXONOMY_TERMS_MISSING_PARAMETERS, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if getting taxonomy failed', function(done) {
      provider.getOne = function(filter, fields, callback) {
        callback(new Error('Message'));
      };

      response.send = function(data) {
        assert.ok(false, 'Unexpected response');
      };

      request.params.id = '42';
      taxonomyController.getTaxonomyTermsAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_TAXONOMY_ERROR, 'Wrong error');
        done();
      });
    });

    it('should call next middleware with an error if taxonomy is not found', function(done) {
      provider.getOne = function(filter, fields, callback) {
        callback();
      };

      response.send = function(data) {
        assert.ok(false, 'Unexpected response');
      };

      request.params.id = '42';
      taxonomyController.getTaxonomyTermsAction(request, response, function(error) {
        assert.strictEqual(error, errors.GET_TAXONOMY_NOT_FOUND, 'Wrong error');
        done();
      });
    });
  });

});
