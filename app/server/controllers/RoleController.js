'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var RoleModel = process.require('app/server/models/RoleModel.js');
var EntityController = openVeoAPI.controllers.EntityController;

/**
 * Provides all route actions to deal with roles.
 *
 * @class RoleController
 * @constructor
 * @extends EntityController
 */
function RoleController() {
  EntityController.call(this, RoleModel);
}

module.exports = RoleController;
util.inherits(RoleController, EntityController);
