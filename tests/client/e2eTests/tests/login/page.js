'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var LoginPage = process.require('tests/client/e2eTests/pages/LoginPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Login page', function() {
  var page;

  // Prepare page
  before(function() {
    page = new LoginPage();
    page.logout();
    page.load();
  });

  // Reload page after each test
  afterEach(function() {
    page.refresh();
  });

  it('should display an error message if trying to log without email and password', function() {
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
    assert.eventually.ok(page.isEmailOnError());
    assert.eventually.ok(page.isPasswordOnError());
  });

  it('should display an error message if trying to log without password', function() {
    page.setEmail('john');
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
    assert.eventually.ok(page.isEmailOnError());
    assert.eventually.ok(page.isPasswordOnError());
    assert.eventually.equal(page.getEmail(), '');
    assert.eventually.equal(page.getPassword(), '');
  });

  it('should display an error message if trying to log without email', function() {
    page.setPassword('password');
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
    assert.eventually.ok(page.isEmailOnError());
    assert.eventually.ok(page.isPasswordOnError());
    assert.eventually.equal(page.getEmail(), '');
    assert.eventually.equal(page.getPassword(), '');
  });

  it('should display an error message if trying to log with a wrong account', function() {
    page.setEmail('something is wrong');
    page.setPassword('in the kingdom of denmark');
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
    assert.eventually.ok(page.isEmailOnError());
    assert.eventually.ok(page.isPasswordOnError());
    assert.eventually.equal(page.getEmail(), '');
    assert.eventually.equal(page.getPassword(), '');
  });

  it('should no longer consider fields on error when modified', function() {
    page.submit();
    page.setEmail('email');
    page.setPassword('password');
    page.unfocus();
    assert.eventually.notOk(page.isEmailOnError());
    assert.eventually.notOk(page.isPasswordOnError());
  });

  it('should display a 404 not found page if accessing a wrong public URI as an anonymous user', function() {
    browser.driver.get(process.protractorConf.baseUrl + 'wrongUri');
    assert.eventually.equal(browser.driver.findElement(by.css('h1')).getText(), 'Not Found');
    assert.eventually.equal(
      browser.driver.findElement(by.css('p')).getText(),
      'The requested URL /wrongUri was not found on this server.'
    );
    page.load();
  });

  it('should redirect to login page if accessing a wrong back end URI as an anonymous user', function() {
    browser.get(process.protractorConf.baseUrl + 'be/wrongUri');
    assert.eventually.equal(browser.getCurrentUrl(), process.protractorConf.baseUrl + 'be/login');
  });

});
