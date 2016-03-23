'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');

/**
 * Defines a UserProvider class to get and save back end users.
 *
 * @class UserProvider
 * @constructor
 * @extends EntityProvider
 * @param {Database} database The database to interact with
 */
function UserProvider(database) {
  openVeoAPI.EntityProvider.prototype.init.call(this, database, 'users');
}

module.exports = UserProvider;
util.inherits(UserProvider, openVeoAPI.EntityProvider);

/**
 * Gets a user by its credentials.
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
      email: email,
      password: password
    },
    {
      password: 0
    },
    1, function(error, data) {
      callback(error, data && data[0]);
    });
};

/**
 * Gets a user by its email.
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
      email: email
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
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The user
 */
UserProvider.prototype.getOne = function(id, callback) {
  this.database.get(this.collection,
    {
      id: id
    },
    {
      password: 0
    },
    1, function(error, data) {
      callback(error, data && data[0]);
    });
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
    {key: {name: 1}, name: 'byName'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create users indexes : ' + result.note);

    callback(error);
  });
};
