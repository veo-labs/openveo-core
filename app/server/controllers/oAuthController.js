'use strict';

/**
 * @module core-controllers
 */

/**
 * Provides route actions for all requests relative to Web Service
 * authentication.
 *
 * @class oauthController
 */

// Module dependencies
var winston = require('winston');
var openVeoAPI = require('@openveo/api');
var pathUtil = process.require('app/server/path.js');
var errors = process.require('app/server/httpErrors.js');

// Module files
var applicationStorage = openVeoAPI.applicationStorage;

// Get logger
var logger = winston.loggers.get('openveo');

/**
 * Retrieves the scope corresponding to the couple url / http method.
 *
 * @method getScopeByUrl
 * @private
 * @static
 * @param {String} url An url
 * @param {String} httpMethod The http method (POST, GET, PUT, DELETE)
 * @return {String} The scope id if found, null otherwise
 */
function getScopeByUrl(url, httpMethod) {
  var scopes = applicationStorage.getWebServiceScopes();

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
 * Validates scopes for the given token depending on requested url.
 *
 * Revoke access to the service if client does not have permission.
 *
 * @method validateScopesAction
 * @static
 */
module.exports.validateScopesAction = function(request, response, next) {

  // An access token has been delivered to this client
  if (request.oauth2.accessToken) {

    // Checks if the client has access to the given api by looking
    // at scopes
    var scope = getScopeByUrl(request.url, request.method);

    // Access granted
    if (scope && request.oauth2.accessToken.scopes.indexOf(scope) > -1)
      next();

    // Access refused
    else {
      logger.warn(
        'Access refused for client ' + request.oauth2.accessToken.clientId + ' for path ' + request.url +
        ' with method ' + request.method);
      next(errors.WS_FORBIDDEN);
    }

  } else {
    next(errors.WS_UNAUTHORIZED);
  }
};
