'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var OpenVeoClient = require('@openveo/rest-nodejs-client').OpenVeoClient;
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');
var GroupModel = process.require('app/server/models/GroupModel.js');
var GroupHelper = process.require('tests/client/e2eTests/helpers/GroupHelper.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Web service /groups', function() {
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

  it('should be able to get the list of groups', function() {
    var deferred = protractor.promise.defer();

    var groupsToAdd = [
      {
        name: 'Get group name',
        description: 'Get group description'
      }
    ];

    groupHelper.addEntities(groupsToAdd).then(function(addedGroups) {
      page.refresh();

      webServiceClient.get('groups').then(function(results) {
        var groups = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length),
                                groupsToAdd.length + defaultGroups.length);
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

  it('should not be able search for groups without permissions', function() {
    var deferred = protractor.promise.defer();
    var unAuthorizedApplication = process.protractorConf.getWebServiceApplication(
      datas.applications.coreApplicationsGuest.name
    );
    var client = new OpenVeoClient(
      process.protractorConf.webServiceUrl,
      unAuthorizedApplication.id,
      unAuthorizedApplication.secret
    );

    client.get('groups').then(function(results) {
      assert.eventually.ok(protractor.promise.fulfilled(false),
                           'Application without permission should not get groups');
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

  it('should be able to search text into name and description', function() {
    var deferred = protractor.promise.defer();

    var groupsToAdd = [
      {
        name: 'Test groupssearch search 1',
        description: 'Test groupssearch description 1'
      },
      {
        name: 'Test groupssearch search 2',
        description: 'Test groupssearch description 2'
      }
    ];

    groupHelper.addEntities(groupsToAdd).then(function(addedGroups) {
      page.refresh();

      webServiceClient.get('groups?query=' + encodeURIComponent('groupssearch')).then(function(results) {
        var groups = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length), 2, 'Wrong number of results');
        return webServiceClient.get('groups?query=' + encodeURIComponent('"groupssearch description"'));
      }).then(function(results) {
        var groups = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length), 2, 'Wrong number of results');
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
    var addedGroups;

    beforeEach(function() {
      var groupsToAdd = [
        {
          name: 'First groupssort',
          description: 'First groupssort description'
        },
        {
          name: 'Second groupssort',
          description: 'Second groupssort description'
        }
      ];

      groupHelper.addEntities(groupsToAdd).then(function(addedLines) {
        addedGroups = addedLines;
      });
      page.refresh();
    });

    it('should be able to sort groups by name', function() {
      var deferred = protractor.promise.defer();

      webServiceClient.get('groups?sortBy=name&query=groupssort').then(function(results) {
        var groups = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length), 2, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(groups[0].id), addedGroups[1].id,
                                'First group is wrong');
        assert.eventually.equal(protractor.promise.fulfilled(groups[1].id), addedGroups[0].id,
                                'Second group is wrong');

        return webServiceClient.get('groups?sortBy=name&sortOrder=asc&query=groupssort');
      }).then(function(results) {
        var groups = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length), 2, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(groups[0].id), addedGroups[0].id,
                                'First group is wrong');
        assert.eventually.equal(protractor.promise.fulfilled(groups[1].id), addedGroups[1].id,
                                'Second group is wrong');

        deferred.fulfill();
      }).catch(function(error) {
        assert.eventually.ok(protractor.promise.fulfilled(false), error.message);
        deferred.fulfill();
      });

      return page.flow.execute(function() {
        return deferred.promise;
      });
    });

    it('should be able to sort groups by description', function() {
      var deferred = protractor.promise.defer();

      webServiceClient.get('groups?sortBy=description&query=groupssort').then(function(results) {
        var groups = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length), 2, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(groups[0].id), addedGroups[1].id,
                                'First group is wrong');
        assert.eventually.equal(protractor.promise.fulfilled(groups[1].id), addedGroups[0].id,
                                'Second group is wrong');

        return webServiceClient.get('groups?sortBy=description&sortOrder=asc&query=groupssort');
      }).then(function(results) {
        var groups = results.entities;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length), 2, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(groups[0].id), addedGroups[0].id,
                                'First group is wrong');
        assert.eventually.equal(protractor.promise.fulfilled(groups[1].id), addedGroups[1].id,
                                'Second group is wrong');

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
    var addedGroups;

    beforeEach(function() {
      var groupsToAdd = [
        {
          name: 'Get groupspagination name 1',
          description: 'Get groupspagination description 1'
        },
        {
          name: 'Get groupspagination name 2',
          description: 'Get groupspagination description 2'
        }
      ];

      groupHelper.addEntities(groupsToAdd).then(function(addedLines) {
        addedGroups = addedLines;
      });

      page.refresh();
    });

    it('should be able to paginate results', function() {
      var deferred = protractor.promise.defer();

      webServiceClient.get('groups?page=1&limit=1&query=groupspagination').then(function(results) {
        var groups = results.entities;
        var pagination = results.pagination;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length), 1, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.limit), 1, 'Wrong limit');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.page), 1, 'Wrong page');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.pages), addedGroups.length, 'Wrong pages');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.size), addedGroups.length, 'Wrong size');
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

      webServiceClient.get('groups?limit=1&query=groupspagination').then(function(results) {
        var groups = results.entities;
        var pagination = results.pagination;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length), 1, 'Wrong number of results');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.limit), 1, 'Wrong limit');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.page), 1, 'Wrong page');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.pages), addedGroups.length, 'Wrong pages');
        assert.eventually.equal(protractor.promise.fulfilled(pagination.size), addedGroups.length, 'Wrong size');
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

      webServiceClient.get('groups?page=1&query=groupspagination').then(function(results) {
        var groups = results.entities;
        var pagination = results.pagination;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length), 2, 'Wrong number of results');
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

    it('should not return any groups if the specified page is outside the pagination', function() {
      var deferred = protractor.promise.defer();

      webServiceClient.get('groups?limit=1&page=1000&query=groupspagination').then(function(results) {
        var groups = results.entities;
        var pagination = results.pagination;
        assert.eventually.equal(protractor.promise.fulfilled(groups.length), 0, 'Wrong number of results');
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
