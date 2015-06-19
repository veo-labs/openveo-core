"use scrict"

// Module dependencies
var util = require("util");
var crypto = require("crypto");
var openVeoAPI = require("openveo-api");

var ClientProvider = process.require("app/server/providers/ClientProvider.js");

/**
 * Creates a ClientModel.
 */
function ClientModel(){
  openVeoAPI.EntityModel.prototype.init.call(this, new ClientProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = ClientModel;
util.inherits(ClientModel, openVeoAPI.EntityModel);

/**
 * Adds a new client to the clients collection.
 * @param Object data A client object
 * e.g.
 * {
 *   id : "Client id",
 *   secret : "Client secret",
 *   name : "Name of the client",
 *   scopes : {
 *    scope1 : {
 *     description : "description 1",
 *     name : "name 1",
 *     activated : true
 *    },
 *    scope2 : {
 *     description : "description 2",
 *     name : "name 2",
 *     activated : true
 *    }
 *  }
 * }
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 * @Override
 */
ClientModel.prototype.add = function(data, callback){
  if(!data.scopes){
    callback(new Error("Requires scopes to add a client application"));
    return;
  }

  var client = {
    id : crypto.randomBytes(20).toString("hex"),
    name : data.name,
    scopes : data.scopes,
    secret : crypto.randomBytes(20).toString("hex")
  };
  this.provider.add(client, function(error){
    callback(error, client);
  });
};

/**
 * Updates client application.
 * @param String id The id of the client
 * @param Object data The client with all properties to update
 * e.g.
 * {
 *   name : "New client name",
 *   scopes : {
 *    scope1 : {
 *     description : "description 1",
 *     name : "name 1",
 *     activated : true
 *    },
 *    scope2 : {
 *     description : "description 2",
 *     name : "name 2",
 *     activated : true
 *    }
 *  }
 * }
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 */
ClientModel.prototype.update = function(id, data, callback){
  var client = {};
  if(data.name) client["name"] = data.name;
  if(data.scopes) client["scopes"] = data.scopes;
  this.provider.update(id, client, callback);
};