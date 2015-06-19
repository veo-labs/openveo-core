"use scrict"

// Module dependencies
var crypto = require("crypto");
var util = require("util");
var openVeoAPI = require("openveo-api");

var UserProvider = process.require("app/server/providers/UserProvider.js");

/**
 * Creates a UserModel.
 */
function UserModel(){
  openVeoAPI.EntityModel.prototype.init.call(this, new UserProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = UserModel;
util.inherits(UserModel, openVeoAPI.EntityModel);

/**
 * Gets a user by credentials.
 * @param String name The name of the user
 * @param String password The password of the user
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 *   - Object The user
 */
UserModel.prototype.getUserByCredentials = function(name, password, callback){

  // Encrypt password
  password = crypto.createHmac("sha256", "Plji9Qhu8d").update(password).digest("hex");
  
  this.provider.getUserByCredentials(name, password, callback);
};