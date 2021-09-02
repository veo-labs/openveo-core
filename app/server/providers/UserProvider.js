'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var path = require('path');
var crypto = require('crypto');
var nanoid = require('nanoid').nanoid;
var async = require('async');
var openVeoApi = require('@openveo/api');
var configDir = openVeoApi.fileSystem.getConfDir();
var conf = require(path.join(configDir, 'core/conf.json'));
var ResourceFilter = openVeoApi.storages.ResourceFilter;
var NotFoundError = openVeoApi.errors.NotFoundError;

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
 * Gets an internal user by its credentials.
 *
 * @method getUserByCredentials
 * @async
 * @param {String} email The user email
 * @param {String} password The user clear text password
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The user
 */
UserProvider.prototype.getUserByCredentials = function(email, password, callback) {
  password = crypto.createHmac('sha256', conf.passwordHashKey).update(password).digest('hex');

  this.getOne(
    new ResourceFilter()
      .equal('origin', openVeoApi.passport.STRATEGIES.LOCAL)
      .equal('email', email)
      .equal('password', password),
    {
      exclude: ['password']
    },
    callback
  );
};

/**
 * Gets an internal user by its email.
 *
 * @method getUserByEmail
 * @async
 * @param {String} email The email of the user
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The user
 */
UserProvider.prototype.getUserByEmail = function(email, callback) {
  this.getOne(
    new ResourceFilter()
      .equal('origin', openVeoApi.passport.STRATEGIES.LOCAL)
      .equal('email', email),
    {
      exclude: ['password']
    },
    callback
  );
};

/**
 * Adds users.
 *
 * @method add
 * @async
 * @param {Array} users The list of users to store with for each user:
 *   - **String** name The user name
 *   - **String** email The user email
 *   - **String** password The user password
 *   - **String** passwordValidate The user password validation
 *   - **String** [id] The user id, generated if not specified
 *   - **Array** [roles] The user role ids
 *   - **Boolean** [locked=false] true to lock the user from edition, false otherwise
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of users inserted
 *   - **Array** The list of added users
 */
UserProvider.prototype.add = function(users, callback) {
  var self = this;
  var usersToAdd = [];
  var userEmails = [];

  for (var i = 0; i < users.length; i++) {
    var user = users[i];

    if (!user.name || !user.email || !user.password)
      return this.executeCallback(callback, new TypeError('Requires name, email and password to add a user'));

    // Validate password
    if (user.password !== user.passwordValidate)
      return this.executeCallback(callback, new Error('Passwords do not match'));

    // Validate email
    if (!openVeoApi.util.isEmailValid(user.email))
      return this.executeCallback(callback, new TypeError('Invalid email address: ' + user.email));

    userEmails.push(user.email);
  }

  // Find users
  this.getAll(
    new ResourceFilter()
      .equal('origin', openVeoApi.passport.STRATEGIES.LOCAL)
      .in('email', userEmails),
    {
      include: ['email']
    },
    {
      id: 'desc'
    },
    function(getAllError, fetchedUsers) {
      if (getAllError) return self.executeCallback(callback, getAllError);

      for (var i = 0; i < users.length; i++) {
        var user = users[i];

        // Validate email
        for (var j = 0; j < fetchedUsers.length; j++) {
          if (user.email === fetchedUsers[j].email)
            return self.executeCallback(callback, new Error('Email "' + user.email + '" not available'));
        }

        // Encrypt password
        var password = crypto.createHmac('sha256', conf.passwordHashKey).update(user.password).digest('hex');

        usersToAdd.push({
          id: user.id || nanoid(),
          name: user.name,
          email: user.email,
          password: password,
          locked: user.locked || false,
          origin: openVeoApi.passport.STRATEGIES.LOCAL,
          roles: user.roles || []
        });
      }

      UserProvider.super_.prototype.add.call(self, usersToAdd, function(addError, total, addedUsers) {
        if (addError) return self.executeCallback(callback, addError);

        if (callback) {
          addedUsers.forEach(function(addedUser) {
            delete addedUser['password'];
          });

          callback(null, total, addedUsers);
        }
      });
    }
  );
};

/**
 * Updates an internal user.
 *
 * @method updateOne
 * @async
 * @param {ResourceFilter} [filter] Rules to filter the user to update
 * @param {Object} data The modifications to perform
 * @param {String} [data.name] The user name
 * @param {String} [data.email] The user email
 * @param {String} [data.password] The user password. Also requires passwordValidate
 * @param {String} [data.passwordValidate] The user password validation. Also requires password
 * @param {Array} [data.roles] The user role ids
 * @param {Boolean} [data.locked] true to lock the user from edition, false otherwise
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** 1 if everything went fine
 */
UserProvider.prototype.updateOne = function(filter, data, callback) {
  var self = this;
  var modifications = {};
  var total;
  var user;

  if (!filter) filter = new ResourceFilter();
  filter.equal('origin', openVeoApi.passport.STRATEGIES.LOCAL);

  // Validate password
  if (data.password) {

    if (data.password !== data.passwordValidate)
      return this.executeCallback(callback, new Error('Passwords does not match'));
    else {

      // Encrypt password
      var password = crypto.createHmac('sha256', conf.passwordHashKey).update(data.password).digest('hex');
      modifications.password = password;

    }
  }

  // Validate email
  if (data.email && !openVeoApi.util.isEmailValid(data.email))
    return this.executeCallback(callback, new TypeError('Invalid email address'));

  // Validate roles
  if (data.roles) modifications.roles = data.roles;

  // Validate name
  if (data.name) modifications.name = data.name;

  // Validate locked
  if (typeof data.locked !== 'undefined') modifications.locked = Boolean(data.locked);

  async.series([

    // Get user corresponding to given filter
    function(callback) {
      self.getOne(
        filter,
        {
          include: ['id']
        },
        function(error, fetchedUser) {
          if (error) return callback(error);
          if (!fetchedUser) return callback(new NotFoundError(JSON.stringify(filter)));

          user = fetchedUser;
          callback();
        }
      );
    },

    // Verify if the email address is not already used
    function(callback) {
      if (!data.email) return callback();
      self.getUserByEmail(data.email, function(error, fetchedUser) {
        if (error) return callback(error);
        if (fetchedUser && fetchedUser.id !== user.id) return callback(new Error('Email not available'));

        modifications.email = data.email;
        callback();
      });
    },

    // Update user
    function(callback) {
      UserProvider.super_.prototype.updateOne.call(
        self,
        new ResourceFilter().equal('id', user.id).equal('origin', openVeoApi.passport.STRATEGIES.LOCAL),
        modifications,
        function(error, totalItems) {
          if (error) return callback(error);
          total = totalItems;
          callback();
        }
      );
    }

  ], function(error) {
    self.executeCallback(callback, error, total);
  });
};

/**
 * Removes users.
 *
 * This will execute core hook "USERS_DELETED" after removing users with:
 * - **Array** The ids of deleted users
 *
 * @method remove
 * @async
 * @param {ResourceFilter} [filter] Rules to filter users to remove
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed users
 */
UserProvider.prototype.remove = function(filter, callback) {
  var self = this;

  // Find users
  this.getAll(
    filter,
    {
      include: ['id']
    },
    {
      id: 'desc'
    },
    function(getAllError, users) {
      if (getAllError) return self.executeCallback(callback, getAllError);
      if (!users || !users.length) return self.executeCallback(callback);

      // Remove users
      UserProvider.super_.prototype.remove.call(self, filter, function(removeError, total) {
        if (removeError) return self.executeCallback(callback, removeError);

        // Execute hook
        var api = process.api.getCoreApi();
        api.executeHook(
          api.getHooks().USERS_DELETED,
          users.map(function(user) {
            return user.id;
          }),
          function(hookError) {
            self.executeCallback(callback, hookError, total);
          }
        );
      });
    }
  );
};

/**
 * Adds external users.
 *
 * External users are automatically locked when added.
 *
 * @method addThirdPartyUsers
 * @async
 * @param {Array} users The list of users to add with for each user:
 *   - **String** name The user name
 *   - **String** email The user email
 *   - **String** origin Id of the third party provider system
 *   - **String** originId The user id in third party provider system
 *   - **String** [id] The user id, generated if not specified
 *   - **Array** [originGroups] The user groups in third party provider system
 *   - **Array** [roles] The user role ids
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of users inserted
 *   - **Array** The inserted users
 */
UserProvider.prototype.addThirdPartyUsers = function(users, callback) {
  var usersToAdd = [];

  for (var i = 0; i < users.length; i++) {
    var user = users[i];

    if (!user.origin || !user.name || !user.email || !user.originId) {
      return this.executeCallback(
        callback,
        new TypeError('Requires name, email, origin and origin id to add a third party user')
      );
    }

    if (user.origin === openVeoApi.passport.STRATEGIES.LOCAL)
      return this.executeCallback(callback, new Error('Third party user origin can\'t be local'));

    usersToAdd.push({
      id: user.id || nanoid(),
      name: user.name,
      email: user.email,
      origin: user.origin,
      originId: user.originId,
      originGroups: user.originGroups || [],
      roles: user.roles || [],
      locked: true
    });
  }

  UserProvider.super_.prototype.add.call(this, usersToAdd, callback);
};

/**
 * Updates an external user.
 *
 * @method updateThirdPartyUser
 * @async
 * @param {ResourceFilter} [filter] Rules to filter users to update
 * @param {Object} data The modifications to perform
 * @param {String} [data.name] The user name
 * @param {String} [data.email] The user email
 * @param {Array} [data.originGroups] The user groups in third party provider system
 * @param {Array} [data.roles] The user role ids
 * @param {Boolean} [data.locked] true to lock the user from edition, false otherwise
 * @param {String} origin The user origin (see openVeoApi.passport.STRATEGIES)
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** 1 if everything went fine
 */
UserProvider.prototype.updateThirdPartyUser = function(filter, data, origin, callback) {
  var modifications = {};

  if (origin === openVeoApi.passport.STRATEGIES.LOCAL)
    return this.executeCallback(callback, new Error('Can\'t update a local user with "updateThirdPartyUser"'));

  if (!filter) filter = new ResourceFilter();
  filter.equal('origin', origin);

  if (data.name) modifications.name = data.name;
  if (data.email) modifications.email = data.email;
  if (data.originGroups) modifications.originGroups = data.originGroups;
  if (data.roles) modifications.roles = data.roles;
  if (typeof data.locked !== 'undefined') modifications.locked = Boolean(data.locked);

  this.storage.updateOne(this.location, filter, modifications, function(error, total) {
    this.executeCallback(callback, error, total);
  }.bind(this));
};

/**
 * Creates users indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 */
UserProvider.prototype.createIndexes = function(callback) {
  var language = process.api.getCoreApi().getContentLanguage();

  this.storage.createIndexes(this.location, [
    {key: {name: 1}, name: 'byName'},

    // eslint-disable-next-line camelcase
    {key: {name: 'text'}, weights: {name: 1}, default_language: language, name: 'querySearch'}

  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create users indexes : ' + result.note);

    callback(error);
  });
};

/**
 * Drops an index from database collection.
 *
 * @method dropIndex
 * @async
 * @param {String} indexName The name of the index to drop
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 */
UserProvider.prototype.dropIndex = function(indexName, callback) {
  this.storage.dropIndex(this.location, indexName, function(error, result) {
    if (result && result.ok)
      process.logger.debug('Index "' + indexName + '" dropped');

    callback(error);
  });
};
