'use strict';

var passport = require('passport');
var util = require('@openveo/api/lib/util.js');
var LocalStrategy = require('passport-local').Strategy;
var UserModel = process.require('app/server/models/UserModel.js');
var RoleModel = process.require('app/server/models/RoleModel.js');
var UserProvider = process.require('app/server/providers/UserProvider.js');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');
var storage = process.require('app/server/storage.js');

/**
 * Gets user roles details.
 *
 * @async
 * @method getUserRoles
 * @private
 * @param {Object} user The user
 * @param {Function} callback Function to call when its done
 *  - *Error* An error if something went wrong, null otherwise
 *  - *Object* The upgraded user with roles details
 */
function getUserRoles(user, callback) {

  // Get user permissions by roles
  if (user.roles) {
    var roleModel = new RoleModel(new RoleProvider(storage.getDatabase()));
    roleModel.getByIds(user.roles, function(error, roles) {
      if (error)
        callback(null, false);
      else {
        user.permissions = [];
        for (var i = 0; i < roles.length; i++) {
          user.permissions = util.joinArray(user.permissions, roles[i].permissions);
          delete roles[i].permissions;
        }

        user.roles = roles;
        callback(null, user);
      }
    });
  } else
    callback(null, user);

}

// Define a passport authentication strategy.
// "email" and "password" field must be send using a POST
// request to authenticate.
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    var userModel = new UserModel(new UserProvider(storage.getDatabase()));
    userModel.getUserByCredentials(email, password, function(error, user) {
      if (error || !user)
        done(null, false);
      else if (user.id == 0)
        done(null, user);
      else
        getUserRoles(user, done);
    });
  }
));

// In order to support login sessions, Passport serialize and
// deserialize user instances to and from the session.
// Only the user ID is serialized to the session.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// When subsequent requests are received, the ID is used to find
// the user, which will be restored to req.user.
passport.deserializeUser(function(id, done) {
  var userModel = new UserModel(new UserProvider(storage.getDatabase()));
  userModel.getOne(id, null, function(error, user) {
    if (error || !user)
      done(null, false);
    else if (user.id == 0)
      done(null, user);
    else
      getUserRoles(user, done);
  });
});
