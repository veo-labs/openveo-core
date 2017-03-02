'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var passport = require('passport');
var openVeoApi = require('@openveo/api');
var pathUtil = process.require('app/server/path.js');
var errors = process.require('app/server/httpErrors.js');
var storage = process.require('app/server/storage.js');
var Controller = openVeoApi.controllers.Controller;

/**
 * Retrieves, recursively, the permission corresponding to the couple url / http method.
 *
 * @example
 *     var permissions = [
 *       {
 *         label: 'Permissions group',
 *         permissions: [
 *           {
 *             id: 'perm-1',
 *             name: 'Name of the permission',
 *             description: 'Description of the permission',
 *             paths: [ 'get /publishVideo' ]
 *           }
 *         ]
 *       }
 *     ];
 *     getPermissionByUrl(permissions, '/publishVideo', 'GET'); // "perm-1"
 *     getPermissionByUrl(permissions, '/video', 'GET'); // null
 *
 * @method getPermissionByUrl
 * @private
 * @static
 * @param {Array} permissions The list of permissions
 * @param {String} url An url
 * @param {String} httpMethod The http method (POST, GET, PUT, DELETE)
 * @return {String} The permission id if found, null otherwise
 */
function getPermissionByUrl(permissions, url, httpMethod) {
  var permissionsList = [];
  for (var i = 0; i < permissions.length; i++) {

    // Single permission
    if (permissions[i].id) {
      if (permissions[i].paths) {
        for (var j = 0; j < permissions[i].paths.length; j++) {
          var path = permissions[i].paths[j];
          if (pathUtil.validate(httpMethod + ' ' + url, path))
            permissionsList.push(permissions[i].id);
        }
      }
    } else if (permissions[i].label) {

      // Group of permissions
      var permissionId = getPermissionByUrl(permissions[i].permissions, url, httpMethod);

      if (permissionId && permissionId.length > 0) {
        permissionsList = permissionsList.concat(permissionId);
      }
    }
  }
  if (permissionsList.length == 0)
    return null;
  else
    return permissionsList;
}

/**
 * Checks if asked page is the user profile.
 *
 * All users must have access to its profile.
 *
 * @method isUserProfileUrl
 * @private
 * @param {Object} request The express request object handled by the server
 * @param {Object} request.user The connected user
 * @param {String} request.user.id The connected user id
 * @param {Boolean} request.user.locked true if user is locked, false otherwise
 * @param {String} request.method Request's HTTP method
 * @param {String} request.path Request's path
 * @return {Boolean} true if the page is the user profile page, false otherwise
 */
function isUserProfileUrl(request) {
  var path = '/users/' + request.user.id;
  return !request.user.locked && ((request.path === path) && (request.method === 'POST'));
}

/**
 * Defines a controller to handlerequests relative to back end authentication.
 *
 * @class authenticationController
 * @extends Controller
 * @constructor
 */
function AuthenticationController() {
  AuthenticationController.super_.call(this);
}

module.exports = AuthenticationController;
util.inherits(AuthenticationController, Controller);

/**
 * Establishes requests authentication using module passport.
 *
 * If authentication fails, an HTTP code 401 is returned to the client.
 * If authentication succeeds, an HTTP code 200 is returned to the
 * client with user information as a JSON Object.
 *
 * @method authenticateAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
AuthenticationController.prototype.authenticateAction = function(request, response, next) {

  // Use passport to authenticate the request
  passport.authenticate('local', function(error, user) {

    // An error occurred while authenticating
    // Dispatch the error
    if (error)
      return next(errors.BACK_END_AUTHENTICATION_ERROR);

    // No user was found for the given login / password
    // Send back a 401 Not Authorized
    if (!user)
      return next(errors.BACK_END_AUTHENTICATION_FAILED);

    // Establish a session, authenticate the request
    request.login(user, function(loginError) {
      if (loginError)
        return next(loginError);

      return response.status(200).send(user);
    });

  })(request, response, next);
};

/**
 * Removes requests authentication, requests are not authenticated
 * anymore.
 *
 * An HTTP code 200 is returned to the client with no content.
 *
 * @method logoutAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
AuthenticationController.prototype.logoutAction = function(request, response, next) {
  request.logout();
  next();
};

/**
 * Checks if current request is authenticated.
 *
 * If not send back an HTTP code 401 with appropriate page.
 * It just get to the next route action if permission is granted.
 *
 * @method restrictAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {String} request.url Request's url
 * @param {String} request.method Request's method
 * @param {Object} request.user The connected user
 * @param {String} request.user.id The connected user id
 * @param {Array} request.user.permissions The connected user permissions
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
AuthenticationController.prototype.restrictAction = function(request, response, next) {
  var error = errors.BACK_END_UNAUTHORIZED;

  // User is authenticated
  if (request.isAuthenticated()) {
    error = errors.BACK_END_FORBIDDEN;

    // Get requested permission for this request
    var permissions = getPermissionByUrl(storage.getPermissions(), request.url, request.method);
    var superAdminId = storage.getConfiguration().superAdminId;

    // No particular permission requested : access granted by default
    // Also always grant access to super administrator
    if (!permissions || request.user.id === superAdminId || isUserProfileUrl(request))
      return next();

    // Checks if user has permission on this url
    // Iterates through user roles to find if requested permission
    // is part of his privileges
    if (request.user.permissions) {

      // Found permission : access granted
      for (var i = 0; i < permissions.length; i++)
        if (request.user.permissions.indexOf(permissions[i]) >= 0)
          return next();

    }

  }

  // Not authenticated
  return next(error);
};

/**
 * Gets the tree of groups / permissions and return it as a JSON object.
 *
 * @method getPermissionsAction
 * @param {Request} request ExpressJS HTTP Request
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
AuthenticationController.prototype.getPermissionsAction = function(request, response) {
  var permissions = storage.getPermissions();
  response.send({
    permissions: permissions
  });
};
