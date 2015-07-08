"use strict"

// Module dependencies
var winston = require("winston");
var openVeoAPI = require("openveo-api");
var pathUtil = process.require("app/server/path.js");

// Module files
var applicationStorage = openVeoAPI.applicationStorage;

// Get logger
var logger = winston.loggers.get("openveo");

/**
 * Validates scopes for the given token depending on requested url.
 * Revoke access to the service if client does not have permission.
 */
module.exports.validateScopesAction = function(request, response, next){
  
  // An access token has been delivered to this client
  if(request.oauth2.accessToken){
    
    // Checks if the client has access to the given api by looking
    // at scopes
    var scope = getScopeByUrl(request.url, request.method);
    
    // Access granted
    if(scope && request.oauth2.accessToken.scopes[scope] && request.oauth2.accessToken.scopes[scope].activated)
      next();
    
    // Access refused
    else{
      logger.warn("Access refused for client " + request.oauth2.accessToken.clientId + " for path " + request.url + " with method " + request.method);
      response.status(403).send("Requires a token with the " + scope + " scope");
    }

  }
  else{
    logger.warn("Access refused for unknown client");
    response.status(403).send("Forbidden");
  }
};

/**
 * Retrieves the scope corresponding to the couple url / http method.
 * @param String url An url
 * @param String httpMethod The http method (POST, GET, PUT, DELETE)
 * @return String The scope id if found, null otherwise
 */
function getScopeByUrl(url, httpMethod){
  var scopes = applicationStorage.getWebServiceScopes();
  
  for(var id in scopes){
    
    // Got paths associated to the scope
    if(scopes[id].paths){
      
      // Iterate through the list of paths
      for(var i = 0 ; i < scopes[id].paths.length ; i++){
        var path = scopes[id].paths[i];
        
        if(pathUtil.validate(httpMethod + " " + url, path))
          return id;
      }
      
    }
    
  }
  
  return null;
  
}