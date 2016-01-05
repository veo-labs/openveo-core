'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var LoginPage = process.require('tests/client/e2eTests/pages/LoginPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Login page', function() {
  var page;

  before(function() {
    page = new LoginPage();
    page.logout();
    page.load();
  });

  it('should display an error message if trying to log without password', function() {
    page.setEmail('john');
    page.setPassword('');
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
  });

  it('should display an error message if trying to log without email', function() {
    page.setEmail('');
    page.setPassword('password');
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
  });

  it('should display an error message if trying to log with a wrong account', function() {
    page.setEmail('something is wrong');
    page.setPassword('in the kingdom of denmark');
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
  });

});
