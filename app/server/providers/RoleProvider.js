"use strict"

/** 
 * @module core-providers 
 */

// Module dependencies
var util = require("util");
var openVeoAPI = require("openveo-api");

/**
 * Defines a RoleProvider class to get and save back end user roles.
 *
 * @class RoleProvider
 * @constructor
 * @extends EntityProvider
 * @param {Database} database The database to interact with
 */
function RoleProvider(database){
  openVeoAPI.EntityProvider.prototype.init.call(this, database, "roles");
}

module.exports = RoleProvider;
util.inherits(RoleProvider, openVeoAPI.EntityProvider);

/**
 * Gets list of roles by ids.
 *
 * @method getByIds
 * @async
 * @param {Array} ids The list of role ids
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of roles
 */
RoleProvider.prototype.getByIds = function(ids, callback){
  this.database.get(this.collection, {"id" : { $in : ids }}, { "_id" : 0 }, -1, callback);
};