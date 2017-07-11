'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var RolePage = process.require('tests/client/e2eTests/pages/RolePage.js');
var RoleModel = process.require('app/server/models/RoleModel.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var storage = process.require('app/server/storage.js');
var RoleHelper = process.require('tests/client/e2eTests/helpers/RoleHelper.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Role page translations', function() {
  var page;
  var roleHelper;
  var defaultRoles;
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
        assert.eventually.equal(page.getTitle(), coreTranslations.ROLES.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleElement.getText(), coreTranslations.ROLES.TITLE);
        assert.eventually.equal(page.pageDescriptionElement.getText(), coreTranslations.ROLES.INFO);
        assert.eventually.equal(page.addFormLabelElement.getText(), coreTranslations.ROLES.ADD_ROLE);

        // Add form translations
        page.openAddForm();
        var addFormFields = page.getAddFormFields(page.addFormElement);
        var nameField = addFormFields.name;
        assert.eventually.equal(nameField.getLabel(), coreTranslations.ROLES.FORM_ADD_NAME);
        assert.eventually.equal(nameField.getDescription(), coreTranslations.ROLES.FORM_ADD_NAME_DESC);
        assert.eventually.equal(page.addButtonElement.getText(), coreTranslations.UI.FORM_ADD);

        page.getPermissionGroups(page.addFormElement).then(function(groups) {
          groups.forEach(function(group) {
            roleHelper.getGroupPermissions(group, page.translations).then(function(expectedPermissions) {
              assert.eventually.sameMembers(page.getGroupPermissions(group, page.addFormElement), expectedPermissions);
            });
          });
        });

        page.closeAddForm();

        // Search engine translations
        page.searchLinkElement.getText().then(function(text) {
          assert.equal(text.trim(), coreTranslations.UI.SEARCH_BY);
        });

        // Some not locked roles
        page.search({query: baseName});

        var searchFields = page.getSearchFields(page.searchFormElement);
        var searchQueryField = searchFields.query;
        assert.eventually.equal(searchQueryField.getLabel(), coreTranslations.ROLES.QUERY_FILTER);

        // All actions translations
        page.setSelectAllMouseOver();
        assert.eventually.equal(page.popoverElement.getAttribute('content'), coreTranslations.UI.SELECT_ALL);

        page.selectAllLines();

        assert.eventually.sameMembers(page.getGlobalActions(), [
          coreTranslations.UI.REMOVE
        ]);

        // Headers translations
        assert.eventually.ok(page.isTableHeader(coreTranslations.ROLES.NAME_COLUMN), 'Missing name column');
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

  // Load page
  before(function() {
    var roleModel = new RoleModel(new RoleProvider(storage.getDatabase()));
    roleHelper = new RoleHelper(roleModel);
    page = new RolePage();
    page.logAsAdmin();
    roleHelper.getEntities().then(function(roles) {
      defaultRoles = roles;
    });
    page.load();
  });

  // Logout
  after(function() {
    page.logout();
  });

  // Reload page after each test
  afterEach(function() {
    roleHelper.removeAllEntities(defaultRoles);
    page.refresh();
  });

  it('should be available in different languages', function() {
    roleHelper.addEntities([
      {
        name: baseName + ' 1',
        permissions: []
      },
      {
        name: baseName + ' 2',
        permissions: []
      }
    ]);

    checkTranslations();
  });

});
