"use scrict"

// Module dependencies
var util = require("util");
var openVeoAPI = require("openveo-api");

/**
 * Creates a UserProvider.
 * @param Database database The database to interact with
 */
function UserProvider(database){
  openVeoAPI.EntityProvider.prototype.init.call(this, database, "users");
}

module.exports = UserProvider;
util.inherits(UserProvider, openVeoAPI.EntityProvider);

/**
 * Gets a user by its credentials.
 * @param String name The name of the user
 * @param String password The password of the user
 * @param Function callback Function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 *   - Object The user 
 */
UserProvider.prototype.getUserByCredentials = function(name, password, callback){
  this.database.get(this.collection, {"username" : name, "password" : password}, { "password" : 0 }, 1, function(error, data){
    callback(error, data && data[0]);
  });
};

/**
 * Gets a user without its paswword.
 * @param String id The user id
 * @param Function callback Function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 *   - Object The user
 * @Override
 */
UserProvider.prototype.getOne = function(id, callback){
  this.database.get(this.collection, {"id" : id}, { "password" : 0 }, 1, function(error, data){
    callback(error, data && data[0]);
  });
};