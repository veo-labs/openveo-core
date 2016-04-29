'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var ApplicationPage = process.require('tests/client/e2eTests/pages/ApplicationPage.js');
var ApplicationHelper = process.require('tests/client/e2eTests/helpers/ApplicationHelper.js');
var ClientModel = process.require('app/server/models/ClientModel.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Application page', function() {
  var page, defaultApplications, applicationHelper;

  // Prepare page
  before(function() {
    applicationHelper = new ApplicationHelper(new ClientModel());
    page = new ApplicationPage();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  describe('without access', function() {

    // Log with a user without access permission
    before(function() {
      return page.logAs(datas.users.coreGuest);
    });


    it('should not access the page', function() {
      return page.load().then(function() {
        assert.ok(false, 'User has access to application page and should not');
      }, function() {
        assert.ok(true);
      });
    });

  });

  describe('without write permission', function() {

    // Log with a user without write permission
    before(function() {
      page.logAs(datas.users.coreApplicationsNoWrite);
      applicationHelper.getEntities().then(function(applications) {
        defaultApplications = applications;
      });
      page.load();
    });

    // Remove all extra application after each test and reload the page
    afterEach(function() {
      applicationHelper.removeAllEntities(defaultApplications);
      page.refresh();
    });

    it('should not have form to create an application', function() {
      assert.eventually.notOk(page.addFormElement.isPresent());
    });

    it('should not be able to create application by requesting the server directly', function() {
      var data = {
        name: 'Test',
        scopes: []
      };
      page.sendRequest('be/applications', 'put', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without update permission', function() {

    // Log with a user without update permission
    before(function() {
      page.logAs(datas.users.coreApplicationsNoUpdate);
      applicationHelper.getEntities().then(function(applications) {
        defaultApplications = applications;
      });
      page.load();
    });

    // Remove all extra application after each test and reload the page
    afterEach(function() {
      applicationHelper.removeAllEntities(defaultApplications);
      page.refresh();
    });

    it('should not have edit button to edit an application', function() {
      var name = 'Test edition';

      // Create line
      page.addLine(name, []);

      assert.isRejected(page.editApplication(name, {name: 'Another name'}));

      // Remove line
      page.removeLine(name);
    });

    it('should not be able to edit application by requesting the server directly', function() {
      var id = 'core';
      var data = {
        name: 'Test edition',
        scopes: []
      };

      page.sendRequest('be/applications/' + id, 'post', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without delete permission', function() {

    // Log with a user without delete permission
    before(function() {
      page.logAs(datas.users.coreApplicationsNoDelete);
      applicationHelper.getEntities().then(function(applications) {
        defaultApplications = applications;
      });
      page.load();
    });

    // Remove all extra application after each test and reload the page
    afterEach(function() {
      applicationHelper.removeAllEntities(defaultApplications);
      page.refresh();
    });

    it('should not have delete action to remove an application', function() {
      assert.isRejected(page.removeLine(datas.applications.coreApplicationsGuest.name));
    });

    it('should not be able to delete application by requesting the server directly', function() {
      var id = 'core';
      page.sendRequest('be/applications/' + id, 'delete').then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

});
