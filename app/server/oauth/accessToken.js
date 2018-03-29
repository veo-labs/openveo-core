'use strict';

/**
 * @module core-oauth
 */

/**
 * Provides functions to interface oauth tokens and openveo Web Service.
 *
 * @class accessToken
 * @static
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
 * @method getTokenProvider
 * @private
 * @return {TokenProvider} The token provider
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
 * @async
 * @param {String} userId User identifier associated to the OAuth client
 * @param {String} clientId OAuth client id
 * @param {Object} scopes The list of scopes
 * @param {Number} ttl Token time to live (in seconds)
 * @param {Function} callback with:
 *  - **Object** An error if something went wrong or null if everything is fine
 *  - **String** The access token
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
          callback(error, addedTokens[0].token);
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
 * @async
 * @param {String} token Client's access token
 * @param {Function} callback with :
 *  - **Object** An error if something went wrong or null if everything is fine
 *  - **Object** The access token
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
 * @property ttl
 * @type Number
 * @default 3600
 */
accessToken.ttl = 3600;

module.exports = accessToken;
