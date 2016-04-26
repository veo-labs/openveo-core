'use strict';

/**
 * @module core-models
 */

var util = require('util');
var crypto = require('crypto');
var shortid = require('shortid');
var openVeoAPI = require('@openveo/api');

var ClientProvider = process.require('app/server/providers/ClientProvider.js');

/**
 * Defines a ClientModel class to manipulate Web Service client
 * applications.
 *
 * @class ClientModel
 * @constructor
 * @extends EntityModel
 */
function ClientModel() {
  openVeoAPI.EntityModel.call(this, new ClientProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = ClientModel;
util.inherits(ClientModel, openVeoAPI.EntityModel);

/**
 * Adds a new client to the clients' collection.
 *
 * @example
 *     var ClientModel = new process.require("app/server/models/ClientModel.js");
 *     var client = new ClientModel();
 *     client.add({
 *       id : "Client id",
 *       secret : "Client secret",
 *       name : "Name of the client",
 *       scopes : [
 *        {
 *         id: "scope1",
 *         description : "description 1",
 *         name : "name 1",
 *         activated : true
 *        },
 *        {
 *         id: "scope2",
 *         description : "description 2",
 *         name : "name 2",
 *         activated : true
 *        }
 *      ]
 *     }, callback);
 *
 * @method add
 * @async
 * @param {Object} data A client object
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
 * @example
 *     var ClientModel = new process.require("app/server/models/ClientModel.js");
 *     var client = new ClientModel();
 *     client.update("1", {
 *       name : "New client name",
 *       scopes : [
 *        {
 *         id : "scope1",
 *         description : "description 1",
 *         name : "name 1",
 *         activated : true
 *        },
 *        {
 *         id : "scope2",
 *         description : "description 2",
 *         name : "name 2",
 *         activated : true
 *        }
 *      ]
 *     }, callback);
 *
 *
 * @method update
 * @async
 * @param {String} id The id of the client
 * @param {Object} data The client with all properties to update
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
ClientModel.prototype.update = function(id, data, callback) {
  var client = {};
  if (data.name)
    client['name'] = data.name;
  if (data.scopes)
    client['scopes'] = data.scopes;
  this.provider.update(id, client, callback);
};
