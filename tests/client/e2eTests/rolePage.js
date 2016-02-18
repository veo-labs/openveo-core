'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var e2e = require('@openveo/test').e2e;
var RolePage = process.require('tests/client/e2eTests/pages/RolePage.js');
var RoleModel = process.require('app/server/models/RoleModel.js');
var roleHelper = process.require('tests/client/e2eTests/helpers/roleHelper.js');
var TableAssert = e2e.asserts.TableAssert;

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Role page', function() {
  var page, tableAssert, defaultRoles;

  /**
   * Verifies permission of a role.
   *
   * @param {String} roleName The role name
   * @param {Array} rolePermissions List of permissions expected for the role
   * @return {Promise} Promise resolving when check is done
   */
  function checkPermissions(roleName, rolePermissions) {
    return page.getRolePermissions(roleName).then(function(permissions) {
      var j = 0;

      for (var i = 0; i < permissions.length; i++) {
        var permission = permissions[i];
        if (rolePermissions.indexOf(permission) >= 0)
          j++;
      }

      assert.equal(j, rolePermissions.length, 'Permissions of role ' + roleName + ' are incorrect');
    });
  }

  // Load roles page using super administrator account
  before(function() {
    page = new RolePage(new RoleModel());
    tableAssert = new TableAssert(page);
    page.logAsAdmin();
    roleHelper.getRoles().then(function(roles) {
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
    roleHelper.removeAllRoles(defaultRoles);
    page.refresh();
  });

  it('should display page title', function() {
    assert.eventually.ok(page.pageTitleElement.isDisplayed());
  });

  it('should display page description', function() {
    assert.eventually.ok(page.pageDescriptionElement.isDisplayed());
  });

  it('should be able to add / remove a role', function() {
    var name = 'test add / remove role';
    var corePermissions = page.getCorePermissions();
    page.addLine(name, corePermissions);
    assert.isFulfilled(page.getLine(name));
    checkPermissions(name, corePermissions);
    page.removeLine(name);
  });

  it('should not be able to add a new role with no name', function() {
    page.openAddForm();
    assert.eventually.notOk(page.addButtonElement.isEnabled());
    page.closeAddForm();
  });

  it('should not display buttons to change the number of items per page if roles lower than 6', function() {
    page.getTotalLines().then(function(totalRoles) {
      if (totalRoles < 6)
        assert.eventually.equal(page.itemsPerPageLinkElements.count(), 0);
    });
  });

  it('should be able to edit a role', function() {
    var name = 'test edition';
    var newName = 'test edition renamed';

    // Create line
    var corePermissions = page.getCorePermissions();
    page.addLine(name, corePermissions);

    var newRolePermissions = [
      page.translations.PERMISSIONS.UPDATE_ROLE_NAME
    ];

    page.editRole(name, {name: newName, permissions: newRolePermissions});
    checkPermissions(newName, newRolePermissions);
  });

  it('should be able to cancel when removing a role', function() {
    return tableAssert.checkCancelRemove();
  });

  it('should be able to sort by name', function() {
    return tableAssert.checkSort(page.translations.ROLES.NAME_COLUMN);
  });

  it('should have buttons to change the number of items per page', function() {
    return tableAssert.checkItemsPerPage();
  });

  it('should be able to remove several lines simultaneously', function() {
    return tableAssert.checkMassiveRemove();
  });

  it('should be paginated', function() {
    return tableAssert.checkPagination();
  });

  it('should be able to select lines', function() {
    return tableAssert.checkLinesSelection(page.translations.ROLES.NAME_COLUMN);
  });

  describe('Search', function() {
    var lines;

    // Add lines to test search
    before(function() {
      return page.addLinesByPassAuto('test search', 2).then(function(addedLines) {
        lines = addedLines;
      });
    });

    it('should be able to search by full name', function() {
      var expectedValues;
      var search = {name: lines[0].name};

      // Get all line values before search
      page.getLineValues(page.translations.ROLES.NAME_COLUMN).then(function(values) {

        // Predict values
        expectedValues = values.filter(function(element) {
          return element === search.name;
        });

      }).then(function() {
        tableAssert.checkSearch(search, expectedValues, page.translations.ROLES.NAME_COLUMN);
      });
    });

    it('should be able to search by partial name', function() {
      var expectedValues;
      var search = {name: lines[1].name.slice(0, 2)};

      // Get all line values before search
      page.getLineValues(page.translations.ROLES.NAME_COLUMN).then(function(values) {

        // Predict values
        expectedValues = values.filter(function(element) {
          return new RegExp(search.name).test(element);
        });

      }).then(function() {
        tableAssert.checkSearch(search, expectedValues, page.translations.ROLES.NAME_COLUMN);
      });
    });

    it('should be case sensitive', function() {
      var search = {name: lines[1].name.toUpperCase()};

      page.search(search);
      assert.isRejected(page.getLineValues(page.translations.ROLES.NAME_COLUMN));
    });

    it('should be able to clear search', function() {
      var search = {name: lines[0].name};

      page.search(search);
      page.clearSearch();
      assert.isFulfilled(page.getLineValues(page.translations.ROLES.NAME_COLUMN));
    });

  });

});
