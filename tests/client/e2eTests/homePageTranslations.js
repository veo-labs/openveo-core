'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var i18n = process.require('tests/client/e2eTests/i18n/i18n.js');
var HomePage = process.require('tests/client/e2eTests/pages/HomePage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Home page translations', function() {
  var page, languages, translations;

  before(function() {
    page = new HomePage();
    page.logAsAdmin();
    page.load().then(function() {

      // Get available languages
      languages = page.getLanguages();

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

        // Open versions
        page.openVersions();

        // Verify translations
        assert.eventually.equal(page.getTitle(), translations.HOME.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), translations.HOME.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), translations.HOME.DESCRIPTION);

        // Close versions
        return page.closeVersions();

      }).then(function() {
        return checkTranslations(++index);
      });
    } else {
      return protractor.promise.fulfilled();
    }
  }

  it('should be available in different languages', function() {
    return checkTranslations();
  });

});
