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

  /**
   * Checks translations.
   *
   * @param {Number} [index] Index of the language to test in the list of languages
   * @return {Promise} Promise resolving when translations have been tested
   */
  function checkTranslations(index) {
    index = index || 0;
    var languages = page.getLanguages();

    if (index < languages.length) {
      return page.selectLanguage(languages[index]).then(function() {

        // Profile popover title
        page.setProfileLinkMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('title'), page.translations.MENU.PROFILES);

        // Language popover title and actual language name
        page.setLanguageLinkMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('title'), page.translations.MENU.LANGUAGE);

        // Move cursor over language link again (IE workaround)
        page.setLanguageLinkMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'),
                               page.translations[page.language.translationCode]);

        // Logout popover title
        page.setLogoutLinkMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), page.translations.MENU.LOGOUT);

        // Test languages selector options
        page.openLanguages();
        for (var i = 0; i < languages.length; i++) {
          var languageOption = page.getLanguageOption(languages[i].code);
          assert.eventually.equal(languageOption.getText(), page.translations.LANGUAGE[languages[i].translationCode]);
        }
        page.closeLanguages().then(function() {
          return checkTranslations(++index);
        });
      });
    } else {
      return protractor.promise.fulfilled();
    }
  }

  it('should be available in different languages', function() {
    return checkTranslations();
  });

});
