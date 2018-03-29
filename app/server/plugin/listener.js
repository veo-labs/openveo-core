'use strict';

/**
 * @module core-plugin
 */

var async = require('async');
var openVeoApi = require('@openveo/api');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var GroupProvider = process.require('app/server/providers/GroupProvider.js');
var storage = process.require('app/server/storage.js');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

/**
 * Sets event listeners on core.
 *
 * @class listener
 * @static
 */

/**
 * Handles hook when roles have been deleted.
 *
 * Deleted roles have to be removed from users.
 *
 * @method onRolesDeleted
 * @static
 * @async
 * @param {Array} ids The list of deleted role ids
 * @param {Function} callback Function to call when it's done
 *  - **Error** An error if something went wrong, null otherwise
 */
module.exports.onRolesDeleted = function(ids, callback) {
  var users;
  var coreApi = process.api.getCoreApi();
  var database = coreApi.getDatabase();
  var userProvider = new UserProvider(database);

  async.series([

    // Find all users containing, at least, one of the deleted roles
    function(callback) {
      var orFilters = [];
      ids.forEach(function(roleId) {
        orFilters.push(new ResourceFilter().equal('roles', roleId));
      });

      userProvider.getAll(
        new ResourceFilter().or(orFilters),
        {
          include: ['id', 'roles']
        },
        {
          id: 'desc'
        },
        function(error, fetchedUsers) {
          users = fetchedUsers;
          callback(error);
        }
      );
    },

    // Remove roles from users
    function(callback) {
      if (!users || !users.length) return callback();
      var asyncFunctions = [];

      users.forEach(function(user) {

        // Remove deleted roles from user roles
        ids.forEach(function(roleId) {
          var index = user.roles.indexOf(roleId);

          if (index >= 0)
            user.roles.splice(index, 1);
        });

        // Update user
        asyncFunctions.push(function(callback) {
          userProvider.updateOne(
            new ResourceFilter().equal('id', user.id),
            {
              roles: user.roles
            },
            callback
          );
        });
      });

      async.parallel(asyncFunctions, callback);
    }
  ], function(error, results) {
    callback(error);
  });
};

/**
 * Handles hook when groups have been added.
 *
 * Each time a new group is added, 3 new permissions are created (create, update and delete) and organized in a
 * group of permissions.
 *
 * @method onGroupsAdded
 * @static
 * @async
 * @param {Array} groups The list of added groups
 * @param {Function} callback Function to call when it's done
 */
module.exports.onGroupsAdded = function(groups, callback) {
  if (groups) {
    var groupProvider = new GroupProvider(process.api.getCoreApi().getDatabase());
    var permissions = storage.getPermissions() || [];

    groups.forEach(function(group) {
      var groupPermissions = groupProvider.createGroupPermissions(group.id, group.name);

      // Add new group permissions to the list of permissions
      // The last group must stay the last group, this is the group of orphaned permissions
      permissions.splice(permissions.length - 1, 0, groupPermissions);

    });

    storage.setPermissions(permissions);
  }

  callback();
};

/**
 * Handles hook when a group has been updated.
 *
 * Each time a group is modified, the list of permissions is updated.
 *
 * @method onGroupUpdated
 * @static
 * @async
 * @param {Object} data Hook data
 * @param {String} data.id The id of updated group
 * @param {Object} data.modifications The list of modifications applied
 * @param {Function} callback Function to call when it's done
 */
module.exports.onGroupUpdated = function(data, callback) {
  if (data.id && data.modifications) {
    var permissions = storage.getPermissions() || [];

    permissions.forEach(function(permission) {
      if (permission.groupId === data.id && data.modifications.name)
        permission.label = data.modifications.name;
    });
  }

  callback();
};

/**
 * Handles hook when groups have been deleted.
 *
 * Each time a group is removed, the list of permissions is updated.
 *
 * @method onGroupsDeleted
 * @static
 * @async
 * @param {Array} ids The list of deleted group ids
 * @param {Function} callback Function to call when it's done
 */
module.exports.onGroupsDeleted = function(ids, callback) {
  var permissions = storage.getPermissions();
  if (ids && permissions) {
    permissions = permissions.filter(function(permission) {
      return (ids.indexOf(permission.groupId) === -1);
    });

    storage.setPermissions(permissions);
  }

  callback();
};
