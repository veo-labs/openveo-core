'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var UserPage = process.require('tests/client/e2eTests/pages/UserPage.js');
var UserHelper = process.require('tests/client/e2eTests/helpers/UserHelper.js');
var UserModel = process.require('app/server/models/UserModel.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('User page', function() {
  var page, defaultUsers, userHelper;

  // Prepare page
  before(function() {
    userHelper = new UserHelper(new UserModel());
    page = new UserPage();
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
        assert.ok(false, 'User has access to users page and should not');
      }, function() {
        assert.ok(true);
      });
    });

  });

  describe('without write permission', function() {

    // Log with a user without access permission
    before(function() {
      page.logAs(datas.users.coreUsersNoWrite);
      userHelper.getEntities().then(function(users) {
        defaultUsers = users;
      });
      page.load();
    });

    // Remove all extra users after each test and reload the page
    afterEach(function() {
      userHelper.removeAllEntities(defaultUsers);
      page.refresh();
    });

    it('should not have form to create a user', function() {
      assert.eventually.notOk(page.addFormElement.isPresent());
    });

    it('should not be able to create user by requesting the server directly', function() {
      var data = {
        name: 'Test'
      };
      page.sendRequest('be/users', 'put', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without update permission', function() {

    // Log with a user without update permission
    before(function() {
      page.logAs(datas.users.coreUsersNoUpdate);
      userHelper.getEntities().then(function(users) {
        defaultUsers = users;
      });
      page.load();
    });

    // Remove all extra users after each test and reload the page
    afterEach(function() {
      userHelper.removeAllEntities(defaultUsers);
      page.refresh();
    });

    it('should not have edit button to edit a user', function() {
      var name = 'Test edition';

      // Create line
      page.addLine(name, {
        email: 'test-edition@veo-labs.com',
        password: 'test-edition',
        passwordValidate: 'test-edition',
        roles: []
      });

      assert.isRejected(page.editUser(name, {name: 'Another name', email: 'another-email@veo-labs.com', roles: []}));

      // Remove line
      page.removeLine(name);
    });

    it('should not be able to edit user by requesting the server directly', function() {
      var id = 'core';
      var data = {
        name: 'Test edition'
      };

      page.sendRequest('be/users/' + id, 'post', data).then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

  describe('without delete permission', function() {

    // Log with a user without delete permission
    before(function() {
      page.logAs(datas.users.coreUsersNoDelete);
      userHelper.getEntities().then(function(users) {
        defaultUsers = users;
      });
      page.load();
    });

    // Remove all extra users after each test and reload the page
    afterEach(function() {
      userHelper.removeAllEntities(defaultUsers);
      page.refresh();
    });

    it('should not have delete action to remove a user', function() {
      assert.isRejected(page.removeLine(datas.users.coreGuest.name));
    });

    it('should not be able to delete user by requesting the server directly', function() {
      var id = 'core';
      page.sendRequest('be/users/' + id, 'delete').then(function(response) {
        assert.equal(response.status, 403);
      });
    });

  });

});
