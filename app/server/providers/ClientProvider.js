'use strict';

/**
 * @module core/providers/ClientProvider
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
 * @param {Array} clients The list of clients to store with for each client:
 * @param {String} clients[].name The client name
 * @param {String} [clients[].id] The client id, generated if not specified
 * @param {Array} [clients[].scopes] The client scopes
 * @param {module:core/providers/ClientProvider~ClientProvider~addCallback} [callback] The function to call when it's
 * done
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
 * @param {ResourceFilter} [filter] Rules to filter client to update
 * @param {Object} data The modifications to perform
 * @param {String} [data.name] The client name
 * @param {Array} [data.scopes] The client scopes
 * @param {module:core/providers/ClientProvider~ClientProvider~updateOneCallback} [callback] The function to call when
 * it's done
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
 * @param {callback} callback Function to call when it's done
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
 * @param {String} indexName The name of the index to drop
 * @param {callback} callback Function to call when it's done
 */
ClientProvider.prototype.dropIndex = function(indexName, callback) {
  this.storage.dropIndex(this.location, indexName, function(error, result) {
    if (result && result.ok)
      process.logger.debug('Index "' + indexName + '" dropped');

    callback(error);
  });
};

/**
 * @callback module:core/providers/ClientProvider~ClientProvider~addCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total The total amount of clients inserted
 * @param {(Array|Undefined)} clients The list of added clients
 */

/**
 * @callback module:core/providers/ClientProvider~ClientProvider~updateOneCallback
 * @param {(Error|null)} error The error if an error occurred, null otherwise
 * @param {(Number|Undefined)} total 1 if everything went fine
 */
