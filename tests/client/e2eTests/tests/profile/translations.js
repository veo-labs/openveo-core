'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');
var ProfilePage = process.require('tests/client/e2eTests/pages/ProfilePage.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var UserHelper = process.require('tests/client/e2eTests/helpers/UserHelper.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Profile page', function() {
  var page;

  // Prepare page
  before(function() {
    page = new ProfilePage();
  });

  describe('of a local user', function() {

    // Log with a local user and load profile page
    before(function() {
      page.logAs(datas.users.coreAdmin);
      page.load();
    });

    // Reload page after each test
    afterEach(function() {
      page.refresh();
    });

    // Logout after tests
    after(function() {
      page.logout();
    });

    /**
     * Checks translations for a local user.
     *
     * It checks user edition form and password edition form.
     *
     * @param {Number} [index] Index of the language to test in the list of languages
     * @return {Promise} Promise resolving when translations have been tested
     */
    function checkTranslations(index) {
      index = index || 0;
      var languages = page.getLanguages();

      if (index < languages.length) {
        return page.selectLanguage(languages[index]).then(function() {

          // Form edit button translation
          assert.eventually.equal(page.editUserElement.getText(), page.translations.CORE.UI.FORM_EDIT);

          return page.activateEdition();
        }).then(function() {
          var coreTranslations = page.translations.CORE;

          // Account form translations
          assert.eventually.equal(page.getTitle(), coreTranslations.PROFILES.PAGE_TITLE);
          assert.eventually.equal(page.pageTitleElement.getText(), coreTranslations.PROFILES.TITLE);
          assert.eventually.equal(page.pageDescriptionElement.getText(), coreTranslations.PROFILES.INFO);
          assert.eventually.equal(page.accountTitleElement.getText(), coreTranslations.PROFILES.ATTR_USER_ACCOUNT);
          assert.eventually.equal(page.userNameLabelElement.getText(), coreTranslations.PROFILES.ATTR_NAME + ' *');
          assert.eventually.equal(page.userEmailLabelElement.getText(), coreTranslations.PROFILES.ATTR_EMAIL);
          assert.eventually.equal(page.userRolesLabelElement.getText(), coreTranslations.PROFILES.ATTR_ROLES);
          assert.eventually.equal(page.submitUserElement.getText(), coreTranslations.UI.FORM_SAVE);
          assert.eventually.equal(page.cancelUserElement.getText(), coreTranslations.UI.FORM_CANCEL);

          // Password form translations
          assert.eventually.equal(page.passwordTitleElement.getText(), coreTranslations.PROFILES.ATTR_MODIFY_PASSWORD);
          assert.eventually.equal(page.passwordLabelElement.getText(), coreTranslations.PROFILES.ATTR_PASSWORD);
          assert.eventually.equal(page.confirmPasswordLabelElement.getText(),
                                  coreTranslations.PROFILES.ATTR_CONFIRM_PASSWORD);
          assert.eventually.equal(page.submitPasswordElement.getText(), coreTranslations.UI.FORM_SAVE);
          assert.eventually.equal(page.cancelPasswordElement.getText(), coreTranslations.UI.FORM_CANCEL);

          return page.cancelEdition();
        }).then(function() {
          return checkTranslations(++index);
        });
      } else {
        return protractor.promise.fulfilled();
      }
    }

    it('should be available in different languages', function() {
      return checkTranslations();
    });

  });

  describe('of an external user', function() {
    var userHelper;
    var defaultUsers;

    // Log with a local user and load the profile page
    before(function() {
      var userProvider = new UserProvider(storage.getDatabase());
      userHelper = new UserHelper(userProvider);

      page.logAs(datas.users.coreAdmin);
      page.load();

      userHelper.getEntities().then(function(users) {
        defaultUsers = users;
      });
    });

    // Remove all entities added during tests
    afterEach(function() {
      userHelper.removeAllEntities(defaultUsers);
    });

    // Logout after tests
    after(function() {
      page.logout();
    });

    /**
     * Checks translations for an external user.
     *
     * External user profile page only displays a list of properties with values.
     * It checks that label have the appropriate translation and eventually property default values.
     *
     * @param {String} strategyId The id of the third party provider
     * @param {Number} [index] Index of the language to test in the list of languages
     * @return {Promise} Promise resolving when translations have been tested
     */
    function checkTranslations(strategyId, index) {
      index = index || 0;
      var languages = page.getLanguages();

      if (index < languages.length) {
        return page.selectLanguage(languages[index]).then(function() {
          var coreTranslations = page.translations.CORE;
          var strategyIdUpperCase = strategyId.toUpperCase();

          // Labels
          assert.eventually.equal(page.userNameInfoLabelElement.getText(), coreTranslations.PROFILES.ATTR_NAME);
          assert.eventually.equal(page.userEmailInfoLabelElement.getText(), coreTranslations.PROFILES.ATTR_EMAIL);
          assert.eventually.equal(page.userOriginInfoLabelElement.getText(), coreTranslations.PROFILES.ATTR_ORIGIN);
          assert.eventually.equal(page.userRolesInfoLabelElement.getText(), coreTranslations.PROFILES.ATTR_ROLES);

          // Values
          assert.eventually.equal(page.userRolesInfoElement.getText(), coreTranslations.PROFILES.NO_ROLES);
          assert.eventually.equal(page.getUserOrigin(strategyId),
                                  coreTranslations.PROFILES['ORIGIN_' + strategyIdUpperCase]);

          return browser.waitForAngular();
        }).then(function() {
          return checkTranslations(strategyId, ++index);
        });
      } else {
        return protractor.promise.fulfilled();
      }
    }

    describe('of type CAS', function() {

      it('should be available in different languages', function() {
        var casUser = process.protractorConf.getCasUser('core-guest');
        page.logToCasAs(casUser);
        page.load();

        return checkTranslations(openVeoApi.passport.STRATEGIES.CAS);
      });

    });

    describe('of type LDAP', function() {

      it('should be available in different languages', function() {
        var ldapUser = process.protractorConf.getLdapUser('cn=core-guest,dc=test');
        page.logToLdapAs(ldapUser);
        page.load();

        return checkTranslations(openVeoApi.passport.STRATEGIES.LDAP);
      });

    });

  });

});
