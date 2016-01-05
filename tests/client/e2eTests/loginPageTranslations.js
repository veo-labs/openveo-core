'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var i18n = process.require('tests/client/e2eTests/i18n/i18n.js');
var LoginPage = process.require('tests/client/e2eTests/pages/LoginPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Login page translations', function() {
  var page, languages;

  before(function() {
    page = new LoginPage();
    page.load().then(function() {
      languages = page.getLanguages();
    });
  });

  /**
   * Checks translations.
   *
   * @param {Number} [index] Index of the language to test in the list of languages
   */
  function checkTranslations(index) {
    index = index || 0;

    if (index < languages.length) {
      return page.selectLanguage(languages[index]).then(function() {

        // Submit form to have error message
        page.submit();

        // Load login page dictionaries
        var translations = i18n.getPublicTranslations(page.language.code);

        // Verify translations
        var expectedLoginDescription = translations.LOGIN.LOGIN_DESCRIPTION;
        var expectedPasswordDescription = translations.LOGIN.PASSWORD_DESCRIPTION;
        assert.eventually.equal(page.userInputElement.getAttribute('placeholder'), expectedLoginDescription);
        assert.eventually.equal(page.passwordInputElement.getAttribute('placeholder'), expectedPasswordDescription);
        assert.eventually.equal(page.getTitle(), translations.LOGIN.PAGE_TITLE);
        assert.eventually.equal(page.userLabelElement.getText(), translations.LOGIN.LOGIN);
        assert.eventually.equal(page.passwordLabelElement.getText(), translations.LOGIN.PASSWORD);
        assert.eventually.equal(page.buttonElement.getText(), translations.LOGIN.SUBMIT);
        assert.eventually.equal(page.errorMessageElement.getText(), translations.LOGIN.ERROR);

        // Test languages selector options
        for (var i = 0; i < languages.length; i++) {
          var languageOption = page.getLanguageOption(languages[i].code);
          var expectedLanguageLabel = translations.LANGUAGE[languages[i].translationCode];
          assert.eventually.equal(languageOption.getAttribute('label'), expectedLanguageLabel);
        }

        return browser.waitForAngular();
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
