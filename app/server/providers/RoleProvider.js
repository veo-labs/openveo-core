'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var openVeoApi = require('@openveo/api');

/**
 * Defines a RoleProvider to get and save back end user roles.
 *
 * @class RoleProvider
 * @extends EntityProvider
 * @constructor
 * @param {Database} database The database to interact with
 */
function RoleProvider(database) {
  RoleProvider.super_.call(this, database, 'core_roles');
}

module.exports = RoleProvider;
util.inherits(RoleProvider, openVeoApi.providers.EntityProvider);

/**
 * Gets roles by ids.
 *
 * @method getByIds
 * @async
 * @param {Array} ids The list of role ids
 * @param {Function} callback Function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of roles
 */
RoleProvider.prototype.getByIds = function(ids, callback) {
  this.database.get(this.collection,
    {
      id: {
        $in: ids
      }
    },
    {
      _id: 0
    },
    -1, callback);
};

/**
 * Creates roles indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
RoleProvider.prototype.createIndexes = function(callback) {
  this.database.createIndexes(this.collection, [
    {key: {name: 1}, name: 'byName'},
    {key: {name: 'text'}, weights: {name: 1}, name: 'querySearch'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create roles indexes : ' + result.note);

    callback(error);
  });
};
