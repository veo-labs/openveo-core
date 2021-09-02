'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var crypto = require('crypto');
var nanoid = require('nanoid').nanoid;
var openVeoApi = require('@openveo/api');

/**
 * Defines a ClientProvider to get and save Web Service client applications.
 *
 * @class ClientProvider
 * @extends EntityProvider
 * @constructor
 * @param {Database} database The database storing the clients
 */
function ClientProvider(database) {
  ClientProvider.super_.call(this, database, 'core_clients');
}

module.exports = ClientProvider;
util.inherits(ClientProvider, openVeoApi.providers.EntityProvider);

/**
 * Adds Web Service client applications.
 *
 * When adding a client a secret is automatically generated.
 *
 * @method add
 * @async
 * @param {Array} clients The list of clients to store with for each client:
 *   - **String** name The client name
 *   - **String** [id] The client id, generated if not specified
 *   - **Array** [scopes] The client scopes
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of clients inserted
 *   - **Array** The list of added clients
 */
ClientProvider.prototype.add = function(clients, callback) {
  var clientsToAdd = [];

  for (var i = 0; i < clients.length; i++) {
    var client = clients[i];

    if (!client.name)
      return this.executeCallback(callback, new TypeError('Requires a name to create a Web Service client'));

    clientsToAdd.push({
      id: client.id || nanoid(),
      name: client.name,
      scopes: client.scopes || [],
      secret: crypto.randomBytes(20).toString('hex')
    });
  }

  ClientProvider.super_.prototype.add.call(this, clientsToAdd, callback);
};

/**
 * Updates a client.
 *
 * @method updateOne
 * @async
 * @param {ResourceFilter} [filter] Rules to filter client to update
 * @param {Object} data The modifications to perform
 * @param {String} [data.name] The client name
 * @param {Array} [data.scopes] The client scopes
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** 1 if everything went fine
 */
ClientProvider.prototype.updateOne = function(filter, data, callback) {
  var modifications = {};
  if (data.name) modifications.name = data.name;
  if (data.scopes) modifications.scopes = data.scopes;

  ClientProvider.super_.prototype.updateOne.call(this, filter, modifications, callback);
};

/**
 * Creates clients indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 */
ClientProvider.prototype.createIndexes = function(callback) {
  var language = process.api.getCoreApi().getContentLanguage();

  this.storage.createIndexes(this.location, [
    {key: {name: 1}, name: 'byName'},

    // eslint-disable-next-line camelcase
    {key: {name: 'text'}, weights: {name: 1}, default_language: language, name: 'querySearch'}

  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create clients indexes : ' + result.note);

    callback(error);
  });
};

/**
 * Drops an index from database collection.
 *
 * @method dropIndex
 * @async
 * @param {String} indexName The name of the index to drop
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 */
ClientProvider.prototype.dropIndex = function(indexName, callback) {
  this.storage.dropIndex(this.location, indexName, function(error, result) {
    if (result && result.ok)
      process.logger.debug('Index "' + indexName + '" dropped');

    callback(error);
  });
};
