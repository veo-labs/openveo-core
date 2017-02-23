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
var superAdminId;
var anonymousUserId;
var serverConfiguration;

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
 * Gets the id of the super administrator.
 *
 * @method getSuperAdminId
 * @static
 * @return {String} The super administrator id
 */
module.exports.getSuperAdminId = function() {
  return superAdminId;
};

/**
 * Sets the id of the super administrator.
 *
 * It can be set only once.
 *
 * @method setSuperAdminId
 * @static
 * @param {String} id The id of the super administrator
 */
module.exports.setSuperAdminId = function(id) {
  superAdminId = id;
};

/**
 * Gets the id of the anonymous user.
 *
 * @method getAnonymousUserId
 * @static
 * @return {String} The anonymous user id
 */
module.exports.getAnonymousUserId = function() {
  return anonymousUserId;
};

/**
 * Sets the id of the anonymous user.
 *
 * It can be set only once.
 *
 * @method setAnonymousUserId
 * @static
 * @param {String} id The id of the anonymous user
 */
module.exports.setAnonymousUserId = function(id) {
  anonymousUserId = id;
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
