"use scrict"

// Module dependencies
var util = require("util");
var openVeoAPI = require("openveo-api");

var TokenProvider = process.require("app/server/providers/TokenProvider.js");

/**
 * Creates an TokenModel.
 */
function TokenModel(){
  openVeoAPI.EntityModel.prototype.init.call(this, new TokenProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = TokenModel;
util.inherits(TokenModel, openVeoAPI.EntityModel);

/**
 * Adds a new token.
 * @param String token The token string
 * @param String clientId The client id the token belongs to
 * @param Array scopes A list of scopes with granted access for this token
 * @param Number ttl The title to live in milliseconds of the token
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 */
TokenModel.prototype.add = function(token, clientId, scopes, ttl, callback){
  this.provider.add({
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
 * Removes all tokens associated to a client id.
 * @param String clientId The id of the client
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 */
TokenModel.prototype.removeTokensByClientId = function(clientId, callback){
  this.provider.removeByClient(clientId, function(error){
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
TokenModel.prototype.getTokenByValue = function(token, callback){
  this.provider.getByValue(token, callback);
};