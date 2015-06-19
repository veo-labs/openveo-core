"use strict"

// Module dependencies
var openVeoAPI = require("openveo-api");
var ClientModel = process.require("app/server/models/ClientModel.js");

var applicationStorage = openVeoAPI.applicationStorage;
var clientModel;
var client = {};

/**
 * Gets clients id.
 * @param Object oAuthClient An OAuth client
 * @return String The client id
 */
client.getId = function(oAuthClient){
  return oAuthClient.id;
};

/**
 * Fetches client object by primary key.
 * @param String id The client id
 * @param Function callback with :
 *  - Object An error is something went wrong or null if everything is fine
 *  - Object The client object or null if something went wrong
 * {
 *   id : "7bff6606c8fc4e1259ff44342ad870502dbcf9d5",
 *   name : "Client application name",
 *   secret : "7532552b97cba918c5118a8a10bb7b5f8dbd5ab0",
 *   scopes : {
 *     scope1 : {
 *        description : "description 1",
 *        name : "name 1",
 *        activated : true
 *     },
 *     scope2 : {
 *        description : "description 2",
 *        name : "name 2",
 *        activated : true
 *     }
 *   }
 * }
 */
client.fetchById = function(id, callback){
  var model = getClientModel();
  model.getOne(id, callback);
};

/**
 * Verifies client's secret.
 * @param Object oAuthClient An OAuth client
 * @param String secret OAuth client's secret to verify
 * @return Boolean true if the client's secret is verified
 */
client.checkSecret = function(oAuthClient, secret){
  return (oAuthClient.secret === secret);
};

/**
 * Checks grant type permission for the client.
 * For now only client_credentials grant type is available.
 *
 * @param Object client An OAuth client
 * @param String grantType The grant type asked by client
 * @return Boolean true if the grand type is "client_credentials" false
 * otherwise
 */
client.checkGrantType = function(client, grantType){
  return (grantType === "client_credentials");
};

/**
 * Gets the list of scopes granted for the client.
 * @param Object oAuthClient An OAuth client
 * @param String scope The list of scopes sent by the OAuth client
 */
client.checkScope = function(oAuthClient, scope){
  return oAuthClient.scopes;
};

module.exports = client;

/**
 * Gets ClientModel instance.
 * @return ClientModel The ClientModel instance
 */
function getClientModel(){
  if(!clientModel)
    clientModel = new ClientModel();
  
  return clientModel;
}