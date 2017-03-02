'use strict';

/**
 * @module core
 */

/**
 * Storage is a global context for the core.
 *
 * @class storage
 * @static
 */

// Stores a bunch of information
var menu;
var database;
var scopes;
var entities;
var permissions;
var serverConfiguration;
var configuration;

/**
 * Gets the computed back end menu with all links.
 *
 * @method getMenu
 * @static
 * @return {Array} The list of back end links
 */
module.exports.getMenu = function() {
  return menu;
};

/**
 * Sets the back end menu list of links.
 *
 * @method setMenu
 * @static
 * @param {Array} newMenu The list of back end menu links
 */
module.exports.setMenu = function(newMenu) {
  menu = newMenu;
};

/**
 * Gets the current database instance.
 *
 * @method getDatabase
 * @static
 * @return {Database} A Database object
 */
module.exports.getDatabase = function() {
  return database;
};

/**
 * Sets a new database instance as the current database.
 *
 * @method setDatabase
 * @static
 * @param {Database} newDatabase The new database of the application
 */
module.exports.setDatabase = function(newDatabase) {
  database = newDatabase;
};

/**
 * Sets the web service list of scopes.
 *
 * @method setWebServiceScopes
 * @static
 * @param {Object} newScopes The new list of scopes for the web service
 */
module.exports.setWebServiceScopes = function(newScopes) {
  scopes = newScopes;
};

/**
 * Gets the list of web service scopes defined by plugins.
 *
 * @method getWebServiceScopes
 * @static
 * @return {Object} scopes
 */
module.exports.getWebServiceScopes = function() {
  return scopes;
};

/**
 * Sets the list of permissions.
 *
 * @method setPermissions
 * @static
 * @param {Object} permissions The new list of permissions
 */
module.exports.setPermissions = function(newPermissions) {
  permissions = newPermissions;
};

/**
 * Gets the list of permissions defined by plugins.
 *
 * @method getPermissions
 * @static
 * @return {Object} permissions
 */
module.exports.getPermissions = function() {
  return permissions;
};

/**
 * Sets the list of entities.
 *
 * @method setEntities
 * @static
 * @param {Object} newEntities The list of entities
 */
module.exports.setEntities = function(newEntities) {
  entities = newEntities;
};

/**
 * Gets the list of entities defined by plugins.
 *
 * @method getEntities
 * @static
 * @return {Object} entities
 */
module.exports.getEntities = function() {
  return entities;
};

/**
 * Sets the application server configuration.
 *
 * @method setServerConfiguration
 * @static
 * @param {Object} configuration The server configuration
 */
module.exports.setServerConfiguration = function(configuration) {
  serverConfiguration = configuration;
};

/**
 * Gets the application server configuration.
 *
 * @method getServerConfiguration
 * @static
 * @return {Object} The server configuration
 */
module.exports.getServerConfiguration = function() {
  return serverConfiguration;
};

/**
 * Gets OpenVeo configuration.
 *
 * @method getConfiguration
 * @static
 * @return {Object} The OpenVeo configuration
 */
module.exports.getConfiguration = function() {
  return configuration;
};

/**
 * Sets the OpenVeo configuration.
 *
 * @method setConfiguration
 * @static
 * @param {Object} conf The OpenVeo configuration
 */
module.exports.setConfiguration = function(conf) {
  configuration = conf;
};
