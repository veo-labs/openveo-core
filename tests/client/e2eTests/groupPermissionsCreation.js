'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var RolePage = process.require('tests/client/e2eTests/pages/RolePage.js');
var GroupPage = process.require('tests/client/e2eTests/pages/GroupPage.js');
var RoleModel = process.require('app/server/models/RoleModel.js');
var GroupModel = process.require('app/server/models/GroupModel.js');
var RoleHelper = process.require('tests/client/e2eTests/helpers/RoleHelper.js');
var GroupHelper = process.require('tests/client/e2eTests/helpers/GroupHelper.js');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

describe('Group permissions creation', function() {
  var rolePage;
  var groupPage;
  var roleHelper;
  var groupHelper;
  var defaultRoles;
  var defaultGroups;

  // Load roles page using super administrator account
  before(function() {

    // Models
    var roleModel = new RoleModel();
    var groupModel = new GroupModel();

    // Helpers
    roleHelper = new RoleHelper(roleModel);
    groupHelper = new GroupHelper(groupModel);

    // Pages
    rolePage = new RolePage(roleModel);
    groupPage = new GroupPage(groupModel);

    roleHelper.getEntities().then(function(roles) {
      defaultRoles = roles;
    });
    groupHelper.getEntities().then(function(groups) {
      defaultGroups = groups;
    });
  });

  // Start each test on group page
  beforeEach(function() {
    groupPage.logAsAdmin();
    groupPage.load();
  });

  // Remove all extra application after each test and reload the page
  afterEach(function() {
    roleHelper.removeAllEntities(defaultRoles);
    groupHelper.removeAllEntities(defaultGroups);
    groupPage.load();
    groupPage.logout();
  });

  it('should automatically create permissions when creating group', function() {
    var name = 'test permissions creation';
    var description = 'test permissions creation';

    // Create group
    groupPage.addLine(name, description);

    // Navigate to role page
    rolePage.load();

    rolePage.openAddForm();
    rolePage.getGroupPermissions(name, rolePage.addFormElement).then(function(permissions) {
      assert.ok(permissions.indexOf(rolePage.translations.PERMISSIONS.GROUP_READ_NAME) >= 0);
      assert.ok(permissions.indexOf(rolePage.translations.PERMISSIONS.GROUP_UPDATE_NAME) >= 0);
      assert.ok(permissions.indexOf(rolePage.translations.PERMISSIONS.GROUP_DELETE_NAME) >= 0);
      assert.equal(permissions.length, 3);
    });

    groupPage.load();
    groupPage.removeLine(name);
  });

  it('should automatically delete group permissions when deleting a group', function() {
    var name = 'test permissions remove';
    var description = 'test permissions remove';

    // Create group
    groupPage.addLine(name, description);

    // Navigate to role page
    rolePage.load();
    rolePage.openAddForm();
    assert.isFulfilled(rolePage.getGroupPermissions(name, rolePage.addFormElement), 'Expected group ' + name);

    // Navigate to group page
    groupPage.load();
    groupPage.removeLine(name);

    // Navigate to role page
    rolePage.load();
    rolePage.openAddForm();
    assert.isRejected(rolePage.getGroupPermissions(name, rolePage.addFormElement), 'Unexpected group ' + name);
  });

  it('should automatically update group permissions when updating a group', function() {
    var name = 'test permissions update';
    var description = 'test permissions update';
    var newName = 'test permissions update new';
    var newDescription = 'test permissions update new';

    // Create group
    groupPage.addLine(name, description);

    // Navigate to role page
    rolePage.load();
    rolePage.openAddForm();
    assert.isFulfilled(rolePage.getGroupPermissions(name, rolePage.addFormElement), 'Expected group ' + name);

    // Navigate to group page
    groupPage.load();
    groupPage.editGroup(name, {name: newName, description: newDescription});

    // Navigate to role page
    rolePage.load();
    rolePage.openAddForm();
    assert.isFulfilled(rolePage.getGroupPermissions(newName, rolePage.addFormElement), 'Expected group ' + newName);
  });

});
