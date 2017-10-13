'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoApi = require('@openveo/api');
var SettingPage = process.require('tests/client/e2eTests/pages/SettingPage.js');
var SettingModel = process.require('app/server/models/SettingModel.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var storage = process.require('app/server/storage.js');
var SettingHelper = process.require('tests/client/e2eTests/helpers/SettingHelper.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Settings page translations', function() {
  var page;
  var settingHelper;
  var defaultSettings;

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
        var casGroupsAssociationField = page.getMatchField(coreTranslations.SETTINGS.CAS.GROUP_ASSOC_LABEL);
        var ldapGroupsAssociationField = page.getMatchField(coreTranslations.SETTINGS.LDAP.GROUP_ASSOC_LABEL);

        // Page info
        assert.eventually.equal(page.getTitle(), coreTranslations.SETTINGS.PAGE_TITLE);
        assert.eventually.equal(page.pageTitleFinder.getText(), coreTranslations.SETTINGS.TITLE);
        assert.eventually.equal(page.pageDescriptionFinder.getText(), coreTranslations.SETTINGS.INFO);

        // Sections
        assert.eventually.ok(page.isSectionPresent(coreTranslations.SETTINGS.CAS.TITLE));
        assert.eventually.ok(page.isSectionPresent(coreTranslations.SETTINGS.LDAP.TITLE));

        // CAS groups association field
        assert.eventually.equal(casGroupsAssociationField.getLabel(),
                                coreTranslations.SETTINGS.CAS.GROUP_ASSOC_LABEL);
        assert.eventually.equal(casGroupsAssociationField.getDescription(),
                                coreTranslations.SETTINGS.CAS.GROUP_ASSOC_DESC);
        assert.eventually.equal(casGroupsAssociationField.getInputPlaceholder(),
                                coreTranslations.SETTINGS.CAS.GROUP_ASSOC_INPUT);
        assert.eventually.equal(casGroupsAssociationField.getTagsPlaceholder(),
                                coreTranslations.SETTINGS.CAS.GROUP_ASSOC_TAGS);

        // LDAP groups association field
        assert.eventually.equal(ldapGroupsAssociationField.getLabel(),
                                coreTranslations.SETTINGS.LDAP.GROUP_ASSOC_LABEL);
        assert.eventually.equal(ldapGroupsAssociationField.getDescription(),
                                coreTranslations.SETTINGS.LDAP.GROUP_ASSOC_DESC);
        assert.eventually.equal(ldapGroupsAssociationField.getInputPlaceholder(),
                                coreTranslations.SETTINGS.LDAP.GROUP_ASSOC_INPUT);
        assert.eventually.equal(ldapGroupsAssociationField.getTagsPlaceholder(),
                                coreTranslations.SETTINGS.LDAP.GROUP_ASSOC_TAGS);

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
    var settingModel = new SettingModel(new SettingProvider(storage.getDatabase()));
    settingHelper = new SettingHelper(settingModel);

    page = new SettingPage();
    page.logAsAdmin();

    settingHelper.getEntities().then(function(settings) {
      defaultSettings = settings;
    });

    page.load();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  // Remove added settings and reload page after each test
  afterEach(function() {
    settingHelper.removeAllEntities(defaultSettings);
    page.refresh();
  });

  it('should be available in different languages', function() {

    // Add empty CAS and LDAP settings to display association fields
    settingHelper.addEntities([
      {
        id: 'core-' + openVeoApi.passport.STRATEGIES.CAS,
        value: [{
          group: '',
          roles: []
        }]
      },
      {
        id: 'core-' + openVeoApi.passport.STRATEGIES.LDAP,
        value: [{
          group: '',
          roles: []
        }]
      }
    ]);

    checkTranslations();
  });

});
