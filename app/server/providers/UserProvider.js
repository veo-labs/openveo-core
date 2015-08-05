"use strict"

/** 
 * @module core-providers 
 */

// Module dependencies
var util = require("util");
var openVeoAPI = require("openveo-api");

/**
 * Defines a UserProvider class to get and save back end users.
 *
 * @class UserProvider
 * @constructor
 * @extends EntityProvider
 * @param {Database} database The database to interact with
 */
function UserProvider(database){
  openVeoAPI.EntityProvider.prototype.init.call(this, database, "users");
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
UserProvider.prototype.getUserByCredentials = function(email, password, callback){
  this.database.get(this.collection, {"email" : email, "password" : password}, { "password" : 0 }, 1, function(error, data){
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
UserProvider.prototype.getUserByEmail = function(email, callback){
  this.database.get(this.collection, { "email" : email }, { "password" : 0 }, 1, function(error, data){
    callback(error, data && data[0]);
  });
};

/**
 * Gets a list of users.
 *
 * @method get
 * @async
 * It's not possible to get locked users as part of the results.
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The list of entities
 */
UserProvider.prototype.get = function(callback){
  this.database.get(this.collection, { locked : { $ne : true } }, { "_id" : 0 }, -1, callback);
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
UserProvider.prototype.getOne = function(id, callback){
  this.database.get(this.collection, {"id" : id}, { "password" : 0 }, 1, function(error, data){
    callback(error, data && data[0]);
  });
};

/**
 * Updates a user.
 *
 * It's not possible to update locked users.
 *
 * @method update
 * @async
 * @param {String} id The user id
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
UserProvider.prototype.update = function(id, data, callback){
  this.database.update(this.collection, {id : id, locked : { $ne : true }}, data, callback);
};

/**
 * Removes a user.
 *
 * It's not possible to remove a locked user.
 *
 * @method remove
 * @async
 * @param {String} id The id of the user to remove
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed items
 */
UserProvider.prototype.remove = function(id, callback){
  this.database.remove(this.collection, {id :{$in : id}, locked : { $ne : true }}, callback);
};