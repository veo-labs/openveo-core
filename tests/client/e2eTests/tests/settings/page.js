'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');
var SettingPage = process.require('tests/client/e2eTests/pages/SettingPage.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var RoleHelper = process.require('tests/client/e2eTests/helpers/RoleHelper.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var SettingHelper = process.require('tests/client/e2eTests/helpers/SettingHelper.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Setting page', function() {
  var page;
  var defaultRoles;
  var defaultSettings;
  var roleHelper;
  var settingHelper;

  // Prepare page
  before(function() {
    var roleProvider = new RoleProvider(storage.getDatabase());
    var settingProvider = new SettingProvider(storage.getDatabase());
    roleHelper = new RoleHelper(roleProvider);
    settingHelper = new SettingHelper(settingProvider);
    page = new SettingPage();

    page.logAsAdmin();
    page.load();

    roleHelper.getEntities().then(function(roles) {
      defaultRoles = roles;
    });

    settingHelper.getEntities().then(function(settings) {
      defaultSettings = settings;
    });
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  // Remove entities added during tests
  afterEach(function() {
    roleHelper.removeAllEntities(defaultRoles);
    settingHelper.removeAllEntities(defaultSettings);
  });

  it('should display page title', function() {
    assert.eventually.ok(page.pageTitleFinder.isPresent());
  });

  it('should display page description', function() {
    assert.eventually.ok(page.pageDescriptionFinder.isPresent());
  });

  describe('without CAS', function() {

    // Reload OpenVeo without authentication mechanisms
    before(function() {
      process.protractorConf.restartOpenVeo(false, false, true);
      page.refresh();
    });

    // Reload OpenVeo with authentication mechanisms
    after(function() {
      process.protractorConf.restartOpenVeo();
    });

    it('should not display the CAS configuration', function() {
      assert.isRejected(page.getMatchField(page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL).getElement());
    });

    it('should not display the CAS section', function() {
      assert.eventually.notOk(page.isSectionPresent(page.translations.CORE.SETTINGS.CAS.TITLE));
    });

  });

  describe('without LDAP', function() {

    // Reload OpenVeo without authentication mechanisms
    before(function() {
      process.protractorConf.restartOpenVeo(false, false, true);
      page.refresh();
    });

    // Reload OpenVeo with authentication mechanisms
    after(function() {
      process.protractorConf.restartOpenVeo();
    });

    it('should not display the LDAP configuration', function() {
      assert.isRejected(page.getMatchField(page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL).getElement());
    });

    it('should not display the LDAP section', function() {
      assert.eventually.notOk(page.isSectionPresent(page.translations.CORE.SETTINGS.LDAP.TITLE));
    });

  });

  describe('with CAS', function() {

    it('should be able to associate a CAS group with OpenVeo roles', function() {
      var expectedRolePrefix = 'Test CAS group association role';
      var expectedTags = [];
      var expectedText = 'Test CAS group association text';
      var expectedNumberOfRoles = 2;
      var expectedMatches = [];

      for (var i = 0; i < expectedNumberOfRoles; i++)
        expectedTags.push(expectedRolePrefix + ' ' + i);

      expectedMatches.push({
        text: expectedText,
        tags: expectedTags
      });

      roleHelper.addEntitiesAuto(expectedRolePrefix, expectedNumberOfRoles).then(function(addedRoles) {
        page.refresh();
        page.setMatchFieldValue(page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL, expectedMatches);
        page.saveSettings();
        page.refresh();

        page.getMatchFieldValue(page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL).then(function(matches) {
          var match = matches[0];
          assert.equal(matches.length, 1, 'Unexpected number of associations');
          assert.equal(match.text, expectedText, 'Wrong association text');
          assert.sameMembers(match.tags, expectedTags, 'Wrong association tags');
        });
      });
    });

    it('should not be able to associate CAS groups with OpenVeo roles which are not known', function() {
      var expectedText = 'Test CAS group association text';

      page.setMatchFieldValue(page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL, [
        {
          text: expectedText,
          tags: ['unknown role']
        }
      ]);
      page.getMatchFieldValue(page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL).then(function(matches) {
        var match = matches[0];
        assert.equal(matches.length, 1, 'Unexpected number of associations');
        assert.equal(match.text, expectedText, 'Wrong association text');
        assert.equal(match.tags.length, 0, 'Unexpected roles');
      });
    });

    it('should be able to associate several CAS groups with OpenVeo roles', function() {
      var expectedRolePrefix = 'Test CAS group association role';
      var expectedText = 'Test CAS group association text';
      var expectedMatches = [
        {
          text: expectedText + ' 0',
          tags: [expectedRolePrefix + ' 0']
        },
        {
          text: expectedText + ' 1',
          tags: [expectedRolePrefix + ' 1']
        }
      ];

      roleHelper.addEntitiesAuto(expectedRolePrefix, 2).then(function(addedRoles) {
        page.refresh();
        page.setMatchFieldValue(page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL, expectedMatches);
        page.saveSettings();
        page.refresh();

        page.getMatchFieldValue(page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL).then(function(matches) {
          assert.equal(matches.length, 2, 'Unexpected number of associations');

          for (var i = 0; i < matches.length; i++) {
            var match = matches[i];

            assert.equal(match.text, expectedMatches[i].text, 'Wrong association text');
            assert.sameMembers(match.tags, expectedMatches[i].tags, 'Wrong association tags');
          }

        });
      });
    });

    it('should be able to remove associations', function() {
      settingHelper.addEntities([
        {
          id: 'core-' + openVeoApi.passport.STRATEGIES.CAS,
          value: [
            {
              group: 'some group',
              roles: ['role 1', 'role 2']
            }
          ]
        }
      ]);

      page.refresh();
      page.clearMatchField(page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL);
      page.saveSettings();
      page.refresh();

      page.getMatchFieldValue(page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL).then(function(matches) {
        assert.equal(matches.length, 0, 'Unexpected associations');
      });
    });

    it('should be able to use autocompletion to enter roles', function() {
      var expectedRolePrefix = 'Test CAS group association role';
      var expectedTags = [expectedRolePrefix + ' 0'];
      var expectedText = 'Test CAS group association text';
      var expectedMatches = [{
        text: expectedText,
        tags: expectedTags
      }];
      var availableOptions = [{
        name: expectedTags[0],
        value: expectedTags[0]
      }];

      roleHelper.addEntitiesAuto(expectedRolePrefix, 1).then(function(addedRoles) {
        page.refresh();
        page.setMatchFieldValueUsingAutoCompletion(
          page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL,
          expectedMatches,
          availableOptions
        );
        page.saveSettings();
        page.refresh();

        page.getMatchFieldValue(page.translations.CORE.SETTINGS.CAS.GROUP_ASSOC_LABEL).then(function(matches) {
          var match = matches[0];
          assert.equal(matches.length, 1, 'Unexpected number of associations');
          assert.equal(match.text, expectedText, 'Wrong association text');
          assert.sameMembers(match.tags, expectedTags, 'Wrong association tags');
        });
      });
    });

  });

  describe('with LDAP', function() {

    it('should be able to associate an LDAP group with OpenVeo roles', function() {
      var expectedRolePrefix = 'Test LDAP group association role';
      var expectedTags = [];
      var expectedText = 'Test LDAP group association text';
      var expectedNumberOfRoles = 2;
      var expectedMatches = [];

      for (var i = 0; i < expectedNumberOfRoles; i++)
        expectedTags.push(expectedRolePrefix + ' ' + i);

      expectedMatches.push({
        text: expectedText,
        tags: expectedTags
      });

      roleHelper.addEntitiesAuto(expectedRolePrefix, expectedNumberOfRoles).then(function(addedRoles) {
        page.refresh();
        page.setMatchFieldValue(page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL, expectedMatches);
        page.saveSettings();
        page.refresh();

        page.getMatchFieldValue(page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL).then(function(matches) {
          var match = matches[0];
          assert.equal(matches.length, 1, 'Unexpected number of associations');
          assert.equal(match.text, expectedText, 'Wrong association text');
          assert.sameMembers(match.tags, expectedTags, 'Wrong association tags');
        });
      });
    });

    it('should not be able to associate LDAP groups with OpenVeo roles which are not known', function() {
      var expectedText = 'Test LDAP group association text';

      page.setMatchFieldValue(page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL, [
        {
          text: expectedText,
          tags: ['unknown role']
        }
      ]);
      page.getMatchFieldValue(page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL).then(function(matches) {
        var match = matches[0];
        assert.equal(matches.length, 1, 'Unexpected number of associations');
        assert.equal(match.text, expectedText, 'Wrong association text');
        assert.equal(match.tags.length, 0, 'Unexpected roles');
      });
    });

    it('should be able to associate several LDAP groups with OpenVeo roles', function() {
      var expectedRolePrefix = 'Test LDAP group association role';
      var expectedText = 'Test LDAP group association text';
      var expectedMatches = [
        {
          text: expectedText + ' 0',
          tags: [expectedRolePrefix + ' 0']
        },
        {
          text: expectedText + ' 1',
          tags: [expectedRolePrefix + ' 1']
        }
      ];

      roleHelper.addEntitiesAuto(expectedRolePrefix, 2).then(function(addedRoles) {
        page.refresh();
        page.setMatchFieldValue(page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL, expectedMatches);
        page.saveSettings();
        page.refresh();

        page.getMatchFieldValue(page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL).then(function(matches) {
          assert.equal(matches.length, 2, 'Unexpected number of associations');

          for (var i = 0; i < matches.length; i++) {
            var match = matches[i];

            assert.equal(match.text, expectedMatches[i].text, 'Wrong association text');
            assert.sameMembers(match.tags, expectedMatches[i].tags, 'Wrong association tags');
          }

        });
      });
    });

    it('should be able to remove associations', function() {
      settingHelper.addEntities([
        {
          id: 'core-' + openVeoApi.passport.STRATEGIES.LDAP,
          value: [
            {
              group: 'some group',
              roles: ['role 1', 'role 2']
            }
          ]
        }
      ]);

      page.refresh();
      page.clearMatchField(page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL);
      page.saveSettings();
      page.refresh();

      page.getMatchFieldValue(page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL).then(function(matches) {
        assert.equal(matches.length, 0, 'Unexpected associations');
      });
    });

    it('should be able to use autocompletion to enter roles', function() {
      var expectedRolePrefix = 'Test LDAP group association role';
      var expectedTags = [expectedRolePrefix + ' 0'];
      var expectedText = 'Test LDAP group association text';
      var expectedMatches = [{
        text: expectedText,
        tags: expectedTags
      }];
      var availableOptions = [{
        name: expectedTags[0],
        value: expectedTags[0]
      }];

      roleHelper.addEntitiesAuto(expectedRolePrefix, 1).then(function(addedRoles) {
        page.refresh();
        page.setMatchFieldValueUsingAutoCompletion(
          page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL,
          expectedMatches,
          availableOptions
        );
        page.saveSettings();
        page.refresh();

        page.getMatchFieldValue(page.translations.CORE.SETTINGS.LDAP.GROUP_ASSOC_LABEL).then(function(matches) {
          var match = matches[0];
          assert.equal(matches.length, 1, 'Unexpected number of associations');
          assert.equal(match.text, expectedText, 'Wrong association text');
          assert.sameMembers(match.tags, expectedTags, 'Wrong association tags');
        });
      });
    });

  });

});
