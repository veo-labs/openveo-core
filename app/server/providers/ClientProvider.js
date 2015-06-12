"use scrict"

// The name of the clients collection
var CLIENTS_COLLECTION = "clients";

/**
 * Creates a ClientProvider to interact with database client collection.
 * @param Database database The database to interact with
 */
function ClientProvider(database){
  this.database = database;
  
  if(!this.database)
    throw new Error("ClientProvider needs a database");
}

module.exports = ClientProvider;

/**
 * Gets a client by id. 
 * @param String id The id of the client
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 *   - Object The user
 */
ClientProvider.prototype.getClientById = function(id, callback){
  this.database.get(CLIENTS_COLLECTION, {"id" : id}, { "_id" : 0 }, 1, function(error, data){
    callback(error, data && data[0]);
  });
};

/**
 * Gets the list of clients.
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 *   - Object The list of clients
 */
ClientProvider.prototype.getClients = function(callback){
  this.database.get(CLIENTS_COLLECTION, null, null, -1, callback);
};

/**
 * Adds a new client to the clients collection.
 * @param Object client A client object
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
 */
ClientProvider.prototype.addClient = function(client, callback){
  this.database.insert(CLIENTS_COLLECTION, client, callback);
};

/**
 * Updates client application information.
 * @param String id The id of the client
 * @param Object client The client with all properties to update
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
ClientProvider.prototype.updateClient = function(id, client, callback){
  this.database.update(CLIENTS_COLLECTION, {id : id}, client, callback);
};

/**
 * Removes a client by its id.
 * @param String id The id of the client
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 */
ClientProvider.prototype.removeClient = function(id, callback){
  this.database.remove(CLIENTS_COLLECTION, {id : id}, callback);
};