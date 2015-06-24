"use scrict"

// Module dependencies
var util = require("util");
var openVeoAPI = require("openveo-api");
var RoleProvider = process.require("app/server/providers/RoleProvider.js");

/**
 * Creates a RoleModel.
 */
function RoleModel(){
  openVeoAPI.EntityModel.prototype.init.call(this, new RoleProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = RoleModel;
util.inherits(RoleModel, openVeoAPI.EntityModel);

/**
 * Adds a new role.
 * @param Object data A role object
 * e.g.
 * {
 *   name : "Name of the role",
 *   permissions : {
 *    perm1 : {
 *     name : "name 1",
 *     description : "description 1",
 *     activated : true
 *    },
 *    perm2 : {
 *     name : "name 2",
 *     description : "description 2",
 *     activated : true
 *    }
 *  } 
 * }
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 * @Override 
 */
RoleModel.prototype.add = function(data, callback){
  if(!data.name || !data.permissions){
    callback(new Error("Requires name and permissions to add a role"));
    return;
  }

  var role = {
    id : Date.now().toString(),
    name : data.name,
    permissions : data.permissions
  };
  
  this.provider.add(role, function(error){
    if(callback)
      callback(error, role);
  });
};

/**
 * Gets a list of roles by ids.
 * @param Array roles Role ids
 * e.g.
 * [ "12345646", "548974354" ]
 * @param Function callback The function to call when it's done
 *   - Error The error if an error occurred, null otherwise
 *   - Array The list of roles
 * @Override 
 */
RoleModel.prototype.getByIds = function(roles, callback){
  this.provider.getByIds(roles, callback);
};