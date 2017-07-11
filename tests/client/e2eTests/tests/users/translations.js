'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var UserPage = process.require('tests/client/e2eTests/pages/UserPage.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');
var storage = process.require('app/server/storage.js');
var UserHelper = process.require('tests/client/e2eTests/helpers/UserHelper.js');
var UserModel = process.require('app/server/models/UserModel.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('User page translations', function() {
  var page;
  var userHelper;
  var defaultUsers;
  var baseName = 'test translations';

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
        var coreTranslations = page.translations.CORE;

        // Page translations
        assert.eventually.equal(page.getTitle(), coreTranslations.USERS.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), coreTranslations.USERS.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), coreTranslations.USERS.INFO);
        assert.eventually.equal(page.addFormLabelElement.getText(), coreTranslations.USERS.ADD_USER);

        // Add form translations
        page.openAddForm();
        var addFormFields = page.getAddFormFields(page.addFormElement);
        var nameField = addFormFields.name;
        var emailField = addFormFields.email;
        var passwordField = addFormFields.password;
        var passwordValidateField = addFormFields.passwordValidate;
        var rolesField = addFormFields.roles;
        assert.eventually.equal(nameField.getLabel(), coreTranslations.USERS.FORM_ADD_NAME);
        assert.eventually.equal(nameField.getDescription(), coreTranslations.USERS.FORM_ADD_NAME_DESC);
        assert.eventually.equal(emailField.getLabel(), coreTranslations.USERS.FORM_ADD_EMAIL);
        assert.eventually.equal(emailField.getDescription(), coreTranslations.USERS.FORM_ADD_EMAIL_DESC);
        assert.eventually.equal(passwordField.getLabel(), coreTranslations.USERS.FORM_ADD_PASSWORD);
        assert.eventually.equal(passwordField.getDescription(), coreTranslations.USERS.FORM_ADD_PASSWORD_DESC);
        assert.eventually.equal(passwordValidateField.getLabel(), coreTranslations.USERS.FORM_ADD_PASSWORD_VALIDATE);
        assert.eventually.equal(passwordValidateField.getDescription(),
                               coreTranslations.USERS.FORM_ADD_PASSWORD_VALIDATE_DESC);
        assert.eventually.equal(rolesField.getLabel(), coreTranslations.USERS.FORM_ADD_ROLE);
        assert.eventually.equal(rolesField.getDescription(), coreTranslations.USERS.FORM_ADD_ROLE_DESC);
        assert.eventually.equal(page.addButtonElement.getText(), coreTranslations.UI.FORM_ADD);
        page.closeAddForm();

        // Search engine translations
        page.searchLinkElement.getText().then(function(text) {
          assert.equal(text.trim(), coreTranslations.UI.SEARCH_BY);
        });

        var searchFields = page.getSearchFields(page.searchFormElement);
        var searchQueryField = searchFields.query;
        assert.eventually.equal(searchQueryField.getLabel(), coreTranslations.USERS.QUERY_FILTER);

        // Some not locked users
        page.search({query: baseName});

        // All actions translations
        page.setSelectAllMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), coreTranslations.UI.SELECT_ALL);

        page.selectAllLines();

        assert.eventually.sameMembers(page.getGlobalActions(), [
          coreTranslations.UI.REMOVE
        ]);

        // Headers translations
        assert.eventually.ok(page.isTableHeader(coreTranslations.USERS.NAME_COLUMN), 'Missing name column');
        assert.eventually.ok(page.isTableHeader(coreTranslations.UI.ACTIONS_COLUMN), 'Missing actions column');

        // Individual actions
        assert.eventually.sameMembers(page.getLineActions(baseName + ' 1'), [
          coreTranslations.UI.REMOVE
        ]);

        // Locked users
        page.search({query: datas.users.coreLocked.name});

        assert.eventually.sameMembers(page.getGlobalActions(), [
          coreTranslations.UI.NO_COMMON_ACTION
        ]);

        assert.eventually.sameMembers(page.getLineActions(datas.users.coreLocked.name), [
          coreTranslations.UI.NO_ACTION
        ]);

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
    var userModel = new UserModel(new UserProvider(storage.getDatabase()));
    userHelper = new UserHelper(userModel);
    page = new UserPage();
    page.logAsAdmin();
    userHelper.getEntities().then(function(users) {
      defaultUsers = users;
    });
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
  });

  // Reload page after each test
  afterEach(function() {
    userHelper.removeAllEntities(defaultUsers);
    page.refresh();
  });

  it('should be available in different languages', function() {
    userHelper.addEntities([
      {
        name: baseName + ' 1',
        email: 'test-translations@veo-labs.com',
        password: 'test-translations',
        passwordValidate: 'test-translations'
      },
      {
        name: baseName + ' 2',
        email: 'test-translations@veo-labs.com',
        password: 'test-translations',
        passwordValidate: 'test-translations'
      }
    ]);

    checkTranslations();
  });

});
