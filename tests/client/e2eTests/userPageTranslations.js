'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var i18n = process.require('tests/client/e2eTests/i18n/i18n.js');
var UserPage = process.require('tests/client/e2eTests/pages/UserPage.js');
var datas = process.require('tests/client/e2eTests/database/data.json');
var browserExt = require('@openveo/test').e2e.browser;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('User page translations', function() {
  var page, languages, translations;

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

        // Load page dictionaries
        translations = i18n.getBackEndTranslations(page.language.code);

        // Page translations
        assert.eventually.equal(page.getTitle(), translations.USERS.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), translations.USERS.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), translations.USERS.INFO);
        assert.eventually.equal(page.addFormLabelElement.getText(), translations.USERS.ADD_USER);

        // Add form translations
        page.openAddForm();
        var addFormFields = page.getAddFormFields(page.addFormElement);
        var nameField = addFormFields.name;
        var emailField = addFormFields.email;
        var passwordField = addFormFields.password;
        var passwordValidateField = addFormFields.passwordValidate;
        var rolesField = addFormFields.roles;
        var expectedPasswordValidateDescription = translations.USERS.FORM_ADD_PASSWORD_VALIDATE_DESC;
        assert.eventually.equal(nameField.getLabel(), translations.USERS.FORM_ADD_NAME);
        assert.eventually.equal(nameField.getDescription(), translations.USERS.FORM_ADD_NAME_DESC);
        assert.eventually.equal(emailField.getLabel(), translations.USERS.FORM_ADD_EMAIL);
        assert.eventually.equal(emailField.getDescription(), translations.USERS.FORM_ADD_EMAIL_DESC);
        assert.eventually.equal(passwordField.getLabel(), translations.USERS.FORM_ADD_PASSWORD);
        assert.eventually.equal(passwordField.getDescription(), translations.USERS.FORM_ADD_PASSWORD_DESC);
        assert.eventually.equal(passwordValidateField.getLabel(), translations.USERS.FORM_ADD_PASSWORD_VALIDATE);
        assert.eventually.equal(passwordValidateField.getDescription(), expectedPasswordValidateDescription);
        assert.eventually.equal(rolesField.getLabel(), translations.USERS.FORM_ADD_ROLE);
        assert.eventually.equal(rolesField.getDescription(), translations.USERS.FORM_ADD_ROLE_DESC);
        assert.eventually.equal(page.addButtonElement.getText(), translations.UI.FORM_ADD);
        page.closeAddForm();

        // Search engine translations
        page.searchLinkElement.getText().then(function(text) {
          assert.equal(text.trim(), translations.UI.SEARCH_BY);
        });

        var searchFields = page.getSearchFields(page.searchFormElement);
        var searchNameField = searchFields.name;
        assert.eventually.equal(searchNameField.getLabel(), translations.USERS.TITLE_FILTER);

        // All actions translations
        page.setSelectAllMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), translations.UI.SELECT_ALL);

        page.selectAllLines();
        browserExt.click(page.actionsButtonElement);
        var removeActionElement = page.actionsElement.element(by.cssContainingText('a', translations.UI.REMOVE));
        assert.eventually.ok(removeActionElement.isDisplayed(), 'Missing all remove action');

        // Headers translations
        assert.eventually.ok(page.isTableHeader(translations.USERS.NAME_COLUMN), 'Missing name column');
        assert.eventually.ok(page.isTableHeader(translations.UI.ACTIONS_COLUMN), 'Missing actions column');

        // Individual actions
        page.getLine(datas.users.coreGuest.name).then(function(line) {
          var actionTd = line.trElement.all(by.css('td')).last();
          var actionButton = actionTd.element(by.css('button'));
          var removeActionElement = actionTd.element(by.cssContainingText('a', translations.UI.REMOVE));

          browserExt.click(actionButton).then(function() {
            assert.eventually.ok(removeActionElement.isDisplayed(), 'Missing remove action');
          });
        }, function(error) {
          assert.ok(false);
        });

        return browser.waitForAngular();
      }).then(function() {
        return checkTranslations(++index);
      });
    } else {
      return protractor.promise.fulfilled();
    }
  }

  // Load page
  before(function() {
    page = new UserPage();
    page.logAsAdmin();
    page.load().then(function() {

      // Get available languages
      languages = page.getLanguages();

      // Get translations
      translations = i18n.getBackEndTranslations(page.language.code);

    });
  });

  // Logout
  after(function() {
    page.logout();
  });

  it('should be available in different languages', function() {
    return checkTranslations();
  });

});
