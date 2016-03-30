'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');

/**
 * Defines a ClientProvider class to get and save Web Service client
 * applications.
 *
 * @class ClientProvider
 * @constructor
 * @extends EntityProvider
 * @param {Database} database The database to interact with
 */
function ClientProvider(database) {
  openVeoAPI.EntityProvider.call(this, database, 'clients');
}

module.exports = ClientProvider;
util.inherits(ClientProvider, openVeoAPI.EntityProvider);

/**
 * Retrieves a client application by its id.
 *
 * @method getOne
 * @async
 * @param {String} id The client id
 * @param {Object} filter A MongoDB filter
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Object** The entity
 */
ClientProvider.prototype.getOne = function(id, filter, callback) {
  if (!filter) filter = {};
  filter.id = id;

  this.database.get(this.collection, filter,
    {
      _id: 0
    },
    1, function(error, data) {
      callback(error, data && data[0]);
    }
  );
};

/**
 * Creates clients indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
ClientProvider.prototype.createIndexes = function(callback) {
  this.database.createIndexes(this.collection, [
    {key: {name: 1}, name: 'byName'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create clients indexes : ' + result.note);

    callback(error);
  });
};
