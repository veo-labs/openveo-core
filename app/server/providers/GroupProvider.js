'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');

/**
 * Defines a GroupProvider class to get and save content groups.
 *
 * @class GroupProvider
 * @constructor
 * @extends EntityProvider
 * @param {Database} database The database to interact with
 */
function GroupProvider(database) {
  openVeoAPI.EntityProvider.call(this, database, 'core-groups');
}

module.exports = GroupProvider;
util.inherits(GroupProvider, openVeoAPI.EntityProvider);

/**
 * Creates groups indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
GroupProvider.prototype.createIndexes = function(callback) {
  this.database.createIndexes(this.collection, [
    {key: {name: 1}, name: 'byName'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create groups indexes : ' + result.note);

    callback(error);
  });
};
