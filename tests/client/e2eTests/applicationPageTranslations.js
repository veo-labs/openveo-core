'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var i18n = process.require('tests/client/e2eTests/i18n/i18n.js');
var ApplicationPage = process.require('tests/client/e2eTests/pages/ApplicationPage.js');
var datas = process.require('tests/client/e2eTests/database/data.json');
var browserExt = require('@openveo/test').e2e.browser;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Application page translations', function() {
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
        assert.eventually.equal(page.getTitle(), translations.APPLICATIONS.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), translations.APPLICATIONS.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), translations.APPLICATIONS.INFO);
        assert.eventually.equal(page.addFormLabelElement.getText(), translations.APPLICATIONS.ADD_APPLICATION);

        // Add form translations
        page.openAddForm();
        var addFormFields = page.getAddFormFields(page.addFormElement);
        var nameField = addFormFields.name;
        var scopesField = addFormFields.scopes;
        assert.eventually.equal(nameField.getLabel(), translations.APPLICATIONS.FORM_ADD_NAME);
        assert.eventually.equal(nameField.getDescription(), translations.APPLICATIONS.FORM_ADD_NAME_DESC);
        assert.eventually.equal(scopesField.getLabel(), translations.APPLICATIONS.FORM_ADD_SCOPES);
        assert.eventually.equal(scopesField.getDescription(), translations.APPLICATIONS.FORM_ADD_SCOPES_DESC);
        assert.eventually.equal(page.addButtonElement.getText(), translations.UI.FORM_ADD);
        page.closeAddForm();

        // Search engine translations
        page.searchLinkElement.getText().then(function(text) {
          assert.equal(text.trim(), translations.UI.SEARCH_BY);
        });

        var searchFields = page.getSearchFields(page.searchFormElement);
        var searchNameField = searchFields.name;
        assert.eventually.equal(searchNameField.getLabel(), translations.APPLICATIONS.TITLE_FILTER);

        // All actions translations
        page.setSelectAllMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), translations.UI.SELECT_ALL);

        page.selectAllLines();
        browserExt.click(page.actionsButtonElement);
        var removeActionElement = page.actionsElement.element(by.cssContainingText('a', translations.UI.REMOVE));
        assert.eventually.ok(removeActionElement.isDisplayed(), 'Missing all remove action');

        // Headers translations
        assert.eventually.ok(page.isTableHeader(translations.APPLICATIONS.NAME_COLUMN), 'Missing name column');
        assert.eventually.ok(page.isTableHeader(translations.UI.ACTIONS_COLUMN), 'Missing actions column');

        // Individual actions
        page.getLine(datas.applications.coreApplicationsGuest.name).then(function(line) {
          var actionTd = line.trElement.all(by.css('td')).last();
          var actionButton = actionTd.element(by.css('button'));
          var removeAction = actionTd.element(by.cssContainingText('a', translations.UI.REMOVE));

          browserExt.click(actionButton).then(function() {
            assert.eventually.ok(removeAction.isDisplayed(), 'Missing remove action');
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
    page = new ApplicationPage();
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
