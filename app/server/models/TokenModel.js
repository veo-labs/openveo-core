'use strict';

/**
 * @module core-models
 */

var util = require('util');
var openVeoApi = require('@openveo/api');

/**
 * Defines a TokenModel to manipulate tokens for Web Service authentication.
 *
 * @class TokenModel
 * @extends EntityModel
 * @constructor
 * @param {TokenProvider} provider The entity provider
 */
function TokenModel(provider) {
  TokenModel.super_.call(this, provider);
}

module.exports = TokenModel;
util.inherits(TokenModel, openVeoApi.models.EntityModel);

/**
 * Adds a new token.
 *
 * @method add
 * @async
 * @param {String} token The token string
 * @param {String} clientId The client id the token belongs to
 * @param {Array} scopes A list of scopes with granted access for this token
 * @param {Number} ttl The time to live in milliseconds of the token
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of items inserted
 *   - **Object** The inserted token
 */
TokenModel.prototype.add = function(token, clientId, scopes, ttl, callback) {
  this.provider.add({
    token: token,
    clientId: clientId,
    scopes: scopes || [],
    ttl: ttl
  },
  function(error, addedCount, tokens) {
    if (callback)
      callback(error, addedCount, tokens && tokens[0]);
  });
};

/**
 * Removes all tokens associated to a client id.
 *
 * @method removeTokensByClientId
 * @async
 * @param {String} clientId The id of the client
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of deleted tokens
 */
TokenModel.prototype.removeTokensByClientId = function(clientId, callback) {
  this.provider.removeByClient(clientId, function(error, deletedCount) {
    if (callback)
      callback(error, deletedCount);
  });
};

/**
 * Fetch a token by its value.
 *
 * @method getTokenByValue
 * @async
 * @param {String} token The token value
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The fetched token
 */
TokenModel.prototype.getTokenByValue = function(token, callback) {
  this.provider.getByValue(token, callback);
};
