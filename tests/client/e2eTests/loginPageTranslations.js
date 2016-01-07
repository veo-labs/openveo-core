'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var LoginPage = process.require('tests/client/e2eTests/pages/LoginPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Login page translations', function() {
  var page;

  before(function() {
    page = new LoginPage();
    page.load();
  });

  /**
   * Checks translations.
   *
   * @param {Number} [index] Index of the language to test in the list of languages
   */
  function checkTranslations(index) {
    index = index || 0;
    var languages = page.getLanguages();

    if (index < languages.length) {
      return page.selectLanguage(languages[index]).then(function() {

        // Submit form to have error message
        page.submit();

        // Verify translations
        var expectedLoginDescription = page.translations.LOGIN.LOGIN_DESCRIPTION;
        var expectedPasswordDescription = page.translations.LOGIN.PASSWORD_DESCRIPTION;
        assert.eventually.equal(page.userInputElement.getAttribute('placeholder'), expectedLoginDescription);
        assert.eventually.equal(page.passwordInputElement.getAttribute('placeholder'), expectedPasswordDescription);
        assert.eventually.equal(page.getTitle(), page.translations.LOGIN.PAGE_TITLE);
        assert.eventually.equal(page.userLabelElement.getText(), page.translations.LOGIN.LOGIN);
        assert.eventually.equal(page.passwordLabelElement.getText(), page.translations.LOGIN.PASSWORD);
        assert.eventually.equal(page.buttonElement.getText(), page.translations.LOGIN.SUBMIT);
        assert.eventually.equal(page.errorMessageElement.getText(), page.translations.LOGIN.ERROR);

        // Test languages selector options
        for (var i = 0; i < languages.length; i++) {
          var languageOption = page.getLanguageOption(languages[i].code);
          var expectedLanguageLabel = page.translations.LANGUAGE[languages[i].translationCode];
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
