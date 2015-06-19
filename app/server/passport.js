"use strict"

// Module dependencies
var passport = require("passport");
var openVeoAPI = require("openveo-api");
var LocalStrategy = require("passport-local").Strategy;
var UserModel = process.require("app/server/models/UserModel.js");
var applicationStorage = openVeoAPI.applicationStorage;

var userModel = new UserModel();

// Define a passport authentication strategy.
// "userName" and "password" field must be send using a POST 
// request to authenticate.
passport.use(new LocalStrategy(
  {
    usernameField: "userName",
    passwordField: "password"
  },
  function(username, password, done){
    userModel.getUserByCredentials(username, password, function(error, user){
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
  userModel.getOne(id, function(error, user){
    if(error)
      done(null, false);
    else
      done(null, user);
  });
});