'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var GroupPage = process.require('tests/client/e2eTests/pages/GroupPage.js');
var GroupModel = process.require('app/server/models/GroupModel.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var storage = process.require('app/server/storage.js');
var GroupHelper = process.require('tests/client/e2eTests/helpers/GroupHelper.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Group page translations', function() {
  var page;
  var defaultGroups;
  var groupHelper;
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
        var name = 'Test translations';
        var description = 'Test translations description';
        var coreTranslations = page.translations.CORE;

        // Create line
        page.addLine(name, description);

        // Page translations
        assert.eventually.equal(page.getTitle(), coreTranslations.GROUPS.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), coreTranslations.GROUPS.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), coreTranslations.GROUPS.INFO);
        assert.eventually.equal(page.addFormLabelElement.getText(), coreTranslations.GROUPS.ADD_GROUP);

        // Add form translations
        page.openAddForm();
        var addFormFields = page.getAddFormFields(page.addFormElement);
        var nameField = addFormFields.name;
        var descriptionField = addFormFields.description;
        assert.eventually.equal(nameField.getLabel(), coreTranslations.GROUPS.FORM_ADD_NAME);
        assert.eventually.equal(nameField.getDescription(), coreTranslations.GROUPS.FORM_ADD_NAME_DESC);
        assert.eventually.equal(descriptionField.getLabel(), coreTranslations.GROUPS.FORM_ADD_DESCRIPTION);
        assert.eventually.equal(descriptionField.getDescription(), coreTranslations.GROUPS.FORM_ADD_DESCRIPTION_DESC);
        assert.eventually.equal(page.addButtonElement.getText(), coreTranslations.UI.FORM_ADD);
        page.closeAddForm();

        // Search engine translations
        page.searchLinkElement.getText().then(function(text) {
          assert.equal(text.trim(), coreTranslations.UI.SEARCH_BY);
        });

        var searchFields = page.getSearchFields(page.searchFormElement);
        var searchQueryField = searchFields.query;
        assert.eventually.equal(searchQueryField.getLabel(), coreTranslations.GROUPS.QUERY_FILTER);

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
        assert.eventually.ok(page.isTableHeader(coreTranslations.GROUPS.NAME_COLUMN), 'Missing name column');
        assert.eventually.ok(page.isTableHeader(coreTranslations.UI.ACTIONS_COLUMN), 'Missing actions column');

        // Individual actions
        assert.eventually.sameMembers(page.getLineActions(baseName + ' 1'), [
          coreTranslations.UI.REMOVE
        ]);

        page.removeLine(name);
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
    groupHelper = new GroupHelper(new GroupModel(new GroupProvider(storage.getDatabase())));
    page = new GroupPage();
    page.logAsAdmin();
    groupHelper.getEntities().then(function(groups) {
      defaultGroups = groups;
    });
    page.load();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  // Reload page after each test
  afterEach(function() {
    groupHelper.removeAllEntities(defaultGroups);

    // After removing a group OpenVeo sub process has to be restarted to rebuild its in memory permissions
    process.protractorConf.restartOpenVeo();

    page.refresh();
  });

  it('should be available in different languages', function() {
    groupHelper.addEntities([
      {
        name: baseName + ' 1',
        description: baseName + ' 1'
      },
      {
        name: baseName + ' 2',
        description: baseName + ' 2'
      }
    ]);
    return checkTranslations();
  });

});
