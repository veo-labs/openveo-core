'use strict';

/**
 * @module core
 */

var async = require('async');
var openVeoApi = require('@openveo/api');
var UserModel = process.require('app/server/models/UserModel.js');
var RoleModel = process.require('app/server/models/RoleModel.js');
var SettingModel = process.require('app/server/models/SettingModel.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var storage = process.require('app/server/storage.js');

/**
 * The authenticator helps manipulate users authenticated by passport strategies.
 *
 * Users returned by passport are not necessary OpenVeo users. It could be users from a third party authentication
 * server. The authenticator helps making sure that the authenticated user is a ready to use OpenVeo user.
 *
 * @class authenticator
 * @static
 */

/**
 * Populates user with detailed roles and permissions.
 *
 * @method populateUser
 * @async
 * @param {Object} user The user to populate
 * @param {Array} [user.roles] The list of role ids
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The populated user
 */
function populateUser(user, callback) {
  if (!user.roles || !user.roles.length) return callback(null, user);

  var roleModel = new RoleModel(new RoleProvider(storage.getDatabase()));
  roleModel.getByIds(user.roles, function(error, roles) {
    if (error) return callback(error);
    user.permissions = [];

    for (var i = 0; i < roles.length; i++)
      user.permissions = openVeoApi.util.joinArray(user.permissions, roles[i].permissions);

    user.roles = roles;
    callback(null, user);
  });
}

/**
 * Serializes only essential user information required to retrieve it later.
 *
 * @method serializeUser
 * @async
 * @static
 * @param {Object} user The user to serialize
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **String** The serialized user information
 */
module.exports.serializeUser = function(user, callback) {
  if (!user || !user.id)
    return callback(new Error('Could not serialize user: unknown user "' + (user ? user.id : '') + '"'));

  callback(null, user.id);
};

/**
 * Fetches a user with its permissions from serialized data.
 *
 * @method deserializeUser
 * @async
 * @static
 * @param {String} data Serialized data as serialized by serializeUser(), the id of the user
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The user with its permissions
 */
module.exports.deserializeUser = function(data, callback) {
  var userModel = new UserModel(new UserProvider(storage.getDatabase()));

  userModel.getOne(data, null, function(error, user) {
    if (error) return callback(error);
    if (!user) return callback(new Error('Unkown user "' + data + '"'));
    if (user.id === process.api.getCoreApi().getSuperAdminId()) return callback(null, user);

    // Get user permissions and roles
    populateUser(user, callback);

  });
};

/**
 * Verifies a user as returned by the passport local strategy.
 *
 * @method verifyUserByCredentials
 * @async
 * @static
 * @param {String} email User email
 * @param {String} password User password
 * @param {Function} callback Function to call when its done
 *  - **Error** An error if something went wrong, null otherwise
 *  - **Object** The user with its permissions
 */
module.exports.verifyUserByCredentials = function(email, password, callback) {
  var userModel = new UserModel(new UserProvider(storage.getDatabase()));

  userModel.getUserByCredentials(email, password, function(error, user) {
    if (error) return callback(error);
    if (!user) return callback(new Error('Email and / or password incorrect for "' + email + '"'));
    if (user.id === process.api.getCoreApi().getSuperAdminId()) return callback(null, user);

    populateUser(user, callback);
  });
};

/**
 * Verifies user as returned by third party providers.
 *
 * OpenVeo trusts users from third party providers, if the user does not exist in OpenVeo
 * it is created with minimum information.
 *
 * @method verifyUserAuthentication
 * @async
 * @static
 * @param {Object} thirdPartyUser The user from the third party provider
 * @param {String} strategy The id of the strategy
 * @param {Function} callback Function to call when its done
 *  - **Error** An error if something went wrong, null otherwise
 *  - **Object** The user with its permissions
 */
module.exports.verifyUserAuthentication = function(thirdPartyUser, strategy, callback) {
  var user;
  var exists = false;
  var roles = [];
  var strategyConfiguration = storage.getConfiguration().auth[strategy];
  var thirdPartyIdAttribute = strategyConfiguration.userIdAttribute;
  var thirdPartyNameAttribute = strategyConfiguration.userNameAttribute;
  var thirdPartyEmailAttribute = strategyConfiguration.userEmailAttribute;
  var thirdPartyGroupAttribute = strategyConfiguration.userGroupAttribute;
  var userModel = new UserModel(new UserProvider(storage.getDatabase()));
  var settingModel = new SettingModel(new SettingProvider(storage.getDatabase()));
  var originId = openVeoApi.util.evaluateDeepObjectProperties(thirdPartyIdAttribute, thirdPartyUser).replace(/ /g, '');
  var originGroups = openVeoApi.util.evaluateDeepObjectProperties(thirdPartyGroupAttribute, thirdPartyUser);
  var thirdPartyUserName = openVeoApi.util.evaluateDeepObjectProperties(thirdPartyNameAttribute, thirdPartyUser);
  var thirdPartyUserEmail = openVeoApi.util.evaluateDeepObjectProperties(thirdPartyEmailAttribute, thirdPartyUser);
  originGroups = originGroups || [];
  originGroups = (Array.isArray(originGroups)) ? originGroups : originGroups.split(',');

  async.series([

    // Test if user already exists in OpenVeo
    function(callback) {
      if (originId) {
        userModel.get({
          origin: strategy,
          originId: originId
        }, function(error, users) {
          if (error) return callback(error);
          if (users && users.length) {
            exists = true;
            user = users[0];
          }
          callback();
        });
      } else {
        exists = false;
        callback();
      }
    },

    // Attribute OpenVeo roles depending on third party user group
    // Matching is made in OpenVeo settings page
    function(callback) {
      if (!originGroups) return callback();

      settingModel.getOne('core-' + strategy, null, function(error, settings) {
        if (error) return callback(error);

        if (settings && settings.value && settings.value.length) {

          // Look for third party user group inside OpenVeo settings
          settings.value.forEach(function(match) {
            if (originGroups.indexOf(match.group) >= 0)
              roles = roles.concat(match.roles);
          });
        }
        callback();
      });
    },

    // Create user if it does not exist yet
    function(callback) {
      if (exists) return callback();

      userModel.addThirdPartyUser({
        name: thirdPartyUserName,
        email: thirdPartyUserEmail,
        roles: roles
      }, strategy, originId, originGroups, function(error, addedCount, addedUser) {
        if (addedUser) user = addedUser;
        callback(error);
      });
    },

    // Update user if information from third party provider have changed (name, email, group)
    function(callback) {
      if (user.name !== thirdPartyUserName ||
          user.email !== thirdPartyUserEmail ||
          !openVeoApi.util.areSameArrays(user.originGroups, originGroups) ||
          !openVeoApi.util.areSameArrays(user.roles, roles)
         ) {

        user.name = thirdPartyUserName;
        user.email = thirdPartyUserEmail;
        user.roles = roles;
        user.originGroups = originGroups;

        userModel.updateThirdPartyUser(user.id, {
          name: user.name,
          email: user.email,
          originGroups: user.originGroups,
          roles: user.roles
        }, strategy, callback);
      } else
        callback();
    },

    // Fetches the user with its permissions
    function(callback) {
      populateUser(user, callback);
    }

  ], function(error, results) {
    callback(error, user);
  });

};
