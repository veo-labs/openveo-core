'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');

/**
 * Defines a TokenProvider class to get and save Web Service tokens.
 *
 * @class TokenProvider
 * @constructor
 * @extends EntityProvider
 * @param {Database} database The database to interact with
 */
function TokenProvider(database) {
  openVeoAPI.EntityProvider.call(this, database, 'tokens');
}

module.exports = TokenProvider;
util.inherits(TokenProvider, openVeoAPI.EntityProvider);

/**
 * Removes all tokens associated to a client application.
 *
 * @method removeByClient
 * @async
 * @param {String} clientId The id of the client
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of deleted tokens
 */
TokenProvider.prototype.removeByClient = function(clientId, callback) {
  var filter = {};
  filter['clientId'] = {$in: [clientId]};

  this.database.remove(this.collection, filter, callback);
};

/**
 * Gets a token by its value.
 *
 * @method getByValue
 * @async
 * @param {String} token The token value
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The fetched token
 */
TokenProvider.prototype.getByValue = function(token, callback) {
  this.database.get(this.collection,
    {
      token: token
    },
    {
      _id: 0
    },
    1, function(error, data) {
      callback(error, data && data[0]);
    });
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
  this.database.createIndexes(this.collection, [
    {key: {clientId: 1}, name: 'byClientId'},
    {key: {token: 1}, name: 'byToken'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create tokens indexes : ' + result.note);

    callback(error);
  });
};
