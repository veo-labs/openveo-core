'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var RolePage = process.require('tests/client/e2eTests/pages/RolePage.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Role page without access', function() {
  var page;

  // Load roles page
  before(function() {
    page = new RolePage();
    return page.logAs(datas.users.coreGuest);
  });

  // Logout
  after(function() {
    page.logout();
  });

  it('Should not access the page', function() {
    return page.load().then(function() {
      assert.ok(false, 'User has access to role page and should not');
    }, function() {
      assert.ok(true);
    });
  });

});

describe('Role page without write permission', function() {
  var page;

  // Load roles page
  before(function() {
    page = new RolePage();
    page.logAs(datas.users.coreRolesNoWrite);
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
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

describe('Role page without update permission', function() {
  var page;

  // Load roles page
  before(function() {
    page = new RolePage();
    page.logAs(datas.users.coreRolesNoUpdate);
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
  });

  it('should not have edit button to edit a role', function() {
    var name = 'Test edition';

    // Create line
    page.addLine(name, []);

    assert.isRejected(page.editRole(name, {name: 'Another name'}));

    // Remove line
    page.removeLine(name);
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

describe('Role page without delete permission', function() {
  var page;

  // Load roles page
  before(function() {
    page = new RolePage();
    page.logAs(datas.users.coreRolesNoDelete);
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
  });

  it('should not have delete action to remove a role', function() {
    assert.isRejected(page.removeLine(datas.roles.coreAdmin.name));
  });

  it('should not be able to edit role by requesting the server directly', function() {
    var id = 'core';
    page.sendRequest('be/crud/role/' + id, 'delete').then(function(response) {
      assert.equal(response.status, 403);
    });
  });

});
