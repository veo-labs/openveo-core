"use scrict"

// The name of the access tokens collection
var TOKENS_COLLECTION = "tokens";

/**
 * Creates an TokenProvider to interact with database
 * accessToken collection.
 * @param Database database The database to interact with
 */
function TokenProvider(database){
  this.database = database;
  
  if(!this.database)
    throw new Error("TokenProvider needs a database");
}

module.exports = TokenProvider;

/**
 * Adds a new token to the tokens collection.
 * @param String token The token string
 * @param String clientId The client id the token belongs to
 * @param Array scopes A list of scopes with granted access for this token
 * @param Number ttl The title to live in milliseconds of the token
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 */
TokenProvider.prototype.addToken = function(token, clientId, scopes, ttl, callback){
  this.database.insert(TOKENS_COLLECTION, {
    "token" : token,
    "clientId" : clientId,
    "scopes" : scopes || [],
    "ttl" : ttl
  }, function(error){
    if(callback)
      callback(error);
  });
};

/**
 * Removes tokens associated to a client id.
 * @param String clientId The id of the client
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 */
TokenProvider.prototype.removeTokensByClientId = function(clientId, callback){
  this.database.remove(TOKENS_COLLECTION, { "clientId" : clientId }, function(error){
    if(callback)
      callback(error);
  });
};

/**
 * Fetch a token by its value.
 * @param String token The token value
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 *   - Object The token
 */
TokenProvider.prototype.getToken = function(token, callback){
  this.database.get(TOKENS_COLLECTION, {"token" : token}, { "_id" : 0 }, 1, function(error, data){
    callback(error, data && data[0]);
  });
};