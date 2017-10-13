'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoApi = require('@openveo/api');
var ProfilePage = process.require('tests/client/e2eTests/pages/ProfilePage.js');
var storage = process.require('app/server/storage.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');
var UserModel = process.require('app/server/models/UserModel.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var SettingModel = process.require('app/server/models/SettingModel.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var RoleModel = process.require('app/server/models/RoleModel.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var UserHelper = process.require('tests/client/e2eTests/helpers/UserHelper.js');
var SettingHelper = process.require('tests/client/e2eTests/helpers/SettingHelper.js');
var RoleHelper = process.require('tests/client/e2eTests/helpers/RoleHelper.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Profile page', function() {
  var page;
  var defaultUsers;
  var defaultSettings;
  var defaultRoles;
  var userHelper;
  var settingHelper;
  var roleHelper;

  // Prepare page and save actual entities
  before(function() {
    var userModel = new UserModel(new UserProvider(storage.getDatabase()));
    var settingModel = new SettingModel(new SettingProvider(storage.getDatabase()));
    var roleModel = new RoleModel(new RoleProvider(storage.getDatabase()));
    userHelper = new UserHelper(userModel);
    settingHelper = new SettingHelper(settingModel);
    roleHelper = new RoleHelper(roleModel);
    page = new ProfilePage();

    page.logAs(datas.users.coreAdmin);
    page.load();

    userHelper.getEntities().then(function(users) {
      defaultUsers = users;
    });

    settingHelper.getEntities().then(function(settings) {
      defaultSettings = settings;
    });

    roleHelper.getEntities().then(function(roles) {
      defaultRoles = roles;
    });
  });

  // Remove all entities added during tests
  afterEach(function() {
    userHelper.removeAllEntities(defaultUsers);
    settingHelper.removeAllEntities(defaultSettings);
    roleHelper.removeAllEntities(defaultRoles);
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  describe('of local user', function() {

    // Log with a user and load the profile page
    before(function() {
      page.logAs(datas.users.coreAdmin);
      page.load();
    });

    // Reload page after each test
    afterEach(function() {
      page.refresh();
    });

    it('should display page title', function() {
      assert.eventually.ok(page.pageTitleElement.isPresent());
    });

    it('should display page description', function() {
      assert.eventually.ok(page.pageDescriptionElement.isPresent());
    });

    it('should display user name, email and roles', function() {
      var user = page.getUser();

      // Build user expected roles
      var expectedRolesNames = [];
      user.roles.forEach(function(roleId) {
        expectedRolesNames.push(datas.roles[roleId].name);
      });

      assert.eventually.equal(page.userNameElement.getText(), user.name);
      assert.eventually.equal(page.userEmailElement.getText(), user.email);

      page.userRolesElement.getText().then(function(text) {
        var roles = text.split(', ');
        assert.includeMembers(roles, expectedRolesNames);
      });

      assert.eventually.ok(page.editUserElement.isPresent());
    });

    it('should display form to change password', function() {
      assert.eventually.ok(page.passwordElement.isPresent(), 'Password field is not present');
      assert.eventually.ok(page.confirmPasswordElement.isPresent(), 'Password confirmation field is not present');
      assert.eventually.ok(page.submitPasswordElement.isPresent(), 'Submit button is not present');
      assert.eventually.ok(page.cancelPasswordElement.isPresent(), 'Cancel button is not present');
    });

    it('should be able to change user name', function() {
      var newAdminName = 'test changing user name';
      page.setNameAndSave(newAdminName);
      assert.eventually.equal(page.userNameElement.getText(), newAdminName);
      page.setNameAndSave(page.getUser().name);
      assert.eventually.equal(page.userNameElement.getText(), page.getUser().name);
    });

    it('should not be able to save user without a name', function() {
      assert.isRejected(page.setNameAndSave());
    });

    it('should not be able to change email and roles', function() {
      page.activateEdition();
      assert.eventually.equal(page.userEmailElement.getText(), page.getUser().email);
      assert.eventually.isNotEmpty(page.userRolesElement.getText());
    });

    it('should be able to cancel user edition', function() {
      page.activateEdition();
      page.setName('test cancelling edition');
      page.cancelEdition();
      assert.eventually.equal(page.userNameElement.getText(), page.getUser().name);
    });

    it('should be able to change user password', function() {
      var newPassword = 'test-changing-password';
      var oldPassword = page.getUser().password;

      page.changePassword(newPassword);
      assert.eventually.equal(page.passwordElement.getText(), '');
      assert.eventually.equal(page.confirmPasswordElement.getText(), '');
      assert.eventually.notOk(page.submitPasswordElement.isEnabled());

      page.logAs({
        name: page.getUser().name,
        email: page.getUser().email,
        password: newPassword
      });
      page.load();
      browser.sleep(10000);
      page.changePassword(oldPassword);
    });

    it('should not be able to save password if the two fields are not equal', function() {
      page.setPassword('test-password-confirmation');
      page.setConfirmPassword('test-password-confirmation-different');
      assert.eventually.notOk(page.submitPasswordElement.isEnabled());
    });

    it('should clear password form when hitting cancel', function() {
      page.setPassword('test-cancelling-password-edition');
      page.setConfirmPassword('test-cancelling-password-edition');
      page.cancelPasswordElement.click();
      assert.eventually.equal(page.passwordElement.getText(), '');
      assert.eventually.equal(page.confirmPasswordElement.getText(), '');
      assert.eventually.notOk(page.submitPasswordElement.isEnabled());
    });

  });

  describe('of super administrator', function() {

    // Log with the super administrator and load the profile page
    before(function() {
      page.logAsAdmin();
      return page.load();
    });

    // Refresh page after each test
    afterEach(function() {
      return page.refresh();
    });

    // Logout after tests
    after(function() {
      return page.logout();
    });

    it('should not be able to change password', function() {
      assert.eventually.notOk(page.passwordElement.isPresent(), 'Password field is present');
      assert.eventually.notOk(page.confirmPasswordElement.isPresent(), 'Password confirmation field is present');
      assert.eventually.notOk(page.submitPasswordElement.isPresent(), 'Submit button is present');
      assert.eventually.notOk(page.cancelPasswordElement.isPresent(), 'Cancel button is present');
    });

    it('should not be able to edit user information', function() {
      assert.isRejected(page.activateEdition());
    });

  });

  describe('of locked user', function() {

    // Log with a locked user and load profile page
    before(function() {
      page.logAs(datas.users.coreLocked);
      return page.load();
    });

    // Refresh page after each test
    afterEach(function() {
      return page.refresh();
    });

    // Logout after tests
    after(function() {
      return page.logout();
    });

    it('should not be able to change password', function() {
      assert.eventually.notOk(page.passwordElement.isPresent(), 'Password field is present');
      assert.eventually.notOk(page.confirmPasswordElement.isPresent(), 'Password confirmation field is present');
      assert.eventually.notOk(page.submitPasswordElement.isPresent(), 'Submit button is present');
      assert.eventually.notOk(page.cancelPasswordElement.isPresent(), 'Cancel button is present');
    });

    it('should not be able to edit user information', function() {
      assert.isRejected(page.activateEdition());
    });

  });

  describe('of user without roles', function() {

    // Log as guest and load profile page
    before(function() {
      page.logAs(datas.users.coreGuest);
      return page.load();
    });

    // Refresh page after each test
    afterEach(function() {
      return page.refresh();
    });

    // Logout after tests
    after(function() {
      return page.logout();
    });

    it('should not display roles', function() {
      assert.eventually.notOk(page.userRolesElement.isPresent());
    });

  });

  describe('of a CAS user', function() {
    var userNameAttribute;
    var userEmailAttribute;
    var userGroupAttribute;

    // Prepare page
    before(function() {
      userNameAttribute = process.protractorConf.casConf.userNameAttribute;
      userEmailAttribute = process.protractorConf.casConf.userEmailAttribute;
      userGroupAttribute = process.protractorConf.casConf.userGroupAttribute;
    });

    it('should not display user form nor password form', function() {
      var casUser = process.protractorConf.getCasUser('core-guest');
      page.logToCasAs(casUser);
      page.load();

      assert.eventually.notOk(page.userFormElement.isPresent());
      assert.eventually.notOk(page.passwordFormElement.isPresent());
    });

    it('should display user informations', function() {
      var casUser = process.protractorConf.getCasUser('core-guest');
      var casUserGroups = openVeoApi.util.evaluateDeepObjectProperties(userGroupAttribute, casUser);
      var expectedName = openVeoApi.util.evaluateDeepObjectProperties(userNameAttribute, casUser);
      var expectedEmail = openVeoApi.util.evaluateDeepObjectProperties(userEmailAttribute, casUser);
      var expectedRolePrefix = 'CAS user role';
      var expectedRoles = [];
      var roles;
      var matches = [];

      // Create as many roles as CAS user groups
      roleHelper.addEntitiesAuto(expectedRolePrefix, casUserGroups.length).then(function(addedRoles) {
        roles = addedRoles;

        for (var i = 0; i < casUserGroups.length; i++) {
          matches.push({
            group: casUserGroups[i],
            roles: [roles[i].id]
          });
          expectedRoles.push(roles[i].name);
        }

        // Add CAS matches to configuration
        settingHelper.addEntities([
          {
            id: 'core-' + openVeoApi.passport.STRATEGIES.CAS,
            value: matches
          }
        ]);

        page.logToCasAs(casUser);
        page.load();

        assert.eventually.equal(page.userNameInfoElement.getText(), expectedName);
        assert.eventually.equal(page.userEmailInfoElement.getText(), expectedEmail);
        assert.eventually.equal(page.userRolesInfoElement.getText(), expectedRoles.join(', '));
        assert.eventually.equal(page.getUserOrigin(openVeoApi.passport.STRATEGIES.CAS),
                                page.translations.CORE.PROFILES.ORIGIN_CAS);
      });
    });

  });

  describe('of an LDAP user', function() {
    var userNameAttribute;
    var userEmailAttribute;
    var userGroupAttribute;

    // Prepare page
    before(function() {
      userNameAttribute = process.protractorConf.ldapConf.userNameAttribute;
      userEmailAttribute = process.protractorConf.ldapConf.userEmailAttribute;
      userGroupAttribute = process.protractorConf.ldapConf.userGroupAttribute;
    });

    it('should not display user form nor password form', function() {
      var ldapUser = process.protractorConf.getLdapUser('cn=core-guest,dc=test');
      page.logToLdapAs(ldapUser);
      page.load();

      assert.eventually.notOk(page.userFormElement.isPresent());
      assert.eventually.notOk(page.passwordFormElement.isPresent());
    });

    it('should display user informations', function() {
      var ldapUser = process.protractorConf.getLdapUser('cn=core-guest,dc=test');
      var ldapUserGroups = openVeoApi.util.evaluateDeepObjectProperties(userGroupAttribute, ldapUser).split(',');
      var expectedName = openVeoApi.util.evaluateDeepObjectProperties(userNameAttribute, ldapUser);
      var expectedEmail = openVeoApi.util.evaluateDeepObjectProperties(userEmailAttribute, ldapUser);
      var expectedRolePrefix = 'LDAP user role';
      var expectedRoles = [];
      var roles;
      var matches = [];

      // Create as many roles as LDAP user groups
      roleHelper.addEntitiesAuto(expectedRolePrefix, ldapUserGroups.length).then(function(addedRoles) {
        roles = addedRoles;

        for (var i = 0; i < ldapUserGroups.length; i++) {
          matches.push({
            group: ldapUserGroups[i],
            roles: [roles[i].id]
          });
          expectedRoles.push(roles[i].name);
        }

        // Add LDAP matches to configuration
        settingHelper.addEntities([
          {
            id: 'core-' + openVeoApi.passport.STRATEGIES.LDAP,
            value: matches
          }
        ]);

        page.logToLdapAs(ldapUser);
        page.load();

        assert.eventually.equal(page.userNameInfoElement.getText(), expectedName);
        assert.eventually.equal(page.userEmailInfoElement.getText(), expectedEmail);
        assert.eventually.equal(page.userRolesInfoElement.getText(), expectedRoles.join(', '));
        assert.eventually.equal(page.getUserOrigin(openVeoApi.passport.STRATEGIES.LDAP),
                                page.translations.CORE.PROFILES.ORIGIN_LDAPAUTH);
      });
    });

  });
});
