'use strict';

/**
 * @module core-controllers
 */

var util = require('util');
var openVeoAPI = require('@openveo/api');
var UserModel = process.require('app/server/models/UserModel.js');
var EntityController = openVeoAPI.controllers.EntityController;

/**
 * Provides all route actions to deal with users.
 *
 * @class UserController
 * @constructor
 * @extends EntityController
 */
function UserController() {
  EntityController.call(this, UserModel);
}

module.exports = UserController;
util.inherits(UserController, EntityController);
