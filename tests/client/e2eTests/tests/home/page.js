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

  it('should display a 404 not found page if accessing a wrong public URI as an authenticated user', function() {
    browser.driver.get(process.protractorConf.baseUrl + 'wrongUri');
    assert.eventually.equal(browser.driver.findElement(by.css('h1')).getText(), 'Not Found');
    assert.eventually.equal(
      browser.driver.findElement(by.css('p')).getText(),
      'The requested URL /wrongUri was not found on this server.'
    );
    page.load();
  });

  it('should redirect to home page if accessing a wrong back end URI as an authenticated user', function() {
    browser.get(process.protractorConf.baseUrl + 'be/wrongUri');
    assert.eventually.equal(browser.getCurrentUrl(), process.protractorConf.baseUrl + 'be/');
  });

  it('should redirect to home page if accessing the login page as an authenticated user', function() {
    browser.get(process.protractorConf.baseUrl + 'be/login');
    assert.eventually.equal(browser.getCurrentUrl(), process.protractorConf.baseUrl + 'be/');
  });

});
