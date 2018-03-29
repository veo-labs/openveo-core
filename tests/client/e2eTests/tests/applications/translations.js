'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var ApplicationPage = process.require('tests/client/e2eTests/pages/ApplicationPage.js');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var ApplicationHelper = process.require('tests/client/e2eTests/helpers/ApplicationHelper.js');
var storage = process.require('app/server/storage.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Application page translations', function() {
  var page;
  var applicationHelper;
  var defaultApplications;
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
        assert.eventually.equal(page.getTitle(), coreTranslations.APPLICATIONS.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), coreTranslations.APPLICATIONS.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), coreTranslations.APPLICATIONS.INFO);
        assert.eventually.equal(page.addFormLabelElement.getText(), coreTranslations.APPLICATIONS.ADD_APPLICATION);

        // Add form translations
        page.openAddForm();
        var addFormFields = page.getAddFormFields(page.addFormElement);
        var nameField = addFormFields.name;
        var scopesField = addFormFields.scopes;
        assert.eventually.equal(nameField.getLabel(), coreTranslations.APPLICATIONS.FORM_ADD_NAME);
        assert.eventually.equal(nameField.getDescription(), coreTranslations.APPLICATIONS.FORM_ADD_NAME_DESC);
        assert.eventually.equal(scopesField.getLabel(), coreTranslations.APPLICATIONS.FORM_ADD_SCOPES);
        assert.eventually.equal(scopesField.getDescription(), coreTranslations.APPLICATIONS.FORM_ADD_SCOPES_DESC);
        assert.eventually.equal(page.addButtonElement.getText(), coreTranslations.UI.FORM_ADD);
        assert.eventually.sameMembers(page.getAvailableScopes(), applicationHelper.getScopes(page.translations));

        page.closeAddForm();

        // Search engine translations
        page.searchLinkElement.getText().then(function(text) {
          assert.equal(text.trim(), coreTranslations.UI.SEARCH_BY);
        });

        var searchFields = page.getSearchFields(page.searchFormElement);
        var searchQueryField = searchFields.query;
        assert.eventually.equal(searchQueryField.getLabel(), coreTranslations.APPLICATIONS.QUERY_FILTER);

        // Make search to deal only with entries specially added for the test
        page.search({query: baseName});

        // All actions translations
        page.setSelectAllMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), coreTranslations.UI.SELECT_ALL);

        page.selectAllLines();

        assert.eventually.sameMembers(page.getGlobalActions(), [
          coreTranslations.UI.REMOVE
        ]);

        // Headers translations
        assert.eventually.ok(page.isTableHeader(coreTranslations.APPLICATIONS.NAME_COLUMN), 'Missing name column');
        assert.eventually.ok(page.isTableHeader(coreTranslations.UI.ACTIONS_COLUMN), 'Missing actions column');

        // Individual actions
        assert.eventually.sameMembers(page.getLineActions(baseName + ' 1'), [
          coreTranslations.UI.REMOVE
        ]);

        return browser.waitForAngular();
      }).then(function() {
        return checkTranslations(++index);
      });
    } else {
      return protractor.promise.fulfilled();
    }
  }

  // Prepare page
  before(function() {
    var clientProvider = new ClientProvider(storage.getDatabase());
    applicationHelper = new ApplicationHelper(clientProvider);
    page = new ApplicationPage();
    page.logAsAdmin();
    applicationHelper.getEntities().then(function(applications) {
      defaultApplications = applications;
    });
    page.load();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  // Reload page after each test
  afterEach(function() {
    applicationHelper.removeAllEntities(defaultApplications);
    page.refresh();
  });

  it('should be available in different languages', function() {
    applicationHelper.addEntities([
      {
        name: baseName + ' 1'
      },
      {
        name: baseName + ' 2'
      }
    ]);

    checkTranslations();
  });

});
