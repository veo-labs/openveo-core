'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoApi = require('@openveo/api');
var LoginPage = process.require('tests/client/e2eTests/pages/LoginPage.js');
var storage = process.require('app/server/storage.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var UserHelper = process.require('tests/client/e2eTests/helpers/UserHelper.js');
var SettingHelper = process.require('tests/client/e2eTests/helpers/SettingHelper.js');
var RoleHelper = process.require('tests/client/e2eTests/helpers/RoleHelper.js');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Login page', function() {
  var page;
  var defaultUsers;
  var defaultSettings;
  var defaultRoles;
  var userHelper;
  var settingHelper;
  var roleHelper;

  // Prepare page
  before(function() {
    var userProvider = new UserProvider(storage.getDatabase());
    var settingProvider = new SettingProvider(storage.getDatabase());
    var roleProvider = new RoleProvider(storage.getDatabase());
    userHelper = new UserHelper(userProvider);
    settingHelper = new SettingHelper(settingProvider);
    roleHelper = new RoleHelper(roleProvider);
    page = new LoginPage();
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

  // Reload page after each test and remove added entities
  afterEach(function() {
    page.logout();
    userHelper.removeAllEntities(defaultUsers);
    settingHelper.removeAllEntities(defaultSettings);
    roleHelper.removeAllEntities(defaultRoles);
    page.refresh();
  });

  it('should display an error message if trying to log without email and password', function() {
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
    assert.eventually.ok(page.isLoginOnError());
    assert.eventually.ok(page.isPasswordOnError());
  });

  it('should display an error message if trying to log without password', function() {
    page.setLogin('john');
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
    assert.eventually.ok(page.isLoginOnError());
    assert.eventually.ok(page.isPasswordOnError());
    assert.eventually.equal(page.getLogin(), '');
    assert.eventually.equal(page.getPassword(), '');
  });

  it('should display an error message if trying to log without email', function() {
    page.setPassword('password');
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
    assert.eventually.ok(page.isLoginOnError());
    assert.eventually.ok(page.isPasswordOnError());
    assert.eventually.equal(page.getLogin(), '');
    assert.eventually.equal(page.getPassword(), '');
  });

  it('should display an error message if trying to log with a wrong account', function() {
    page.setLogin('something is wrong');
    page.setPassword('in the kingdom of denmark');
    page.submit();
    assert.eventually.ok(page.errorMessageElement.isDisplayed());
    assert.eventually.ok(page.isLoginOnError());
    assert.eventually.ok(page.isPasswordOnError());
    assert.eventually.equal(page.getLogin(), '');
    assert.eventually.equal(page.getPassword(), '');
  });

  it('should no longer consider fields on error when modified', function() {
    page.submit();
    page.setLogin('email');
    page.setPassword('password');
    page.unfocus();
    assert.eventually.notOk(page.isLoginOnError());
    assert.eventually.notOk(page.isPasswordOnError());
  });

  it('should display a 404 not found page if accessing a wrong public URI as an anonymous user', function() {
    browser.driver.get(process.protractorConf.baseUrl + 'wrongUri');
    assert.eventually.equal(browser.driver.findElement(by.css('h1')).getText(), 'Not Found');
    assert.eventually.equal(
      browser.driver.findElement(by.css('p')).getText(),
      'The requested URL /wrongUri was not found on this server.'
    );
    page.load();
  });

  it('should redirect to login page if accessing a wrong back end URI as an anonymous user', function() {
    browser.get(process.protractorConf.baseUrl + 'be/wrongUri');
    assert.eventually.equal(browser.getCurrentUrl(), process.protractorConf.baseUrl + 'be/login');
  });

  describe('without CAS', function() {

    // Reload OpenVeo without authentication mechanisms
    before(function() {
      process.protractorConf.restartOpenVeo(false, false, true);
      page.refresh();
    });

    // Reload OpenVeo with authentication mechanisms after tests
    after(function() {
      process.protractorConf.restartOpenVeo();
      page.refresh();
    });

    it('should not display the CAS button nor the separator', function() {
      assert.eventually.notOk(page.casButtonElement.isPresent());
      assert.eventually.notOk(page.separatorElement.isPresent());
    });

  });

  describe('with CAS', function() {
    var userIdAttribute;
    var userNameAttribute;
    var userEmailAttribute;
    var userGroupAttribute;

    before(function() {
      userIdAttribute = process.protractorConf.casConf.userIdAttribute;
      userNameAttribute = process.protractorConf.casConf.userNameAttribute;
      userEmailAttribute = process.protractorConf.casConf.userEmailAttribute;
      userGroupAttribute = process.protractorConf.casConf.userGroupAttribute;
    });

    it('should display the CAS button and the separator', function() {
      assert.eventually.ok(page.casButtonElement.isPresent());
      assert.eventually.equal(
        page.casButtonElement.getAttribute('href'),
        'authenticate/cas'
      );
      assert.eventually.ok(page.separatorElement.isPresent());
    });

    it('should be able to create a new user, with roles, when connecting with the CAS user', function() {
      var casUser = process.protractorConf.getCasUser('core-guest');
      var casUserGroups = openVeoApi.util.evaluateDeepObjectProperties(userGroupAttribute, casUser);
      var expectedRoleIds = [];
      var roles;
      var matches = [];

      // Create as many roles as CAS user groups
      roleHelper.addEntitiesAuto('CAS user role', casUserGroups.length).then(function(addedRoles) {
        roles = addedRoles;

        for (var i = 0; i < casUserGroups.length; i++) {
          matches.push({
            group: casUserGroups[i],
            roles: [roles[i].id]
          });
          expectedRoleIds.push(roles[i].id);
        }

        // Add CAS matches to configuration
        settingHelper.addEntities([
          {
            id: 'core-' + openVeoApi.passport.STRATEGIES.CAS,
            value: matches
          }
        ]);

        page.logToCasAs(casUser);

        userHelper.getEntities(
          new ResourceFilter()
            .equal('origin', openVeoApi.passport.STRATEGIES.CAS)
            .equal('originId', openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, casUser))
        ).then(function(entities) {
          var entity = entities[0];

          assert.equal(entities.length, 1, 'Wrong number of CAS users');
          assert.equal(entity.name, openVeoApi.util.evaluateDeepObjectProperties(userNameAttribute, casUser));
          assert.equal(entity.email, openVeoApi.util.evaluateDeepObjectProperties(userEmailAttribute, casUser));
          assert.equal(entity.originId, openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, casUser));
          assert.sameMembers(
            entity.originGroups,
            openVeoApi.util.evaluateDeepObjectProperties(userGroupAttribute, casUser)
          );
          assert.sameMembers(entity.roles, expectedRoleIds);
        });
      });

    });

    it('should not create the user if it already exists', function() {
      var casUser = process.protractorConf.getCasUser('core-guest');

      userHelper.addThirdPartyUser({
        name: openVeoApi.util.evaluateDeepObjectProperties(userNameAttribute, casUser),
        email: openVeoApi.util.evaluateDeepObjectProperties(userEmailAttribute, casUser),
        originId: openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, casUser),
        originGroups: openVeoApi.util.evaluateDeepObjectProperties(userGroupAttribute, casUser),
        origin: openVeoApi.passport.STRATEGIES.CAS,
        roles: []
      });

      page.logToCasAs(casUser);

      userHelper.getEntities(
        new ResourceFilter()
          .equal('origin', openVeoApi.passport.STRATEGIES.CAS)
          .equal('originId', openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, casUser))
      ).then(function(entities) {
        assert.equal(entities.length, 1, 'Wrong number of CAS users');
      });
    });

    it('should update user if modified on CAS server', function() {
      var expectedRoleId;
      var casUser = process.protractorConf.getCasUser('core-guest');
      var casUserGroups = openVeoApi.util.evaluateDeepObjectProperties(userGroupAttribute, casUser);

      userHelper.addThirdPartyUser({
        name: 'New name',
        email: 'new.mail.test@test.test',
        originId: openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, casUser),
        originGroups: ['test-group1', 'test-group2'],
        origin: openVeoApi.passport.STRATEGIES.CAS,
        roles: []
      });

      roleHelper.addEntitiesAuto('CAS user role', 1).then(function(addedRoles) {
        var roles = addedRoles;
        expectedRoleId = roles[0].id;

        settingHelper.addEntities([
          {
            id: 'core-' + openVeoApi.passport.STRATEGIES.CAS,
            value: [{
              group: casUserGroups[0],
              roles: [roles[0].id]
            }]
          }
        ]);

        page.logToCasAs(casUser);

        userHelper.getEntities(
          new ResourceFilter()
            .equal('origin', openVeoApi.passport.STRATEGIES.CAS)
            .equal('originId', openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, casUser))
        ).then(function(entities) {
          var entity = entities[0];

          assert.equal(entities.length, 1, 'Wrong number of CAS users');
          assert.equal(entity.roles.length, 1, 'Wrong number of roles');
          assert.equal(entity.roles[0], expectedRoleId, 'Wrong role');
          assert.equal(entity.name, openVeoApi.util.evaluateDeepObjectProperties(userNameAttribute, casUser));
          assert.equal(entity.email, openVeoApi.util.evaluateDeepObjectProperties(userEmailAttribute, casUser));
          assert.equal(entity.originId, openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, casUser));
          assert.sameMembers(entity.originGroups, casUserGroups);
        });
      });

    });

  });

  describe('with LDAP', function() {
    var userIdAttribute;
    var userNameAttribute;
    var userEmailAttribute;
    var userGroupAttribute;

    // Reload OpenVeo with authentication mechanisms
    before(function() {
      userIdAttribute = process.protractorConf.ldapConf.userIdAttribute;
      userNameAttribute = process.protractorConf.ldapConf.userNameAttribute;
      userEmailAttribute = process.protractorConf.ldapConf.userEmailAttribute;
      userGroupAttribute = process.protractorConf.ldapConf.userGroupAttribute;
    });

    it('should be able to create a new user, with roles, when connecting with the LDAP user', function() {
      var ldapUser = process.protractorConf.getLdapUser('cn=core-guest,dc=test');
      var ldapUserGroups = openVeoApi.util.evaluateDeepObjectProperties(userGroupAttribute, ldapUser).split(',');
      var expectedRoleIds = [];
      var roles;
      var matches = [];

      // Create as many roles as LDAP user groups
      roleHelper.addEntitiesAuto('LDAP user role', ldapUserGroups.length).then(function(addedRoles) {
        roles = addedRoles;

        for (var i = 0; i < ldapUserGroups.length; i++) {
          matches.push({
            group: ldapUserGroups[i],
            roles: [roles[i].id]
          });
          expectedRoleIds.push(roles[i].id);
        }

        // Add LDAP matches to configuration
        settingHelper.addEntities([
          {
            id: 'core-' + openVeoApi.passport.STRATEGIES.LDAP,
            value: matches
          }
        ]);

        page.logToLdapAs(ldapUser);

        userHelper.getEntities(
          new ResourceFilter()
            .equal('origin', openVeoApi.passport.STRATEGIES.LDAP)
            .equal('originId', openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, ldapUser))
        ).then(function(entities) {
          var entity = entities[0];

          assert.equal(entities.length, 1, 'Wrong number of LDAP users');
          assert.equal(entity.name, openVeoApi.util.evaluateDeepObjectProperties(userNameAttribute, ldapUser));
          assert.equal(entity.email, openVeoApi.util.evaluateDeepObjectProperties(userEmailAttribute, ldapUser));
          assert.equal(entity.originId, openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, ldapUser));
          assert.sameMembers(entity.originGroups, ldapUserGroups);
          assert.sameMembers(entity.roles, expectedRoleIds);
        });
      });

    });

    it('should not create the user if it already exists', function() {
      var ldapUser = process.protractorConf.getLdapUser('cn=core-guest,dc=test');

      userHelper.addThirdPartyUser({
        name: openVeoApi.util.evaluateDeepObjectProperties(userNameAttribute, ldapUser),
        email: openVeoApi.util.evaluateDeepObjectProperties(userEmailAttribute, ldapUser),
        originId: openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, ldapUser),
        originGroups: openVeoApi.util.evaluateDeepObjectProperties(userGroupAttribute, ldapUser),
        origin: openVeoApi.passport.STRATEGIES.LDAP,
        roles: []
      });

      page.logToLdapAs(ldapUser);

      userHelper.getEntities(
        new ResourceFilter()
          .equal('origin', openVeoApi.passport.STRATEGIES.LDAP)
          .equal('originId', openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, ldapUser))
      ).then(function(entities) {
        assert.equal(entities.length, 1, 'Wrong number of LDAP users');
      });
    });

    it('should update user if modified on LDAP server', function() {
      var expectedRoleId;
      var ldapUser = process.protractorConf.getLdapUser('cn=core-guest,dc=test');
      var ldapUserGroups = openVeoApi.util.evaluateDeepObjectProperties(userGroupAttribute, ldapUser).split(',');

      userHelper.addThirdPartyUser({
        name: 'New name',
        email: 'new.mail.test@test.test',
        originId: openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, ldapUser),
        originGroups: ['test-group1', 'test-group2'],
        origin: openVeoApi.passport.STRATEGIES.LDAP,
        roles: []
      });

      roleHelper.addEntitiesAuto('LDAP user role', 1).then(function(addedRoles) {
        var roles = addedRoles;
        expectedRoleId = roles[0].id;

        settingHelper.addEntities([
          {
            id: 'core-' + openVeoApi.passport.STRATEGIES.LDAP,
            value: [{
              group: ldapUserGroups[0],
              roles: [roles[0].id]
            }]
          }
        ]);

        page.logToLdapAs(ldapUser);

        userHelper.getEntities(
          new ResourceFilter()
            .equal('origin', openVeoApi.passport.STRATEGIES.LDAP)
            .equal('originId', openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, ldapUser))
        ).then(function(entities) {
          var entity = entities[0];

          assert.equal(entities.length, 1, 'Wrong number of LDAP users');
          assert.equal(entity.roles.length, 1, 'Wrong number of roles');
          assert.equal(entity.roles[0], expectedRoleId, 'Wrong role');
          assert.equal(entity.name, openVeoApi.util.evaluateDeepObjectProperties(userNameAttribute, ldapUser));
          assert.equal(entity.email, openVeoApi.util.evaluateDeepObjectProperties(userEmailAttribute, ldapUser));
          assert.equal(entity.originId, openVeoApi.util.evaluateDeepObjectProperties(userIdAttribute, ldapUser));
          assert.sameMembers(entity.originGroups, ldapUserGroups);
        });
      });

    });

  });

});
