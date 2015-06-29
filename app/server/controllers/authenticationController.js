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

  // User is authenticated
  if(request.isAuthenticated()){
    httpErrorCode = 403;

    // Get requested permission for this request
    var permission = getPermissionByUrl(applicationStorage.getPermissions(), request.url, request.method);

    // No particular permission requested : access granted by default
    // Also always grant access to primary user 0
    if(!permission || request.user.id == 0)
      return next();

    // Checks if user has permission on this url
    // Iterates through user roles to find if requested permission
    // is part of his privileges
    if(request.user.roles){
      for(var i = 0 ; i < request.user.roles.length ; i++){
        var role = request.user.roles[i];

        // Found permission : access granted
        for(var j = 0 ; j < role.permissions.length ; j++){
          if(role.permissions[j].id === permission && role.permissions[j].activated)
            return next();
        }

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
 * Gets the tree of groups / permissions and return it as a JSON object.
 * Returns a JSON object as :
 * [
 *  {
 *    "label" : "Permissions group",
 *    "permissions" : [
 *      {
 *        "id" : "perm-1",
 *        "name" : "Name of the permission",
 *        "description" : "Description of the permission"
 *      }
 *      ...
 *    ]
 *  }
 *  ...
 * ]
 */
module.exports.getPermissionsAction = function(request, response, next){
  var permissions = applicationStorage.getPermissions();
  response.send({ permissions : permissions });
};

/**
 * Retrieves, recursively, the permission corresponding to the
 * couple url / http method.
 * @param Object permissions The tree of permissions
 * e.g.
 * [
 *  {
 *    "label" : "Permissions group",
 *    "permissions" : [
 *      {
 *        "id" : "perm-1",
 *        "name" : "Name of the permission",
 *        "description" : "Description of the permission"
 *      }
 *      ...
 *    ]
 *  }
 *  ...
 * ]
 * @param String url An url
 * @param String httpMethod The http method (POST, GET, PUT, DELETE)
 * @return String The permission id if found, null otherwise
 */
function getPermissionByUrl(permissions, url, httpMethod){
  for(var i = 0 ; i < permissions.length ; i++){

    // Single permission
    if(permissions[i].id){
      if(permissions[i].paths){
        for(var j = 0 ; j < permissions[i].paths.length ; j++){
          var pathPattern = permissions[i].paths[j].replace(/\//g, "\\/").replace(/\*/g, ".*");
          var pattern = new RegExp("^(get|post|delete|put)? ?" + pathPattern.toLowerCase());

          if(pattern.test(httpMethod.toLowerCase() + " " + url))
            return permissions[i].id;
        }
      }
    }

    // Group of permissions
    else if(permissions[i].label){
      var permissionId = getPermissionByUrl(permissions[i].permissions, url, httpMethod);

      if(permissionId)
        return permissionId;
    }

  }

  return null;
}