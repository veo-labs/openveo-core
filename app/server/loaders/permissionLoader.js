"use scrict"

// Module dependencies
var path = require("path");
var util = require("util");
var winston = require("winston");
var openVeoAPI = require("openveo-api");

// Get logger
var logger = winston.loggers.get("openveo");

/**
 * Generates CRUD permissions using entities.
 * Permission's translation keys for name and description are generated
 * using the formats "{OPERATION}_{ENTITY_NAME}_NAME" and 
 * "{OPERATION}_{ENTITY_NAME}_DESCRIPTION". 
 * @param Object entities The list of entities
 * e.g
 * {
 *   "application" : "app/server/models/ClientModel"
 * }
 * @return Object Permissions for the given entities
 * e.g.
 * {
 *   create-application : {
 *     name : "PERMISSIONS.CREATE_APPLICATION_NAME",
 *     description : "PERMISSIONS.CREATE_APPLICATION_DESCRIPTION",
 *     paths : [ "put /crud/application*" ]
 *   },
 *   read-application : {
 *     name : "PERMISSIONS.READ_APPLICATION_NAME",
 *     description : "PERMISSIONS.READ_APPLICATION_DESCRIPTION",
 *     paths : [ "get /crud/application*" ]
 *   },  
 *   update-application : {
 *     name : "PERMISSIONS.UPDATE_APPLICATION_NAME",
 *     description : "PERMISSIONS.UPDATE_APPLICATION_DESCRIPTION",
 *     paths : [ "post /crud/application*" ]
 *   },
 *   delete-application : {
 *     name : "PERMISSIONS.DELETE_APPLICATION_NAME",
 *     description : "PERMISSIONS.DELETE_APPLICATION_DESCRIPTION",
 *     paths : [ "delete /crud/application*" ]
 *   }
 * }
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
 * @param Object permissions The list of permissions with group 
 * permissions and eventually orphaned permission not attached to any
 * group
 * @return Object The same list of permissions except that orphaned
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