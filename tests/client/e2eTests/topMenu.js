'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var i18n = process.require('tests/client/e2eTests/i18n/i18n.js');
var MenuPage = process.require('tests/client/e2eTests/pages/MenuPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Top menu', function() {
  var page, translations;

  before(function() {
    page = new MenuPage();
    page.logAsAdmin();
    page.load().then(function() {

      // Load dictionaries
      translations = i18n.getBackEndTranslations(page.language.code);

    });
  });

  after(function() {
    page.logout();
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
    assert.eventually.equal(page.popoverElement.getAttribute('content'), translations[page.language.translationCode]);
  });

  it('should display a popover on logout icon', function() {
    page.setLogoutLinkMouseOver();
    assert.eventually.equal(page.popoverElement.getAttribute('content'), translations.MENU.LOGOUT);
  });

});
