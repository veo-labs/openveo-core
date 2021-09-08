'use strict';

/**
 * @module core/controllers/OAuthController
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var pathUtil = process.require('app/server/path.js');
var errors = process.require('app/server/httpErrors.js');
var storage = process.require('app/server/storage.js');
var Controller = openVeoApi.controllers.Controller;

/**
 * Retrieves, from list of scopes, the scope corresponding to the couple url / http method.
 *
 * @memberof module:core/controllers/OAuthController~OAuthController
 * @private
 * @param {String} url An url
 * @param {String} httpMethod The http method (POST, GET, PUT, DELETE)
 * @return {String} The scope id if found, null otherwise
 */
function getScopeByUrl(url, httpMethod) {
  var scopes = storage.getWebServiceScopes();

  for (var i = 0; i < scopes.length; i++) {
    var scope = scopes[i];

    // Got paths associated to the scope
    if (scope.paths) {

      // Iterate through the list of paths
      for (var j = 0; j < scope.paths.length; j++) {
        var path = scope.paths[j];

        if (pathUtil.validate(httpMethod + ' ' + url, path))
          return scope.id;
      }

    }
  }

  return null;
}

/**
 * Retrieves, recursively, the id of all permissions.
 *
 * @example
 * var permissions = [
 *   {
 *     label: 'Permissions group',
 *     permissions: [
 *       {
 *         id: 'perm-1',
 *         name: 'Name of the first permission',
 *         description: 'Description of the first permission',
 *         paths: [ 'get /path1' ]
 *       }
 *     ]
 *   },
 *   {
 *     id: 'perm-2',
 *     name: 'Name of the second permission',
 *     description: 'Description of the second permission',
 *     paths: [ 'get /path2' ]
 *   }
 * ];
 * getPermissionIds(permissions); // ["perm-1", "perm-2"]
 *
 * @memberof module:core/controllers/OAuthController~OAuthController
 * @private
 * @param {Array} permissions The list of permissions to search in
 * @return {Array} The list of permission ids
 */
function getPermissionIds(permissions) {
  var permissionsList = [];
  for (var i = 0; i < permissions.length; i++) {

    if (permissions[i].id) {

      // Single permission
      permissionsList.push(permissions[i].id);

    } else if (permissions[i].label) {

      // Group of permissions
      var permissionIds = getPermissionIds(permissions[i].permissions);

      if (permissionIds && permissionIds.length > 0)
        permissionsList = permissionsList.concat(permissionIds);
    }
  }

  return permissionsList;
}

/**
 * Defines a controller to handle requests relative to Web Service authentication.
 *
 * @class OauthController
 * @extends Controller
 */
function OauthController() {
  OauthController.super_.call(this);
}

module.exports = OauthController;
util.inherits(OauthController, Controller);

/**
 * Validates scopes for the given token depending on requested url.
 *
 * Revoke access to the service if client does not have permission.
 *
 * @param {Request} request ExpressJS HTTP Request
 * @param {Object} request.oauth2 Request's OAuth information
 * @param {Object} request.oauth2.accessToken The connected client's token
 * @param {String} request.url The request's url
 * @param {String} request.method The request's method
 * @param {Response} response ExpressJS HTTP Response
 * @param {Function} next Function to defer execution to the next registered middleware
 */
OauthController.prototype.validateScopesAction = function(request, response, next) {

  // An access token has been delivered to this client
  if (request.oauth2.accessToken) {

    // Checks if the client has access to the given api by looking
    // at scopes
    var scope = getScopeByUrl(request.url, request.method);

    if (scope && request.oauth2.accessToken.scopes.indexOf(scope) > -1) {

      // Access granted

      // OpenVeo and plugins may define two kinds of permissions:
      // - scope permissions for the Web Service
      // - internal permissions
      // OAuth authentication validates requests based on URLs using scope permissions but it doesn't validate the
      // internal permissions. As Core and plugins may validate internal permissions based on authenticated user
      // permissions, a user has to be created for an authenticated Web Service client. This user has full
      // privileges on internal permissions.
      request.user = {
        id: request.oauth2.accessToken.clientId,
        permissions: getPermissionIds(storage.getPermissions()),
        type: 'oAuthClient'
      };

      next();
    } else {

      // Access refused
      process.logger.warn(
        'Access refused for client ' + request.oauth2.accessToken.clientId + ' for path ' + request.url +
        ' with method ' + request.method);
      next(errors.WS_FORBIDDEN);

    }

  } else {
    next(errors.WS_UNAUTHORIZED);
  }
};
