"use strict"

/** 
 * @module core-models
 */

// Module dependencies
var crypto = require("crypto");
var util = require("util");
var openVeoAPI = require("openveo-api");

var UserProvider = process.require("app/server/providers/UserProvider.js");

// Hash key for passwords
var hashKey = "Plji9Qhu8d";

/**
 * Defines a UserModel class to manipulate back end users.
 *
 * @class UserModel
 * @constructor
 * @extends EntityModel
 */
function UserModel(){
  openVeoAPI.EntityModel.prototype.init.call(this, new UserProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = UserModel;
util.inherits(UserModel, openVeoAPI.EntityModel);

/**
 * Gets a user by credentials.
 *
 * @method getUserByCredentials
 * @async
 * @param {String} email The email of the user
 * @param {String} password The password of the user
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The user
 */
UserModel.prototype.getUserByCredentials = function(email, password, callback){

  // Encrypt password
  password = crypto.createHmac("sha256", hashKey).update(password).digest("hex");
  
  this.provider.getUserByCredentials(email, password, callback);
};

/**
 * Adds a new user.
 *
 * @example
 *     var UserModel = new process.require("app/server/models/UserModel.js");
 *     var user = new UserModel();
 *     user.add({
 *       name : "User name",
 *       email : "User email",
 *       password : "User password",
 *       passwordValidate : "User password",
 *       roles : []
 *     }, callback);
 *
 * @method add
 * @async
 * @param {Object} data A user object
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
UserModel.prototype.add = function(data, callback){
  var self = this;

  if(!data.name || !data.email || !data.password){
    callback(new Error("Requires name, email and password to add a user"));
    return;
  }

  // Validate password
  if(data.password !== data.passwordValidate){
    callback(new Error("Passwords does not match"));
    return;
  }

  // Validate email
  if(!isEmailValid(data.email)){
    callback(new Error("Invalid email address"));
    return;
  }

  // Verify if the email address is not already used
  this.provider.getUserByEmail(data.email, function(error, user){
    if(error || user)
      callback(new Error("Email not available"));
    else{

      // Encrypt password
      var password = crypto.createHmac("sha256", hashKey).update(data.password).digest("hex");

      // Build user object
      var user = {
        id : Date.now().toString(),
        name : data.name,
        email : data.email,
        password : password
      };
      if(data.roles) user["roles"] = data.roles;

      self.provider.add(user, function(error){
        delete user["password"];
        callback(error, user);
      });

    }
  });

};

/**
 * Update a user.
 *
 * @example
 *     var UserModel = new process.require("app/server/models/UserModel.js");
 *     var user = new UserModel();
 *     user.update("1", {
 *       name : "User name",
 *       email : "User email",
 *       password : "User password",
 *       passwordValidate : "User password",
 *       roles : []
 *     }, callback);
 *
 * @method update
 * @async 
 * @param {String} id The id of the user to update
 * @param {Object} data A user object
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
UserModel.prototype.update = function(id, data, callback){
  var self = this;

  // Validate password
  if(data.password && data.password !== data.passwordValidate){
    callback(new Error("Passwords does not match"));
    return;
  }

  // Validate email
  if(data.email && !isEmailValid(data.email)){
    callback(new Error("Invalid email address"));
    return;
  }

  // Verify if the email address is not already used
  this.provider.getUserByEmail(data.email, function(error, user){
    if(error || (user && user.id != id))
      callback(new Error("Email not available"));
    else
      self.provider.update(id, data, callback);
  });
};

/**
 * Checks if an email address is valid or not.
 *
 * @method isEmailValid
 * @param {String} email The email address
 * @return {Boolean} true if the email is valid, false otherwise
 */
function isEmailValid(email){
  return /[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(email);
}