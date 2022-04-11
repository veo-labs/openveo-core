'use strict';

/**
 * Provides functions to interface oauth tokens and openveo Web Service.
 *
 * @module core/oauth/accessToken
 */

var openVeoApi = require('@openveo/api');
var TokenProvider = process.require('app/server/providers/TokenProvider.js');
var storage = process.require('app/server/storage.js');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

var tokenProvider;
var accessToken = {};

/**
 * Gets token provider.
 *
 * @private
 * @return {module:core/providers/TokenProvider~TokenProvider} The token provider
 */
function getTokenProvider() {
  if (!tokenProvider)
    tokenProvider = new TokenProvider(storage.getDatabase());

  return tokenProvider;
}

/**
 * Creates access token and saves it in database.
 *
 * It will previously remove all tokens associated to the client.
 *
 * @method create
 * @static
 * @param {String} userId User identifier associated to the OAuth client
 * @param {String} clientId OAuth client id
 * @param {Object} scopes The list of scopes
 * @param {Number} ttl Token time to live (in seconds)
 * @param {module:core/oauth/accessToken~createCallback} callback A function to call when its done
 */
accessToken.create = function(userId, clientId, scopes, ttl, callback) {
  var provider = getTokenProvider();

  // Before adding the token, remove all tokens for this client
  // Then save the new token
  provider.remove(
    new ResourceFilter().equal('clientId', clientId),
    function(error) {
      if (error)
        return callback(error);

      provider.add(
        [{
          clientId: clientId,
          scopes: scopes,
          ttl: new Date().getTime() + ttl * 1000
        }],
        function(error, total, addedTokens) {
          if (error) return callback(error);
          callback(null, addedTokens[0].token);
        }
      );
    }
  );
};

/**
 * Fetches accessToken object by token.
 *
 * @method fetchByToken
 * @static
 * @param {String} token Client's access token
 * @param {module:core/oauth/accessToken~fetchByTokenCallback} callback A function to call when its done
 */
accessToken.fetchByToken = function(token, callback) {
  var provider = getTokenProvider();
  provider.getOne(new ResourceFilter().equal('token', token), null, callback);
};

/**
 * Checks if token is valid and not expired.
 *
 * @method checkTTL
 * @static
 * @param {Object} token The access token
 * @return {Boolean} true if the token is valid, false otherwise
 */
accessToken.checkTTL = function(token) {
  return (token.ttl > new Date().getTime());
};

/**
 * Default token Time To Live value (1 hour).
 *
 * @type {Number}
 * @default
 * @static
 */
accessToken.ttl = 3600;

module.exports = accessToken;

/**
 * @callback module:core/oauth/accessToken~createCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(String|Undefined)} token The access token
 */

/**
 * @callback module:core/oauth/accessToken~fetchByTokenCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(String|Undefined)} token The access token
 */
