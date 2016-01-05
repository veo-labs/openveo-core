'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var i18n = process.require('tests/client/e2eTests/i18n/i18n.js');
var RolePage = process.require('tests/client/e2eTests/pages/RolePage.js');
var datas = process.require('tests/client/e2eTests/database/data.json');
var browserExt = require('@openveo/test').e2e.browser;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Role page translations', function() {
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
        assert.eventually.equal(page.getTitle(), translations.ROLES.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), translations.ROLES.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), translations.ROLES.INFO);
        assert.eventually.equal(page.addFormLabelElement.getText(), translations.ROLES.ADD_ROLE);

        // Add form translations
        page.openAddForm();
        var addFormFields = page.getAddFormFields(page.addFormElement);
        var coreGroups = page.getCorePermissionGroups();
        var corePermissions = page.getCorePermissions();
        var nameField = addFormFields.name;
        assert.eventually.equal(nameField.getLabel(), translations.ROLES.FORM_ADD_NAME);
        assert.eventually.equal(nameField.getDescription(), translations.ROLES.FORM_ADD_NAME_DESC);
        assert.eventually.equal(page.addButtonElement.getText(), translations.UI.FORM_ADD);

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
          assert.equal(text.trim(), translations.UI.SEARCH_BY);
        });

        var searchFields = page.getSearchFields(page.searchFormElement);
        var searchNameField = searchFields.name;
        assert.eventually.equal(searchNameField.getLabel(), translations.ROLES.TITLE_FILTER);

        // All actions translations
        page.setSelectAllMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), translations.UI.SELECT_ALL);

        page.selectAllLines();
        browserExt.click(page.actionsButtonElement);
        var removeActionElement = page.actionsElement.element(by.cssContainingText('a', translations.UI.REMOVE));
        assert.eventually.ok(removeActionElement.isDisplayed(), 'Missing all remove action');

        // Headers translations
        assert.eventually.ok(page.isTableHeader(translations.ROLES.NAME_COLUMN), 'Missing name column');
        assert.eventually.ok(page.isTableHeader(translations.UI.ACTIONS_COLUMN), 'Missing actions column');

        // Individual actions
        page.getLine(datas.roles.coreAdmin.name).then(function(line) {
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
    page = new RolePage();
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
