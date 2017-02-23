'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var e2e = require('@openveo/test').e2e;
var RolePage = process.require('tests/client/e2eTests/pages/RolePage.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');
var browserExt = e2e.browser;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Role page translations', function() {
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
        var coreTranslations = page.translations.CORE;

        // Page translations
        assert.eventually.equal(page.getTitle(), coreTranslations.ROLES.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), coreTranslations.ROLES.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), coreTranslations.ROLES.INFO);
        assert.eventually.equal(page.addFormLabelElement.getText(), coreTranslations.ROLES.ADD_ROLE);

        // Add form translations
        page.openAddForm();
        var addFormFields = page.getAddFormFields(page.addFormElement);
        var coreGroups = page.getCorePermissionGroups();
        var corePermissions = page.getCorePermissions();
        var nameField = addFormFields.name;
        assert.eventually.equal(nameField.getLabel(), coreTranslations.ROLES.FORM_ADD_NAME);
        assert.eventually.equal(nameField.getDescription(), coreTranslations.ROLES.FORM_ADD_NAME_DESC);
        assert.eventually.equal(page.addButtonElement.getText(), coreTranslations.UI.FORM_ADD);

        page.getPermissionGroups(page.addFormElement).then(function(groups) {
          for (var i = 0; i < coreGroups.length; i++)
            assert.ok(groups.indexOf(coreGroups[i]) >= 0, 'Missing group ' + coreGroups[i]);
        });

        page.getPermissions(page.addFormElement).then(function(permissions) {
          for (var i = 0; i < corePermissions.length; i++)
            assert.ok(permissions.indexOf(corePermissions[i]) >= 0, 'Missing permission ' + corePermissions[i]);
        });
        page.closeAddForm();

        // Search engine translations
        page.searchLinkElement.getText().then(function(text) {
          assert.equal(text.trim(), coreTranslations.UI.SEARCH_BY);
        });

        var searchFields = page.getSearchFields(page.searchFormElement);
        var searchQueryField = searchFields.query;
        assert.eventually.equal(searchQueryField.getLabel(), coreTranslations.ROLES.QUERY_FILTER);

        // All actions translations
        page.setSelectAllMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), coreTranslations.UI.SELECT_ALL);

        page.selectAllLines();
        browserExt.click(page.actionsButtonElement);
        var removeActionElement = page.actionsElement.element(by.cssContainingText('a', coreTranslations.UI.REMOVE));
        assert.eventually.ok(removeActionElement.isDisplayed(), 'Missing all remove action');

        // Headers translations
        assert.eventually.ok(page.isTableHeader(coreTranslations.ROLES.NAME_COLUMN), 'Missing name column');
        assert.eventually.ok(page.isTableHeader(coreTranslations.UI.ACTIONS_COLUMN), 'Missing actions column');

        // Individual actions
        page.getLine(datas.roles.coreAdmin.name).then(function(line) {
          var actionTd = line.all(by.css('td')).last();
          var actionButton = actionTd.element(by.css('button'));
          var removeActionElement = actionTd.element(by.cssContainingText('a', coreTranslations.UI.REMOVE));

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
    page = new RolePage();
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
