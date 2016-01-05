'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var ApplicationPage = process.require('tests/client/e2eTests/pages/ApplicationPage.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Application page without access', function() {
  var page;

  // Load page
  before(function() {
    page = new ApplicationPage();
    return page.logAs(datas.users.coreGuest);
  });

  // Logout
  after(function() {
    page.logout();
  });

  it('Should not access the page', function() {
    return page.load().then(function() {
      assert.ok(false, 'User has access to application page and should not');
    }, function() {
      assert.ok(true);
    });
  });

});

describe('Application page without write permission', function() {
  var page;

  // Load page
  before(function() {
    page = new ApplicationPage();
    page.logAs(datas.users.coreApplicationsNoWrite);
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
  });

  it('should not have form to create an application', function() {
    assert.eventually.notOk(page.addFormElement.isPresent());
  });

  it('should not be able to create application by requesting the server directly', function() {
    var data = {
      name: 'Test',
      scopes: []
    };
    page.sendRequest('be/crud/application', 'put', data).then(function(response) {
      assert.equal(response.status, 403);
    });
  });

});

describe('Application page without update permission', function() {
  var page;

  // Load page
  before(function() {
    page = new ApplicationPage();
    page.logAs(datas.users.coreApplicationsNoUpdate);
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
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

    page.sendRequest('be/crud/application/' + id, 'post', data).then(function(response) {
      assert.equal(response.status, 403);
    });
  });

});

describe('Application page without delete permission', function() {
  var page;

  // Load page
  before(function() {
    page = new ApplicationPage();
    page.logAs(datas.users.coreApplicationsNoDelete);
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
  });

  it('should not have delete action to remove an application', function() {
    assert.isRejected(page.removeLine(datas.applications.coreApplicationsGuest.name));
  });

  it('should not be able to edit application by requesting the server directly', function() {
    var id = 'core';
    page.sendRequest('be/crud/application/' + id, 'delete').then(function(response) {
      assert.equal(response.status, 403);
    });
  });

});
