'use strict';

/**
 * @module core-models
 */

var util = require('util');
var shortid = require('shortid');
var openVeoApi = require('@openveo/api');
var storage = process.require('app/server/storage.js');

/**
 * Defines a GroupModel to manipulate groups.
 *
 * @class GroupModel
 * @extends EntityModel
 * @constructor
 * @param {GroupProvider} provider The entity provider
 */
function GroupModel(provider) {
  GroupModel.super_.call(this, provider);
}

module.exports = GroupModel;
util.inherits(GroupModel, openVeoApi.models.EntityModel);

/**
 * Adds a new group.
 *
 * Each time a new group is added, 3 new permissions are created create/update/delete and organized in a group of
 * permissions.
 *
 * @method add
 * @async
 * @param {Object} data Group's data
 * @param {String} data.name Group's name
 * @param {String} data.description Group's description
 * @param {String} [data.id] Group's id, if not specified id is generated
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of items inserted
 *   - **Object** The added entity
 */
GroupModel.prototype.add = function(data, callback) {
  if (!data.name || !data.description)
    return callback(new Error('Both name and description are required to create a group'));

  var self = this;
  var info = {
    id: data.id || shortid.generate(),
    name: data.name,
    description: data.description
  };

  this.provider.add(info, function(error, insertCount, documents) {
    if (!error && insertCount) {
      var group = documents[0];
      var permissions = storage.getPermissions() || [];
      var groupPermissions = self.createGroupPermissions(group.id, group.name);

      // Add new group permissions to the list of permissions
      // The last group must stay the last group, this is the group of orphaned permissions
      permissions.splice(permissions.length - 1, 0, groupPermissions);

      storage.setPermissions(permissions);
    }

    if (callback)
      callback(error, insertCount, documents && documents[0]);
  });
};

/**
 * Updates a group.
 *
 * Each time a group is modified, the list of permissions is updated.
 *
 * @method update
 * @async
 * @param {String} id The id of the entity to update
 * @param {Object} data Group's data
 * @param {String} data.name Group's name
 * @param {String} data.description Group's description
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of updated items
 */
GroupModel.prototype.update = function(id, data, callback) {
  var info = {};
  if (data.name)
    info.name = data.name;
  if (data.description)
    info.description = data.description;

  this.provider.update(id, info, function(error, updatedCount) {
    if (!error && updatedCount) {
      var permissions = storage.getPermissions();

      // Update permission
      permissions.forEach(function(permission) {
        if (permission.groupId === id && info.name)
          permission.label = info.name;
      });

    }

    if (callback)
      callback(error, updatedCount);
  });
};

/**
 * Removes one or several groups.
 *
 * Each time a group is removed, the list of permissions is updated.
 *
 * @method remove
 * @async
 * @param {String|Array} ids Id(s) of the document(s) to remove from the collection
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The number of deleted entities
 */
GroupModel.prototype.remove = function(ids, callback) {
  this.provider.remove(ids, function(error, deletedCount) {
    var permissions = storage.getPermissions();

    if (permissions) {
      permissions = permissions.filter(function(permission) {
        return (ids.indexOf(permission.groupId) === -1);
      });

      storage.setPermissions(permissions);
    }

    if (callback)
      callback(error, deletedCount);
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
GroupModel.prototype.createGroupPermissions = function(id, name) {
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
 * @param {Function} callback Function to call when it's done with :
 *  - **Array** The list of group permissions
 */
GroupModel.prototype.generateGroupPermissions = function(callback) {
  var self = this;

  // Get the complete list of groups
  this.get(null, function(error, entities) {
    if (error)
      return callback(error);
    else if (entities) {
      var permissions = [];
      entities.forEach(function(entity) {
        permissions.push(self.createGroupPermissions(entity.id, entity.name));
      });
      callback(null, permissions);
    }
  });

};
