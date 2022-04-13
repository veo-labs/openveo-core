'use strict';

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
var MenuPage = process.require('tests/client/e2eTests/pages/MenuPage.js');
var data = process.require('tests/client/e2eTests/build/data.json');

// Load assertion library
var assert = chai.assert;
chai.use(chaiAsPromised);

/**
 * Gets a user with or without the specified permission.
 *
 * @param {String} permission The id of the permission
 * @param {Boolean} [without] true to find a user without the specified permission, false
 * to find a user with the specified permission
 * @return {Object} A user with or without the specified permission
 */
function getUserByPermission(permission, without) {
  for (var id in data.users) {
    var found = without;

    if (!data.users[id].roles) continue;

    for (var i = 0; i < data.users[id].roles.length; i++) {
      var roleId = data.users[id].roles[i];

      if (without && data.roles[roleId].permissions.indexOf(permission) >= 0) {

        // Found a role but didn't expect one
        // Go to next user
        found = false;

      } else if (!without && data.roles[roleId].permissions.indexOf(permission) >= 0) {

        // Found a user with the permission
        found = true;
        break;

      }

    }

    if (found)
      return data.users[id];
  }

  return null;
}

describe('Left menu', function() {
  var page;

  // Prepare page
  before(function() {
    page = new MenuPage();
    page.logAs(data.users.coreGuest);
    page.load();
  });

  // Logout after tests
  after(function() {
    page.logout();
  });

  // Reload page after each test
  afterEach(function() {
    page.refresh();
  });

  it('should not display items for a user without permission', function() {
    this.timeout(400000);
    var menu = process.protractorConf.getMenu();

    function checkPermissions(menu) {
      menu.forEach(function(menuItem) {
        if (menuItem.permission) {

          // Get a user with and without permission to access the menu item
          var userWithoutPermission = getUserByPermission(menuItem.permission, true);
          var userWithPermission = getUserByPermission(menuItem.permission);
          var translatedMenuLabel = eval('page.translations.' + menuItem.label);

          if (userWithoutPermission) {
            page.logAs(userWithoutPermission);
            page.load();
            assert.isRejected(page.clickMenu(translatedMenuLabel));
          }

          if (userWithPermission) {
            page.logAs(userWithPermission);
            page.load();
            assert.isFulfilled(page.clickMenu(translatedMenuLabel));
          }
        }

        if (menuItem.subMenu)
          checkPermissions(menuItem.subMenu);
      });
    }

    checkPermissions(menu);
  });
});
