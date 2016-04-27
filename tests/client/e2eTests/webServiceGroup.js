'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var OpenVeoClient = require('@openveo/rest-nodejs-client').OpenVeoClient;
var GroupModel = process.require('app/server/models/GroupModel.js');
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');
var GroupHelper = process.require('tests/client/e2eTests/helpers/GroupHelper.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Web service /groups/:id', function() {
  var page;
  var webServiceClient;
  var groupHelper;
  var defaultGroups;

  before(function() {
    var application = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsGroups.name
    );
    webServiceClient = new OpenVeoClient(process.protractorConf.webServiceUrl, application.id, application.secret);
    groupHelper = new GroupHelper(new GroupModel());
    page = new HomePage();

    page.logAsAdmin();
    groupHelper.getEntities().then(function(groups) {
      defaultGroups = groups;
    });
    page.load();
  });

  // Logout when its done
  after(function() {
    page.logout();
  });

  // Remove all groups after each test
  afterEach(function() {
    groupHelper.removeAllEntities(defaultGroups);
  });

  it('should be able to get a group by its id', function() {
    var deferred = protractor.promise.defer();

    var groupsToAdd = [
      {
        id: '0',
        name: 'Group 1',
        description: 'Group 1 description'
      }
    ];

    groupHelper.addEntities(groupsToAdd).then(function(addedGroups) {
      page.refresh();

      webServiceClient.get('groups/' + addedGroups[0].id).then(function(results) {
        var group = results.group;
        assert.eventually.isDefined(protractor.promise.fulfilled(group));
        assert.eventually.equal(protractor.promise.fulfilled(group.id), addedGroups[0].id);
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

  it('should not return any group if it does not exist', function() {
    var deferred = protractor.promise.defer();

    webServiceClient.get('groups/unkown').then(function(results) {
      assert.eventually.isUndefined(protractor.promise.fulfilled(results.group));
      deferred.fulfill();
    }).catch(function(error) {
      assert.eventually.ok(protractor.promise.fulfilled(false), error.message);
      deferred.fulfill();
    });

    return page.flow.execute(function() {
      return deferred.promise;
    });
  });

  it('should not be able to get a group without permission', function() {
    var deferred = protractor.promise.defer();
    var unAuthorizedApplication = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsGuest.name
    );
    var client = new OpenVeoClient(
      process.protractorConf.webServiceUrl,
      unAuthorizedApplication.id,
      unAuthorizedApplication.secret
    );

    var groupsToAdd = [
      {
        id: '0',
        name: 'Group 1',
        description: 'Group 1 description'
      }
    ];

    groupHelper.addEntities(groupsToAdd).then(function(addedGroups) {
      page.refresh();

      client.get('groups/' + addedGroups[0].id).then(function(results) {
        assert.eventually.ok(protractor.promise.fulfilled(false),
                             'Application without permission should not be able to get groups');
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
