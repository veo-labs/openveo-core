'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var crypto = require('crypto');
var openVeoApi = require('@openveo/api');

/**
 * Defines a TokenProvider to get and save Web Service tokens.
 *
 * @class TokenProvider
 * @constructor
 * @param {Database} database The database to interact with
 */
function TokenProvider(database) {
  TokenProvider.super_.call(this, database, 'core_tokens');
}

module.exports = TokenProvider;
util.inherits(TokenProvider, openVeoApi.providers.EntityProvider);

/**
 * Adds tokens.
 *
 * @method add
 * @async
 * @param {Array} tokens The list of tokens to store with for each token:
 *   - **String** clientId The client id the token belongs to
 *   - **Number** ttl The time to live in milliseconds of the token
 *   - **Array** [scopes] A list of scopes with granted access for this token
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of tokens inserted
 *   - **Array** The list of added tokens
 */
TokenProvider.prototype.add = function(tokens, callback) {
  var tokensToAdd = [];

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (!token.clientId || !token.ttl)
      return this.executeCallback(callback, new TypeError('Requires clientId and ttl to create a token'));

    tokensToAdd.push({
      token: crypto.randomBytes(64).toString('hex'),
      clientId: token.clientId,
      scopes: token.scopes || [],
      ttl: token.ttl
    });
  }

  TokenProvider.super_.prototype.add.call(this, tokensToAdd, callback);
};

/**
 * Updates a token.
 *
 * @method updateOne
 * @async
 * @param {ResourceFilter} [filter] Rules to filter the token to update
 * @param {Object} data The modifications to perform
 * @param {Number} [data.ttl] The time to live in milliseconds of the token
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** 1 if everything went fine
 */
TokenProvider.prototype.updateOne = function(filter, data, callback) {
  var modifications = {};
  if (data.ttl) modifications.ttl = data.ttl;

  TokenProvider.super_.prototype.updateOne.call(this, filter, modifications, callback);
};

/**
 * Creates tokens indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
TokenProvider.prototype.createIndexes = function(callback) {
  this.storage.createIndexes(this.location, [
    {key: {clientId: 1}, name: 'byClientId'},
    {key: {token: 1}, name: 'byToken'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create tokens indexes : ' + result.note);

    callback(error);
  });
};
