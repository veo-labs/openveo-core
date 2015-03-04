"use strict"

// Module dependencies
var passport = require("passport");
var openVeoAPI = require("openveo-api");
var LocalStrategy = require("passport-local").Strategy;
var UserProvider = openVeoAPI.UserProvider;
var applicationStorage = openVeoAPI.applicationStorage;

var userProvider = new UserProvider(applicationStorage.getDatabase());

// Define a passport authentication strategy.
// "userName" and "password" field must be send using a POST 
// request to authenticate.
passport.use(new LocalStrategy(
  {
    usernameField: "userName",
    passwordField: "password"
  },
  function(username, password, done){
    userProvider.getUserByCredentials(username, password, function(error, user){
      if(error)
        done(null, false);
      else
        done(null, user);
    });
  }
));

// In order to support login sessions, Passport serialize and 
// deserialize user instances to and from the session.
// Only the user ID is serialized to the session.
passport.serializeUser(function(user, done){
  done(null, user.id);
});

// When subsequent requests are received, the ID is used to find
// the user, which will be restored to req.user.
passport.deserializeUser(function(id, done){
  userProvider.getUserById(id, function(error, user){
    if(error)
      done(null, false);
    else
      done(null, user);
  });
  
});