'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var e2e = require('@openveo/test').e2e;
var RolePage = process.require('tests/client/e2eTests/pages/RolePage.js');
var RoleModel = process.require('app/server/models/RoleModel.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var storage = process.require('app/server/storage.js');
var RoleHelper = process.require('tests/client/e2eTests/helpers/RoleHelper.js');
var TableAssert = e2e.asserts.TableAssert;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Role page', function() {
  var page, tableAssert, defaultRoles, roleHelper;

  // Load roles page using super administrator account
  before(function() {
    var roleModel = new RoleModel(new RoleProvider(storage.getDatabase()));
    roleHelper = new RoleHelper(roleModel);
    page = new RolePage(roleModel);
    tableAssert = new TableAssert(page, roleHelper);
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

  // Remove all extra application after each test and reload the page
  afterEach(function() {
    process.protractorConf.startOpenVeo();
    roleHelper.removeAllEntities(defaultRoles);
    page.refresh();
  });

  it('should display page title', function() {
    assert.eventually.ok(page.pageTitleElement.isDisplayed());
  });

  it('should display page description', function() {
    assert.eventually.ok(page.pageDescriptionElement.isDisplayed());
  });

  it('should propose groups of permissions as defined in configuration files and added groups', function() {
    page.openAddForm();
    roleHelper.getPermissionsGroups(page.translations).then(function(groups) {
      assert.eventually.sameMembers(page.getPermissionGroups(page.addFormElement), groups);
    });
    page.closeAddForm();
  });

  it('should propose permissions as defined in configuration files and permissions from added groups', function() {
    page.openAddForm();
    page.getPermissionGroups(page.addFormElement).then(function(groups) {
      groups.forEach(function(group) {
        roleHelper.getGroupPermissions(group, page.translations).then(function(expectedPermissions) {
          assert.eventually.sameMembers(page.getGroupPermissions(group, page.addFormElement), expectedPermissions);
        });
      });
    });
    page.closeAddForm();
  });

  it('should be able to add / remove a role', function() {
    var name = 'test add / remove role';

    roleHelper.getPermissions(page.translations).then(function(permissions) {
      page.addLine(name, permissions);
      assert.eventually.equal(page.getLineFieldText(name, 'name'), name);
      assert.eventually.sameDeepMembers(page.getRolePermissions(name), permissions);
      page.removeLine(name);
      assert.isRejected(page.getLine(name));
    });
  });

  it('should indicate "Not set" if no permission in the role', function() {
    var name = 'test add no permission roles';

    page.addLine(name);
    roleHelper.getPermissionsGroups(page.translations).then(function(groups) {
      var permissions = [];

      // Build permissions descriptors
      groups.forEach(function(group) {
        permissions.push({
          name: page.translations.CORE.UI.EMPTY,
          group: group
        });
      });

      assert.eventually.sameDeepMembers(page.getRolePermissions(name), permissions);
    });
    page.removeLine(name);
  });

  it('should not be able to add a new role without a name', function() {
    page.openAddForm();
    assert.eventually.notOk(page.addButtonElement.isEnabled());
    page.closeAddForm();
  });

  it('should display an error if adding a role failed on server side', function() {
    var name = 'test add error';

    process.protractorConf.stopOpenVeo();
    page.addLine(name);

    assert.eventually.sameMembers(page.getAlertMessages(), [page.translations.CORE.ERROR.SERVER]);
    page.closeAlerts();

    process.protractorConf.startOpenVeo();
    assert.isRejected(page.getLine(name));
  });

  it('should display an error if removing a role failed on server side', function() {
    var name = 'test remove error';

    page.addLine(name);

    // Search for the line before stopping the server
    page.search({query: name});

    process.protractorConf.stopOpenVeo();
    page.removeLine(name);

    assert.eventually.sameMembers(page.getAlertMessages(), [page.translations.CORE.ERROR.SERVER]);
    page.closeAlerts();

    assert.isFulfilled(page.getLine(name));
  });

  it('should be able to edit a role', function() {
    var name = 'test edition';
    var newName = 'test edition renamed';
    var newPermissions = [
      {
        name: page.translations.CORE.PERMISSIONS.UPDATE_ROLES_NAME,
        group: page.translations.CORE.PERMISSIONS.GROUP_ROLES
      }
    ];

    roleHelper.getPermissionsGroups(page.translations).then(function(groups) {
      var expectedPermissions = [];

      // Build permissions descriptors
      groups.forEach(function(group) {
        if (group === page.translations.CORE.PERMISSIONS.GROUP_ROLES) {
          expectedPermissions.push(newPermissions[0]);
        } else {
          expectedPermissions.push({
            name: page.translations.CORE.UI.EMPTY,
            group: group
          });
        }
      });

      page.addLine(name);
      page.editRole(name, {name: newName, permissions: newPermissions});
      assert.eventually.sameDeepMembers(page.getRolePermissions(newName), expectedPermissions);
      page.removeLine(newName);
    });
  });

  it('should be able to cancel when editing a role', function() {
    var name = 'test edition';
    var newName = 'test edition renamed';
    var newPermissions = [
      {
        name: page.translations.CORE.PERMISSIONS.UPDATE_ROLES_NAME,
        group: page.translations.CORE.PERMISSIONS.GROUP_ROLES
      }
    ];

    roleHelper.getPermissionsGroups(page.translations).then(function(groups) {
      var expectedPermissions = [];

      // Build permissions descriptors
      groups.forEach(function(group) {
        expectedPermissions.push({
          name: page.translations.CORE.UI.EMPTY,
          group: group
        });
      });

      page.addLine(name);
      page.editRole(name, {name: newName, permissions: newPermissions}, true);
      assert.eventually.ok(page.isOpenedLine(name));
      assert.eventually.equal(page.getLineFieldText(name, 'name'), name);
      assert.eventually.sameDeepMembers(page.getRolePermissions(name), expectedPermissions);
    });
  });

  it('should not be able to update a role without a name', function() {
    var name = 'test edition without a name';

    // Create line
    page.addLine(name);

    assert.isRejected(page.editRole(name, {name: ''}));
  });

  it('should be able to cancel when removing a role', function() {
    tableAssert.checkCancelRemove();
  });

  it('should be able to sort by name', function() {
    tableAssert.checkSort(page.translations.CORE.ROLES.NAME_COLUMN);
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

  it('should have actions to remove roles', function() {
    tableAssert.checkActions([
      page.translations.CORE.UI.REMOVE
    ]);
  });

  describe('search', function() {
    var lines;

    // Add lines to test search
    beforeEach(function() {
      return roleHelper.addEntitiesAuto('test search', 2).then(function(addedLines) {
        lines = addedLines;
        return page.refresh();
      });
    });

    it('should be able to search by full name', function() {
      var expectedValues;
      var search = {query: lines[0].name};

      // Get all line values before search
      page.getLineValues(page.translations.CORE.ROLES.NAME_COLUMN).then(function(values) {

        // Predict values
        expectedValues = values.filter(function(element) {
          return element === search.query;
        });

      }).then(function() {
        tableAssert.checkSearch(search, expectedValues, page.translations.CORE.ROLES.NAME_COLUMN);
      });
    });

    it('should not be able to search by partial name', function() {
      var search = {query: lines[1].name.slice(0, 2)};

      page.search(search);
      assert.isRejected(page.getLineValues(page.translations.CORE.ROLES.NAME_COLUMN));
    });

    it('should be case insensitive', function() {
      var expectedValues;
      var search = {query: lines[1].name.toUpperCase()};

      // Get all line values before search
      page.getLineValues(page.translations.CORE.ROLES.NAME_COLUMN).then(function(values) {
        var regexp = new RegExp(search.query, 'i');

        // Predict values
        expectedValues = values.filter(function(element) {
          return regexp.test(element);
        });

      }).then(function() {
        tableAssert.checkSearch(search, expectedValues, page.translations.CORE.ROLES.NAME_COLUMN);
      });
    });

    it('should be able to clear search', function() {
      var search = {query: lines[0].name};

      page.search(search);
      page.clearSearch();
      assert.isFulfilled(page.getLineValues(page.translations.CORE.ROLES.NAME_COLUMN));
    });

  });

});
