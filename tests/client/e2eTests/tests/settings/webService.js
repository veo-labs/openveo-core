'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoTest = require('@openveo/test');
var openVeoApi = require('@openveo/api');
var OpenVeoClient = require('@openveo/rest-nodejs-client').OpenVeoClient;
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var storage = process.require('app/server/storage.js');
var SettingHelper = process.require('tests/client/e2eTests/helpers/SettingHelper.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');
var check = openVeoTest.util.check;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Settings web service', function() {
  var page;
  var client;
  var helper;
  var clientWithoutPermission;

  before(function() {
    var application = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsSettings.name
    );
    var unAuthorizedApplication = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsGuest.name
    );
    client = new OpenVeoClient(process.protractorConf.webServiceUrl, application.id, application.secret);
    clientWithoutPermission = new OpenVeoClient(
      process.protractorConf.webServiceUrl,
      unAuthorizedApplication.id,
      unAuthorizedApplication.secret
    );
    helper = new SettingHelper(new SettingProvider(storage.getDatabase()));
    page = new HomePage();

    page.logAsAdmin();
    page.load();
  });

  // Logout when its done
  after(function() {
    page.logout();
  });

  // Remove all settings after each test
  afterEach(function() {
    helper.removeAllEntities();
  });

  describe('put /settings', function() {

    it('should be able to add settings', function(done) {
      var settingToAdd = helper.getAddExample();

      client.put('/settings', [settingToAdd]).then(function(results) {
        var setting = results.entities[0];
        var isSameSetting = openVeoApi.util.isContained(settingToAdd, setting);

        check(function() {
          assert.equal(results.total, 1, 'Wrong total');
          assert.ok(isSameSetting, 'Wrong setting');
        }, done);
      }).catch(function(error) {
        check(function() {
          assert.ok(false, 'Unexpected error : ' + error.message);
        }, done);
      });
    });

    it('should not be able to add settings without permission', function(done) {
      var settingToAdd = helper.getAddExample();

      clientWithoutPermission.put('/settings', [settingToAdd]).then(function(results) {
        check(function() {
          assert.ok(false, 'Applications without permission should not be able to add settings');
        }, done);
      }).catch(function(error) {
        check(function() {
          assert.isDefined(false, error.httpCode, 403, 'Expected end point to be protected');
        }, done);
      });
    });

  });

  describe('delete /settings', function() {

    it('should be able to delete settings', function(done) {
      var entitiesToAdd = [helper.getAddExample()];

      helper.addEntities(entitiesToAdd).then(function(addedEntities) {
        client.delete('/settings/' + addedEntities[0].id).then(function(results) {
          check(function() {
            assert.equal(results.total, entitiesToAdd.length, 'Wrong total');
            assert.equal(results.httpCode, 200, 'Wrong HTTP code');
          }, done, true);

          client.get('/settings/' + addedEntities[0].id).then(function(result) {
            check(function() {
              assert.isNull(result.entity, 'Expected resource to be deleted');
            }, done);
          }).catch(function(error) {
            check(function() {
              assert.ok(false, 'Unexpected error');
            }, done);
          });
        }).catch(function(error) {
          check(function() {
            assert.ok(false, 'Unexpected error : ' + error.message);
          }, done);
        });
      });
    });

    it('should not be able to delete settings without permission', function(done) {
      var entitiesToAdd = [helper.getAddExample()];

      helper.addEntities(entitiesToAdd).then(function(addedEntities) {
        clientWithoutPermission.delete('/settings/' + addedEntities[0].id).then(function(results) {
          check(function() {
            assert.ok(false, 'Applications without permission should not be able to delete settings');
          }, done);
        }).catch(function(error) {
          check(function() {
            assert.isDefined(error.httpCode, 403, 'Expected end point to be protected');
          }, done);
        });
      });
    });

    describe('get /settings/:id', function() {

      it('should be able to get a setting by its id', function(done) {
        var entitiesToAdd = [helper.getAddExample()];

        helper.addEntities(entitiesToAdd).then(function(addedEntities) {
          client.get('/settings/' + addedEntities[0].id).then(function(results) {
            var setting = results.entity;
            check(function() {
              assert.equal(setting.id, addedEntities[0].id);
            }, done);
          }).catch(function(error) {
            check(function() {
              assert.ok(false, 'Unexpected error : ' + error.message);
            }, done);
          });
        });
      });

      it('should return null if setting does not exist', function(done) {
        client.get('/settings/unknown').then(function(results) {
          check(function() {
            assert.isNull(results.entity, 'Unexpected setting');
          }, done);
        }).catch(function(error) {
          check(function() {
            assert.ok(false, 'Unexpected error');
          }, done);
        });
      });

      it('should not be able to get a setting without permission', function(done) {
        var entitiesToAdd = [helper.getAddExample()];

        helper.addEntities(entitiesToAdd).then(function(addedEntities) {
          clientWithoutPermission.get('/settings/' + addedEntities[0].id).then(function(results) {
            check(function() {
              assert.ok(false, 'Application without permission should not be able to get settings');
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

});
