"use scrict"

// Module dependencies
var util = require("util");
var openVeoAPI = require("openveo-api");

/**
 * Creates a TokenProvider.
 * @param Database database The database to interact with
 */
function TokenProvider(database){
  openVeoAPI.EntityProvider.prototype.init.call(this, database, "tokens");
}

module.exports = TokenProvider;
util.inherits(TokenProvider, openVeoAPI.EntityProvider);

/**
 * Removes all tokens associated to a client application.
 * @param String clientId The id of the client
 * @param Function callback Function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 */
TokenProvider.prototype.removeByClient = function(clientId, callback){
  this.database.remove(this.collection, { "clientId" : clientId }, callback);
};

/**
 * Gets a token by its value.
 * @param String token The token value
 * @param Function callback Function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 */
TokenProvider.prototype.getByValue = function(token, callback){
  this.database.get(this.collection, {"token" : token}, { "_id" : 0 }, 1, function(error, data){
    callback(error, data && data[0]);
  });
};