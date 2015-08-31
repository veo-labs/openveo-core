"use strict"

/** 
 * @module core-loaders
 */

/**
 * Provides functions to interpret permissions definition from core and 
 * plugin's configuration.
 *
 * @class permissionLoader
 */

// Module dependencies
var path = require("path");
var util = require("util");
var winston = require("winston");
var openVeoAPI = require("@openveo/api");

// Get logger
var logger = winston.loggers.get("openveo");

/**
 * Generates CRUD permissions using entities.
 *
 * Permission's translation keys for name and description are generated
 * using the formats "{OPERATION}_{ENTITY_NAME}_NAME" and 
 * "{OPERATION}_{ENTITY_NAME}_DESCRIPTION".
 *
 * @example
 *     var permissionLoader= process.require("app/server/loaders/permissionLoader.js");
 *     var entities = { 
 *       "application": "app/server/models/ClientModel" 
 *     };
 *
 *     console.log(permissionLoader.generateCRUDPermissions(entities));
 *     // [
 *     //   {
 *     //     label: "PERMISSIONS.GROUP_APPLICATION",
 *     //     permissions: [
 *     //       {
 *     //         id : "create-application",
 *     //         name : "PERMISSIONS.CREATE_APPLICATION_NAME",
 *     //         description : "PERMISSIONS.CREATE_APPLICATION_DESCRIPTION",
 *     //         paths : [ "put /crud/application*" ]
 *     //       },
 *     //       {
 *     //         id : "read-application",
 *     //         name : "PERMISSIONS.READ_APPLICATION_NAME",
 *     //         description : "PERMISSIONS.READ_APPLICATION_DESCRIPTION",
 *     //         paths : [ "get /crud/application*" ]
 *     //       },  
 *     //       {
 *     //         id : "update-application",
 *     //         name : "PERMISSIONS.UPDATE_APPLICATION_NAME",
 *     //         description : "PERMISSIONS.UPDATE_APPLICATION_DESCRIPTION",
 *     //         paths : [ "post /crud/application*" ]
 *     //       },
 *     //       {
 *     //         id : "delete-application",
 *     //         name : "PERMISSIONS.DELETE_APPLICATION_NAME",
 *     //         description : "PERMISSIONS.DELETE_APPLICATION_DESCRIPTION",
 *     //         paths : [ "delete /crud/application*" ]
 *     //       }
 *     //     ]
 *     //   }
 *     // ]
 *
 * @method generateCRUDPermissions
 * @static  
 * @param {Object} entities The list of entities
 * @return {Object} Permissions for the given entities
 */
module.exports.generateCRUDPermissions = function(entities){
  var permissions = [];

  if(entities){
    var operations = {
      "create" : "put /crud/",
      "read" : "get /crud/",
      "update" : "post /crud/",
      "delete" : "delete /crud/"
    };

    for(var entityId in entities){
      var entityIdUpperCase = entityId.toUpperCase();
      var group = { label : "PERMISSIONS.GROUP_" + entityIdUpperCase, permissions : [] };

      for(var operation in operations){
        var operationUpperCase = operation.toUpperCase();
        group.permissions.push({
          id : operation + "-" + entityId,
          name : "PERMISSIONS." + operationUpperCase + "_" + entityIdUpperCase + "_NAME",
          description : "PERMISSIONS." + operationUpperCase + "_" + entityIdUpperCase + "_DESCRIPTION",
          paths : [ operations[operation] + entityId + "*" ]
        });
      }
      permissions.push(group);
    }
  }
  return permissions;
}

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
module.exports.groupOrphanedPermissions = function(permissions){
  var formattedPermissions = [];
  var orphanedGroup = { 
    label : "PERMISSIONS.GROUP_OTHERS",
    permissions : [] 
  };
  
  for(var i = 0 ; i < permissions.length ; i++){
    
    // Orphaned permission
    if(permissions[i].id)
      orphanedGroup.permissions.push(permissions[i]);
    
    // Group permission
    else
      formattedPermissions.push(permissions[i]);
  }
  
  if(orphanedGroup.permissions.length)
    formattedPermissions.push(orphanedGroup);
  
  return formattedPermissions;
}