'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var openVeoApi = require('@openveo/api');
var e2e = require('@openveo/test').e2e;
var UserPage = process.require('tests/client/e2eTests/pages/UserPage.js');
var RolePage = process.require('tests/client/e2eTests/pages/RolePage.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var storage = process.require('app/server/storage.js');
var UserHelper = process.require('tests/client/e2eTests/helpers/UserHelper.js');
var RoleHelper = process.require('tests/client/e2eTests/helpers/RoleHelper.js');
var datas = process.require('tests/client/e2eTests/resources/data.json');
var TableAssert = e2e.asserts.TableAssert;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('User page', function() {
  var page;
  var tableAssert;
  var defaultUsers;
  var defaultRoles;
  var userHelper;
  var roleHelper;
  var rolePage;

  // Prepare page
  before(function() {
    var userProvider = new UserProvider(storage.getDatabase());
    var roleProvider = new RoleProvider(storage.getDatabase());
    userHelper = new UserHelper(userProvider);
    roleHelper = new RoleHelper(roleProvider);
    page = new UserPage(userProvider);
    rolePage = new RolePage(roleProvider);
    tableAssert = new TableAssert(page, userHelper);
    page.logAsAdmin();
    userHelper.getEntities().then(function(users) {
      defaultUsers = users;
    });
    roleHelper.getEntities().then(function(roles) {
      defaultRoles = roles;
    });
    page.load();
  });

  after(function() {
    page.logout();
  });

  // Remove all extra users after each test and reload the page
  afterEach(function() {
    process.protractorConf.startOpenVeo();
    userHelper.removeAllEntities(defaultUsers);
    roleHelper.removeAllEntities(defaultRoles);
    page.refresh();
  });

  it('should display page title', function() {
    assert.eventually.ok(page.pageTitleElement.isPresent());
  });

  it('should display page description', function() {
    assert.eventually.ok(page.pageDescriptionElement.isPresent());
  });

  it('should propose all available roles', function() {
    roleHelper.getRoles().then(function(roles) {
      assert.eventually.sameMembers(page.getAvailableRoles(), roles);
    });
  });

  it('should propose new roles added from /be/roles-list page', function() {
    var name = 'Test adding new role';
    rolePage.translations = page.translations;

    // Load roles page
    page.clickMenu(page.translations.CORE.MENU.ROLES);

    // Add a role
    rolePage.addLine(name);

    // Go back to users page
    rolePage.clickMenu(rolePage.translations.CORE.MENU.USERS);

    assert.eventually.include(page.getAvailableRoles(), name);
  });

  it('should be able to add / remove a user', function() {
    var name = 'test add / remove user';
    var email = 'test-add-remove@veo-labs.com';
    var password = 'test-add-remove-password';

    roleHelper.getRoles().then(function(roles) {

      // Add new user
      page.addLine(name, {
        email: email,
        password: password,
        passwordValidate: password,
        roles: roles
      });

      // Verify user information
      assert.eventually.equal(page.getLineFieldText(name, 'name'), name);
      assert.eventually.sameMembers(page.getUserRoles(name), roles);
      assert.eventually.equal(page.getLineFieldText(name, 'email'), email);

      // Test connection with the new user
      page.logAs({
        name: name,
        email: email,
        password: password
      });

      // Log back to admin
      page.logAsAdmin();
      page.load();

      // Remove user
      page.removeLine(name);

      assert.isRejected(page.getLine(name));
    });

  });

  it('should not be able to add a user without name', function() {
    var email = 'test-add-without-name@veo-labs.com';
    var password = 'test-add-without-name';

    assert.isRejected(page.addLine(null, {email: email, password: password, passwordValidate: password}));
    assert.eventually.notOk(page.addButtonElement.isEnabled());
  });

  it('should not be able to add a user without email', function() {
    var name = 'test add user without email';
    var password = 'test-add-without-email';

    assert.isRejected(page.addLine(name, {password: password, passwordValidate: password}));
    assert.eventually.notOk(page.addButtonElement.isEnabled());
  });

  it('should not be able to add a user without password', function() {
    var name = 'test add user without password';
    var email = 'test-add-without-password@veo-labs.com';
    var password = 'test-add-without-password';

    assert.isRejected(page.addLine(name, {email: email, passwordValidate: password}));
    assert.eventually.notOk(page.addButtonElement.isEnabled());
  });

  it('should not be able to add a user without password confirmation', function() {
    var name = 'test add user without password confirmation';
    var email = 'test-add-without-password-confirmation@veo-labs.com';
    var password = 'test-add-without-password-confirmation';

    assert.isRejected(page.addLine(name, {email: email, password: password}));
    assert.eventually.notOk(page.addButtonElement.isEnabled());
  });

  it('should display an error notification if password confirmation does not match password', function() {
    var name = 'test add user with wrong password confirmation';
    var email = 'test-add-with-wrong-password-confirmation@veo-labs.com';
    var password = 'test-add-with-wrong-password-confirmation';

    page.addLine(name, {email: email, password: password, passwordValidate: 'wrong'});
    page.getAlertMessages().then(function(messages) {
      assert.equal(messages.length, 1);
      assert.ok(messages[0].indexOf(page.translations.CORE.ERROR.SERVER) === 0);
    });
    page.closeAlerts();
  });

  it('should display an error if adding a user failed on server side', function() {
    var name = 'test add error';
    var email = 'test-add-error@veo-labs.com';
    var password = 'test-add-error';

    process.protractorConf.stopOpenVeo();
    page.addLine(name, {email: email, password: password, passwordValidate: password});

    assert.eventually.sameMembers(page.getAlertMessages(), [page.translations.CORE.ERROR.SERVER]);
    page.closeAlerts();

    process.protractorConf.startOpenVeo();
    assert.isRejected(page.getLine(name));
  });

  it('should display an error if removing a user failed on server side', function() {
    var name = 'test remove error';
    var email = 'test-remove-error@veo-labs.com';
    var password = 'test-remove-error';

    page.addLine(name, {email: email, password: password, passwordValidate: password});

    // Search for the line before stopping the server
    page.search({query: name});

    process.protractorConf.stopOpenVeo();
    page.removeLine(name);

    assert.eventually.sameMembers(page.getAlertMessages(), [page.translations.CORE.ERROR.SERVER]);
    page.closeAlerts();

    assert.isFulfilled(page.getLine(name));
  });

  it('should be able to edit a user', function() {
    var name = 'test edition';
    var newName = 'test edition renamed';
    var newEmail = 'test-edition-renamed@veo-labs.com';
    var password = 'test edition';

    roleHelper.getRoles().then(function(newRoles) {

      // Create user
      page.addLine(name, {
        email: 'test-edition@veo-labs.com',
        password: password,
        passwordValidate: password
      });

      // Edit user
      page.editUser(name, {name: newName, email: newEmail, roles: newRoles});

      // Verify user information
      assert.eventually.equal(page.getLineFieldText(newName, 'name'), newName);
      assert.eventually.sameMembers(page.getUserRoles(newName), newRoles);
      assert.eventually.equal(page.getLineFieldText(newName, 'email'), newEmail);

      // Test connection with new email
      page.logAs({
        name: newName,
        email: newEmail,
        password: password
      });

      // Log back to admin
      page.logAsAdmin();
      page.load();

    });
  });

  it('should be able to cancel when editing a user', function() {
    var name = 'test cancelling edition';
    var newName = 'test cancelling edition edited';
    var email = 'test-cancelling-edition@veo-labs.com';
    var newEmail = 'test-cancelling-edition-edited@veo-labs.com';

    roleHelper.getRoles().then(function(newRoles) {

      // Create user
      page.addLine(name, {
        email: email,
        password: 'test-cancelling-edition',
        passwordValidate: 'test-cancelling-edition'
      });

      // Edit user
      page.editUser(name, {name: newName, email: newEmail, roles: newRoles}, true);
      assert.eventually.ok(page.isOpenedLine(name));

      assert.eventually.equal(page.getLineFieldText(name, 'name'), name);
      assert.eventually.equal(page.getLineFieldText(name, 'email'), email);
      assert.eventually.equal(page.getLineFieldText(name, 'roles'), page.translations.CORE.UI.EMPTY);
    });

  });

  it('should indicate "Not set" if no roles for the user', function() {
    var name = 'test add without roles';
    var email = 'test-add-without-roles@veo-labs.com';
    var password = 'test-add-without-roles';

    page.addLine(name, {email: email, password: password, passwordValidate: password});
    assert.eventually.equal(page.getLineFieldText(name, 'roles'), page.translations.CORE.UI.EMPTY);
    page.removeLine(name);
  });

  it('should not be able to update a user without name', function() {
    var name = 'test edit user without name';
    var email = 'test-edit-without-name@veo-labs.com';
    var password = 'test-edit-without-name';

    page.addLine(name, {email: email, password: password, passwordValidate: password});
    assert.isRejected(page.editUser(name, {name: ''}));
  });

  it('should not be able to update a user without email', function() {
    var name = 'test edit user without email';
    var email = 'test-edit-without-email@veo-labs.com';
    var password = 'test-edit-without-email';

    // Add new user
    page.addLine(name, {email: email, password: password, passwordValidate: password});
    assert.isRejected(page.editUser(name, {email: ''}));
  });

  it('should not be able to remove a locked user', function() {
    assert.eventually.sameMembers(page.getLineActions(e2e.users.testSuperAdmin.name), [
      page.translations.CORE.UI.NO_ACTION
    ]);
  });

  it('should propose actions available for all selected lines', function() {
    var baseName = 'test common actions';

    userHelper.addEntities([
      {
        name: baseName + ' not locked',
        email: 'test-common-action-not-locked@veo-labs.com',
        password: 'test-common-action-not-locked',
        passwordValidate: 'test-common-action-not-locked'
      },
      {
        name: baseName + ' locked',
        email: 'test-common-action-locked@veo-labs.com',
        password: 'test-common-action-locked',
        passwordValidate: 'test-common-action-locked',
        locked: true
      }
    ]);

    page.search({query: baseName});

    page.selectAllLines();
    assert.eventually.sameMembers(page.getGlobalActions(), [
      page.translations.CORE.UI.NO_COMMON_ACTION
    ]);
  });

  it('should not be able to remove a locked user', function() {
    page.selectLine(datas.users.coreLocked.name);
    assert.eventually.sameMembers(page.getGlobalActions(), [
      page.translations.CORE.UI.NO_COMMON_ACTION
    ]);

    assert.eventually.sameMembers(page.getLineActions(datas.users.coreLocked.name), [
      page.translations.CORE.UI.NO_ACTION
    ]);
  });

  it('should refuse a removed user', function() {
    var name = 'test removed user';
    var email = 'test-removed-user@veo-labs.com';
    var password = 'test-removed-user';

    page.addLine(name, {email: email, password: password, passwordValidate: password});
    page.removeLine(name);

    assert.isRejected(page.logAs({
      name: name,
      email: email,
      password: password
    }));

    page.logAsAdmin();
    page.load();
  });

  it('should logout a connected user when removed', function() {
    var name = 'test logged out user';
    var email = 'test-logged-out-user@veo-labs.com';
    var password = 'test-logged-out-user';

    roleHelper.getRoles().then(function(roles) {

      page.addLine(name, {
        name: name,
        email: email,
        password: password,
        passwordValidate: 'test-logged-out-user',
        roles: roles
      });

      page.logAs({
        name: name,
        email: email,
        password: password
      });
      page.load();

      page.removeLine(name);

      assert.eventually.equal(browser.getCurrentUrl(), process.protractorConf.baseUrl + 'be/login');

      page.logAsAdmin();
      page.load();
    });
  });

  it('should be able to cancel when removing a user', function() {
    tableAssert.checkCancelRemove(page.translations.CORE.USERS.QUERY_FILTER);
  });

  it('should be able to sort by name', function() {
    tableAssert.checkSort(page.translations.CORE.USERS.NAME_COLUMN);
  });

  it('should have buttons to change the number of items per page', function() {
    tableAssert.checkItemsPerPage();
  });

  it('should be able to remove several lines simultaneously', function() {
    tableAssert.checkMassiveRemove();
  });

  it('should be paginated', function() {
    tableAssert.checkPagination();
  });

  it('should be able to select lines', function() {
    tableAssert.checkLinesSelection();
  });

  it('should have actions to remove users', function() {
    tableAssert.checkActions([
      page.translations.CORE.UI.REMOVE
    ]);
  });

  describe('search', function() {
    var lines;

    // Add lines to test search
    beforeEach(function() {
      return userHelper.addEntitiesAuto('test search', 2).then(function(addedLines) {
        lines = addedLines;
        return page.refresh();
      });
    });

    it('should be able to search by full name', function() {
      var expectedValues;
      var search = {query: lines[0].name};

      // Get all line values before search
      page.getLineValues(page.translations.CORE.USERS.NAME_COLUMN).then(function(values) {

        // Predict values
        expectedValues = values.filter(function(element) {
          return element === search.query;
        });

      }).then(function() {
        tableAssert.checkSearch(search, expectedValues, page.translations.CORE.USERS.NAME_COLUMN);
      });
    });

    it('should not be able to search by partial name', function() {
      var search = {query: lines[1].name.slice(0, 2)};

      page.search(search);
      assert.isRejected(page.getLineValues(page.translations.CORE.USERS.NAME_COLUMN));
    });

    it('should be case insensitive', function() {
      var expectedValues;
      var search = {query: lines[1].name.toUpperCase()};

      // Get all line values before search
      page.getLineValues(page.translations.CORE.USERS.NAME_COLUMN).then(function(values) {
        var regexp = new RegExp(search.query, 'i');

        // Predict values
        expectedValues = values.filter(function(element) {
          return regexp.test(element);
        });

      }).then(function() {
        tableAssert.checkSearch(search, expectedValues, page.translations.CORE.USERS.NAME_COLUMN);
      });
    });

    it('should be able to clear search', function() {
      var search = {query: lines[0].name};

      page.search(search);
      page.clearSearch();
      assert.isFulfilled(page.getLineValues(page.translations.CORE.USERS.NAME_COLUMN));
    });

    it('should be able to search by origin', function() {
      var expectedValues = [];
      var expectedUsers = [
        {
          name: 'test search by origin 42',
          email: 'test-search-by-origin1@test.test',
          originId: '42',
          originGroups: [],
          origin: openVeoApi.passport.STRATEGIES.LDAP,
          roles: []
        },
        {
          name: 'test search by origin 43',
          email: 'test-search-by-origin43@test.test',
          originId: '43',
          originGroups: [],
          origin: openVeoApi.passport.STRATEGIES.CAS,
          roles: []
        }
      ];

      expectedUsers.forEach(function(expectedUser) {
        userHelper.addThirdPartyUser(expectedUser);
      });

      page.refresh();

      // Build search query to search only the first item
      var search = {origin: page.translations.CORE.USERS['ORIGIN_' + expectedUsers[0].origin.toUpperCase()]};

      // Get all line details
      page.getAllLineDetails().then(function(datas) {
        var regexp = new RegExp(page.translations.CORE.USERS['ORIGIN_' + expectedUsers[0].origin.toUpperCase()]);

        // Predict values
        var filteredDatas = datas.filter(function(data) {
          return regexp.test(data.fields.origin);
        });

        for (var i = 0; i < filteredDatas.length; i++)
          expectedValues.push(filteredDatas[i].cells[1]);

      }).then(function() {
        return tableAssert.checkSearch(search, expectedValues, page.translations.CORE.USERS.NAME_COLUMN);
      });
    });

  });

});
