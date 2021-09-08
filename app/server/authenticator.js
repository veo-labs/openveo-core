'use strict';

/**
 * The authenticator helps manipulate users authenticated by passport strategies.
 *
 * Users returned by passport are not necessary OpenVeo users. It could be users from a third party authentication
 * server. The authenticator helps making sure that the authenticated user is a ready to use OpenVeo user.
 *
 * @module core/authenticator
 */

var async = require('async');
var openVeoApi = require('@openveo/api');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var SettingProvider = process.require('app/server/providers/SettingProvider.js');
var storage = process.require('app/server/storage.js');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

/**
 * Populates user with detailed roles and permissions.
 *
 * @private
 * @param {Object} user The user to populate
 * @param {Array} [user.roles] The list of role ids
 * @param {module:core/authenticator~populateUserCallback} callback The function to call when it's done
 */
function populateUser(user, callback) {
  if (!user.roles || !user.roles.length) return callback(null, user);

  var roleProvider = new RoleProvider(storage.getDatabase());
  roleProvider.get(
    new ResourceFilter().in('id', user.roles),
    null,
    user.roles.length,
    null,
    {
      name: 'asc'
    },
    function(error, roles) {
      if (error) return callback(error);
      user.permissions = [];

      for (var i = 0; i < roles.length; i++)
        user.permissions = openVeoApi.util.joinArray(user.permissions, roles[i].permissions);

      user.roles = roles;
      callback(null, user);
    }
  );
}

/**
 * Serializes only essential user information required to retrieve it later.
 *
 * @param {Object} user The user to serialize
 * @param {module:core/authenticator~serializeUserCallback} callback The function to call when it's done
 */
module.exports.serializeUser = function(user, callback) {
  if (!user || !user.id)
    return callback(new Error('Could not serialize user: unknown user "' + (user ? user.id : '') + '"'));

  callback(null, user.id);
};

/**
 * Fetches a user with its permissions from serialized data.
 *
 * @param {String} data Serialized data as serialized by serializeUser(): the id of the user
 * @param {module:core/authenticator~deserializeUserCallback} callback The function to call when it's done
 */
module.exports.deserializeUser = function(data, callback) {
  var userProvider = new UserProvider(storage.getDatabase());

  userProvider.getOne(
    new ResourceFilter().equal('id', data),
    null,
    function(error, user) {
      if (error) return callback(error);
      if (!user) return callback(new Error('Unkown user "' + data + '"'));
      if (user.id === process.api.getCoreApi().getSuperAdminId()) return callback(null, user);

      // Get user permissions and roles
      populateUser(user, callback);
    }
  );
};

/**
 * Verifies a user as returned by the passport local strategy.
 *
 * @param {String} email User email
 * @param {String} password User password
 * @param {module:core/authenticator~verifyUserByCredentialsCallback} callback Function to call when its done
 */
module.exports.verifyUserByCredentials = function(email, password, callback) {
  var userProvider = new UserProvider(storage.getDatabase());

  userProvider.getUserByCredentials(email, password, function(error, user) {
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
 * @param {Object} thirdPartyUser The user from the third party provider
 * @param {String} strategy The id of the strategy
 * @param {module:core/authenticator~verifyUserAuthenticationCallback} callback Function to call when its done
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
  var userProvider = new UserProvider(storage.getDatabase());
  var settingProvider = new SettingProvider(storage.getDatabase());
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
        userProvider.getOne(
          new ResourceFilter().equal('origin', strategy).equal('originId', originId),
          null,
          function(error, fetchedUser) {
            if (error) return callback(error);
            if (fetchedUser) {
              exists = true;
              user = fetchedUser;
            }
            callback();
          }
        );
      } else {
        exists = false;
        callback();
      }
    },

    // Attribute OpenVeo roles depending on third party user group
    // Matching is made in OpenVeo settings page
    function(callback) {
      if (!originGroups) return callback();

      settingProvider.getOne(
        new ResourceFilter().equal('id', 'core-' + strategy),
        null,
        function(error, settings) {
          if (error) return callback(error);

          if (settings && settings.value && settings.value.length) {

            // Look for third party user group inside OpenVeo settings
            settings.value.forEach(function(match) {
              if (originGroups.indexOf(match.group) >= 0)
                roles = roles.concat(match.roles);
            });
          }
          callback();
        }
      );
    },

    // Create user if it does not exist yet
    function(callback) {
      if (exists) return callback();

      userProvider.addThirdPartyUsers([
        {
          name: thirdPartyUserName,
          email: thirdPartyUserEmail,
          roles: roles,
          origin: strategy,
          originId: originId,
          originGroups: originGroups
        }
      ], function(error, total, addedUsers) {
        if (addedUsers) user = addedUsers[0];
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

        userProvider.updateThirdPartyUser(
          new ResourceFilter().equal('id', user.id),
          {
            name: user.name,
            email: user.email,
            originGroups: user.originGroups,
            roles: user.roles
          },
          strategy,
          callback
        );
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

/**
 * @callback module:core/authenticator~populateUserCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} user The populated user
 */

/**
 * @callback module:core/authenticator~serializeUserCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(String|Undefined)} information The serialized user information
 */

/**
 * @callback module:core/authenticator~deserializeUserCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} user The user with its permissions
 */

/**
 * @callback module:core/authenticator~verifyUserByCredentialsCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} user The user with its permissions
 */

/**
 * @callback module:core/authenticator~verifyUserAuthenticationCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Object|Undefined)} user The user with its permissions
 */
