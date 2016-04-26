'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var GroupPage = process.require('tests/client/e2eTests/pages/GroupPage.js');
var GroupHelper = process.require('tests/client/e2eTests/helpers/GroupHelper.js');
var GroupModel = process.require('app/server/models/GroupModel.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Group page', function() {
  var page, groupHelper;

  // Prepare page
  before(function() {
    groupHelper = new GroupHelper(new GroupModel());
    page = new GroupPage();
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
        assert.ok(false, 'User has access to group page and should not');
      }, function() {
        assert.ok(true);
      });
    });

  });

  describe('without write permission', function() {

    // Log with a user without write permission
    before(function() {
      page.logAs(datas.users.coreGroupsNoWrite);
      page.load();
    });

    // Remove all groups after each test and reload the page
    afterEach(function() {
      groupHelper.removeAllEntities();
      page.refresh();
    });

    it('should not have form to create a group', function() {
      assert.eventually.notOk(page.addFormElement.isPresent());
    });

    it('should not be able to create group by requesting the server directly', function() {
      var data = {
        name: 'Test',
        scopes: []
      };
      page.sendRequest('be/crud/group', 'put', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without update permission', function() {

    // Log with a user without update permission
    before(function() {
      page.logAs(datas.users.coreGroupsNoUpdate);
      page.load();
    });

    // Remove all groups after each test and reload the page
    afterEach(function() {
      groupHelper.removeAllEntities();
      page.refresh();
    });

    it('should not have edit button to edit a group', function() {
      var name = 'Test edition';
      var description = 'Test edition description';

      // Create line
      page.addLine(name, description);
      assert.isRejected(page.editGroup(name, {name: 'Another name'}));
    });

    it('should not be able to edit group by requesting the server directly', function() {
      var data = {
        name: 'Test edition',
        description: 'Test edition description'
      };

      page.sendRequest('be/crud/group/whatever', 'post', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without delete permission', function() {

    // Log with a user without delete permission
    before(function() {
      page.logAs(datas.users.coreGroupsNoDelete);
      page.load();
    });

    // Remove all groups after each test and reload the page
    afterEach(function() {
      groupHelper.removeAllEntities();
      page.refresh();
    });

    it('should not have delete action to remove a group', function() {
      var name = 'Test edition';
      var description = 'Test edition description';

      page.addLine(name, description);
      assert.isRejected(page.removeLine(name));
    });

    it('should not be able to delete group by requesting the server directly', function() {
      page.sendRequest('be/crud/group/whatever', 'delete').then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

});
