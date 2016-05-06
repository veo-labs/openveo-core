'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var ProfilePage = process.require('tests/client/e2eTests/pages/ProfilePage.js');
var datas = process.require('tests/client/e2eTests/database/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Profile page translations', function() {
  var page;

  // Prepare page
  before(function() {
    page = new ProfilePage();
    page.logAs(datas.users.coreAdmin);
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

        // Form edit button translation
        assert.eventually.equal(page.editUserElement.getText(), page.translations.CORE.UI.FORM_EDIT);

        return page.activateEdition();
      }).then(function() {
        var coreTranslations = page.translations.CORE;

        // Account form translations
        assert.eventually.equal(page.getTitle(), coreTranslations.PROFILES.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), coreTranslations.PROFILES.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), coreTranslations.PROFILES.INFO);
        assert.eventually.equal(page.accountTitleElement.getText(), coreTranslations.PROFILES.ATTR_USER_ACCOUNT);
        assert.eventually.equal(page.userNameLabelElement.getText(), coreTranslations.PROFILES.ATTR_NAME + ' *');
        assert.eventually.equal(page.userEmailLabelElement.getText(), coreTranslations.PROFILES.ATTR_EMAIL);
        assert.eventually.equal(page.userRolesLabelElement.getText(), coreTranslations.PROFILES.ATTR_ROLES);
        assert.eventually.equal(page.submitUserElement.getText(), coreTranslations.UI.FORM_SAVE);
        assert.eventually.equal(page.cancelUserElement.getText(), coreTranslations.UI.FORM_CANCEL);

        // Password form translations
        assert.eventually.equal(page.passwordTitleElement.getText(), coreTranslations.PROFILES.ATTR_MODIFY_PASSWORD);
        assert.eventually.equal(page.passwordLabelElement.getText(), coreTranslations.PROFILES.ATTR_PASSWORD);
        assert.eventually.equal(page.confirmPasswordLabelElement.getText(),
                                coreTranslations.PROFILES.ATTR_CONFIRM_PASSWORD);
        assert.eventually.equal(page.submitPasswordElement.getText(), coreTranslations.UI.FORM_SAVE);
        assert.eventually.equal(page.cancelPasswordElement.getText(), coreTranslations.UI.FORM_CANCEL);

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
