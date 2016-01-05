'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var i18n = process.require('tests/client/e2eTests/i18n/i18n.js');
var ProfilePage = process.require('tests/client/e2eTests/pages/ProfilePage.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Profile page translations', function() {
  var page, languages, translations;

  before(function() {
    page = new ProfilePage();
    page.logAs(datas.users.coreAdmin);
    page.load().then(function() {

      // Get available languages
      languages = page.getLanguages();

      // Get translations
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

        // Load dictionaries
        translations = i18n.getBackEndTranslations(page.language.code);

        // Form edit button translation
        assert.eventually.equal(page.editUserElement.getText(), translations.UI.FORM_EDIT);

        return page.setNameAndSave();
      }).then(function() {
        var expectedConfirmPasswordLabel = translations.PROFILES.ATTR_CONFIRM_PASSWORD;

        // Account form translations
        assert.eventually.equal(page.getTitle(), translations.PROFILES.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), translations.PROFILES.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), translations.PROFILES.INFO);
        assert.eventually.equal(page.accountTitleElement.getText(), translations.PROFILES.ATTR_USER_ACCOUNT);
        assert.eventually.equal(page.userNameLabelElement.getText(), translations.PROFILES.ATTR_NAME + ' *');
        assert.eventually.equal(page.userEmailLabelElement.getText(), translations.PROFILES.ATTR_EMAIL);
        assert.eventually.equal(page.userRolesLabelElement.getText(), translations.PROFILES.ATTR_ROLES);
        assert.eventually.equal(page.submitUserElement.getText(), translations.UI.FORM_SAVE);
        assert.eventually.equal(page.cancelUserElement.getText(), translations.UI.FORM_CANCEL);
        assert.eventually.equal(page.userNameErrorElement.getText(), translations.UI.REQUIRED_FIELD);

        // Password form translations
        assert.eventually.equal(page.passwordTitleElement.getText(), translations.PROFILES.ATTR_MODIFY_PASSWORD);
        assert.eventually.equal(page.passwordLabelElement.getText(), translations.PROFILES.ATTR_PASSWORD);
        assert.eventually.equal(page.confirmPasswordLabelElement.getText(), expectedConfirmPasswordLabel);
        assert.eventually.equal(page.submitPasswordElement.getText(), translations.UI.FORM_SAVE);
        assert.eventually.equal(page.cancelPasswordElement.getText(), translations.UI.FORM_CANCEL);

        return page.cancelEdition();
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
