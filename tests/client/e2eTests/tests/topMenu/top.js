'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var e2e = require('@openveo/test').e2e;
var browserExt = e2e.browser;
var MenuPage = process.require('tests/client/e2eTests/pages/MenuPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Top menu', function() {
  var page;

  // Prepare page
  before(function() {
    page = new MenuPage();
    page.logAsAdmin();
    page.load();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  // Reload page after each test
  afterEach(function() {
    page.load();
    page.refresh();
  });

  it('should have a link to the home page', function() {
    browserExt.click(page.homeLinkElement);
    assert.eventually.equal(browser.getCurrentUrl(), process.protractorConf.baseUrl + 'be/');
  });

  it('should have a link to the profile page', function() {
    browserExt.click(page.profileLinkElement);
    assert.eventually.equal(browser.getCurrentUrl(), process.protractorConf.baseUrl + 'be/profile');
  });

  it('should display actual profile name in a popover on profile icon', function() {
    page.setProfileLinkMouseOver();
    assert.eventually.equal(page.popoverElement.getAttribute('content'), page.getUser().name);
  });

  it('should display actual language in a popover on language icon', function() {
    page.setLanguageLinkMouseOver();
    assert.eventually.equal(
      page.popoverElement.getAttribute('content'),
      page.translations.CORE.LANGUAGE[page.language.translationCode]
    );
  });

  it('should display a popover on logout icon', function() {
    page.setLogoutLinkMouseOver();
    assert.eventually.equal(page.popoverElement.getAttribute('content'), page.translations.CORE.MENU.LOGOUT);
  });

});
