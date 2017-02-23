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

var crypto = require('crypto');
var TokenModel = process.require('app/server/models/TokenModel.js');
var TokenProvider = process.require('app/server/providers/TokenProvider.js');
var storage = process.require('app/server/storage.js');

var tokenModel;
var accessToken = {};

/**
 * Gets TokenModel instance.
 *
 * @method getTokenModel
 * @private
 * @return {TokenModel} The TokenModel instance
 */
function getTokenModel() {
  if (!tokenModel)
    tokenModel = new TokenModel(new TokenProvider(storage.getDatabase()));

  return tokenModel;
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
 * @param {Function} callback with :
 *  - **Object** An error if something went wrong or null if everything is fine
 *  - **String** The access token
 */
accessToken.create = function(userId, clientId, scopes, ttl, callback) {
  var token = crypto.randomBytes(64).toString('hex');
  var model = getTokenModel();

  // Before adding the token, remove all tokens for this client
  // Then save the new token
  model.removeTokensByClientId(clientId, function(error) {
    if (error)
      return callback(error);

    model.add(token, clientId, scopes, new Date().getTime() + ttl * 1000, function(error) {
      callback(error, token);
    });
  });
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
  var model = getTokenModel();
  model.getTokenByValue(token, callback);
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
