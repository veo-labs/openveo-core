'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Home page', function() {
  var page;

  // Prepare page
  before(function() {
    page = new HomePage();
    page.logAsAdmin();
    page.load();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  // Reload page after each test
  afterEach(function() {
    page.refresh();
  });

  it('should display page title', function() {
    assert.eventually.ok(page.pageTitleElement.isPresent());
  });

  it('should display page description', function() {
    assert.eventually.ok(page.pageDescriptionElement.isPresent());
  });

  it('should display version button', function() {
    assert.eventually.ok(page.versionButtonElement.isPresent());
  });

  it('should display a popup to display the list of versions', function() {
    page.openVersions();
    assert.eventually.isAbove(page.versionElements.count(), 1);
    page.closeVersions();
  });

});
