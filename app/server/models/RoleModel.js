'use strict';

/**
 * @module core-models
 */

// Module dependencies
var util = require('util');
var shortid = require('shortid');
var openVeoAPI = require('@openveo/api');
var RoleProvider = process.require('app/server/providers/RoleProvider.js');

/**
 * Defines a RoleModel class to manipulate user roles for back end
 * permissions.
 *
 * @class RoleModel
 * @constructor
 * @extends EntityModel
 */
function RoleModel() {
  openVeoAPI.EntityModel.prototype.init.call(this, new RoleProvider(openVeoAPI.applicationStorage.getDatabase()));
}

module.exports = RoleModel;
util.inherits(RoleModel, openVeoAPI.EntityModel);

/**
 * Adds a new role.
 *
 * @example
 *     var RoleModel = new process.require("app/server/models/RoleModel.js");
 *     var role = new RoleModel();
 *     role.add({
 *       name : "Name of the role",
 *       permissions : {
 *        perm1 : {
 *         name : "name 1",
 *         description : "description 1",
 *         activated : true
 *        },
 *        perm2 : {
 *         name : "name 2",
 *         description : "description 2",
 *         activated : true
 *        }
 *      }
 *     }, callback);
 *
 * @method add
 * @async
 * @param {Object} data A role object
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 */
RoleModel.prototype.add = function(data, callback) {
  if (!data.name || !data.permissions) {
    callback(new Error('Requires name and permissions to add a role'));
    return;
  }

  var role = {
    id: data.id || shortid.generate(),
    name: data.name,
    permissions: data.permissions
  };

  this.provider.add(role, function(error, addedCount, roles) {
    if (callback)
      callback(error, addedCount, roles && roles[0]);
  });
};

/**
 * Gets a list of roles by ids.
 *
 * @method getByIds
 * @async
 * @param {Array} roles Role ids
 * @param {Function} callback The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Array** The list of roles
 */
RoleModel.prototype.getByIds = function(roles, callback) {
  this.provider.getByIds(roles, callback);
};
