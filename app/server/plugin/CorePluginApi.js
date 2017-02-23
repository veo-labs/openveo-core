'use strict';

/**
 * @module core-plugin
 */

var util = require('util');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');

/**
 * Defines the Core Plugin API exposed to other plugins.
 *
 * @class CorePluginApi
 * @extends PluginApi
 * @constructor
 */
function CorePluginApi() {
  CorePluginApi.super_.call(this);
}

module.exports = CorePluginApi;
util.inherits(CorePluginApi, openVeoApi.plugin.PluginApi);

/**
 * Gets the list of loaded openveo plugins.
 *
 * @method getPlugins
 * @return {Array} The list of loaded plugins
 */
CorePluginApi.prototype.getPlugins = function() {
  return storage.getPlugins();
};

/**
 * Gets the current database instance.
 *
 * @method getDatabase
 * @return {Database} The application's database
 */
CorePluginApi.prototype.getDatabase = function() {
  return storage.getDatabase();
};

/**
 * Gets the id of the super administrator.
 *
 * @method getSuperAdminId
 * @return {String} The super administrator id
 */
CorePluginApi.prototype.getSuperAdminId = function() {
  return storage.getSuperAdminId();
};

/**
 * Gets the id of the anonymous user.
 *
 * @method getAnonymousUserId
 * @return {String} The anonymous user id
 */
CorePluginApi.prototype.getAnonymousUserId = function() {
  return storage.getAnonymousUserId();
};

/**
 * Gets the list of entities defined by plugins.
 *
 * @method getEntities
 * @return {Object} The list of entities by entity name
 */
CorePluginApi.prototype.getEntities = function() {
  return storage.getEntities();
};

/**
 * Gets the list of permissions defined by plugins.
 *
 * @method getPermissions
 * @return {Object} The list of permissions
 */
CorePluginApi.prototype.getPermissions = function() {
  return storage.getPermissions();
};

/**
 * Gets the list of Web Service scopes defined by plugins.
 *
 * @method getWebServiceScopes
 * @return {Object} The list of Web Service scopes
 */
CorePluginApi.prototype.getWebServiceScopes = function() {
  return storage.getWebServiceScopes();
};

/**
 * Gets information about the application server.
 *
 * @method getServerConfiguration
 * @return {Object} The server configuration
 */
CorePluginApi.prototype.getServerConfiguration = function() {
  var serverConfiguration = storage.getServerConfiguration();
  return {
    httpPort: serverConfiguration.httpPort,
    socketPort: serverConfiguration.socketPort
  };
};
