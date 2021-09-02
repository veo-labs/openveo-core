'use strict';

/**
 * @module core-providers
 */

var nanoid = require('nanoid').nanoid;
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
 * Adds roles.
 *
 * @method add
 * @async
 * @param {Array} roles The list of roles to store with for each role:
 *   - **String** name The role name
 *   - **Array** permissions The role permissions
 *   - **String** [id] The role id, generated if not specified
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of roles inserted
 *   - **Array** The list of added roles
 */
RoleProvider.prototype.add = function(roles, callback) {
  var rolesToAdd = [];

  for (var i = 0; i < roles.length; i++) {
    var role = roles[i];

    if (!role.name || !role.permissions)
      return this.executeCallback(callback, new TypeError('Requires name and permissions to add a role'));

    rolesToAdd.push({
      id: role.id || nanoid(),
      name: role.name,
      permissions: role.permissions
    });
  }

  RoleProvider.super_.prototype.add.call(this, rolesToAdd, callback);
};

/**
 * Removes roles.
 *
 * This will execute core hook "ROLES_DELETED" after deleting roles with:
 * - **Array** ids The list of deleted role ids
 *
 * @method remove
 * @async
 * @param {ResourceFilter} [filter] Rules to filter roles to remove
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed roles
 */
RoleProvider.prototype.remove = function(filter, callback) {
  var self = this;

  // Find roles
  this.getAll(
    filter,
    {
      include: ['id']
    },
    {
      id: 'desc'
    },
    function(getAllError, roles) {
      if (getAllError) return self.executeCallback(callback, getAllError);
      if (!roles || !roles.length) return self.executeCallback(callback);

      // Remove roles
      RoleProvider.super_.prototype.remove.call(self, filter, function(removeError, total) {
        if (removeError) return self.executeCallback(callback, removeError);

        // Execute hook
        var api = process.api.getCoreApi();
        api.executeHook(
          api.getHooks().ROLES_DELETED,
          roles.map(function(role) {
            return role.id;
          }),
          function(hookError) {
            return self.executeCallback(callback, hookError, total);
          }
        );
      });
    }
  );
};

/**
 * Updates a role.
 *
 * @method updateOne
 * @async
 * @param {ResourceFilter} [filter] Rules to filter the role to update
 * @param {Object} data The modifications to perform
 * @param {String} [data.name] The role name
 * @param {Array} [data.permissions] The role permissions
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** 1 if everything went fine
 */
RoleProvider.prototype.updateOne = function(filter, data, callback) {
  var modifications = {};
  if (data.name) modifications.name = data.name;
  if (data.permissions) modifications.permissions = data.permissions;

  RoleProvider.super_.prototype.updateOne.call(this, filter, modifications, callback);
};

/**
 * Creates roles indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 */
RoleProvider.prototype.createIndexes = function(callback) {
  var language = process.api.getCoreApi().getContentLanguage();

  this.storage.createIndexes(this.location, [
    {key: {name: 1}, name: 'byName'},

    // eslint-disable-next-line camelcase
    {key: {name: 'text'}, weights: {name: 1}, default_language: language, name: 'querySearch'}

  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create roles indexes : ' + result.note);

    callback(error);
  });
};

/**
 * Drops an index from database collection.
 *
 * @method dropIndex
 * @async
 * @param {String} indexName The name of the index to drop
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 */
RoleProvider.prototype.dropIndex = function(indexName, callback) {
  this.storage.dropIndex(this.location, indexName, function(error, result) {
    if (result && result.ok)
      process.logger.debug('Index "' + indexName + '" dropped');

    callback(error);
  });
};
