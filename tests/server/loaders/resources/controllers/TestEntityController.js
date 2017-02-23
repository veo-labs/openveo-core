'use strict';

var util = require('util');
var openVeoApi = require('@openveo/api');

function TestEntityController() {

}

util.inherits(TestEntityController, openVeoApi.controllers.EntityController);
module.exports = TestEntityController;
