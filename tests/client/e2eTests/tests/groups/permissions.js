'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var GroupPage = process.require('tests/client/e2eTests/pages/GroupPage.js');
var GroupHelper = process.require('tests/client/e2eTests/helpers/GroupHelper.js');
var GroupModel = process.require('app/server/models/GroupModel.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var storage = process.require('app/server/storage.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Group page', function() {
  var page, groupHelper, defaultGroups;

  // Prepare page
  before(function() {
    groupHelper = new GroupHelper(new GroupModel(new GroupProvider(storage.getDatabase())));
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
      groupHelper.getEntities().then(function(groups) {
        defaultGroups = groups;
      });
      page.load();
    });

    // Remove all groups after each test and reload the page
    afterEach(function() {
      groupHelper.removeAllEntities(defaultGroups);
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
      page.sendRequest('be/groups', 'put', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without update permission', function() {

    // Log with a user without update permission
    before(function() {
      page.logAs(datas.users.coreGroupsNoUpdate);
      groupHelper.getEntities().then(function(groups) {
        defaultGroups = groups;
      });
      page.load();
    });

    // Remove all groups after each test and reload the page
    afterEach(function() {
      groupHelper.removeAllEntities(defaultGroups);
      page.refresh();
    });

    it('should not have edit button to edit a group', function() {
      var name = 'Test edition';
      var description = 'Test edition description';

      // Create line
      page.addLine(name, description);
      assert.isRejected(page.editGroup(name, {name: 'Another name'}));

      page.removeLine(name);
    });

    it('should not be able to edit group by requesting the server directly', function() {
      var data = {
        name: 'Test edition',
        description: 'Test edition description'
      };

      page.sendRequest('be/groups/whatever', 'post', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without delete permission', function() {

    // Log with a user without delete permission
    before(function() {
      page.logAs(datas.users.coreGroupsNoDelete);
      groupHelper.getEntities().then(function(groups) {
        defaultGroups = groups;
      });
      page.load();
    });

    // Remove all groups after each test and reload the page
    afterEach(function() {
      groupHelper.removeAllEntities(defaultGroups);
      page.refresh();
    });

    it('should not have delete action to remove a group', function() {
      assert.isRejected(page.removeLine(datas.groups.coreGroup.name));
    });

    it('should not be able to delete group by requesting the server directly', function() {
      page.sendRequest('be/groups/whatever', 'delete').then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

});
