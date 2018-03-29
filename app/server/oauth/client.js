'use strict';

/**
 * @module core-oauth
 */

/**
 * Provides functions to interface oauth clients and openveo Web Service.
 *
 * @class client
 * @static
 */

var openVeoApi = require('@openveo/api');
var ClientProvider = process.require('app/server/providers/ClientProvider.js');
var ResourceFilter = openVeoApi.storages.ResourceFilter;

var clientProvider;
var client = {};

/**
 * Gets client provider.
 *
 * @method getClientProvider
 * @private
 * @return {ClientProvider} The client provider
 */
function getClientProvider() {
  if (!clientProvider)
    clientProvider = new ClientProvider(process.api.getCoreApi().getDatabase());

  return clientProvider;
}

/**
 * Gets clients id.
 *
 * @method getId
 * @static
 * @param {Object} oAuthClient An OAuth client
 * @param {String} oAuthClient.id The client's id
 * @return {String} The client id
 */
client.getId = function(oAuthClient) {
  return oAuthClient.id;
};

/**
 * Fetches client object by primary key.
 *
 * @method fetchById
 * @static
 * @param {String} id The client id
 * @param {Function} callback with :
 *  - **Object** An error is something went wrong or null if everything is fine
 *  - **Object** The client object or null if something went wrong
 */
client.fetchById = function(id, callback) {
  var provider = getClientProvider();
  provider.getOne(new ResourceFilter().equal('id', id), null, callback);
};

/**
 * Verifies client's secret.
 *
 * @method checkSecret
 * @static
 * @param {Object} oAuthClient An OAuth client
 * @param {String} oAuthClient.secret The client's secret
 * @param {String} secret OAuth client's secret to verify
 * @param {Function} callback with :
 *  - **Error** An error is something went wrong or null if everything is fine
 *  - **Boolean** true if the client's secret is verified
 */
client.checkSecret = function(oAuthClient, secret, callback) {
  callback(null, (oAuthClient.secret === secret));
};

/**
 * Checks grant type permission for the client.
 *
 * For now only client_credentials grant type is available.
 *
 * @method checkGrantType
 * @static
 * @param {Object} client An OAuth client
 * @param {String} grantType The grant type asked by client
 * @return {Boolean} true if the grant type is "client_credentials"
 * false otherwise
 */
client.checkGrantType = function(client, grantType) {
  return (grantType === 'client_credentials');
};

/**
 * Gets the list of scopes granted for the client.
 *
 * @method checkScope
 * @static
 * @param {Object} oAuthClient An OAuth client
 * @param {Object} oAuthClient.scopes The client's scopes
 * @return {Array} scope The list of scopes sent by the OAuth client
 */
client.checkScope = function(oAuthClient) {
  return oAuthClient.scopes;
};

module.exports = client;
