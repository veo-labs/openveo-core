'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var RolePage = process.require('tests/client/e2eTests/pages/RolePage.js');
var roleHelper = process.require('tests/client/e2eTests/helpers/roleHelper.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Role page', function() {
  var page, defaultRoles;

  // Prepare page
  before(function() {
    page = new RolePage();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  describe('without access', function() {

    // Log with a user without access permission
    before(function() {
      page.logAs(datas.users.coreGuest);
    });

    it('should not access the page', function() {
      return page.load().then(function() {
        assert.ok(false, 'User has access to role page and should not');
      }, function() {
        assert.ok(true);
      });
    });

  });

  describe('without write permission', function() {

    // Log with a user without write permission
    before(function() {
      page.logAs(datas.users.coreRolesNoWrite);
      roleHelper.getRoles().then(function(roles) {
        defaultRoles = roles;
      });
      page.load();
    });

    // Remove all extra application after each test and reload the page
    afterEach(function() {
      roleHelper.removeAllRoles(defaultRoles);
      page.refresh();
    });

    it('should not have form to create a role', function() {
      assert.eventually.notOk(page.addFormElement.isPresent());
    });

    it('should not be able to create role by requesting the server directly', function() {
      var data = {
        name: 'Test',
        permissions: []
      };
      page.sendRequest('be/crud/role', 'put', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without update permission', function() {

    // Log with a user without update permission
    before(function() {
      page.logAs(datas.users.coreRolesNoUpdate);
      roleHelper.getRoles().then(function(roles) {
        defaultRoles = roles;
      });
      page.load();
    });

    // Remove all extra application after each test and reload the page
    afterEach(function() {
      roleHelper.removeAllRoles(defaultRoles);
      page.refresh();
    });

    it('should not have edit button to edit a role', function() {
      var name = 'Test edition';

      // Create line
      page.addLine(name, []);

      assert.isRejected(page.editRole(name, {name: 'Another name'}));
    });

    it('should not be able to edit role by requesting the server directly', function() {
      var id = 'core';
      var data = {
        name: 'Test edition',
        permissions: []
      };

      page.sendRequest('be/crud/role/' + id, 'post', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without delete permission', function() {

    // Log with a user without delete permission
    before(function() {
      page.logAs(datas.users.coreRolesNoDelete);
      page.load();
    });

    // Remove all extra application after each test and reload the page
    afterEach(function() {
      roleHelper.removeAllRoles(defaultRoles);
      page.refresh();
    });

    it('should not have delete action to remove a role', function() {
      assert.isRejected(page.removeLine(datas.roles.coreAdmin.name));
    });

    it('should not be able to delete role by requesting the server directly', function() {
      var id = 'core';
      page.sendRequest('be/crud/role/' + id, 'delete').then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

});
