"use strict"

// Module dependencies
var passport = require("passport");

/**
 * Establishes requests authentication using module passport.
 * If authentication fails, an HTTP code 401 is returned to the client.
 * If authentication succeeds, an HTTP code 200 is returned to the client
 * with user information as a JSON Object.
 */
module.exports.authenticateAction = function(request, response, next){
  
  // Use passport to authenticate the request
  passport.authenticate("local", function(error, user, info){
    
    // An error occurred while authenticating
    // Dispatch the error
    if(error)
      return next(error);
    
    // No user was found for the given login / password
    // Send back a 401 Not Authorized
    if(!user)
      return response.status(401).send();
    
    // Establish a session, authenticate the request
    request.login(user, function(error){
      if(error)
        return next(error);

      return response.status(200).send(user);
    });
    
  })(request, response, next);
};

/**
 * Removes requests authentication, requests are not authenticated 
 * anymore.
 * An HTTP code 200 is returned to the client.
 */
module.exports.logoutAction = function(request, response, next){
  request.logout();
  response.status(200).send();
};

/**
 * Checks if current request is authenticated.
 * If not send back an HTTP code 401 with appropriate page.
 */
module.exports.restrictAction = function(request, response, next){

  // User is authenticated, keep going
  if(request.isAuthenticated())
      return next();

  // Not authenticated
  response.status(401);
  
  // HTML content
  if(request.accepts("html")){
    response.render("401");  
    return; 
  }
  
  // JSON content
  if(request.accepts("json")){
    response.send({ error: "Not authenticated" });
    return;
  }
  
  // Text content
  response.type("txt").send("Not authenticated");  
  
};