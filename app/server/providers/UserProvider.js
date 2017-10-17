'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');

/**
 * Defines a UserProvider to get and save back end users.
 *
 * @class UserProvider
 * @extends EntityProvider
 * @constructor
 * @param {Database} database The database to interact with
 */
function UserProvider(database) {
  UserProvider.super_.call(this, database, 'core_users');
}

module.exports = UserProvider;
util.inherits(UserProvider, openVeoApi.providers.EntityProvider);

/**
 * Gets a local user by its credentials.
 *
 * @method getUserByCredentials
 * @async
 * @param {String} email The email of the user
 * @param {String} password The password of the user
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The user
 */
UserProvider.prototype.getUserByCredentials = function(email, password, callback) {
  this.database.get(this.collection,
    {
      $and: [
        {
          origin: {$eq: openVeoApi.passport.STRATEGIES.LOCAL}
        },
        {
          email: email,
          password: password
        }
      ]
    },
    {
      password: 0
    },
    1, function(error, data) {
      callback(error, data && data[0]);
    });
};

/**
 * Gets a local user by its email.
 *
 * @method getUserByEmail
 * @async
 * @param {String} email The email of the user
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The user
 */
UserProvider.prototype.getUserByEmail = function(email, callback) {
  this.database.get(this.collection,
    {
      $and: [
        {
          origin: {$eq: openVeoApi.passport.STRATEGIES.LOCAL}
        },
        {
          email: email
        }
      ]
    },
    {
      password: 0
    },
    1, function(error, data) {
      callback(error, data && data[0]);
    });
};

/**
 * Gets a user without its paswword.
 *
 * @method getOne
 * @async
 * @param {String} id The user id
 * @param {Object} [filter] A MongoDB filter
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The user
 */
UserProvider.prototype.getOne = function(id, filter, callback) {

  if (!filter) filter = {};
  filter.id = id;

  this.database.get(this.collection, filter,
    {
      password: 0
    },
    1, function(error, data) {
      callback(error, data && data[0]);
    });
};

/**
 * Updates an internal user.
 *
 * If the entity has the property "locked", it won't be updated. It also won't be updated
 * if user is not an OpenVeo user.
 *
 * @method update
 * @async
 * @param {String} id The id of the user to update
 * @param {Object} data User's data
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
UserProvider.prototype.update = function(id, data, callback) {
  this.database.update(this.collection, {
    id: id,
    locked: {$ne: true},
    origin: {$eq: openVeoApi.passport.STRATEGIES.LOCAL}
  }, data, callback);
};

/**
 * Updates an external user.
 *
 * @method updateThirdPartyUser
 * @async
 * @param {String} id The id of the user to update
 * @param {Object} data User's data
 * @param {String} origin The user's origin (see openVeoApi.passport.STRATEGIES)
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
UserProvider.prototype.updateThirdPartyUser = function(id, data, origin, callback) {
  if (origin === openVeoApi.passport.STRATEGIES.LOCAL)
    return callback(new Error('Can\'t update a local user with "updateThirdPartyUser"'));

  this.database.update(this.collection, {
    id: id,
    origin: {$eq: origin}
  }, data, callback);
};

/**
 * Creates users indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
UserProvider.prototype.createIndexes = function(callback) {
  this.database.createIndexes(this.collection, [
    {key: {name: 1}, name: 'byName'},
    {key: {name: 'text'}, weights: {name: 1}, name: 'querySearch'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create users indexes : ' + result.note);

    callback(error);
  });
};
