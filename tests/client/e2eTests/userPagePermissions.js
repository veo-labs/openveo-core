'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var UserPage = process.require('tests/client/e2eTests/pages/UserPage.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('User page without access', function() {
  var page;

  // Load page
  before(function() {
    page = new UserPage();
    return page.logAs(datas.users.coreGuest);
  });

  // Logout
  after(function() {
    page.logout();
  });

  it('Should not access the page', function() {
    return page.load().then(function() {
      assert.ok(false, 'User has access to users page and should not');
    }, function() {
      assert.ok(true);
    });
  });

});

describe('User page without write permission', function() {
  var page;

  // Load page
  before(function() {
    page = new UserPage();
    page.logAs(datas.users.coreUsersNoWrite);
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
  });

  it('should not have form to create a user', function() {
    assert.eventually.notOk(page.addFormElement.isPresent());
  });

  it('should not be able to create user by requesting the server directly', function() {
    var data = {
      name: 'Test'
    };
    page.sendRequest('be/crud/user', 'put', data).then(function(response) {
      assert.equal(response.status, 403);
    });
  });

});

describe('User page without update permission', function() {
  var page;

  // Load page
  before(function() {
    page = new UserPage();
    page.logAs(datas.users.coreUsersNoUpdate);
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
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

    page.sendRequest('be/crud/user/' + id, 'post', data).then(function(response) {
      assert.equal(response.status, 403);
    });
  });

});

describe('User page without delete permission', function() {
  var page;

  // Load page
  before(function() {
    page = new UserPage();
    page.logAs(datas.users.coreUsersNoDelete);
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
  });

  it('should not have delete action to remove a user', function() {
    assert.isRejected(page.removeLine(datas.users.coreGuest.name));
  });

  it('should not be able to edit user by requesting the server directly', function() {
    var id = 'core';
    page.sendRequest('be/crud/user/' + id, 'delete').then(function(response) {
      assert.equal(response.status, 403);
    });
  });

});
