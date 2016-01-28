'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var e2e = require('@openveo/test').e2e;
var UserPage = process.require('tests/client/e2eTests/pages/UserPage.js');
var datas = process.require('tests/client/e2eTests/database/data.json');
var browserExt = e2e.browser;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('User page translations', function() {
  var page;

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

        // Page translations
        assert.eventually.equal(page.getTitle(), page.translations.USERS.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), page.translations.USERS.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), page.translations.USERS.INFO);
        assert.eventually.equal(page.addFormLabelElement.getText(), page.translations.USERS.ADD_USER);

        // Add form translations
        page.openAddForm();
        var addFormFields = page.getAddFormFields(page.addFormElement);
        var nameField = addFormFields.name;
        var emailField = addFormFields.email;
        var passwordField = addFormFields.password;
        var passwordValidateField = addFormFields.passwordValidate;
        var rolesField = addFormFields.roles;
        assert.eventually.equal(nameField.getLabel(), page.translations.USERS.FORM_ADD_NAME);
        assert.eventually.equal(nameField.getDescription(), page.translations.USERS.FORM_ADD_NAME_DESC);
        assert.eventually.equal(emailField.getLabel(), page.translations.USERS.FORM_ADD_EMAIL);
        assert.eventually.equal(emailField.getDescription(), page.translations.USERS.FORM_ADD_EMAIL_DESC);
        assert.eventually.equal(passwordField.getLabel(), page.translations.USERS.FORM_ADD_PASSWORD);
        assert.eventually.equal(passwordField.getDescription(), page.translations.USERS.FORM_ADD_PASSWORD_DESC);
        assert.eventually.equal(passwordValidateField.getLabel(), page.translations.USERS.FORM_ADD_PASSWORD_VALIDATE);
        assert.eventually.equal(passwordValidateField.getDescription(),
                               page.translations.USERS.FORM_ADD_PASSWORD_VALIDATE_DESC);
        assert.eventually.equal(rolesField.getLabel(), page.translations.USERS.FORM_ADD_ROLE);
        assert.eventually.equal(rolesField.getDescription(), page.translations.USERS.FORM_ADD_ROLE_DESC);
        assert.eventually.equal(page.addButtonElement.getText(), page.translations.UI.FORM_ADD);
        page.closeAddForm();

        // Search engine translations
        page.searchLinkElement.getText().then(function(text) {
          assert.equal(text.trim(), page.translations.UI.SEARCH_BY);
        });

        var searchFields = page.getSearchFields(page.searchFormElement);
        var searchNameField = searchFields.name;
        assert.eventually.equal(searchNameField.getLabel(), page.translations.USERS.TITLE_FILTER);

        // All actions translations
        page.setSelectAllMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), page.translations.UI.SELECT_ALL);

        page.selectAllLines();
        browserExt.click(page.actionsButtonElement);
        var removeActionElement = page.actionsElement.element(by.cssContainingText('a', page.translations.UI.REMOVE));
        assert.eventually.ok(removeActionElement.isDisplayed(), 'Missing all remove action');

        // Headers translations
        assert.eventually.ok(page.isTableHeader(page.translations.USERS.NAME_COLUMN), 'Missing name column');
        assert.eventually.ok(page.isTableHeader(page.translations.UI.ACTIONS_COLUMN), 'Missing actions column');

        // Individual actions
        page.getLine(datas.users.coreGuest.name).then(function(line) {
          var actionTd = line.all(by.css('td')).last();
          var actionButton = actionTd.element(by.css('button'));
          var removeActionElement = actionTd.element(by.cssContainingText('a', page.translations.UI.REMOVE));

          browserExt.click(actionButton).then(function() {
            assert.eventually.ok(removeActionElement.isDisplayed(), 'Missing remove action');
          });
        }, function(error) {
          assert.ok(false, error.message);
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
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
  });

  // Reload page after each test
  afterEach(function() {
    page.refresh();
  });

  it('should be available in different languages', function() {
    return checkTranslations();
  });

});
