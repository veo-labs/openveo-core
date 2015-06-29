"use scrict"

// Module dependencies
var crypto = require("crypto");
var util = require("util");
var openVeoAPI = require("openveo-api");

var UserProvider = process.require("app/server/providers/UserProvider.js");

// Hash key for passwords
var hashKey = "Plji9Qhu8d";

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
 * @param String email The email of the user
 * @param String password The password of the user
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 *   - Object The user
 */
UserModel.prototype.getUserByCredentials = function(email, password, callback){

  // Encrypt password
  password = crypto.createHmac("sha256", hashKey).update(password).digest("hex");
  
  this.provider.getUserByCredentials(email, password, callback);
};

/**
 * Adds a new user.
 * @param Object data A user object
 * e.g.
 * {
 *   name : "User name",
 *   email : "User email",
 *   password : "User password",
 *   passwordValidate : "User password",
 *   roles : []
 * }
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 * @Override
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
  if(!(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(data.email))){
    callback(new Error("Invalid email address"));
    return;
  }

  // Verify if the email address is not already used
  this.provider.getUserByEmail(data.email, function(error, user){
    if(error || user)
      callback(new Error("Email not available"));
    else{

      // Encrypt password
      password = crypto.createHmac("sha256", hashKey).update(data.password).digest("hex");

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