"use strict"

// Module dependencies
var crypto = require("crypto");
var openVeoAPI = require("openveo-api");
var TokenModel = process.require("app/server/models/TokenModel.js");

var applicationStorage = openVeoAPI.applicationStorage;
var tokenModel;
var accessToken = {};

/**
 * Create access token and save it in database.
 * It will previously remove all tokens associated to the client.
 *
 * @param String userId User identifier associated to the OAuth client
 * @param String clientId OAuth client id
 * @param Object scopes The list of scopes
 * {
 *   "scope1" : {
 *     "description" : "description 1",
 *     "name" : "name 1",
 *     "activated" : true
 *   },
 *   "scope2" : {
 *     "description" : "description 2",
 *     "name" : "name 2",
 *     "activated" : true
 *   }
 * }  
 * @param Number ttl Token time to live (in seconds)
 * @param Function callback with :
 *  - Object An error if something went wrong or null if everything is fine
 *  - String The access token
 */
accessToken.create = function(userId, clientId, scopes, ttl, callback){
  var token = crypto.randomBytes(64).toString("hex");
  var model = getTokenModel();
  
  // Before adding the token, remove all tokens for this client
  model.removeTokensByClientId(clientId);

  // Save the new token
  model.add(token, clientId, scopes, new Date().getTime() + ttl * 1000, function(error){
    callback(error, token);
  });
};

/**
 * Fetches accessToken object by token.
 * @param String token Client's access token
 * @param Function callback with :
 *  - Object An error is something went wrong or null if everything 
 * went fine
 *  - Object The access token
 *    {
 *      token : "756157bd2f1ffd0bb3945198411a0c568d653e02953180b58e0a4c770d07e068e2806e1b603b865d7124a422a9654a49c27f36c5499576368104bebd7f59fd51",
 *      clientId : "9f334536352a995af2be1cce83a9c71c243666b8",
 *      scopes : {
 *        scope1 : {
 *          description : "description 1",
 *          name : "name 1",
 *          activated : true
 *        },
 *        scope2 : {
 *          description : "description 2",
 *          name : "name 2",
 *          activated : true
 *        }
 *      }
 *    }
 */
accessToken.fetchByToken = function(token, callback){
  var model = getTokenModel();
  model.getTokenByValue(token, callback);
};

/**
 * Check if token is valid and not expired.
 * @param Object token The access token 
 * @return Boolean true if the token is valid, false otherwise
 */
accessToken.checkTTL = function(token){
  return (token.ttl > new Date().getTime());
};

// Default token time to live value (1 hour)
accessToken.ttl = 3600;

module.exports = accessToken;

/**
 * Gets TokenModel instance.
 * @return TokenModel The TokenModel instance
 */
function getTokenModel(){
  if(!tokenModel)
    tokenModel = new TokenModel();
  
  return tokenModel;
}