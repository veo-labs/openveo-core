"use strict"

/**
 * Application storage is a global storage for core and plugins, to be 
 * able to share information between both core and plugins.  
 * Information stored in the application storage must be limited.
 *
 * @module applicationStorage
 * @class applicationStorage
 * @main applicationStorage
 */

// Stores a bunch of information for all the application
var plugins, menu, database, scopes, entities, permissions;

/**
 * Gets the list of loaded openveo plugins.
 *
 * @method getPlugins
 * @return {Array} The list of loaded plugins
 */
module.exports.getPlugins = function(){
  return plugins;
};

/**
 * Sets the list of openveo plugins.
 *
 * @method setPlugins
 * @param {Array} subPlugins The list of plugins
 */
module.exports.setPlugins = function(subPlugins){
  plugins = subPlugins;
};

/**
 * Gets the computed back office menu with all links.
 *
 * @method getMenu
 * @return {Array} The list of back office links
 */
module.exports.getMenu = function(){
  return menu;
};

/**
 * Sets the back office menu list of links.
 *
 * @method setMenu
 * @param {Array} newMenu The list of back office menu links
 */
module.exports.setMenu = function(newMenu){
  menu = newMenu;
};

/**
 * Gets the database.
 *
 * @method getDatabase
 * @return {Database} A Database object
 */
module.exports.getDatabase = function(){
  return database;
};

/**
 * Sets the database.
 *
 * @method getDatabase
 * @param {Database} newDatabase The new database of the application
 */
module.exports.setDatabase = function(newDatabase){
  database = newDatabase;
};

/**
 * Sets the web service list of scopes.
 *
 * @method setWebServiceScopes
 * @param {Object} newScopes The new list of scopes of the web service
 */
module.exports.setWebServiceScopes = function(newScopes){
  scopes = newScopes;
};

/**
 * Gets the list of web service scopes.
 *
 * @method getWebServiceScopes
 * @return {Object} scopes
 */
module.exports.getWebServiceScopes = function(){
  return scopes;
};

/**
 * Sets the list of permissions.
 *
 * @method setPermissions
 * @param {Object} permissions The new list of permissions
 */
module.exports.setPermissions = function(newPermissions){
  permissions = newPermissions;
};

/**
 * Gets the list of permissions.
 *
 * @method getPermissions
 * @return {Object} permissions
 */
module.exports.getPermissions = function(){
  return permissions;
};

/**
 * Sets the list of entities.
 *
 * @method setEntities
 * @param {Object} newEntities The list of entities
 */
module.exports.setEntities = function(newEntities){
  entities = newEntities;
};

/**
 * Gets the list of entities.
 *
 * @method getEntities
 * @return {Object} entities
 */
module.exports.getEntities = function(){
  return entities;
};