'use strict';

/**
 * @module core-providers
 */

var util = require('util');
var shortid = require('shortid');
var openVeoApi = require('@openveo/api');
var NotFoundError = openVeoApi.errors.NotFoundError;

/**
 * Defines a GroupProvider to get and save content groups.
 *
 * @class GroupProvider
 * @extends EntityProvider
 * @constructor
 * @param {Database} database The database to interact with
 */
function GroupProvider(database) {
  GroupProvider.super_.call(this, database, 'core_groups');
}

module.exports = GroupProvider;
util.inherits(GroupProvider, openVeoApi.providers.EntityProvider);

/**
 * Adds content groups.
 *
 * This will execute core hook "GROUPS_ADDED" after adding groups with:
 * - **Array** The list of added groups
 *
 * @method add
 * @async
 * @param {Array} groups The list of groups to store with for each group:
 *   - **String** [id] The group id, generated if not specified
 *   - **String** name The group name
 *   - **String** description The group description
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of groups inserted
 *   - **Array** The list of added groups
 */
GroupProvider.prototype.add = function(groups, callback) {
  var self = this;
  var groupsToAdd = [];

  for (var i = 0; i < groups.length; i++) {
    var group = groups[i];

    if (!group.name || !group.description)
      return this.executeCallback(callback, new TypeError('Both name and description are required to create a group'));

    groupsToAdd.push({
      id: group.id || shortid.generate(),
      name: group.name,
      description: group.description
    });
  }

  GroupProvider.super_.prototype.add.call(this, groupsToAdd, function(error, total, addedGroups) {
    if (error) return self.executeCallback(callback, error);

    var api = process.api.getCoreApi();
    api.executeHook(api.getHooks().GROUPS_ADDED, addedGroups, function(hookError) {
      self.executeCallback(callback, hookError, total, addedGroups);
    });
  });
};

/**
 * Updates a group.
 *
 * This will execute core hook "GROUP_UPDATED" after updating group with:
 * - **Object** The hook data with:
 *   - **String** id The id of updated group
 *   - **Object** modifications The list of modifications applied
 *
 * @method updateOne
 * @async
 * @param {ResourceFilter} [filter] Rules to filter the group to update
 * @param {Object} data The modifications to perform
 * @param {String} [data.name] The group name
 * @param {String} [data.description] The group description
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** 1 if everything went fine
 */
GroupProvider.prototype.updateOne = function(filter, data, callback) {
  var self = this;
  var modifications = {};
  if (data.name) modifications.name = data.name;
  if (data.description) modifications.description = data.description;

  // Find group
  this.getOne(
    filter,
    {
      include: ['id']
    },
    function(getOneError, group) {
      if (getOneError) return self.executeCallback(callback, getOneError);
      if (!group) return self.executeCallback(callback, new NotFoundError(JSON.stringify(filter)));

      // Update group
      GroupProvider.super_.prototype.updateOne.call(self, filter, modifications, function(updateError, total) {
        if (updateError) return self.executeCallback(callback, updateError);

        // Execute hook
        var api = process.api.getCoreApi();
        api.executeHook(
          api.getHooks().GROUP_UPDATED,
          {
            id: group.id,
            modifications: modifications
          },
          function(hookError) {
            self.executeCallback(callback, hookError, total);
          }
        );
      });
    }
  );
};

/**
 * Removes groups.
 *
 * This will execute core hook "GROUPS_DELETED" after deleting groups with:
 * - **Array** ids The list of deleted group ids
 *
 * @method remove
 * @async
 * @param {ResourceFilter} [filter] Rules to filter groups to remove
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of removed groups
 */
GroupProvider.prototype.remove = function(filter, callback) {
  var self = this;

  // Find groups
  this.getAll(
    filter,
    {
      include: ['id']
    },
    {
      id: 'desc'
    },
    function(getAllError, groups) {
      if (getAllError) return self.executeCallback(callback, getAllError);
      if (!groups || !groups.length) return self.executeCallback(callback);

      // Remove groups
      GroupProvider.super_.prototype.remove.call(self, filter, function(removeError, total) {
        if (removeError) return self.executeCallback(callback, removeError);

        // Execute hook
        var api = process.api.getCoreApi();
        api.executeHook(
          api.getHooks().GROUPS_DELETED,
          groups.map(function(group) {
            return group.id;
          }),
          function(hookError) {
            self.executeCallback(callback, hookError, total);
          }
        );
      });
    }
  );
};

/**
 * Creates groups indexes.
 *
 * @method createIndexes
 * @async
 * @param {Function} callback Function to call when it's done with :
 *  - **Error** An error if something went wrong, null otherwise
 */
GroupProvider.prototype.createIndexes = function(callback) {
  this.storage.createIndexes(this.location, [
    {key: {name: 1}, name: 'byName'},
    {key: {name: 'text', description: 'text'}, weights: {name: 2}, name: 'querySearch'}
  ], function(error, result) {
    if (result && result.note)
      process.logger.debug('Create groups indexes : ' + result.note);

    callback(error);
  });
};

/**
 * Creates permissions for a group.
 *
 * @method createGroupPermissions
 * @param {String} id The group id
 * @param {String} name The group name
 * @return {Object} The group permissions
 * @throws {TypeError} An error if required parameters are not specified
 */
GroupProvider.prototype.createGroupPermissions = function(id, name) {
  if (!id || !name || (typeof id !== 'string') || (typeof name !== 'string'))
    throw new TypeError('id and name must be valid String');

  var operations = ['get', 'update', 'delete'];
  var permissionGroup = {
    label: name,
    groupId: id,
    permissions: []
  };

  for (var i = 0; i < operations.length; i++) {
    var operation = operations[i];
    var operationUC = operation.toUpperCase();
    permissionGroup.permissions.push({
      id: operation + '-group-' + id,
      name: 'CORE.PERMISSIONS.GROUP_' + operationUC + '_NAME',
      description: 'CORE.PERMISSIONS.GROUP_' + operationUC + '_NAME'
    });
  }

  return permissionGroup;
};

/**
 * Generates permissions using groups.
 *
 * Permission's translation keys for name and description are generated
 * using the formats "GROUP_{OPERATION}_NAME" and
 * "{GROUP}_{OPERATION}_DESCRIPTION".
 *
 * @example
 *        // Example of generated groups
 *        // [
 *        //   {
 *        //     label: 'My group name',
 *        //     permissions: [
 *        //       {
 *        //         id : 'get-group-groupID',
 *        //         name : 'CORE.PERMISSIONS.GROUP_GET_NAME',
 *        //         description : 'CORE.PERMISSIONS.GROUP_GET_DESCRIPTION'
 *        //       },
 *        //       {
 *        //         id : 'update-group-groupID',
 *        //         name : 'CORE.PERMISSIONS.GROUP_UPDATE_NAME',
 *        //         description : 'CORE.PERMISSIONS.GROUP_UPDATE_DESCRIPTION'
 *        //       },
 *        //       {
 *        //         id : 'delete-group-groupID',
 *        //         name : 'CORE.PERMISSIONS.GROUP_DELETE_NAME',
 *        //         description : 'CORE.PERMISSIONS.GROUP_DELETE_DESCRIPTION'
 *        //       }
 *        //     ]
 *        //   }
 *        // ]
 *
 *     });
 *
 * @method generateGroupPermissions
 * @async
 * @param {Function} callback Function to call when it's done with:
 *  - **Error** An error if something went wrong, null otherwise
 *  - **Array** The list of group permissions
 */
GroupProvider.prototype.generateGroupPermissions = function(callback) {
  var self = this;

  // Get the complete list of groups
  this.getAll(
    null,
    {
      include: ['id', 'name']
    },
    {
      id: 'desc'
    },
    function(error, groups) {
      if (error) return callback(error);
      else if (groups) {
        var permissions = [];
        groups.forEach(function(group) {
          permissions.push(self.createGroupPermissions(group.id, group.name));
        });
        callback(null, permissions);
      }
    }
  );
};
