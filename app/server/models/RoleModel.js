'use strict';

/**
 * @module core-models
 */

var util = require('util');
var shortid = require('shortid');
var openVeoApi = require('@openveo/api');

/**
 * Defines a RoleModel to manipulate user roles for back end permissions.
 *
 * @class RoleModel
 * @extends EntityModel
 * @constructor
 * @param {RoleProvider} provider The entity provider
 */
function RoleModel(provider) {
  RoleModel.super_.call(this, provider);
}

module.exports = RoleModel;
util.inherits(RoleModel, openVeoApi.models.EntityModel);

/**
 * Adds a new role.
 *
 * @method add
 * @async
 * @param {Object} data A role object
 * @param {String} data.name Role's name
 * @param {Array} data.permissions Role's permissions
 * @param {String} [data.id] Role's id, if not specified id is generated
 * @param {Function} [callback] The function to call when it's done
 *   - **Error** The error if an error occurred, null otherwise
 *   - **Number** The total amount of items inserted
 *   - **Object** The inserted role
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
