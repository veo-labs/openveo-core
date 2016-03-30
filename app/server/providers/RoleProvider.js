'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');

/**
 * Defines a RoleProvider class to get and save back end user roles.
 *
 * @class RoleProvider
 * @constructor
 * @extends EntityProvider
 * @param {Database} database The database to interact with
 */
function RoleProvider(database) {
  openVeoAPI.EntityProvider.call(this, database, 'roles');
}

module.exports = RoleProvider;
util.inherits(RoleProvider, openVeoAPI.EntityProvider);

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
    {key: {name: 1}, name: 'byName'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create roles indexes : ' + result.note);

    callback(error);
  });
};
