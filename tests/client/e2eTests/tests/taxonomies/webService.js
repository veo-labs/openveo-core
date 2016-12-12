'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoTest = require('@openveo/test');
var OpenVeoClient = require('@openveo/rest-nodejs-client').OpenVeoClient;
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');
var TaxonomyModel = process.require('app/server/models/TaxonomyModel.js');
var TaxonomyHelper = process.require('tests/client/e2eTests/helpers/TaxonomyHelper.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');
var check = openVeoTest.util.check;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Taxonomies web service', function() {
  var page;
  var webServiceClient;
  var helper;

  before(function() {
    var application = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsTaxonomies.name
    );
    webServiceClient = new OpenVeoClient(process.protractorConf.webServiceUrl, application.id, application.secret);
    helper = new TaxonomyHelper(new TaxonomyModel());
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
    helper.removeAllEntities();
  });

  describe('get /taxonomies/:id/terms', function() {

    it('should be able to get the list of available property types', function(done) {
      var taxonomiesToAdd = [
        {
          id: '0',
          name: 'taxo',
          tree: [
            {
              items: [],
              title: 'term1',
              id: '1'
            }
          ]
        }
      ];

      helper.addEntities(taxonomiesToAdd).then(function(addedTaxonomies) {
        webServiceClient.get('taxonomies/' + addedTaxonomies[0].id + '/terms').then(function(results) {
          var terms = results.terms;
          check(function() {
            assert.equal(terms[0].id, taxonomiesToAdd[0].tree[0].id);
          }, done);
        }).catch(function(error) {
          check(function() {
            assert.ok(false, 'Unexpected error : ' + error.message);
          }, done);
        });
      });
    });

    it('should not return any terms if taxonomy does not exist', function(done) {
      webServiceClient.get('taxonomies/unknown/terms').then(function(results) {
        check(function() {
          assert.ok(false, 'Unexpected results');
        }, done);
      }).catch(function(error) {
        check(function() {
          assert.equal(error.httpCode, 404, 'Expected not found');
        }, done);
      });
    });

    it('should not be able to get the terms without permission', function(done) {
      var unAuthorizedApplication = process.protractorConf.getWebServiceApplication(
        datas.applications.coreApplicationsGuest.name
      );
      var clientWithoutPermission = new OpenVeoClient(
        process.protractorConf.webServiceUrl,
        unAuthorizedApplication.id,
        unAuthorizedApplication.secret
      );
      var taxonomiesToAdd = [
        {
          id: '0',
          name: 'taxo',
          tree: [
            {
              items: [],
              title: 'term1',
              id: '1'
            }
          ]
        }
      ];

      helper.addEntities(taxonomiesToAdd).then(function(addedTaxonomies) {
        clientWithoutPermission.get('taxonomies/' + addedTaxonomies[0].id + '/terms').then(function(results) {
          check(function() {
            assert.ok(false, 'Application without permission should not be able to get taxonomy terms');
          }, done);
        }).catch(function(error) {
          check(function() {
            assert.isDefined(error.httpCode, 403, 'Expected end point to be protected');
          }, done);
        });
      });
    });

  });

});
