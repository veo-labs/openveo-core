'use strict';

/**
 * @module core-models
 */

var crypto = require('crypto');
var path = require('path');
var util = require('util');
var shortid = require('shortid');
var async = require('async');
var openVeoApi = require('@openveo/api');
var configDir = openVeoApi.fileSystem.getConfDir();
var conf = require(path.join(configDir, 'core/conf.json'));

/**
 * Defines a UserModel to manipulate back end users.
 *
 * @class UserModel
 * @extends EntityModel
 * @constructor
 * @param {UserProvider} provider The entity provider
 */
function UserModel(provider) {
  UserModel.super_.call(this, provider);
}

module.exports = UserModel;
util.inherits(UserModel, openVeoApi.models.EntityModel);

/**
 * Gets a local user by credentials.
 *
 * @method getUserByCredentials
 * @async
 * @param {String} email The email of the user
 * @param {String} password The password of the user
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The user
 */
UserModel.prototype.getUserByCredentials = function(email, password, callback) {

  // Encrypt password
  password = crypto.createHmac('sha256', conf.passwordHashKey).update(password).digest('hex');

  this.provider.getUserByCredentials(email, password, callback);
};

/**
 * Adds a new user.
 *
 * @method add
 * @async
 * @param {Object} data A user object
 * @param {String} data.name User's name
 * @param {String} data.email User's email
 * @param {String} data.password User's password
 * @param {String} data.passwordValidate User's password validation
 * @param {String} [data.id] User's id, if not specified an id will be generated
 * @param {String} [data.origin] User's origin, default to local
 * @param {Array} [data.roles] User's role ids
 * @param {Boolean} [data.locked=false] true to lock user from edition
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of items inserted
 *   - **Object** The inserted user
 */
UserModel.prototype.add = function(data, callback) {
  var self = this;

  if (!data.name || !data.email || !data.password) {
    callback(new Error('Requires name, email and password to add a user'));
    return;
  }

  // Validate password
  if (data.password !== data.passwordValidate) {
    callback(new Error('Passwords does not match'));
    return;
  }

  // Validate email
  if (!openVeoApi.util.isEmailValid(data.email)) {
    callback(new Error('Invalid email address ' + data.email));
    return;
  }

  // Verify if the email address is not already used
  this.provider.getUserByEmail(data.email, function(error, user) {
    if (error || user)
      callback(new Error('Email "' + data.email + '"not available'));
    else {

      // Encrypt password
      var password = crypto.createHmac('sha256', conf.passwordHashKey).update(data.password).digest('hex');

      // Build user object
      user = {
        id: data.id || shortid.generate(),
        name: data.name,
        email: data.email,
        password: password,
        locked: data.locked || false,
        origin: data.origin || openVeoApi.passport.STRATEGIES.LOCAL,
        roles: data.roles || []
      };

      self.provider.add(user, function(error, addedCount, users) {
        delete user['password'];

        if (callback)
          callback(error, addedCount, user);
      });

    }
  });

};

/**
 * Updates a user.
 *
 * @method update
 * @async
 * @param {String} id The id of the user to update
 * @param {Object} data A user object
 * @param {String} [data.email] User's email
 * @param {String} [data.password] User's password
 * @param {String} [data.passwordValidate] User's password validation
 * @param {Boolean} [data.locked=false] true to lock user from edition
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
UserModel.prototype.update = function(id, data, callback) {
  var self = this;
  var updatedItems;

  // Validate password
  if (data.password) {
    if (data.password !== data.passwordValidate) {
      callback(new Error('Passwords does not match'));
      return;
    } else {
      // Encrypt password
      var password = crypto.createHmac('sha256', conf.passwordHashKey).update(data.password).digest('hex');
      data.password = password;
      delete data.passwordValidate;
    }
  }

  // Validate email
  if (data.email && !openVeoApi.util.isEmailValid(data.email)) {
    callback(new Error('Invalid email address'));
    return;
  }

  async.series([

    // Verify if the email address is not already used
    function(callback) {
      if (!data.email) return callback();

      self.provider.getUserByEmail(data.email, function(error, user) {
        if (error) return callback(error);
        if (user && user.id != id) return callback(new Error('Email not available'));
        callback();
      });
    },

    // Update user
    function(callback) {
      self.provider.update(id, data, function(error, totalItems) {
        if (error) return callback(error);
        updatedItems = totalItems;
        callback();
      });
    }

  ], function(error) {
    callback(error, updatedItems);
  });
};

/**
 * Removes entities.
 *
 * Execute hook USERS_DELETED.
 *
 * @method remove
 * @async
 * @param {String|Array} ids Id(s) of the document(s) to remove from the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of deleted entities
 */
UserModel.prototype.remove = function(ids, callback) {
  this.provider.remove(ids, function(error, deletedNumber) {
    if (error) return callback(error);
    var api = process.api.getCoreApi();

    api.executeHook(api.getHooks().USERS_DELETED, ids, function(error) {
      if (error) return callback(error);
      callback(null, deletedNumber);
    });
  });
};

/**
 * Adds a third party provider user.
 *
 * @method addThirdPartyUser
 * @async
 * @param {Object} data A user object
 * @param {String} data.name User's name
 * @param {String} data.email User's email
 * @param {String} [data.id] User's id, if not specified an id will be generated
 * @param {Array} [data.roles] User's role ids
 * @param {String} origin Id of the third party provider system
 * @param {String} originId The user id in third party provider system
 * @param {Array} [originGroups] The user groups in third party provider system
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of items inserted
 *   - **Object** The inserted user
 */
UserModel.prototype.addThirdPartyUser = function(data, origin, originId, originGroups, callback) {
  if (!origin || !data || !data.name || !data.email || !originId) {
    callback(new Error('Requires name, origin and origin id to add a third party user'));
    return;
  }

  var user = {
    id: data.id || shortid.generate(),
    name: data.name,
    email: data.email,
    origin: origin,
    originId: originId,
    originGroups: originGroups || [],
    roles: data.roles || [],
    locked: true
  };

  this.provider.add(user, function(error, addedCount, users) {
    if (callback)
      callback(error, addedCount, user);
  });
};

/**
 * Updates a third party provider user.
 *
 * @method updateThirdPartyUser
 * @async
 * @param {String} id User id in OpenVeo
 * @param {Object} data A user object
 * @param {String} [data.name] User's name
 * @param {String} [data.email] User's email
 * @param {Array} [data.originGroups] User's groups in third party provider system
 * @param {Array} [data.roles] User's role ids
 * @param {String} origin The user origin strategy (passport strategy)
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of items updates
 */
UserModel.prototype.updateThirdPartyUser = function(id, data, origin, callback) {
  var userData = {};

  if (data.name) userData.name = data.name;
  if (data.email) userData.email = data.email;
  if (data.originGroups) userData.originGroups = data.originGroups;
  if (data.roles) userData.roles = data.roles;

  this.provider.updateThirdPartyUser(id, userData, origin, function(error, updatedCount) {
    if (callback)
      callback(error, updatedCount);
  });
};
