'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var e2e = require('@openveo/test').e2e;
var GroupPage = process.require('tests/client/e2eTests/pages/GroupPage.js');
var GroupModel = process.require('app/server/models/GroupModel.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var storage = process.require('app/server/storage.js');
var GroupHelper = process.require('tests/client/e2eTests/helpers/GroupHelper.js');
var browserExt = e2e.browser;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Group page translations', function() {
  var page;
  var defaultGroups;
  var groupHelper;

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

        // All actions translations
        page.setSelectAllMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), coreTranslations.UI.SELECT_ALL);

        page.selectAllLines();
        browserExt.click(page.actionsButtonElement);
        var removeActionElement = page.actionsElement.element(by.cssContainingText('a', coreTranslations.UI.REMOVE));
        assert.eventually.ok(removeActionElement.isDisplayed(), 'Missing all remove action');

        // Headers translations
        assert.eventually.ok(page.isTableHeader(coreTranslations.GROUPS.NAME_COLUMN), 'Missing name column');
        assert.eventually.ok(page.isTableHeader(coreTranslations.UI.ACTIONS_COLUMN), 'Missing actions column');

        // Individual actions
        page.getLine(name).then(function(line) {
          var actionTd = line.all(by.css('td')).last();
          var actionButton = actionTd.element(by.css('button'));
          var removeAction = actionTd.element(by.cssContainingText('a', coreTranslations.UI.REMOVE));

          browserExt.click(actionButton).then(function() {
            assert.eventually.ok(removeAction.isDisplayed(), 'Missing remove action');
          });
        }, function(error) {
          assert.ok(false, error.message);
        });

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
    page.refresh();
  });

  it('should be available in different languages', function() {
    return checkTranslations();
  });

});
