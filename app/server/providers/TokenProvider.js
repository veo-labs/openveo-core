'use strict';

/**
 * @module core/providers/TokenProvider
 */

var util = require('util');
var crypto = require('crypto');
var openVeoApi = require('@openveo/api');

/**
 * Defines a TokenProvider to get and save Web Service tokens.
 *
 * @class TokenProvider
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
 * @param {Array} tokens The list of tokens to store with for each token:
 * @param {String} tokens[].clientId The client id the token belongs to
 * @param {Number} tokens[].ttl The time to live in milliseconds of the token
 * @param {Array} [tokens[].scopes] A list of scopes with granted access for this token
 * @param {module:core/providers/TokenProvider~TokenProvider~addCallback} [callback] The function to call when it's done
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
 * @param {ResourceFilter} [filter] Rules to filter the token to update
 * @param {Object} data The modifications to perform
 * @param {Number} [data.ttl] The time to live in milliseconds of the token
 * @param {module:core/providers/TokenProvider~TokenProvider~updateOneCallback} [callback] The function to call when
 * it's done
 */
TokenProvider.prototype.updateOne = function(filter, data, callback) {
  var modifications = {};
  if (data.ttl) modifications.ttl = data.ttl;

  TokenProvider.super_.prototype.updateOne.call(this, filter, modifications, callback);
};

/**
 * Creates tokens indexes.
 *
 * @param {callback} callback Function to call when it's done
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

/**
 * @callback module:core/providers/TokenProvider~TokenProvider~addCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total The total amount of tokens inserted
 * @param {(Array|Undefined)} tokens The list of added tokens
 */

/**
 * @callback module:core/providers/TokenProvider~TokenProvider~updateOneCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total 1 if everything went fine
 */
