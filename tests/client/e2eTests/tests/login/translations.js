'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var LoginPage = process.require('tests/client/e2eTests/pages/LoginPage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Login page translations', function() {
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
        var coreTranslations = page.translations.CORE;

        // Submit form to have error message
        page.submit();

        // Verify translations
        assert.eventually.equal(page.userInputElement.getAttribute('placeholder'),
                                coreTranslations.LOGIN.LOGIN_DESCRIPTION);
        assert.eventually.equal(page.passwordInputElement.getAttribute('placeholder'),
                                coreTranslations.LOGIN.PASSWORD_DESCRIPTION);
        assert.eventually.equal(page.getTitle(), coreTranslations.LOGIN.PAGE_TITLE);
        assert.eventually.equal(page.userLabelElement.getText(), coreTranslations.LOGIN.LOGIN);
        assert.eventually.equal(page.passwordLabelElement.getText(), coreTranslations.LOGIN.PASSWORD);
        assert.eventually.equal(page.buttonElement.getText(), coreTranslations.LOGIN.SUBMIT);
        assert.eventually.equal(page.errorMessageElement.getText(), coreTranslations.LOGIN.ERROR);
        assert.eventually.equal(page.casButtonElement.getText(), coreTranslations.LOGIN.CAS_BUTTON);
        assert.eventually.equal(page.separatorElement.getText(), coreTranslations.LOGIN.ALTERNATIVE);

        // Test languages selector options
        for (var i = 0; i < languages.length; i++) {
          var languageOption = page.getLanguageOption(languages[i].code);
          var expectedLanguageLabel = coreTranslations.LANGUAGE[languages[i].translationCode];
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
