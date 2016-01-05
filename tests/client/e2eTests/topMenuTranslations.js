'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var i18n = process.require('tests/client/e2eTests/i18n/i18n.js');
var MenuPage = process.require('tests/client/e2eTests/pages/MenuPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Top menu', function() {
  var page, translations, languages;

  before(function() {
    page = new MenuPage();
    page.logAsAdmin();
    page.load().then(function() {

      // Get available languages
      languages = page.getLanguages();

      // Load dictionaries
      translations = i18n.getBackEndTranslations(page.language.code);

    });
  });

  after(function() {
    page.logout();
  });

  /**
   * Checks translations.
   *
   * @param {Number} [index] Index of the language to test in the list of languages
   * @return {Promise} Promise resolving when translations have been tested
   */
  function checkTranslations(index) {
    index = index || 0;
    if (index < languages.length) {
      return page.selectLanguage(languages[index]).then(function() {

        // Load login page dictionaries
        translations = i18n.getBackEndTranslations(page.language.code);

        // Profile popover title
        page.setProfileLinkMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('title'), translations.MENU.PROFILES);

        // Language popover title and actual language name
        page.setLanguageLinkMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('title'), translations.MENU.LANGUAGE);

        // Move cursor over language link again (IE workaround)
        page.setLanguageLinkMouseOver();
        var expectedLanguageLabel = translations[page.language.translationCode];
        assert.eventually.equal(page.popoverElement.getAttribute('content'), expectedLanguageLabel);

        // Logout popover title
        page.setLogoutLinkMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), translations.MENU.LOGOUT);

        // Test languages selector options
        page.openLanguages();
        for (var i = 0; i < languages.length; i++) {
          var languageOption = page.getLanguageOption(languages[i].code);
          assert.eventually.equal(languageOption.getText(), translations.LANGUAGE[languages[i].translationCode]);
        }
        page.closeLanguages().then(function() {
          checkTranslations(++index);
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
