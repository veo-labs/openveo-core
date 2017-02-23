'use strict';

var util = require('util');
var openVeoApi = require('@openveo/api');

function TestContentController() {

}

util.inherits(TestContentController, openVeoApi.controllers.ContentController);
module.exports = TestContentController;
