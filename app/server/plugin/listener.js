'use strict';

/**
 * @module core-plugin
 */

var async = require('async');
var UserModel = process.require('app/server/models/UserModel.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');

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
 * @param {Array} The list of deleted role ids
 * @param {Function} callback Function to call when it's done
 *  - **Error** An error if something went wrong, null otherwise
 */
module.exports.onRolesDeleted = function(ids, callback) {
  var users;
  var coreApi = process.api.getCoreApi();
  var database = coreApi.getDatabase();
  var userModel = new UserModel(new UserProvider(database));

  async.series([

    // Find all users containing, at least, one of the deleted roles
    function(callback) {
      var orFilter = [];
      ids.forEach(function(roleId) {
        orFilter.push({roles: roleId});
      });

      userModel.get({
        $or: orFilter
      }, function(error, fetchedUsers) {
        users = fetchedUsers;
        callback(error);
      });
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
          userModel.update(user.id, {
            roles: user.roles
          }, callback);
        });
      });

      async.parallel(asyncFunctions, callback);
    }
  ], function(error, results) {
    callback(error);
  });
};
