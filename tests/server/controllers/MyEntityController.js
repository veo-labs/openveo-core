'use strict';

var util = require('util');
var openVeoAPI = require('@openveo/api');
var EntityController = openVeoAPI.controllers.EntityController;

function MyEntityController() {
  EntityController.call(this, function() {});
}

module.exports = MyEntityController;
util.inherits(MyEntityController, EntityController);
