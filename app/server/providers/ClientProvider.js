"use scrict"

// Module dependencies
var util = require("util");
var openVeoAPI = require("openveo-api");

/**
 * Creates a ClientProvider to interact with database client collection.
 * @param Database database The database to interact with
 */
function ClientProvider(database){
  openVeoAPI.EntityProvider.prototype.init.call(this, database, "clients");
}

module.exports = ClientProvider;
util.inherits(ClientProvider, openVeoAPI.EntityProvider);

/**
 * Retrieves a client application by its id.
 * @param String id The client id 
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 *   - Object The entity
 */
ClientProvider.prototype.getOne = function(id, callback){  
  this.database.get(this.collection, {"id" : id}, { "_id" : 0 }, 1, function(error, data){
    callback(error, data && data[0]);
  });  
};