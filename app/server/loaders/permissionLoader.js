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
 * Makes sure all permissions of a plugin are prefixed by the name of the plugin.
 *
 * If a permission is not prefixed by the name of the plugin, the prefix is automatically added.
 *
 * @private
 * @method prefixPermissions
 * @param {String} pluginName Plugin's name
 * @param {Object} permissions Plugin's permissions
 */
function prefixPermissions(pluginName, permissions) {
  if (pluginName && permissions) {
    permissions.forEach(function(permission) {
      if (permission.id && permission.id.indexOf(pluginName + '-') !== 0)
        permission.id = pluginName + '-' + permission.id;

      if (permission.permissions)
        prefixPermissions(pluginName, permission.permissions);
    });
  }
}

/**
 * Generates add/update/delete permissions for entities.
 *
 * Permission's translation keys for name and description are generated using the formats
 * "PERMISSIONS.{PLUGIN_NAME}_{OPERATION}_{ENTITY_NAME}_NAME" and
 * "PERMISSIONS.{PLUGIN_NAME}_{OPERATION}_{ENTITY_NAME}_DESCRIPTION".
 *
 * Content entities won't generate any permissions.
 *
 * @example
 *     var permissionLoader= process.require("app/server/loaders/permissionLoader.js");
 *     var entities = {
 *       {
 *         core: {
 *           mountPath: "/",
 *           path: "/home/openveo/",
 *           entities: {
 *             applications: "app/server/controllers/ApplicationController"
 *           }
 *         },
 *         publish: {
 *           mountPath: "/publish",
 *           path: "/home/openveo/node_modules/@openveo/publish/",
 *           entities: {
 *             videos: "app/server/controllers/VideoController"
 *           }
 *         }
 *       }
 *     };
 *
 *     console.log(permissionLoader.generateEntityPermissions(entities));
 *     // [
 *     //   {
 *     //     label: "CORE.PERMISSIONS.GROUP_APPLICATIONS",
 *     //     permissions: [
 *     //       {
 *     //         id : "core-add-applications",
 *     //         name : "CORE.PERMISSIONS.ADD_APPLICATIONS_NAME",
 *     //         description : "CORE.PERMISSIONS.ADD_APPLICATIONS_DESCRIPTION",
 *     //         paths : [ "put /applications*" ]
 *     //       },
 *     //       {
 *     //         id : "core-update-applications",
 *     //         name : "CORE.PERMISSIONS.UPDATE_APPLICATIONS_NAME",
 *     //         description : "CORE.PERMISSIONS.UPDATE_APPLICATIONS_DESCRIPTION",
 *     //         paths : [ "post /applications*" ]
 *     //       },
 *     //       {
 *     //         id : "core-delete-applications",
 *     //         name : "CORE.PERMISSIONS.DELETE_APPLICATIONS_NAME",
 *     //         description : "CORE.PERMISSIONS.DELETE_APPLICATIONS_DESCRIPTION",
 *     //         paths : [ "delete /applications*" ]
 *     //       }
 *     //     ]
 *     //   },
 *     //   {
 *     //     label: "PUBLISH.PERMISSIONS.GROUP_VIDEOS",
 *     //     permissions: [
 *     //       {
 *     //         id : "publish-add-videos",
 *     //         name : "PUBLISH.PERMISSIONS.ADD_VIDEOS_NAME",
 *     //         description : "PUBLISH.PERMISSIONS.ADD_VIDEOS_DESCRIPTION",
 *     //         paths : [ "put /publish/videos*" ]
 *     //       },
 *     //       {
 *     //         id : "publish-update-videos",
 *     //         name : "PUBLISH.PERMISSIONS.UPDATE_VIDEOS_NAME",
 *     //         description : "PUBLISH.PERMISSIONS.UPDATE_VIDEOS_DESCRIPTION",
 *     //         paths : [ "post /publish/videos*" ]
 *     //       },
 *     //       {
 *     //         id : "publish-delete-videos",
 *     //         name : "PUBLISH.PERMISSIONS.DELETE_VIDEOS_NAME",
 *     //         description : "PUBLISH.PERMISSIONS.DELETE_VIDEOS_DESCRIPTION",
 *     //         paths : [ "delete /publish/videos*" ]
 *     //       }
 *     //     ]
 *     //   }
 *     // ]
 *
 * @method generateEntityPermissions
 * @static
 * @param {Object} pluginsEntities The list of entities ordered by plugins
 * @return {Object} Permissions for all entities
 */
module.exports.generateEntityPermissions = function(pluginsEntities) {
  var permissions = [];

  if (pluginsEntities) {
    var operations = {
      add: 'put ',
      update: 'post ',
      delete: 'delete '
    };

    for (var pluginName in pluginsEntities) {
      var plugin = pluginsEntities[pluginName];
      var pluginNameUC = pluginName.toUpperCase();
      var mountPath = (plugin.mountPath === '/') ? '/' : plugin.mountPath + '/';

      for (var entityId in plugin.entities) {
        var EntityController = require(path.join(plugin.path, plugin.entities[entityId]));

        if (!(new EntityController() instanceof openVeoAPI.controllers.ContentController)) {
          var entityIdUC = entityId.toUpperCase();
          var entityIdLowerCase = entityId.toLowerCase();

          var group = {
            label: pluginNameUC + '.PERMISSIONS.GROUP_' + entityIdUC,
            permissions: []
          };

          for (var operation in operations) {
            var operationUC = operation.toUpperCase();

            group.permissions.push({
              id: pluginName + '-' + operation + '-' + entityIdLowerCase,
              name: pluginNameUC + '.PERMISSIONS.' + operationUC + '_' + entityIdUC + '_NAME',
              description: pluginNameUC + '.PERMISSIONS.' + operationUC + '_' + entityIdUC + '_DESCRIPTION',
              paths: [operations[operation] + mountPath + entityIdLowerCase + '*']
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
 * Builds entities' scopes.
 *
 * @example
 *     // List of entities by plugin
 *     {
 *       publish: {
 *         mountPath: "/publish",
 *         path: "/home/openveo/node_modules/@openveo/publish",
 *         entities: {
 *           videos: "app/server/controllers/VideoController"
 *         }
 *       }
 *     }
 *
 * @example
 *     // Result
 *     [
 *       {
 *         id: 'publish-get-videos',
 *         name: 'PUBLISH.WS_SCOPES.GET_VIDEOS_NAME',
 *         description: 'PUBLISH.WS_SCOPES.GET_VIDEOS_DESCRIPTON',
 *         paths: [
 *           'get /publish/videos*'
 *         ]
 *       },
 *       {
 *         id: 'publish-add-videos',
 *         name: 'PUBLISH.WS_SCOPES.ADD_VIDEOS_NAME',
 *         description: 'PUBLISH.WS_SCOPES.ADD_VIDEOS_DESCRIPTON',
 *         paths: [
 *           'put /publish/videos*'
 *         ]
 *       },
 *       {
 *         id: 'publish-update-videos',
 *         name: 'PUBLISH.WS_SCOPES.UPDATE_VIDEOS_NAME',
 *         description: 'PUBLISH.WS_SCOPES.UPDATE_VIDEOS_DESCRIPTON',
 *         paths: [
 *           'post /publish/videos*'
 *         ]
 *       },
 *       {
 *         id: 'publish-delete-videos',
 *         name: 'PUBLISH.WS_SCOPES.DELETE_VIDEOS_NAME',
 *         description: 'PUBLISH.WS_SCOPES.DELETE_VIDEOS_DESCRIPTON',
 *         paths: [
 *           'delete /publish/videos*'
 *         ]
 *       }
 *     ]
 *
 * @method generateEntityScopes
 * @static
 * @param {Object} pluginsEntities The list of entities
 * @return {Array} The list of web service scopes for all entities exposed by all plugins
 */
module.exports.generateEntityScopes = function(pluginsEntities) {
  var scopes = [];

  if (pluginsEntities) {
    var operations = {
      get: 'get ',
      add: 'put ',
      update: 'post ',
      delete: 'delete '
    };

    for (var pluginName in pluginsEntities) {
      var plugin = pluginsEntities[pluginName];
      var pluginNameUC = pluginName.toUpperCase();
      var mountPath = (plugin.mountPath === '/') ? '/' : plugin.mountPath + '/';

      for (var entityId in plugin.entities) {
        for (var operation in operations) {
          var operationUC = operation.toUpperCase();
          var entityIdUC = entityId.toUpperCase();
          var entityIdLowerCase = entityId.toLowerCase();

          scopes.push({
            id: pluginName + '-' + operation + '-' + entityIdLowerCase,
            name: pluginNameUC + '.WS_SCOPES.' + operationUC + '_' + entityIdUC + '_NAME',
            description: pluginNameUC + '.WS_SCOPES.' + operationUC + '_' + entityIdUC + '_DESCRIPTION',
            paths: [operations[operation] + mountPath + entityIdLowerCase + '*']
          });

        }
      }
    }

  }

  return scopes;
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
 *        //         id : "get-group-groupID",
 *        //         name : "CORE.PERMISSIONS.GROUP_GET_NAME",
 *        //         description : "CORE.PERMISSIONS.GROUP_GET_DESCRIPTION"
 *        //       },
 *        //       {
 *        //         id : "update-group-groupID",
 *        //         name : "CORE.PERMISSIONS.GROUP_UPDATE_NAME",
 *        //         description : "CORE.PERMISSIONS.GROUP_UPDATE_DESCRIPTION"
 *        //       },
 *        //       {
 *        //         id : "delete-group-groupID",
 *        //         name : "CORE.PERMISSIONS.GROUP_DELETE_NAME",
 *        //         description : "CORE.PERMISSIONS.GROUP_DELETE_DESCRIPTION"
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
 * Reorganizes orphaned top permissions into a generic group.
 *
 * @example
 *     var permissionLoader= process.require("app/server/loaders/permissionLoader.js");
 *     var permissions = {
 *       {
 *         "id" : "orphaned-permission",
 *         "name" : "ORPHANED_PERM_NAME",
 *         "description" : "ORPHANED_PERM_DESCRIPTION"
 *       }
 *     };
 *     console.log(permissionLoader.groupOrphanedPermissions(permissions));
 *     // [
 *     //   {
 *     //     label: "CORE.PERMISSIONS.GROUP_OTHERS",
 *     //     permissions: [
 *     //       {
 *     //         "id" : "orphaned-permission",
 *     //         "name" : "ORPHANED_PERM_NAME",
 *     //         "description" : "ORPHANED_PERM_DESCRIPTION"
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
    label: 'CORE.PERMISSIONS.GROUP_OTHERS',
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
 * add/delete/update permissions are generated for each entity and get/update/delete permissions are
 * created for each group.
 *
 * Orphaned permissions are grouped in a generic group of permissions.
 *
 * @method buildPermissions
 * @static
 * @async
 * @param {Object} entities Entities to build permissions from
 * @param {Array} plugins The list of plugins
 * @param {Function} callback Function to call when its done with :
 *  - **Error** An error if something went wrong
 *  - **Array** The list of generated persmissions
 */
module.exports.buildPermissions = function(entities, plugins, callback) {
  var self = this;
  var permissions = this.generateEntityPermissions(entities);

  // Get plugin's permissions
  if (plugins) {
    plugins.forEach(function(plugin) {
      if (plugin.permissions) {

        // Permission id must be prefixed by the name of the plugin
        // Make sure it is
        prefixPermissions(plugin.name, plugin.permissions);

        permissions = permissions.concat(plugin.permissions);
      }
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
