'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var OpenVeoAPI = require('@openveo/api');
var OpenVeoClient = require('@openveo/rest-nodejs-client').OpenVeoClient;
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');
var TaxonomyHelper = process.require('tests/client/e2eTests/helpers/TaxonomyHelper.js');
var datas = process.require('tests/client/e2eTests/database/data.json');
var TaxonomyModel = OpenVeoAPI.TaxonomyModel;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Web service /taxonomies/:id', function() {
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

  it('should be able to get a taxonomy by its id', function() {
    var deferred = protractor.promise.defer();

    var taxonomiesToAdd = [
      {
        name: 'test',
        id: '0',
        tree: []
      }
    ];

    taxonomyHelper.addEntities(taxonomiesToAdd).then(function(addedTaxonomies) {
      page.refresh();

      webServiceClient.get('taxonomies/' + addedTaxonomies[0].id).then(function(results) {
        var taxonomy = results.taxonomy;
        assert.eventually.isDefined(protractor.promise.fulfilled(taxonomy));
        assert.eventually.equal(protractor.promise.fulfilled(taxonomy.id), addedTaxonomies[0].id);
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

  it('should return an empty taxonomy if it does not exist', function() {
    var deferred = protractor.promise.defer();

    var taxonomiesToAdd = [
      {
        name: 'test',
        id: '0',
        tree: []
      }
    ];

    taxonomyHelper.addEntities(taxonomiesToAdd).then(function(addedTaxonomies) {
      page.refresh();

      webServiceClient.get('taxonomies/unkown').then(function(results) {
        var taxonomy = results.taxonomy;
        assert.eventually.isUndefined(protractor.promise.fulfilled(taxonomy));
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

  it('should not be able to get a taxonomy without permission', function() {
    var deferred = protractor.promise.defer();
    var unAuthorizedApplication = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsGuest.name
    );
    var client = new OpenVeoClient(
      process.protractorConf.webServiceUrl,
      unAuthorizedApplication.id,
      unAuthorizedApplication.secret
    );

    var taxonomiesToAdd = [
      {
        name: 'test',
        id: '0',
        tree: []
      }
    ];

    taxonomyHelper.addEntities(taxonomiesToAdd).then(function(addedTaxonomies) {
      page.refresh();

      client.get('taxonomies/' + addedTaxonomies[0].id).then(function(results) {
        assert.eventually.ok(protractor.promise.fulfilled(false),
                             'Application without permission should not be able to get taxonomies');
        deferred.fulfill();
      }).catch(function(error) {
        assert.eventually.isDefined(protractor.promise.fulfilled(error));
        assert.eventually.ok(protractor.promise.fulfilled(true));
        deferred.fulfill();
      });

    });

    return page.flow.execute(function() {
      return deferred.promise;
    });
  });

});
