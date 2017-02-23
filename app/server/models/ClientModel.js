'use strict';

/**
 * @module core-models
 */

var util = require('util');
var crypto = require('crypto');
var shortid = require('shortid');
var openVeoApi = require('@openveo/api');

/**
 * Defines a ClientModel to manipulate Web Service client applications.
 *
 * @class ClientModel
 * @extends EntityModel
 * @constructor
 * @param {ClientProvider} provider The entity provider
 */
function ClientModel(provider) {
  ClientModel.super_.call(this, provider);
}

module.exports = ClientModel;
util.inherits(ClientModel, openVeoApi.models.EntityModel);

/**
 * Adds a new client to the clients' collection.
 *
 * @method add
 * @async
 * @param {Object} data A client object
 * @param {String} [data.name] Client's name
 * @param {Array} [data.scopes] Client's scopes
 * @param {String} [data.id] Client's id, if not specified id is generated
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of items inserted
 *   - **Object** The inserted client
 */
ClientModel.prototype.add = function(data, callback) {
  var client = {
    id: data.id || shortid.generate(),
    name: data.name,
    scopes: data.scopes,
    secret: crypto.randomBytes(20).toString('hex')
  };
  this.provider.add(client, function(error, addedCount, clients) {
    if (callback)
      callback(error, addedCount, clients && clients[0]);
  });
};

/**
 * Updates client application.
 *
 * @method update
 * @async
 * @param {String} id The id of the client
 * @param {Object} data The client with all properties to update
 * @param {String} [data.name] Client's name
 * @param {Array} [data.scopes] Client's scopes
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
ClientModel.prototype.update = function(id, data, callback) {
  var client = {};
  if (data.name)
    client.name = data.name;
  if (data.scopes)
    client.scopes = data.scopes;

  this.provider.update(id, client, callback);
};
