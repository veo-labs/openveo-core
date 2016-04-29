'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoAPI = require('@openveo/api');
var OpenVeoClient = require('@openveo/rest-nodejs-client').OpenVeoClient;
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');
var TaxonomyHelper = process.require('tests/client/e2eTests/helpers/TaxonomyHelper.js');
var datas = process.require('tests/client/e2eTests/database/data.json');
var TaxonomyModel = openVeoAPI.TaxonomyModel;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Web service /taxonomies', function() {
  var page;
  var webServiceClient;
  var taxonomyHelper;

  before(function() {
    var application = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsTaxonomies.name
    );
    webServiceClient = new OpenVeoClient(process.protractorConf.webServiceUrl, application.id, application.secret);
    taxonomyHelper = new TaxonomyHelper(new TaxonomyModel());
    page = new HomePage();

    page.logAsAdmin();
    page.load();
  });

  // Logout when its done
  after(function() {
    page.logout();
  });

  // Remove all taxonomies after each test
  afterEach(function() {
    taxonomyHelper.removeAllEntities();
  });

  it('should be able to get the list of taxonomies', function() {
    var deferred = protractor.promise.defer();

    var taxonomiesToAdd = [
      {
        name: 'Taxonomy name',
        tree: []
      }
    ];

    taxonomyHelper.addEntities(taxonomiesToAdd).then(function(addedTaxonomies) {
      page.refresh();

      webServiceClient.get('taxonomies').then(function(results) {
        var taxonomies = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies.length), taxonomiesToAdd.length);
        deferred.fulfill();
      }).catch(function(error) {
        assert.eventually.ok(protractor.promise.fulfilled(false), error.message);
        deferred.fulfill();
      });
    });

    return page.flow.execute(function() {
      return deferred.promise;
    });
  });

  it('should not be able search for taxonomies without permissions', function() {
    var deferred = protractor.promise.defer();
    var unAuthorizedApplication = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsGuest.name
    );
    var client = new OpenVeoClient(
      process.protractorConf.webServiceUrl,
      unAuthorizedApplication.id,
      unAuthorizedApplication.secret
    );

    client.get('taxonomies').then(function(results) {
      assert.eventually.ok(protractor.promise.fulfilled(false),
                           'Application without permission should not get taxonomies');
      deferred.fulfill();
    }).catch(function(error) {
      assert.eventually.isDefined(protractor.promise.fulfilled(error));
      assert.eventually.ok(protractor.promise.fulfilled(true));
      deferred.fulfill();
    });

    return page.flow.execute(function() {
      return deferred.promise;
    });
  });

  it('should be able to search text into name', function() {
    var deferred = protractor.promise.defer();

    var taxonomiesToAdd = [
      {
        name: 'Test taxonomies search 1',
        tree: []
      },
      {
        name: 'Test taxonomies search 2',
        tree: []
      }
    ];

    taxonomyHelper.addEntities(taxonomiesToAdd).then(function(addedTaxonomies) {
      page.refresh();

      webServiceClient.get('taxonomies?query=' + encodeURIComponent('search')).then(function(results) {
        var taxonomies = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies.length), 2, 'Wrong number of results');
        return webServiceClient.get('taxonomies?query=' + encodeURIComponent('"taxonomies search"'));
      }).then(function(results) {
        var taxonomies = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies.length), 2, 'Wrong number of results');
        deferred.fulfill();
      }).catch(function(error) {
        assert.eventually.ok(protractor.promise.fulfilled(false), error.message);
        deferred.fulfill();
      });
    });

    return page.flow.execute(function() {
      return deferred.promise;
    });
  });

  // Sort
  describe('Sort', function() {
    var addedTaxonomies;

    beforeEach(function() {
      var taxonomiesToAdd = [
        {
          name: 'First taxonomy',
          tree: []
        },
        {
          name: 'Second taxonomy',
          tree: []
        }
      ];

      taxonomyHelper.addEntities(taxonomiesToAdd).then(function(addedLines) {
        addedTaxonomies = addedLines;
      });
      page.refresh();
    });

    it('should be able to sort taxonomies by name', function() {
      var deferred = protractor.promise.defer();

      webServiceClient.get('taxonomies?sortBy=name').then(function(results) {
        var taxonomies = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies.length), 2, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies[0].id), addedTaxonomies[1].id,
                                'First taxonomy is wrong');
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies[1].id), addedTaxonomies[0].id,
                                'Second taxonomy is wrong');

        return webServiceClient.get('taxonomies?sortBy=name&sortOrder=asc');
      }).then(function(results) {
        var taxonomies = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies.length), 2, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies[0].id), addedTaxonomies[0].id,
                                'First taxonomy is wrong');
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies[1].id), addedTaxonomies[1].id,
                                'Second taxonomy is wrong');

        deferred.fulfill();
      }).catch(function(error) {
        assert.eventually.ok(protractor.promise.fulfilled(false), error.message);
        deferred.fulfill();
      });

      return page.flow.execute(function() {
        return deferred.promise;
      });
    });

  });

  // Pagination
  describe('Pagination', function() {
    var addedTaxonomies;

    beforeEach(function() {
      var taxonomiesToAdd = [
        {
          name: 'Get taxonomy name 1',
          tree: []
        },
        {
          name: 'Get taxonomy name 2',
          tree: []
        }
      ];

      taxonomyHelper.addEntities(taxonomiesToAdd).then(function(addedLines) {
        addedTaxonomies = addedLines;
      });

      page.refresh();
    });

    it('should be able to paginate results', function() {
      var deferred = protractor.promise.defer();

      webServiceClient.get('taxonomies?page=1&limit=1').then(function(results) {
        var taxonomies = results.entities;
        var pagination = results.pagination;
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies.length), 1, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.limit), 1, 'Wrong limit');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.page), 1, 'Wrong page');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.pages), addedTaxonomies.length, 'Wrong pages');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.size), addedTaxonomies.length, 'Wrong size');
        deferred.fulfill();
      }).catch(function(error) {
        assert.eventually.ok(protractor.promise.fulfilled(false), error.message);
        deferred.fulfill();
      });

      return page.flow.execute(function() {
        return deferred.promise;
      });
    });

    it('should choose first page if no page is precised', function() {
      var deferred = protractor.promise.defer();

      webServiceClient.get('taxonomies?limit=1').then(function(results) {
        var taxonomies = results.entities;
        var pagination = results.pagination;
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies.length), 1, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.limit), 1, 'Wrong limit');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.page), 1, 'Wrong page');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.pages), addedTaxonomies.length, 'Wrong pages');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.size), addedTaxonomies.length, 'Wrong size');
        deferred.fulfill();
      }).catch(function(error) {
        assert.eventually.ok(protractor.promise.fulfilled(false), error.message);
        deferred.fulfill();
      });

      return page.flow.execute(function() {
        return deferred.promise;
      });
    });

    it('should not paginate results if limit is not defined', function() {
      var deferred = protractor.promise.defer();

      webServiceClient.get('taxonomies?page=1').then(function(results) {
        var taxonomies = results.entities;
        var pagination = results.pagination;
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies.length), 2, 'Wrong number of results');
        assert.eventually.isUndefined(protractor.promise.fulfilled(pagination), 'Unexpected pagination');
        deferred.fulfill();
      }).catch(function(error) {
        assert.eventually.ok(protractor.promise.fulfilled(false), error.message);
        deferred.fulfill();
      });

      return page.flow.execute(function() {
        return deferred.promise;
      });
    });

    it('should not return any taxonomies if the specified page is outside the pagination', function() {
      var deferred = protractor.promise.defer();

      webServiceClient.get('taxonomies?limit=1&page=1000').then(function(results) {
        var taxonomies = results.entities;
        var pagination = results.pagination;
        assert.eventually.equal(protractor.promise.fulfilled(taxonomies.length), 0, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.limit), 1, 'Wrong limit');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.page), 1000, 'Wrong page');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.pages), 2, 'Wrong pages');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.size), 2, 'Wrong size');
        deferred.fulfill();
      }).catch(function(error) {
        assert.eventually.ok(protractor.promise.fulfilled(false), error.message);
        deferred.fulfill();
      });

      return page.flow.execute(function() {
        return deferred.promise;
      });
    });

  });

});
