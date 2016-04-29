'use strict';

/**
 * @module core-loaders
 */

var path = require('path');
var openVeoAPI = require('@openveo/api');
var GroupModel = process.require('app/server/models/GroupModel.js');

/**
 * Provides functions to interpret permissions definition from core and plugins.
 *
 * Permissions comes from 2 different things :
 *  - Core and plugin's configuration files
 *  - Groups of users which are entities
 *
 * @class permissionLoader
 */

/**
 * Generates create/update/delete permissions for entities.
 *
 * Permission's translation keys for name and description are generated
 * using the formats "{OPERATION}_{ENTITY_NAME}_NAME" and
 * "{OPERATION}_{ENTITY_NAME}_DESCRIPTION".
 *
 * Content entities won't generate any permissions.
 *
 * @example
 *     var permissionLoader= process.require("app/server/loaders/permissionLoader.js");
 *     var entities = {
 *       {
 *         core: {
 *           path: "/home/openveo/",
 *           entities: {
 *             applications: "app/server/controllers/ApplicationController"
 *           }
 *         },
 *         example: {
 *           path: "/home/openveo/node_modules/@openveo/example/",
 *           entities: {
 *             myEntities: "app/server/controllers/MyEntityController"
 *           }
 *         }
 *       }
 *     };
 *
 *     console.log(permissionLoader.generateEntityPermissions(entities));
 *     // [
 *     //   {
 *     //     label: "PERMISSIONS.GROUP_APPLICATIONS",
 *     //     permissions: [
 *     //       {
 *     //         id : "create-applications",
 *     //         name : "PERMISSIONS.CREATE_APPLICATIONS_NAME",
 *     //         description : "PERMISSIONS.CREATE_APPLICATIONS_DESCRIPTION",
 *     //         paths : [ "put /applications*" ]
 *     //       },
 *     //       {
 *     //         id : "update-applications",
 *     //         name : "PERMISSIONS.UPDATE_APPLICATIONS_NAME",
 *     //         description : "PERMISSIONS.UPDATE_APPLICATIONS_DESCRIPTION",
 *     //         paths : [ "post /applications*" ]
 *     //       },
 *     //       {
 *     //         id : "delete-applications",
 *     //         name : "PERMISSIONS.DELETE_APPLICATIONS_NAME",
 *     //         description : "PERMISSIONS.DELETE_APPLICATIONS_DESCRIPTION",
 *     //         paths : [ "delete /applications*" ]
 *     //       }
 *     //     ]
 *     //   },
 *     //   {
 *     //     label: "PERMISSIONS.GROUP_MYENTITIES",
 *     //     permissions: [
 *     //       {
 *     //         id : "create-myentities",
 *     //         name : "PERMISSIONS.CREATE_MYENTITIES_NAME",
 *     //         description : "PERMISSIONS.CREATE_MYENTITIES_DESCRIPTION",
 *     //         paths : [ "put /example/myentities*" ]
 *     //       },
 *     //       {
 *     //         id : "update-myEntities",
 *     //         name : "PERMISSIONS.UPDATE_MYENTITIES_NAME",
 *     //         description : "PERMISSIONS.UPDATE_MYENTITIES_DESCRIPTION",
 *     //         paths : [ "post /example/myentities*" ]
 *     //       },
 *     //       {
 *     //         id : "delete-myEntities",
 *     //         name : "PERMISSIONS.DELETE_MYENTITIES_NAME",
 *     //         description : "PERMISSIONS.DELETE_MYENTITIES_DESCRIPTION",
 *     //         paths : [ "delete /example/myentities*" ]
 *     //       }
 *     //     ]
 *     //   }
 *     // ]
 *
 * @method generateEntityPermissions
 * @static
 * @param {Object} pluginsEntities The list of entities
 * @return {Object} Permissions for the given entities
 */
module.exports.generateEntityPermissions = function(pluginsEntities) {
  var permissions = [];

  if (pluginsEntities) {
    var operations = {
      create: 'put /',
      update: 'post /',
      delete: 'delete /'
    };

    for (var pluginName in pluginsEntities) {
      var pluginEntities = pluginsEntities[pluginName].entities;
      var pluginPath = pluginsEntities[pluginName].path;
      var pluginOperationPath = (pluginName === 'core') ? '' : pluginName + '/';

      for (var entityId in pluginEntities) {
        var EntityController = require(path.join(pluginPath, pluginEntities[entityId]));

        if (!(new EntityController() instanceof openVeoAPI.controllers.ContentController)) {
          var entityIdUpperCase = entityId.toUpperCase();
          var entityIdLowerCase = entityId.toLowerCase();
          var group = {
            label: 'PERMISSIONS.GROUP_' + entityIdUpperCase,
            permissions: []
          };

          for (var operation in operations) {
            var operationUpperCase = operation.toUpperCase();

            group.permissions.push({
              id: operation + '-' + entityIdLowerCase,
              name: 'PERMISSIONS.' + operationUpperCase + '_' + entityIdUpperCase + '_NAME',
              description: 'PERMISSIONS.' + operationUpperCase + '_' + entityIdUpperCase + '_DESCRIPTION',
              paths: [operations[operation] + pluginOperationPath + entityIdLowerCase + '*']
            });
          }
          permissions.push(group);
        }
      }

    }
  }

  return permissions;
};

/**
 * Generates permissions using groups.
 *
 * Permission's translation keys for name and description are generated
 * using the formats "GROUP_{OPERATION}_NAME" and
 * "{GROUP}_{OPERATION}_DESCRIPTION".
 *
 * @example
 *     var permissionLoader= process.require("app/server/loaders/permissionLoader.js");
 *
 *     permissionLoader.generateGroupPermissions(function() {
 *        // [
 *        //   {
 *        //     label: "My group name",
 *        //     permissions: [
 *        //       {
 *        //         id : "read-group-groupID",
 *        //         name : "PERMISSIONS.GROUP_READ_NAME",
 *        //         description : "PERMISSIONS.GROUP_READ_DESCRIPTION"
 *        //       },
 *        //       {
 *        //         id : "update-group-groupID",
 *        //         name : "PERMISSIONS.GROUP_UPDATE_NAME",
 *        //         description : "PERMISSIONS.GROUP_UPDATE_DESCRIPTION"
 *        //       },
 *        //       {
 *        //         id : "delete-group-groupID",
 *        //         name : "PERMISSIONS.GROUP_DELETE_NAME",
 *        //         description : "PERMISSIONS.GROUP_DELETE_DESCRIPTION"
 *        //       }
 *        //     ]
 *        //   }
 *        // ]
 *
 *     });
 *
 * @method generateGroupPermissions
 * @static
 * @async
 * @param {Function} callback Function to call when its done with :
 *  - **Array** The list of group permissions
 */
module.exports.generateGroupPermissions = function(callback) {
  var self = this;
  var groupModel = new GroupModel();

  // Get the complete list of groups
  groupModel.get(null, function(error, entities) {
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

/**
 * Creates permissions for a group.
 *
 * @method createGroupPermissions
 * @param {String} id The group id
 * @param {String} name The group name
 * @return {Object} The group permissions
 * @throws {Error} An error if required parameters are not specified
 */
module.exports.createGroupPermissions = function(id, name) {
  if (!id || !name)
    throw new Error('id and name are required to createGroupPermissions');

  var operations = ['read', 'update', 'delete'];
  var permissionGroup = {
    label: name,
    groupId: id,
    permissions: []
  };

  for (var i = 0; i < operations.length; i++) {
    var operation = operations[i];
    var operationUpperCase = operation.toUpperCase();
    permissionGroup.permissions.push({
      id: operation + '-group-' + id,
      name: 'PERMISSIONS.GROUP_' + operationUpperCase + '_NAME',
      description: 'PERMISSIONS.GROUP_' + operationUpperCase + '_NAME'
    });
  }

  return permissionGroup;
};

/**
 * Reorganizes orphaned top permissions into a generic group.
 *
 * @example
 *     var permissionLoader= process.require("app/server/loaders/permissionLoader.js");
 *     var permissions = {
 *       {
 *         "id" : "orphaned-permission",
 *         "name" : "PERMISSIONS.ORPHANED_PERM_NAME",
 *         "description" : "PERMISSIONS.ORPHANED_PERM_DESCRIPTION"
 *       }
 *     };
 *     console.log(permissionLoader.groupOrphanedPermissions(permissions));
 *     // [
 *     //   {
 *     //     label: "PERMISSIONS.GROUP_OTHERS",
 *     //     permissions: [
 *     //       {
 *     //         "id" : "orphaned-permission",
 *     //         "name" : "PERMISSIONS.ORPHANED_PERM_NAME",
 *     //         "description" : "PERMISSIONS.ORPHANED_PERM_DESCRIPTION"
 *     //       }
 *     //     ]
 *     //   }
 *     // ]
 *
 * @method groupOrphanedPermissions
 * @static
 * @param {Object} permissions The list of permissions with group
 * permissions and eventually orphaned permission not attached to any
 * group
 * @return {Object} The same list of permissions except that orphaned
 * permissions are extracted into a generic group
 */
module.exports.groupOrphanedPermissions = function(permissions) {
  var formattedPermissions = [];
  var orphanedGroup = {
    label: 'PERMISSIONS.GROUP_OTHERS',
    permissions: []
  };
  var groupLabelList = [];
  for (var i = 0; i < permissions.length; i++) {

    // Orphaned permission
    if (permissions[i].id)
      orphanedGroup.permissions.push(permissions[i]);

        // Group permission
    else if (permissions[i].label) {
      var index = groupLabelList.indexOf(permissions[i].label);
      if (index == -1) {

        // label treated for first time
        groupLabelList.push(permissions[i].label);
        formattedPermissions.push(permissions[i]);
      } else {
        formattedPermissions[index].permissions =
                formattedPermissions[index].permissions.concat(permissions[i].permissions);
      }
    }
  }
  if (orphanedGroup.permissions.length)
    formattedPermissions.push(orphanedGroup);

  return formattedPermissions;
};

/**
 * Builds the list of permissions.
 *
 * create/delete/update permissions are generated for each entity and read/update/delete permissions are
 * created for each group.
 *
 * Orphaned permissions are grouped in a generic group of permissions.
 *
 * @method buildPermissions
 * @static
 * @async
 * @param {Array} permissions Default list of permissions
 * @param {Object} entities Entities to build permissions from
 * @param {Array} plugins Entities to build permissions from
 * @param {Function} callback Function to call when its done with :
 *  - **Error** An error if something went wrong
 *  - **Array** The list of generated persmissions
 */
module.exports.buildPermissions = function(permissions, entities, plugins, callback) {
  var self = this;

  if (!permissions)
    permissions = [];

  permissions = permissions.concat(this.generateEntityPermissions(entities));

  // Get plugin's permissions
  if (plugins) {
    plugins.forEach(function(plugin) {
      if (plugin.permissions)
        permissions = permissions.concat(plugin.permissions);
    });
  }

  this.generateGroupPermissions(function(error, groupsPermissions) {
    if (error)
      return callback(error);

    permissions = permissions.concat(groupsPermissions);
    permissions = self.groupOrphanedPermissions(permissions);

    callback(null, permissions);
  });
};
