"use strict"

// Module dependencies
var passport = require("passport");
var openVeoAPI = require("openveo-api");
var applicationStorage = openVeoAPI.applicationStorage;

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
  var httpErrorCode = 401;

  // User is authenticated, keep going
  if(request.isAuthenticated()){
    httpErrorCode = 403;

    // Get requested permission for this request
    var permission = getPermissionByUrl(request.url, request.method);

    // No particular permission requested : access granted by default
    if(!permission || !request.user.roles || request.user.id == 0)
      return next();

    // Checks if user has permission on this url
    // Iterates through user roles to find if requested permission
    // is part of his privileges
    for(var i = 0 ; i < request.user.roles.length ; i++){
      var role = request.user.roles[i];

      // Found permission : access granted
      if(role.permissions[permission] && role.permissions[permission].activated){
        return next();
      }

    }

  }

  // Not authenticated
  response.status(httpErrorCode);
  
  // HTML content
  if(request.accepts("html")){
    response.render(httpErrorCode);
    return;
  }
  
  // JSON content
  if(request.accepts("json")){
    response.send({ error: httpErrorCode });
    return;
  }
  
  // Text content
  response.type("txt").send(httpErrorCode);

};

/**
 * Gets the list of permissions and return it as a JSON object.
 * Returns a JSON object as :
 * {
 *  "readApplications" : {
 *    "name" : "Name of the permission",
 *    "description" : "Description of the permission"
 *  }
 * }
 */
module.exports.getPermissionsAction = function(request, response, next){
  var permissions = applicationStorage.getPermissions();
  var lightPermissions = {};

  for(var permissionId in permissions){
    lightPermissions[permissionId] = {
       name : permissions[permissionId].name,
       description : permissions[permissionId].description
    };
  }

  response.send({ permissions : lightPermissions });
};

/**
 * Retrieves the permission corresponding to the couple url / http method.
 * @param String url An url
 * @param String httpMethod The http method (POST, GET, PUT, DELETE)
 * @return String The permission id if found, null otherwise
 */
function getPermissionByUrl(url, httpMethod){
  var permissions = applicationStorage.getPermissions();

  for(var id in permissions){

    if(permissions[id].paths){

      for(var i = 0 ; i < permissions[id].paths.length ; i++){
        var pathPattern = permissions[id].paths[i].replace(/\//g, "\\/").replace(/\*/g, ".*");
        var pattern = new RegExp("^(get|post|delete|put)? ?" + pathPattern.toLowerCase());

        if(pattern.test(httpMethod.toLowerCase() + " " + url))
          return id;

      }

    }

  }

  return null;
}