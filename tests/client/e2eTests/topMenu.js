'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
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
    page.refresh();
  });

  it('should have a link to the home page', function() {
    assert.eventually.ok(page.profileLinkElement.isPresent());
  });

  it('should have a link to the profile page', function() {
    assert.eventually.ok(page.profileLinkElement.isPresent());
  });

  it('should display actual profile name in a popover on profile icon', function() {
    page.setProfileLinkMouseOver();
    assert.eventually.equal(page.popoverElement.getAttribute('content'), page.getUser().name);
  });

  it('should display actual language in a popover on language icon', function() {
    page.setLanguageLinkMouseOver();
    assert.eventually.equal(page.popoverElement.getAttribute('content'),
                            page.translations[page.language.translationCode]);
  });

  it('should display a popover on logout icon', function() {
    page.setLogoutLinkMouseOver();
    assert.eventually.equal(page.popoverElement.getAttribute('content'), page.translations.MENU.LOGOUT);
  });

});
